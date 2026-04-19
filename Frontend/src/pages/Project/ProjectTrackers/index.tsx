import {
    Box,
    Button,
    Grid,
    Modal,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { getProjectStatus, ProjectTrackers } from 'services/projectService';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { toast } from 'react-toastify';
import 'jspdf-autotable';
import { getFiles } from 'services/uploadService';
import DataGridOData from 'ui-component/DataGridOData';
import SubCard from 'ui-component/cards/SubCard';
import moment from 'moment';
import { Visibility } from '@mui/icons-material';
import DateFilter from '@inovua/reactdatagrid-community/DateFilter';
import SelectFilter from '@inovua/reactdatagrid-community/SelectFilter';
import { getProjectManagers } from 'services/userService';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GridStatus from 'ui-component/GridStatus';
import { IconChevronRight } from '@tabler/icons';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';

interface ClientDetail {
    id: string;
    name: string;
    created_at: string;
}

interface WeeklyStatus {
    id: string;
    commet: string;
    status: string;
    created_at: string;
}
interface ProjectStatus {
    id: string;
    days_delayed: number;
    comment: string;
    created_at: string;
    project_statuses: {
        id: string;
        name: string;
    };
}

interface ProjectTracker {
    id: string;
    name: string;
    client_details: ClientDetail[];
    project_manager_details: any[];
    dicsounted_cost: number | null;
    no_of_weeks: number | null;
    kickoff_date: string | null;
    project_plan: string;
    project_srs: string;
    technical_proposal: string;
    project_status: ProjectStatus[];
    go_live_date: string;
    totalHours: number;
    consumedHours: number;
    remainingHours: number;
    status_report: string;
}

const defaultFilterValue = [
    { name: 'status', type: 'string', operator: 'contains', value: '' },
    { name: 'name', type: 'string', operator: 'contains', value: '' },
    { name: 'project_manager_details', type: 'string', operator: 'contains', value: '' },
    { name: 'kickoff_date', type: 'string', operator: 'contains', value: '' },
    { name: 'go_live_date', type: 'string', operator: 'contains', value: '' }
    // { name: 'payment_recieved', type: 'string', operator: 'contains', value: '' }
];

const ProjectReport = () => {
    const defaultSortInfo = { name: 'id', dir: -1, type: 'date' };
    const [projectManager, setProjectManager] = useState();
    const [statuses, setStatuses] = useState();

    const dispatch = useDispatch();

    const columns: any = [
        {
            header: 'Status',
            name: 'status',
            defaultFlex: 1,
            minWidth: 145,
            textAlign: 'center',
            filterEditor: SelectFilter,
            filterEditorProps: {
                placeholder: 'Select Status',
                dataSource: statuses
            },
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid item textAlign={'center'} xs={12}>
                            <Typography textAlign={'center'} variant="caption">
                                <GridStatus data={data?.project_status[0]?.project_statuses?.name} />
                            </Typography>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Project Name',
            name: 'name',
            defaultFlex: 1,
            minWidth: 220,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                        <Grid item md={12} sm={12} xs={12}>
                            <span>{data?.name || 'N/A'}</span>
                        </Grid>
                    </Grid>
                );
            }
        },
        {
            header: 'Project Manager',
            name: 'project_manager_details',
            defaultFlex: 1,
            minWidth: 200,
            textAlign: 'center',
            filterEditor: SelectFilter,
            filterEditorProps: {
                placeholder: 'Select PM',
                dataSource: projectManager
            },
            render: ({ data }: { data: ProjectTracker }) => {
                return (
                    <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                        {data?.project_manager_details?.map((x: any) => (
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{x?.name}</span>
                            </Grid>
                        ))}
                    </Grid>
                );
            }
        },
        {
            header: 'Project Pirce',
            name: 'discounted_cost',
            defaultFlex: 1,
            minWidth: 100,
            textAlign: 'center',
            render: ({ data }: { data: ProjectTracker }) => {
                return (
                    <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                        <Grid item md={12} sm={12} xs={12}>
                            <span>{data?.dicsounted_cost?.toLocaleString() || 'N/A'}</span>
                        </Grid>
                    </Grid>
                );
            }
        },
        {
            header: 'Propose Weeks',
            name: 'no_of_weeks',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: ProjectTracker }) => {
                return (
                    <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                        <Grid item md={12} sm={12} xs={12}>
                            <span>{data?.no_of_weeks || 'N/A'}</span>
                        </Grid>
                    </Grid>
                );
            }
        },
        {
            header: 'Kickoff Date',
            name: 'kickoff_date',
            type: 'date',
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',
            filterEditor: DateFilter,
            filterEditorProps: (props: any, { index }: { index: number }) => {
                return {
                    dateFormat: 'YYYY-MM-DD',
                    cancelButton: false,
                    highlightWeekends: false,
                    // placeholder: index == 1 ? 'End date is before...' : 'End date is after...'
                    placeholder: ''
                };
            },
            render: ({ data }: { data: ProjectTracker }) => {
                return (
                    <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                        <Grid item md={12} sm={12} xs={12}>
                            <span>{data?.kickoff_date ? moment(data?.kickoff_date).format('Do MMM, YYYY') : 'N/A'}</span>
                        </Grid>
                    </Grid>
                );
            }
        },

        {
            header: 'Go Live Date',
            name: 'go_live_date',
            type: 'date',
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',
            filterEditor: DateFilter,
            filterEditorProps: (props: any, { index }: { index: number }) => {
                return {
                    dateFormat: 'YYYY-MM-DD',
                    cancelButton: false,
                    highlightWeekends: false,
                    placeholder: ''
                };
            },
            render: ({ data }: { data: ProjectTracker }) => {
                return (
                    <Grid container spacing={0.5}>
                        <Grid item md={12} sm={12} xs={12}>
                            <span>{data?.go_live_date ? moment(data?.go_live_date).format('Do MMM, YYYY') : 'N/A'}</span>
                        </Grid>
                    </Grid>
                );
            }
        },
        {
            header: 'Project Hours',
            name: 'hours',
            defaultFlex: 1,
            minWidth: 180,
            textAlign: 'center',
            render: ({ data }: { data: ProjectTracker }) => {
                const totalHours = data?.totalHours || 0;
                const consumedHours = data?.consumedHours || 0;
                const remainingHours = data?.remainingHours || 0;

                // Color based on values
                const totalHoursColor = 'orange';
                const consumedHoursColor = 'blue';
                const remainingHoursColor = 'purple';

                return (
                    <Grid
                        container
                        spacing={0.5}
                        alignItems="center"
                        display={'flex'}
                        flexDirection={'column'}
                        justifyContent="space-between"
                    >
                        <Grid item md={4} sm={4} xs={4} display={'flex'} flexDirection={'column'} alignItems={'center'}>
                            <span style={{ color: totalHoursColor }}>Total Hours: {totalHours.toLocaleString() || 'N/A'}</span>
                        </Grid>
                        <Grid item md={4} sm={4} xs={4} display={'flex'} flexDirection={'column'} alignItems={'center'}>
                            <span style={{ color: consumedHoursColor }}>Consumed Hours: {consumedHours.toLocaleString() || 'N/A'}</span>
                        </Grid>
                        <Grid item md={4} sm={4} xs={4} display={'flex'} flexDirection={'column'} alignItems={'center'}>
                            <span style={{ color: remainingHoursColor }}>Remaining Hours: {remainingHours.toLocaleString() || 'N/A'}</span>
                        </Grid>
                    </Grid>
                );
            }
        },
        {
            header: 'Documents',
            name: 'documents',
            defaultFlex: 1,
            minWidth: 130,
            textAlign: 'center',
            render: ({ data }: { data: ProjectTracker }) => {
                return (
                    <>
                        <Grid container item gap={'7px'} md={12} sm={12} xs={12}>
                            <Grid style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Visibility
                                    onClick={() => OpenFile(data?.project_plan)}
                                    style={{ color: '#5e35b1', width: '15px', cursor: 'pointer' }}
                                />
                            </Grid>
                            <Grid style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="caption">Project Plan</Typography>
                            </Grid>
                        </Grid>

                        <Grid container item gap={'7px'} md={12} sm={12} xs={12}>
                            <Grid style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Visibility
                                    onClick={() => OpenFile(data?.project_srs)}
                                    style={{ color: '#5e35b1', width: '15px', cursor: 'pointer' }}
                                />
                            </Grid>
                            <Grid style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="caption">SRS</Typography>
                            </Grid>
                        </Grid>

                        <Grid container item gap={'7px'} md={12} sm={12} xs={12}>
                            <Grid style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Visibility
                                    onClick={() => GetFilesS3(data?.technical_proposal)}
                                    style={{ color: '#5e35b1', width: '15px', cursor: 'pointer' }}
                                />
                            </Grid>
                            <Grid style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="caption">Proposal</Typography>
                            </Grid>
                        </Grid>

                        <Grid container item gap={'7px'} md={12} sm={12} xs={12}>
                            <Grid style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Visibility
                                    onClick={() => {
                                        if (data?.status_report?.toLowerCase().endsWith('.pdf')) {
                                            GetFilesS3(data.status_report);
                                        } else {
                                            OpenFile(data.status_report);
                                        }
                                    }}
                                    style={{ color: '#5e35b1', width: '15px', cursor: 'pointer' }}
                                />
                            </Grid>
                            <Grid style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="caption">Status Report</Typography>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Weekly Status',
            name: '',
            defaultFlex: 1,
            minWidth: 170,
            textAlign: 'center',
            render: ({ data }: { data: ProjectTracker }) => {
                const [open, setOpen] = useState(false);

                const handleOpen = () => setOpen(true);
                const handleClose = () => setOpen(false);

                const comments = data?.project_status || [];
                const lastStatus = comments[0]?.project_statuses?.name;

                const lastThreeDates = (() => {
                    const workingDays = [];
                    let currentDate = moment();

                    while (workingDays.length < 3) {
                        if (currentDate.isoWeekday() < 6) {
                            // Monday to Friday are working days
                            const formattedDate = currentDate.format('dddd, Do MMM, YYYY');
                            const isCommentAvailable = comments.some(
                                (comment) => moment(comment.created_at).format('dddd, Do MMM, YYYY') === formattedDate
                            );
                            workingDays.push({
                                date: formattedDate,
                                hasComment: isCommentAvailable
                            });
                        }
                        currentDate = currentDate.subtract(1, 'day');
                    }
                    return workingDays.reverse();
                })();

                return (
                    <>
                        {lastStatus !== 'Completed' &&
                            lastStatus !== 'On Hold' &&
                            lastThreeDates.map(({ date, hasComment }, index) => (
                                <Grid
                                    key={index}
                                    sx={{
                                        color: '#444',
                                        fontSize: '0.750rem',
                                        marginBottom: '4px',
                                        textAlign: 'center',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '7px',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {/* Icon for comment */}
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                        {hasComment ? (
                                            <span style={{ color: '#4caf50' }}>✅</span> // Green tick for comment available
                                        ) : (
                                            <span style={{ color: '#f44336' }}>❌</span> // Red cross for comment not available
                                        )}
                                    </Typography>
                                    {/* Date */}
                                    <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                                        {date}
                                    </Typography>
                                </Grid>
                            ))}

                        {/* Display Row Content */}
                        <Grid container spacing={1} alignItems="center" justifyContent="center">
                            <Button
                                variant="outlined"
                                size="small"
                                style={{
                                    marginTop: '8px',
                                    backgroundColor: '#1976d2',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    borderRadius: '20px'
                                }}
                                onClick={handleOpen}
                            >
                                View All Status
                            </Button>
                        </Grid>

                        {/* Modal for All Comments */}
                        <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '80%', // Increased modal width to 80% of the viewport
                                    maxHeight: '80vh',
                                    bgcolor: '#f9f9f9',
                                    borderRadius: '12px',
                                    boxShadow: 24,
                                    p: 4,
                                    overflowY: 'auto'
                                }}
                            >
                                <Typography
                                    id="modal-title"
                                    variant="h6"
                                    component="h2"
                                    sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}
                                >
                                    All Status
                                </Typography>

                                <TableContainer component={Paper} sx={{ overflowY: 'auto' }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left" sx={{ fontWeight: 'bold', color: '#1976d2', width: '12%' }}>
                                                    Date
                                                </TableCell>
                                                <TableCell align="left" sx={{ fontWeight: 'bold', width: '15%', color: '#1976d2' }}>
                                                    Status
                                                </TableCell>
                                                <TableCell align="left" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                    Comment
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {comments.map((comment, index) => (
                                                <TableRow key={index}>
                                                    <TableCell align="left">{moment(comment.created_at).format('Do MMM, YYYY')}</TableCell>
                                                    <TableCell align="left">{comment?.project_statuses?.name}</TableCell>
                                                    <TableCell align="left" sx={{ fontSize: '13px' }}>
                                                        <div
                                                            style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                                                            dangerouslySetInnerHTML={{ __html: comment.comment }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Button
                                    variant="contained"
                                    onClick={handleClose}
                                    sx={{
                                        mt: 3,
                                        backgroundColor: '#1976d2',
                                        color: '#fff',
                                        display: 'block',
                                        ml: 'auto',
                                        textTransform: 'none'
                                    }}
                                >
                                    Close
                                </Button>
                            </Box>
                        </Modal>
                    </>
                );
            }
        },
        {
            name: 'actions',
            header: 'Action',
            defaultFlex: 1,
            minWidth: 100,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <Grid>
                        <Link to={'/project/create?uuid=' + data?.uuid}>
                            <MoreVertIcon style={{ color: '#5e35b1' }} />
                        </Link>
                    </Grid>
                );
            }
        }
    ];

    const GetFilesS3 = async (key: String) => {
        if (key) {
            dispatch(spinLoaderShow(true));

            // let temp = await PagesImage(formData)

            getFiles(key)
                .then((res: any) => {
                    window.location.href = res;
                })
                .catch((err) => {
                    console.log('errror', err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        } else {
            toast.error('File is empty');
        }
    };

    const OpenFile = async (key: string) => {
        if (key && key != '') {
            window.open(key);
        } else {
            toast.error('File is empty');
        }
    };

    const getProjectManagersData = () => {
        getProjectManagers()
            .then((res: any) => {
                const unwantedList = [
                    '65d5f55d75294589c28dd317',
                    '656ef8118726c7c0dc64fac8',
                    '656ef8548726c7c0dc64fac9',
                    '6576c46c75b5e758487ae076',
                    '656ef9748726c7c0dc64face',
                    '656efbc58726c7c0dc64fad0',
                    '66790d08b064cd8717dd977a'
                ];

                res = res
                    ?.filter((x: any) => !unwantedList.includes(x.id))
                    .map((x: any) => ({
                        id: x.id,
                        label: x.name
                    }));

                setProjectManager(res);
            })
            .catch((err) => {})
            .finally(() => {});
    };

    const getProjectStatusData = () => {
        getProjectStatus()
            .then((res: any) => {
                res = res?.map((x: any) => ({
                    id: x.id,
                    label: x.name
                }));
                setStatuses(res);
            })
            .catch((err) => {})
            .finally(() => {});
    };
    useEffect(() => {
        getProjectManagersData();
        getProjectStatusData();
    }, []);

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'Project Tracker'} icon title rightAlign />
            <Paper sx={{ padding: '20px' }}>
                <SubCard>
                    <DataGridOData
                        // showAddButton={true}
                        dataResolver={ProjectTrackers} // api function
                        // exportCSV={exportCSV}
                        keyName="id"
                        // addRoute="/dashboard/promotion/add"
                        filterValue={defaultFilterValue}
                        columns={columns}
                        // dataSource={projectListing}
                        defaultSortInfo={defaultSortInfo}
                        disableCheckbox
                    />
                </SubCard>
            </Paper>
        </>
    );
};

export default ProjectReport;

/*eslint-disable */
import * as React from 'react';
import {
    Box,
    Button,
    Chip,
    Grid,
    LinearProgress,
    LinearProgressProps,
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
import { toast } from 'react-toastify';

// assets
import { useState } from 'react';
import SubCard from 'ui-component/cards/SubCard';
import { Label, Visibility } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DataGridOData from 'ui-component/DataGridOData';
import { getProjectListing, getProjectStatus } from 'services/projectService';
import { Link } from 'react-router-dom';
import { useTheme, styled } from '@mui/material/styles';
import { linearProgressClasses } from '@mui/material/LinearProgress';
import { useDispatch } from 'react-redux';
import { getFiles } from 'services/uploadService';
import { spinLoaderShow } from 'store/actions/spinLoader';
import GridStatus from 'ui-component/GridStatus';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import { getProjectManagers } from 'services/userService';
import SelectFilter from '@inovua/reactdatagrid-community/SelectFilter';
import { GetAllProjectDivisions } from 'services/project-divisions';
import moment from 'moment';
import { GetAllProjectContractTypes } from 'services/project-contract-types';
import { useProjectPDFExport } from './ProjectPDFExport';
import { useProjectExcelExport } from './ProjectExcelExport';
import DateFilter from '@inovua/reactdatagrid-community/DateFilter';

const formatAmount = (amount: number) => `AED ${amount.toLocaleString()}`;
const formatDate = (dateStr: string) => {
    return moment(dateStr).format('Do MMM, YYYY'); // example: 21st Feb, 2025
};

const ProjectListing = (props: any) => {
    const [projectManager, setProjectManager] = useState();
    const [projectDivisions, setProjectDivisions] = useState([]);
    const [statuses, setStatuses] = useState();
    const [getData, setGetData] = useState<any>();
    const [projectContractTypes, setProjectContractTypes] = useState([]);
    const [query, setQuery] = useState<string>('');

    // Export hooks
    const { exportToExcel } = useProjectExcelExport();
    const { exportToPDF } = useProjectPDFExport();

    const dispatch = useDispatch();

    const defaultSortInfo = { name: 'created_at', dir: -1, type: 'string' };

    const defaultFilterValue = [
        { name: 'status', type: 'string', operator: 'contains', value: '' },
        { name: 'name', type: 'string', operator: 'contains', value: '' },
        { name: 'project_manager_details', type: 'string', operator: 'contains', value: '' },
        { name: 'project_categories', type: 'string', operator: 'contains', value: '' },
        { name: 'project_technology', type: 'string', operator: 'contains', value: '' },
        { name: 'project_industry', type: 'string', operator: 'contains', value: '' },
        { name: 'projectDivision', type: 'string', operator: 'contains', value: '' },
        { name: 'project_contract_type', type: 'string', operator: 'contains', value: '' },
        { name: 'kickoff_date', type: 'string', operator: 'contains', value: '' }
    ];

    // Export functions that will be passed to DataGridOData
    const handleExportToExcel = () => {
        exportToExcel(query, getData);
    };

    const handleExportToPDF = () => {
        exportToPDF(query, getData);
    };

    const BorderLinearProgress = styled(LinearProgress)(() => ({
        height: 10,
        width: 100,
        borderRadius: 5,
        [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 5
        }
    }));

    function calculatePercentage(consumedHours: any, totalHours: any) {
        if (totalHours === 0) {
            return 0; // To avoid division by zero
        }
        const percentage: any = (consumedHours / totalHours) * 100;
        return Math.floor(percentage);
    }

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
            // minWidth: 200,
            minWidth: 150,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Typography variant="caption" fontWeight={'700'} textTransform={'uppercase'}>
                            {data.name}
                        </Typography>
                    </>
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
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            {data?.project_manager_details?.map((x: any) => (
                                <Grid item md={12} sm={12} xs={12}>
                                    <span>{x?.name}</span>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Project Divisions',
            name: 'projectDivision',
            minWidth: 200,
            textAlign: 'center',
            filterEditor: SelectFilter,
            filterEditorProps: {
                placeholder: 'Select',
                dataSource: projectDivisions
            },
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        {data?.projectDivision?.id && (
                            <Chip
                                className="custom__chip --brown-chip"
                                key={data?.projectDivision?.id}
                                label={data?.projectDivision?.name}
                                color="success"
                                variant="filled"
                            />
                        )}
                    </>
                );
            }
        },
        {
            header: 'Contract Type',
            name: 'project_contract_type',
            minWidth: 200,
            textAlign: 'center',
            filterEditor: SelectFilter,
            filterEditorProps: {
                placeholder: 'Select',
                dataSource: projectContractTypes
            },
            render: ({ data }: { data: any }) => {
                const type = data?.project_contract_type;
                if (!type?.id) return null;

                return (
                    <span
                        key={type.id}
                        style={{
                            backgroundColor: type.color || '#ccc',
                            color: '#fff',
                            padding: '4px 12px',
                            borderRadius: '999px',
                            display: 'inline-block',
                            fontSize: '0.765rem',
                            fontWeight: 500,
                            textTransform: 'capitalize'
                        }}
                    >
                        {type.name}
                    </span>
                );
            }
        },
        // {
        //     header: 'Consumed Hours',
        //     name: '',
        //     defaultFlex: 1,
        //     // minWidth: 270,
        //     minWidth: 260,
        //     minHeight: 600,
        //     textAlign: 'center',
        //     render: ({ data }: { data: any }) => {
        //         return (
        //             <>
        //                 <Grid container spacing={1} sx={{ margin: 0, padding: 0 }}>
        //                     <Grid item xs={12}>
        //                         <Grid container spacing={1} alignItems="center" justifyContent="center">
        //                             <Grid item md={6} sm={6} xs={6}>
        //                                 <Grid item md={4} sm={4} xs={4}>
        //                                     <Typography variant="caption">Consumed Hours</Typography>
        //                                 </Grid>
        //                                 <BorderLinearProgress
        //                                     variant="determinate"
        //                                     color="secondary"
        //                                     sx={{ width: '100%' }}
        //                                     value={data?.remaining_hours_percentage}
        //                                 />
        //                             </Grid>
        //                             <Grid item md={4} sm={4} xs={4}>
        //                                 <Typography variant="h6">{data?.remaining_hours_percentage}%</Typography>
        //                             </Grid>
        //                         </Grid>
        //                     </Grid>

        //                     {data?.final_additional_hours_listing?.map((x: any) => {
        //                         const additionalHours = data?.additional_consumed_hours?.reduce((accumulator: any, currentValue: any) => {
        //                             if (currentValue?.department?.id == x?.department?.id) {
        //                                 return accumulator + currentValue?.consumed_hours;
        //                             }

        //                             return accumulator;
        //                         }, 0);

        //                         let additional_hours_percentage = calculatePercentage(additionalHours, x.hours);
        //                         return (
        //                             <Grid key={x?.id} item xs={12}>
        //                                 <Grid container spacing={0} alignItems="center" justifyContent="center">
        //                                     <Grid item md={6} sm={6} xs={6}>
        //                                         <Grid item md={4} sm={4} xs={4}>
        //                                             <Typography variant="caption">
        //                                                 {x?.department?.name + ' ' + x?.project_category_hours?.name}
        //                                             </Typography>
        //                                         </Grid>
        //                                         <BorderLinearProgress
        //                                             sx={{ width: '100%' }}
        //                                             variant="determinate"
        //                                             color="error"
        //                                             value={additional_hours_percentage}
        //                                         />
        //                                     </Grid>
        //                                     <Grid item md={4} sm={4} xs={4}>
        //                                         <Typography variant="h6">{additional_hours_percentage}%</Typography>
        //                                     </Grid>
        //                                 </Grid>
        //                             </Grid>
        //                         );
        //                     })}

        //                     {data?.final_upSell_hours_listing?.map((x: any) => {
        //                         const additionalHours = data?.upsell_consumed_hours?.reduce((accumulator: any, currentValue: any) => {
        //                             if (currentValue.department.id == x.department.id) {
        //                                 return accumulator + currentValue?.consumed_hours;
        //                             }

        //                             return accumulator;
        //                         }, 0);

        //                         let upsell_hours_percentage = calculatePercentage(additionalHours, x.hours);
        //                         return (
        //                             <Grid key={x?.id} item xs={12}>
        //                                 <Grid container spacing={0} alignItems="center" justifyContent="center">
        //                                     <Grid item md={6} sm={6} xs={6}>
        //                                         <Grid item md={4} sm={4} xs={4}>
        //                                             <Typography variant="caption">
        //                                                 {x?.department?.name + ' ' + x?.project_category_hours?.name}
        //                                             </Typography>
        //                                         </Grid>
        //                                         <BorderLinearProgress
        //                                             sx={{ width: '100%' }}
        //                                             variant="determinate"
        //                                             color="error"
        //                                             value={upsell_hours_percentage}
        //                                         />
        //                                     </Grid>
        //                                     <Grid item md={4} sm={4} xs={4}>
        //                                         <Typography variant="h6">{upsell_hours_percentage}%</Typography>
        //                                     </Grid>
        //                                 </Grid>
        //                             </Grid>
        //                         );
        //                     })}
        //                 </Grid>
        //             </>
        //         );
        //     }
        // },
        {
            header: 'Planned Hours',
            name: 'projectPlannedHours',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: any }) => (
                <Typography variant="body2" fontWeight="bold">
                    {data?.projectPlannedHours}
                </Typography>
            )
        },
        {
            header: 'Consumed Hours',
            name: 'projectConsumedHours',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: any }) => (
                <Typography variant="body2" fontWeight="bold">
                    {data?.projectConsumedHours}
                </Typography>
            )
        },
        {
            header: 'Budget (AED)',
            name: 'budget',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: any }) => (
                <Typography variant="body2" fontWeight="bold">
                    {data?.budget?.toLocaleString()}
                </Typography>
            )
        },
        {
            header: 'Cost (AED)',
            name: 'cost',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: any }) => (
                <Typography variant="body2" fontWeight="bold" sx={{ color: data?.cost > data?.budget ? '#f44336' : '#4caf50' }}>
                    {data?.cost?.toLocaleString()}
                </Typography>
            )
        },
        {
            header: 'Profit/Loss (AED)',
            name: 'profitOrLoss',
            defaultFlex: 1,
            minWidth: 140,
            textAlign: 'center',
            render: ({ data }: { data: any }) => (
                <Typography variant="body2" fontWeight="bold" sx={{ color: data?.profitOrLoss < 0 ? '#f44336' : '#4caf50' }}>
                    AED {Math.abs(data?.profitOrLoss)?.toLocaleString()}
                </Typography>
            )
        },
        {
            header: 'Profit Status',
            name: 'profitStatus',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: any }) => (
                <Chip
                    label={data?.status?.[0]?.toUpperCase() + data?.status?.slice(1).toLowerCase()}
                    sx={{
                        color: data?.status === 'Profit' ? 'rgb(0, 200, 83)' : 'rgb(216, 67, 21)',
                        backgroundColor: data?.status === 'Profit' ? 'rgba(185, 246, 202, 0.376)' : 'rgb(251, 233, 231)',
                        fontSize: '12px',
                        fontWeight: 600
                    }}
                />
            )
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
                    placeholder: ''
                };
            },
            render: ({ data }: { data: any }) => {
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
            header: 'Client Details',
            name: '',
            defaultFlex: 1,
            // minWidth: 270,
            minWidth: 150,
            minHeight: 600,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid textAlign={'left'}>
                            {data?.client_details?.map((x: any) => (
                                <React.Fragment key={x?.id}>
                                    <Grid>
                                        <Typography variant="caption">
                                            <span style={{ color: 'blue', fontSize: '20px', marginRight: '5px' }}>&#8226;</span>
                                            {x?.name}
                                        </Typography>
                                    </Grid>
                                    <Grid>
                                        <Typography variant="caption">+{x?.number}</Typography>
                                    </Grid>
                                    <Grid>
                                        <Typography variant="caption">{x?.email}</Typography>
                                    </Grid>
                                </React.Fragment>
                            ))}
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Documents',
            name: 'additional_document',
            defaultFlex: 1,
            minWidth: 140,
            textAlign: 'center',
            // textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container item justifyContent={'space-between'} md={12} sm={12} xs={12}>
                            <Grid>
                                <Visibility
                                    onClick={() => OpenFile(data?.project_plan)}
                                    style={{ color: '#5e35b1', width: '15px', cursor: 'pointer' }}
                                />
                            </Grid>
                            <Grid>
                                <Typography variant="caption">Project Plan</Typography>
                            </Grid>
                        </Grid>

                        <Grid container item justifyContent={'space-between'} md={12} sm={12} xs={12}>
                            <Grid>
                                <Visibility
                                    onClick={() => OpenFile(data?.project_srs)}
                                    style={{ color: '#5e35b1', width: '15px', cursor: 'pointer' }}
                                />
                            </Grid>
                            <Grid>
                                <Typography variant="caption">SRS</Typography>
                            </Grid>
                        </Grid>

                        <Grid container item justifyContent={'space-between'} md={12} sm={12} xs={12}>
                            <Grid>
                                <Visibility
                                    onClick={() => GetFilesS3(data?.technical_proposal)}
                                    style={{ color: '#5e35b1', width: '15px', cursor: 'pointer' }}
                                />
                            </Grid>
                            <Grid>
                                <Typography variant="caption">Proposal</Typography>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Technology',
            name: 'project_technology',
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <div className="chip__wrapper">
                            {data?.project_technology?.map((x: any) => (
                                <Chip
                                    className="custom__chip --purple-chip"
                                    key={x?.id}
                                    label={x?.name}
                                    color="secondary"
                                    variant="filled"
                                />
                            ))}
                        </div>
                    </>
                );
            }
        },
        {
            header: 'Category',
            name: 'project_categories',
            defaultFlex: 1,
            // minWidth: 200,
            minWidth: 150,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        {data?.project_categories?.map((x: any) => (
                            <Chip className="custom__chip --blue-chip" key={x?.id} label={x?.name} color="success" variant="filled" />
                        ))}
                    </>
                );
            }
        },
        {
            header: 'Industry',
            name: 'project_industry',
            defaultFlex: 1,
            // minWidth: 200,
            minWidth: 150,
            textAlign: 'center',
            justifyContent: 'space-between',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <div className="chip__wrapper">
                            {data?.project_industry?.map((x: any) => (
                                <Chip
                                    className="custom__chip --brown-chip"
                                    key={x?.id}
                                    label={x?.name}
                                    color="secondary"
                                    variant="filled"
                                />
                            ))}
                        </div>
                    </>
                );
            }
        },
        {
            header: 'Milestone Invoice',
            name: '',
            defaultFlex: 1,
            minWidth: 250,
            minHeight: 600,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                const [open, setOpen] = useState(false);
                const handleOpen = () => setOpen(true);
                const handleClose = () => setOpen(false);

                const milestones = [...(data?.project_milestone || [])];

                const sorted = milestones.sort((a, b) => Number(a.invoice) - Number(b.invoice));
                const firstThree = sorted.slice(0, 3);
                const remaining = sorted.slice(3);

                return (
                    <>
                        {firstThree.map(({ milestone_phase, invoice, targeted_month, milestone_payment }, index) => (
                            <Grid
                                key={index}
                                sx={{
                                    color: '#444',
                                    fontSize: '0.750rem',
                                    marginBottom: '4px',
                                    textAlign: 'left',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: '2px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                                    {invoice ? <span style={{ color: '#4caf50' }}>✅</span> : <span style={{ color: '#f44336' }}>❌</span>}
                                    &nbsp;{milestone_phase?.name}
                                </Typography>
                                {/* <Typography variant="caption" sx={{ fontSize: '0.8rem', color: '#666', paddingLeft: '18px' }}>
                                    {formatDate(targeted_month)} — {formatAmount(milestone_payment)}
                                </Typography> */}
                            </Grid>
                        ))}
                        {firstThree?.length > 0 && (
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
                                    View All Milestones
                                </Button>
                            </Grid>
                        )}

                        <Modal open={open} onClose={handleClose}>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '80%',
                                    maxHeight: '80vh',
                                    bgcolor: '#f9f9f9',
                                    borderRadius: '12px',
                                    boxShadow: 24,
                                    p: 4,
                                    overflowY: 'auto'
                                }}
                            >
                                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                                    All Milestones
                                </Typography>

                                <TableContainer component={Paper}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Milestone</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Invoice</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Target Month</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Payment</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sorted.map((milestone, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{milestone.milestone_phase?.name}</TableCell>
                                                    <TableCell>
                                                        {milestone.invoice ? (
                                                            <span style={{ color: '#4caf50' }}>✅</span>
                                                        ) : (
                                                            <span style={{ color: '#f44336' }}>❌</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{formatDate(milestone.targeted_month)}</TableCell>
                                                    <TableCell>{formatAmount(milestone.milestone_payment)}</TableCell>
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
        }
    };

    const GetAllProjectDivisionsData = () => {
        GetAllProjectDivisions()
            .then((res: any) => {
                res = res?.map((x: any) => ({
                    id: x.id,
                    label: x.name
                }));
                setProjectDivisions(res);
            })
            .catch((err) => {
                console.log('err', err);
            });
    };

    const getProjectManagersData = () => {
        getProjectManagers()
            .then((res: any) => {
                res = res.map((x: any) => ({
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

    const GetAllProjectContractTypesData = () => {
        GetAllProjectContractTypes()
            .then((res: any) => {
                res = res?.map((x: any) => ({
                    id: x.id,
                    label: x.name
                }));
                setProjectContractTypes(res);
            })
            .catch((err) => {
                console.log('err', err);
            });
    };

    React.useEffect(() => {
        getProjectManagersData();
        getProjectStatusData();
        GetAllProjectDivisionsData();
        GetAllProjectContractTypesData();
    }, []);

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'List of Project'} icon title rightAlign />

            {getData?.projectDivisionsWithCount && (
                <SubCard>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '45px', flexWrap: 'wrap' }}>
                        {getData?.projectDivisionsWithCount?.map((item: any, index: number) => (
                            <div key={index} style={{ textAlign: 'center' }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        color: item.color,
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {item.name}
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: item.color,
                                        fontSize: '1.2rem'
                                    }}
                                >
                                    {item.count}
                                </Typography>
                            </div>
                        ))}
                    </div>
                </SubCard>
            )}

            {getData?.statusCounts && (
                <SubCard sx={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '45px', flexWrap: 'wrap' }}>
                        {Object.entries(getData.statusCounts)
                            .filter(([status]) => status !== 'unassigned')
                            .map(([status, count]: any, index) => {
                                const getStatusColor = (status: string) => {
                                    switch (status.toLowerCase()) {
                                        case 'completed':
                                            return '#2e7d32'; // dark green
                                        case 'on hold':
                                            return '#e65100'; // deep orange
                                        case 'on track':
                                        case 'assigned':
                                            return '#f9a825'; // amber
                                        case 'delayed':
                                            return '#c62828'; // deep red
                                        case 'unassigned':
                                            return '#6d4c41'; // brownish grey
                                        case 'not started':
                                            return '#7b1fa2'; // deep red
                                        default:
                                            return '#424242'; // dark grey
                                    }
                                };

                                return (
                                    <div key={index} style={{ textAlign: 'center' }}>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                color: getStatusColor(status),
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {status}
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 'bold',
                                                color: getStatusColor(status),
                                                fontSize: '1.2rem'
                                            }}
                                        >
                                            {count}
                                        </Typography>
                                    </div>
                                );
                            })}
                    </div>
                </SubCard>
            )}

            {/* <SubCard sx={{ marginTop: '10px' }}>
                <DataGridOData
                    dataResolver={getProjectListing} // api function
                    keyName="id"
                    filterValue={defaultFilterValue}
                    columns={columns}
                    defaultSortInfo={defaultSortInfo}
                    disableCheckbox
                    setGetData={setGetData}
                />
            </SubCard> */}

            <SubCard sx={{ marginTop: '10px' }}>
                <DataGridOData
                    dataResolver={getProjectListing} // api function
                    keyName="id"
                    filterValue={defaultFilterValue}
                    columns={columns}
                    defaultSortInfo={defaultSortInfo}
                    disableCheckbox
                    setGetData={setGetData}
                    setQuery={setQuery}
                    showdonwload={true}
                    exportToXlsx={handleExportToExcel}
                    exportToPdf={handleExportToPDF}
                />
            </SubCard>
        </>
    );
};

export default ProjectListing;

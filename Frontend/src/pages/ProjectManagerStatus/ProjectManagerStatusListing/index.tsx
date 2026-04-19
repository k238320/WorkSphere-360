/*eslint-disable */
// assets
import SubCard from 'ui-component/cards/SubCard';
import DataGridOData from 'ui-component/DataGridOData';
import {
    Box,
    Button,
    Chip,
    Grid,
    Modal,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { Link } from 'react-router-dom';
import { GridMoreVertIcon } from '@mui/x-data-grid';
import { getDepartmentListing } from 'services/departmentService';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import { getPmStatusListing } from 'services/pmStatusService';
import { useState } from 'react';
import moment from 'moment';

const ProjectManagerStatusListing = (props: any) => {
    const [showStatus, setShowStatus] = useState<boolean>(false);
    const [OpenshowStatus, setOpenshowStatus] = useState<boolean>(false);
    const [statusData, setStatusData] = useState<any>('');

    const defaultSortInfo = { name: 'id', dir: -1, type: 'string' };

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        bgcolor: 'white',
        border: '2px solid #000',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        p: 4,
        maxHeight: '600px',
        overflowY: 'auto'
    };

    const openmodal = (data: any) => {
        setShowStatus(true);
        setOpenshowStatus(true);
        setStatusData(data);
    };

    const closeModal = () => {
        setShowStatus(false);
        setOpenshowStatus(false);
    };
    const defaultFilterValue = [{ name: 'name', type: 'string', operator: 'contains', value: '' }];

    const columns: any = [
        {
            header: 'Project',
            name: 'name',
            defaultFlex: 1,
            minWidth: 200,
            textAlign: 'center'
        },
        {
            header: 'Project Manager',
            name: 'project_manager',
            defaultFlex: 1,
            minWidth: 250,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                {data?.project_manager_details?.map((x: any) => (
                                    <Grid item md={12} sm={12} xs={12}>
                                        <span>{x?.name}</span>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'SRS Signoff Date',
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        {data?.pm_status?.srs_signoff != undefined && (
                            <>
                                <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                                    <Grid item md={12} sm={12} xs={12}>
                                        <span>{moment(data?.pm_status?.srs_signoff).format('Do MMM, YYYY')}</span>
                                    </Grid>
                                </Grid>
                            </>
                        )}
                        {data?.pm_status?.srs_signoff == undefined && (
                            <>
                                <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                                    <Grid item md={12} sm={12} xs={12}>
                                        <span>{'-'}</span>
                                    </Grid>
                                </Grid>
                            </>
                        )}
                    </>
                );
            }
        },
        {
            header: 'Project Plan',
            defaultFlex: 1,
            minWidth: 250,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <Grid item md={12} sm={12} xs={12}>
                                    <span>{data?.pm_status?.project_plan || '-'}</span>
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Project Status Report',
            defaultFlex: 1,
            minWidth: 250,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <Grid item md={12} sm={12} xs={12}>
                                    <span>{data?.pm_status?.project_status_report || '-'}</span>
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Content',
            defaultFlex: 1,
            minWidth: 250,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <Grid item md={12} sm={12} xs={12}>
                                    <span>{data?.pm_status?.content || '-'}</span>
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Status',
            defaultFlex: 1,
            minWidth: 250,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                {/* {data?.project_status?.map((x: any) => ( */}
                                <Grid item md={12} sm={12} xs={12} sx={{ textWrap: 'wrap', marginBottom: '10px' }}>
                                    <span>{data?.project_status[0]?.comment}</span>
                                </Grid>
                                {data?.project_status.length > 1 && (
                                    <Grid item md={12} sm={12} xs={12} sx={{ color: 'blue', cursor: 'pointer' }}>
                                        <span onClick={() => openmodal(data?.project_status)}>View More Status</span>
                                    </Grid>
                                )}
                                {/* ))} */}
                            </Grid>
                        </Grid>
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
                        <Grid>
                            {/* <Link to={'/department/create?uuid=' + data?.uuid}> */}
                            <Link to={'/pm-status/create?uuid=' + data?.uuid}>
                                <GridMoreVertIcon style={{ color: '#5e35b1' }} />
                            </Link>
                        </Grid>
                    </Grid>
                );
            }
        }
    ];

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'List of PM Status'} icon title rightAlign />
            <SubCard>
                <DataGridOData
                    dataResolver={getPmStatusListing} // api function
                    keyName="id"
                    filterValue={defaultFilterValue}
                    columns={columns}
                    defaultSortInfo={defaultSortInfo}
                    disableCheckbox
                    loading={false}
                />
            </SubCard>

            {showStatus && (
                <div>
                    <Modal
                        open={OpenshowStatus}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                        onClose={() => setOpenshowStatus(false)}
                    >
                        <Box sx={style}>
                            <TableContainer>
                                <Table sx={{ minWidth: 350, maxHeight: 600, overflowY: 'scroll' }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell
                                                sx={{
                                                    pl: 3,
                                                    width: '5%',
                                                    borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                                }}
                                                size="medium"
                                            >
                                                <Typography fontWeight={'700'} fontSize={'16px'}>
                                                    Date
                                                </Typography>
                                            </TableCell>
                                            <TableCell size="medium" sx={{ width: '10%', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                                <Typography fontWeight={'700'} fontSize={'16px'}>
                                                    Status
                                                </Typography>
                                            </TableCell>
                                            <TableCell size="medium" sx={{ width: '15%', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                                <Typography fontWeight={'700'} fontSize={'16px'}>
                                                    Comment
                                                </Typography>
                                            </TableCell>
                                            {/* <TableCell size="medium" sx={{ width: '15%' }}>
                                                <Typography fontWeight={'700'} fontSize={'16px'}>
                                                    Role
                                                </Typography>
                                            </TableCell> */}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {statusData &&
                                            statusData?.map((row: any, index: any) => (
                                                <TableRow hover>
                                                    <TableCell sx={{ pl: 3, borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                                        {moment(row?.created_at).format('l')}
                                                    </TableCell>
                                                    <TableCell sx={{ pl: 3, borderRight: '1px solid rgba(0, 0, 0, 0.1)' }} size="medium">
                                                        <div className="tasks__date__wrapper">
                                                            <span>{row?.project_statuses?.name || '-'} </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell size="medium" sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                                        <Typography fontSize={'16px'}>{row?.comment}</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right' }}>
                                <Button onClick={closeModal}>Close</Button>
                            </Stack>
                        </Box>
                    </Modal>
                </div>
            )}
        </>
    );
};

export default ProjectManagerStatusListing;

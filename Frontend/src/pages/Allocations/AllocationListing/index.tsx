/*eslint-disable */
import moment from 'moment';

// project imports

// assets
import { useEffect, useState } from 'react';
import SubCard from 'ui-component/cards/SubCard';
import DataGridOData from 'ui-component/DataGridOData';
import { deleteTask, getHourDetails, taskCompletion } from 'services/Allocation/taskServices';
import {
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    IconButton,
    Popover,
    Typography
} from '@mui/material';
import { Link } from 'react-router-dom';
import { GridMoreVertIcon } from '@mui/x-data-grid';
import DateFilter from '@inovua/reactdatagrid-community/DateFilter';
import { Stack } from '@mui/system';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditIcon from '@mui/icons-material/Edit';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import GridStatus from 'ui-component/GridStatus';
import editIcon from '../../../../src/assets/images/icons/edit.png';
import deleteIcon from '../../../../src/assets/images/icons/delete.png';
import completedIcon from '../../../../src/assets/images/icons/checked.png';
import { IconChevronRight } from '@tabler/icons';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { getAllDepartments } from 'services/departmentService';
import SelectFilter from '@inovua/reactdatagrid-community/SelectFilter';
import { getFilteredResources } from 'services/resource';

const AllocationListing = (props: any) => {
    const [allocationListing, setAllocationListing] = useState<any>([]);
    const [anchorEl, setAnchorEl] = useState<any>({
        open: false,
        id: null
    });
    const [open, setOpen] = useState(false);
    const [id, setId] = useState<any>(null);
    const [department, setDepartment] = useState([]);
    const [resource, setResource] = useState<any>([]);

    const dispatch = useDispatch();
    const localUser: any = localStorage.getItem('user');
    const user: any = JSON.parse(localUser);

    const getAllDepartmentsData = () => {
        dispatch(spinLoaderShow(true));

        getAllDepartments()
            .then((res: any) => {
                res = res?.map((x: any) => ({
                    id: x.id,
                    label: x.name
                }));
                setDepartment(res);
            })
            .catch((e) => {
                console.log('err', e);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const handleClick = (id: any) => (event: any) => {
        event.preventDefault(); // Prevent the default behavior
        setAnchorEl({
            open: event.currentTarget,
            id: id
        });
    };

    const handlePopupClose = () => {
        setAnchorEl({
            id: null,
            open: false
        });
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setId(null);
    };

    const handleDelete = (id: string) => () => {
        handleOpen();
        setId(id);
    };

    const handleComplete = (id: any) => () => {
        dispatch(spinLoaderShow(true));
        taskCompletion(id)
            .then((res: any) => {
                if (res?.message) {
                    toast.success(res?.message);
                    handlePopupClose();
                }
            })
            .catch((err) => {
                toast.error(err?.message ?? err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const onDeleteConfirm = () => {
        dispatch(spinLoaderShow(true));
        deleteTask(id)
            .then((res: any) => {
                if (res?.error) {
                    toast.error(res?.error);
                } else {
                    toast.success(res?.message);
                }
                handleClose();
                handlePopupClose();
            })
            .catch((err) => {
                toast.error(err?.message ?? err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const dgetFilteredResourcesdata = () => {
        dispatch(spinLoaderShow(true));
        getFilteredResources()
            .then((res: any) => {
                res = res?.map((x: any) => ({
                    id: x.id,
                    label: x.name
                }));
                setResource(res);
            })
            .catch((err) => {
                console.log('err', err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    useEffect(() => {
        getAllDepartmentsData();
        dgetFilteredResourcesdata();
    }, []);

    // const defaultSortInfo = { name: 'allocation_status', dir: -1, type: 'string' };

    const defaultFilterValue = [
        { name: 'department', type: 'string', operator: 'contains', value: '' },
        { name: 'project_manager', type: 'string', operator: 'contains', value: '' },
        { name: 'resource', type: 'string', operator: 'contains', value: '' },
        { name: 'project', type: 'string', operator: 'contains', value: '' },
        { name: 'name', type: 'string', operator: 'contains', value: '' },
        // { name: 'task_category', type: 'string', operator: 'contains', value: '' },
        { name: 'created_at', type: 'string', operator: 'contains', value: '' },
        { name: 'completion_date', type: 'string', operator: 'contains', value: '' },
        { name: 'actual_completion_date', type: 'string', operator: 'contains', value: '' }
    ];

    const rolesToSkipDepartmentFilter = ['Team Lead', 'Resource'];

    const filteredDefaultFilterValue = rolesToSkipDepartmentFilter.includes(user?.role?.name)
        ? defaultFilterValue.filter((filter) => filter.name !== 'department')
        : defaultFilterValue;

    const columns: any = [
        {
            name: 'actions',
            header: 'Action',
            defaultFlex: 1,
            minWidth: 80,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <Grid>
                        <Grid>
                            <GridMoreVertIcon style={{ color: '#5e35b1', cursor: 'pointer' }} onClick={handleClick(data.id)} />
                            {data.id === anchorEl.id && (
                                <Popover
                                    className="custom__popup"
                                    anchorEl={anchorEl.open}
                                    open={Boolean(anchorEl.open)}
                                    onClose={handlePopupClose}
                                    sx={{ width: '300px !important', minWidth: '300px !important' }}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left'
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right'
                                    }}
                                >
                                    <Grid gap={'20px'} className="custom__popup__wrapper" container>
                                        <Link to={'/allocation/create?uuid=' + data?.uuid}>
                                            <Grid sx={{ marginTop: '5px' }} item md={12} sm={12} xs={12}>
                                                <Stack gap={'10px'} direction="row" alignItems="center">
                                                    <img src={editIcon} alt="edit" width={25} height={25} />
                                                    <Typography>View Task</Typography>
                                                </Stack>
                                            </Grid>
                                        </Link>

                                        {(user?.role?.name === 'Super Admin' || user?.role?.name === 'Project Manager') && (
                                            <>
                                                <Link to={`/allocation/create?uuid=${data?.uuid}&edit=true`}>
                                                    <Grid sx={{ marginTop: '5px' }} item md={12} sm={12} xs={12}>
                                                        <Stack gap={'10px'} direction="row" alignItems="center">
                                                            <img src={editIcon} alt="edit" width={25} height={25} />
                                                            <Typography style={{ cursor: 'pointer' }}>Edit Task</Typography>
                                                        </Stack>
                                                    </Grid>
                                                </Link>

                                                <Grid sx={{ marginTop: '5px' }} item md={12} sm={12} xs={12}>
                                                    <Stack
                                                        gap={'10px'}
                                                        onClick={handleDelete(data?.id)}
                                                        direction="row"
                                                        alignItems="center"
                                                    >
                                                        <img src={deleteIcon} alt="edit" width={25} height={25} />
                                                        <Typography style={{ cursor: 'pointer', color: '#fc0005' }}>Delete Task</Typography>
                                                    </Stack>
                                                </Grid>
                                                <Grid sx={{ marginTop: '5px' }} item md={12} sm={12} xs={12}>
                                                    <Stack
                                                        gap={'10px'}
                                                        onClick={handleComplete(data?.id)}
                                                        direction="row"
                                                        alignItems="center"
                                                    >
                                                        <img src={completedIcon} alt="edit" width={25} height={25} />
                                                        <Typography style={{ cursor: 'pointer', color: '#339900' }}>
                                                            Mark as Complete
                                                        </Typography>
                                                    </Stack>
                                                </Grid>
                                            </>
                                        )}
                                    </Grid>
                                </Popover>
                            )}
                        </Grid>
                    </Grid>
                );
            }
        },
        {
            header: 'Status',
            name: 'status',
            defaultFlex: 1,
            // minWidth: 150,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid item textAlign={'center'} xs={12}>
                            <Typography
                                textAlign={'center'}
                                variant="caption"
                                style={{ display: 'block', padding: '0 10px', fontSize: '10px' }}
                            >
                                <GridStatus data={data?.allocation_status} />
                            </Typography>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Department',
            name: 'department',
            minWidth: 200,
            textAlign: 'center',
            filterEditor: SelectFilter,
            filterEditorProps: {
                placeholder: 'Select',
                dataSource: department
            },
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{data?.department?.[0]?.name}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Task',
            name: 'name',
            defaultFlex: 1,
            minWidth: 300,
            textAlign: 'center'
        },
        {
            header: 'Project/Brand',
            name: 'project',
            defaultFlex: 1,
            minWidth: 200,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{data?.project?.name}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Project Manager',
            name: 'project_manager',
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',

            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            {data?.project?.project_manager_details?.map((x: any) => (
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
            header: 'Resources',
            name: 'resource',
            defaultFlex: 1,
            minWidth: 200,
            textAlign: 'center',
            filterEditor: SelectFilter,
            filterEditorProps: {
                placeholder: 'Select',
                dataSource: resource
            },
            render: ({ data }: { data: any }) => {
                const resourceNames = data?.allocation
                    ?.map((a: any) => a?.resource?.name)
                    .filter((name: any, index: number, self: string[]) => name && self.indexOf(name) === index); // Unique names

                return (
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                            justifyContent: 'center',
                            padding: '4px 0'
                        }}
                    >
                        {resourceNames?.map((name: string, idx: number) => (
                            <span
                                key={idx}
                                style={{
                                    padding: '4px 10px',
                                    backgroundColor: '#e0e0e0',
                                    borderRadius: '16px',
                                    fontSize: '12px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {name}
                            </span>
                        ))}
                    </div>
                );
            }
        },
        {
            header: 'Category',
            name: 'task_category',
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{data?.task_category?.name}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Created Date',
            name: 'created_at',
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',
            filterEditor: DateFilter,
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{moment(data?.created_at).format('Do MMM  YYYY')}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Estimated Date',
            name: 'completion_date',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            filterEditor: DateFilter,
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{moment(data?.completion_date).format('Do MMM, YYYY')}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Actual Date',
            name: 'actual_completion_date',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            filterEditor: DateFilter,
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>
                                    {data?.actual_completion_date ? moment(data?.actual_completion_date).format('Do MMM, YYYY') : 'N/A'}
                                </span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        ,
        {
            header: 'Consumed Hours',
            name: 'project_consumed_hours',
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{data?.project?.consumed_hours}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Remaining Hours',
            name: 'remaining_hours',
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{data?.project?.remaining_hours}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        }
    ];

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'List of Tasks'} icon title rightAlign />
            <SubCard>
                <DataGridOData
                    dataResolver={getHourDetails} // api function
                    keyName="id"
                    filterValue={filteredDefaultFilterValue}
                    columns={columns}
                    // defaultSortInfo={defaultSortInfo}
                    disableCheckbox
                />
            </SubCard>

            <div>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Are you sure you want to delete this task?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={onDeleteConfirm} color="secondary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
};

export default AllocationListing;

import React, { useEffect, useState } from 'react';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import SubCard from 'ui-component/cards/SubCard';
import { IconChevronRight } from '@tabler/icons';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Grid,
    TextField,
    Button,
    Typography,
    Modal,
    Box,
    Stack,
    Select,
    MenuItem,
    InputBase,
    Autocomplete
} from '@mui/material';
import { getExtraHour } from 'services/extraHourService';
import { toast } from 'react-toastify';
import moment from 'moment';
import { LocalizationProvider, DatePicker as DatePicker1 } from '@mui/x-date-pickers';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AutoCompleteField, TextFieldControlled } from 'ui-component/formsField/FormFields';
import { useForm } from 'react-hook-form';
import { getDepartmentCategory } from 'services/categoryService';
import Chip from '@mui/material/Chip';
import useAuth from 'hooks/useAuth';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getDepartmentWise, getResourceByID } from 'services/resource';
import { commentValidation } from './Validations';
import { yupResolver } from '@hookform/resolvers/yup';
import { getAllResources } from 'services/resource';
import { getResourceCategory } from 'services/Allocation/taskServices';
import { extraHourStatus } from 'services/extraHourService';
import { styled } from '@mui/system';
import 'react-datepicker/dist/react-datepicker.css';
import './index.css';

const columns = [
    { id: 'emp_code', label: 'E. Code', minWidth: 10 },
    { id: 'name', label: 'Name', minWidth: 50 },
    { id: 'date', label: 'Department', minWidth: 50 },
    { id: 'start_time', label: 'Date', minWidth: 40 },
    { id: 'end_time', label: 'Checkin Time', minWidth: 50 },
    { id: 'hours', label: 'Checkout Time', minWidth: 50 },
    { id: 'is_approved', label: 'Hours', minWidth: 50 },
    { id: 'status', label: 'Status', minWidth: 50 },
    { id: 'Action', label: 'Action', minWidth: 50 }
];

const statusOptions = [
    { id: 'All Records', name: 'All Records' },
    { id: 'On-Time', name: 'On-Time' },
    { id: 'Late', name: 'Late' },
    { id: 'Half Day', name: 'Half Day' },
    { id: 'Full Day Off', name: 'Full Day Off' },
    { id: 'On-Leave', name: 'On-Leave' },
    { id: 'Work From Home', name: 'Work From Home' },
    { id: 'Holiday', name: 'Holiday' }
];

const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
];

const years = Array.from(new Array(10), (val, index) => 2020 + index);

const index = () => {
    const {
        control,
        formState: { errors },
        setValue,
        handleSubmit
    }: any = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        resolver: yupResolver(commentValidation)
    });

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 3,
        borderRadius: '10px',
        '&:focus': {
            outline: 'none',
            border: 'none'
        }
    };

    const CustomInput = styled(InputBase)(({ theme }: any) => ({
        'label + &': {
            marginTop: theme.spacing(3)
        },
        '& .MuiInputBase-input': {
            borderRadius: 4,
            position: 'relative',
            backgroundColor: '#6e529e',
            border: '1px solid #fff',
            fontSize: 12,
            color: '#fff',
            padding: '8px 26px 8px 12px',
            transition: theme.transitions.create(['border-color', 'box-shadow']),
            '&:focus': {
                borderRadius: 4,
                borderColor: '#fff',
                boxShadow: '0 0 0 0.2rem rgba(255,255,255,.25)'
            }
        }
    }));

    const leavestatusoptions = [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Approved', value: 'APPROVED' }
    ];

    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const newDate = `${year}-${month}`;

    const [open, setOpen] = useState<boolean>(false);
    const [user_comment, setUser_comment] = useState<string>('');
    const [rowData, setRowData] = useState<any>();
    const [addComment, setAddComment] = useState<boolean>(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [state, setState] = useState<any>([]);
    const [filterData, setFilterData] = useState<any>([]);
    const [startTimeOpen, setStartTimeOpen] = React.useState(false);
    const [startEndOpen, setEndTimeOpen] = React.useState(false);
    const [department, setDepartment] = React.useState<any>(null);
    const [departmentData, setDepartmentData] = useState<any>([]);
    const [name, setName] = useState('');
    const [empCode, setEmpCode] = useState('');
    const [Users, setUsers] = useState([]);
    const [resource, setResource] = useState<any>([]);
    const [selectleaveStatus, setLeaveStatus] = useState(null);

    const [startTime, setStartTime] = useState<any>(moment(today).subtract(30, 'days').calendar());
    const [endTime, setEndTime] = useState<any>(today);
    const [teamLead, setTeamLead] = useState(false);
    const [remainingLeaves, setRemainingLeaves] = useState<any>({});
    const [statusCounts, setStatusCounts] = useState({
        totalPresent: 0,
        totalLate: 0,
        totalOnLeaves: 0,
        totalWorkFromHome: 0,
        totalHalfDay: 0,
        totalFullDay: 0,
        totalEmployee: 0,
        netWorkingHours: 0
    });

    const dispatch = useDispatch();
    const { user } = useAuth();

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const hanldeStartTimeChange = (e: any) => {
        if (e) {
            setStartTime(e);
        } else {
            setStartTime(null);
        }
    };

    const hanldeEndTimeChange = (e: any) => {
        if (e) {
            setEndTime(e);
        } else {
            setEndTime(null);
        }
    };

    const handleChangeEmployee = (e: any) => {
        if (e) {
            setName(e?.name);
            setEmpCode(e?.user?.[0]?.employement_code);
        } else {
            setName('');
            setEmpCode('');
        }
    };

    const handleClose = async (data: any) => {
        const newData = { ...data, date: rowData?.date, hours: String(data?.hours), id: rowData?.id };
        delete newData?.department_id;
        setOpen(false);
        setAddComment(false);
    };

    const cancelModal = () => {
        setOpen(false);
        setAddComment(false);
    };

    const handleLaeveStatusChange = (event: any, newValue: any) => {
        setLeaveStatus(newValue);
    };

    const handleStatusChange = (event: any) => {
        const selectedStatus = event.target.value;
        if (selectedStatus === 'All Records') {
            setFilterData(state);
            setPage(0);
        } else {
            const filtered = state.filter((item: any) => item.status === selectedStatus);
            setFilterData(filtered);
            setPage(0);
        }
    };

    const OpenCommentModal = (data: any) => {
        setValue('user_comment', data?.reason || '');
        setValue('hours', Number(data?.hours) || null);
        setValue('approve_by', data?.approve_by || null);
        setRowData(data);
        setAddComment(!addComment);
        setOpen(true);
    };

    const onSearch = () => {
        getEmployeData(startTime, endTime, department, name, empCode, selectleaveStatus);
    };

    const getDepartmentData = async () => {
        getDepartmentCategory()
            .then((res: any) => {
                setDepartmentData(res);
            })
            .catch((err) => {
                toast.error(err);
            });
    };

    const getEmployeData = (
        startTime: any,
        endTime: any,
        department_id?: string,
        name?: string,
        emp_code?: string,
        selectleaveStatus?: any
    ) => {
        dispatch(spinLoaderShow(true));
        getExtraHour(
            moment(startTime)?.format('YYYY-MM-D'),
            moment(endTime)?.format('YYYY-MM-D'),
            department_id,
            name,
            emp_code,
            selectleaveStatus
        )
            .then((response: any) => {
                let res = response;

                if (res?.length > 0) {
                    setState(res);
                    setFilterData(res);
                } else {
                    setState([]);
                    setFilterData([]);
                    setStatusCounts({
                        totalLate: 0,
                        totalOnLeaves: 0,
                        totalWorkFromHome: 0,
                        totalPresent: 0,
                        totalHalfDay: 0,
                        totalFullDay: 0,
                        totalEmployee: 0,
                        netWorkingHours: 0
                    });
                }
                setPage(0);
            })
            .catch((err: any) => {
                toast.error('Some thing Went Wrong');
            })
            .finally(() => {
                if (name && emp_code) {
                    // getEmployeLeaveRecords(name, emp_code);
                } else if (user?.role?.name == 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations' || user?.role?.name == 'Team Lead') {
                    setRemainingLeaves({});
                }
                dispatch(spinLoaderShow(false));
            });
    };

    const getResourceByIDData = () => {
        // dispatch(spinLoaderShow(true));

        getResourceByID(user?.resource_id)
            .then((res: any) => {
                setTeamLead(res?.is_team_lead as boolean);
            })
            .catch(() => {
                toast.error('Some thing Went Wrong');
            })
            .finally(() => {
                // dispatch(spinLoaderShow(false));
            });
    };

    useEffect(() => {
        getDepartmentData();
        getEmployeData(startTime, endTime);

        if (user?.role?.name == 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations') {
            return;
        }
        getResourceByIDData();
    }, []);

    useEffect(() => {
        getAllResources()
            .then((result: any) => {
                setUsers(result);
            })
            .catch((error) => {
                toast.error(error?.message ?? error);
            });
    }, []);

    const handleReject = async () => {
        const newData = { id: rowData?.id, is_approved: 'REJECTED' };
        await extraHourStatus(newData)
            .then((response) => {
                toast.success('Hours Has been Rejected');
                getEmployeData(moment(today).subtract(30, 'days').calendar(), endTime, department, name, empCode);
                cancelModal();
            })
            .catch((error) => {
                toast.error(error?.message ?? error);
            });
    };
    const handleApprove = async () => {
        const newData = { id: rowData?.id, is_approved: 'APPROVED' };
        await extraHourStatus(newData)
            .then((response) => {
                toast.success('Hours Has been Approved');
                cancelModal();
                getEmployeData(moment(today).subtract(30, 'days').calendar(), endTime, department, name, empCode);
            })
            .catch((error) => {
                toast.error(error?.message ?? error);
            });
    };

    const getResourceCategoryData = () => {
        dispatch(spinLoaderShow(true));
        getResourceCategory()
            .then((res) => {
                setResource(res);
            })
            .catch((err) => {
                console.log('err', err);
                toast.error(err?.message ?? err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };
    const getDepartWiseData = async () => {
        dispatch(spinLoaderShow(true));
        getDepartmentWise(department)
            .then((res) => {
                setResource(res);
            })
            .catch((err) => {
                console.log('err', err);
                toast.error(err?.message ?? err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    useEffect(() => {
        if (department) {
            getDepartWiseData();
        } else {
            getResourceCategoryData();
        }
    }, [department]);

    const generateMonthYearOptions = () => {
        const options: any = [];
        years.forEach((year) => {
            months.forEach((month) => {
                options.push({ value: `${year}-${month.value}`, label: `${month.label} ${year}` });
            });
        });
        return options;
    };

    const monthYearOptions = generateMonthYearOptions();

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'List of Extra Hour'} icon title rightAlign />

            <SubCard>
                <Grid container display={'flex'} alignItems={'center'}>
                    <Grid container display={'flex'} alignItems={'center'} spacing={0} sx={{ marginBottom: '12px' }}>
                        <Grid item xs={9.5} md={9.5} sm={9.5}>
                            <Grid container display={'flex'} alignItems={'center'}>
                                <>
                                    <Grid item xs={2} md={2} sm={2} sx={{ marginRight: '10px' }}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker1
                                                open={startTimeOpen}
                                                onOpen={() => setStartTimeOpen(true)}
                                                onClose={() => setStartTimeOpen(false)}
                                                renderInput={(props: any) => (
                                                    <TextField fullWidth {...props} helperText="" onClick={(e) => setStartTimeOpen(true)} />
                                                )}
                                                label="Start Time"
                                                value={startTime}
                                                onChange={(e) => hanldeStartTimeChange(e)}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid item xs={2} md={2} sm={2} sx={{ marginRight: '10px' }}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker1
                                                open={startEndOpen}
                                                onOpen={() => setEndTimeOpen(true)}
                                                onClose={() => setEndTimeOpen(false)}
                                                renderInput={(props: any) => (
                                                    <TextField fullWidth {...props} helperText="" onClick={(e) => setEndTimeOpen(true)} />
                                                )}
                                                label="End Time"
                                                value={endTime}
                                                onChange={(e) => hanldeEndTimeChange(e)}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                </>
                                <Grid item xs={2} md={2} sm={2} sx={{ marginRight: '10px' }}>
                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        options={leavestatusoptions}
                                        value={selectleaveStatus}
                                        onChange={handleLaeveStatusChange}
                                        sx={{ width: '100%' }}
                                        renderInput={(params: any) => <TextField {...params} label="Select Status" />}
                                    />
                                </Grid>

                                {(user?.role?.name == 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations' || teamLead) && (
                                    <>
                                        <Grid item xs={2.5} md={2.5} sm={2.5} style={{ marginBottom: '7px' }}>
                                            <AutoCompleteField
                                                errors={!!errors?.resourceId}
                                                fieldName="resourceId"
                                                autoComplete="off"
                                                label="Resource *"
                                                control={control}
                                                setValue={setValue}
                                                options={resource}
                                                returnObject={false}
                                                iProps={{
                                                    onChange: handleChangeEmployee
                                                }}
                                                isLoading={true}
                                                optionKey="id"
                                                optionValue="name"
                                            />
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </Grid>
                        <Grid item xs={2.5} md={2.5} sm={2.5} gap={1} display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
                            <Button onClick={onSearch} variant="contained">
                                Search
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

                <TableContainer component={Paper} className="custom__table">
                    <Table>
                        <TableHead>
                            <TableRow style={{ background: '#6e529e' }}>
                                {columns?.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        style={{
                                            minWidth: column.minWidth,
                                            border: '1px solid #fff',
                                            color: '#fff',
                                            textAlign: 'center',
                                            fontSize: '12px',
                                            padding: '8px 16px'
                                        }}
                                    >
                                        {column.id === 'sstatus' ? (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {column.label}
                                                <Select
                                                    value=""
                                                    onChange={handleStatusChange}
                                                    displayEmpty
                                                    input={<CustomInput />}
                                                    style={{
                                                        marginLeft: '8px',
                                                        color: '#fff',
                                                        backgroundColor: '#6e529e',
                                                        border: '1px solid #fff',
                                                        fontSize: '12px',
                                                        boxShadow: 'none !important',
                                                        height: '30px'
                                                    }}
                                                    sx={{
                                                        '& .MuiSelect-icon': {
                                                            color: '#fff !important',
                                                            border: 'none !important',
                                                            padding: 'auto 0px !important',
                                                            boxShadow: 'none !important'
                                                        },
                                                        '& .MuiSelect-select': {
                                                            border: 'none !important',
                                                            boxShadow: 'none !important',
                                                            padding: 'auto 0px !important'
                                                        },
                                                        '& .MuiSelect-root': {
                                                            border: 'none !important',
                                                            padding: 'auto 0px !important',
                                                            boxShadow: 'none !important',
                                                            paddingRight: '12px'
                                                        },
                                                        '& .css-1tkrbbx-MuiSelect-select-MuiInputBase-input.css-1tkrbbx-MuiSelect-select-MuiInputBase-input.css-1tkrbbx-MuiSelect-select-MuiInputBase-input':
                                                            {
                                                                paddingRight: '6px'
                                                            },

                                                        border: 'none !important',
                                                        padding: 'auto 0px !important',
                                                        boxShadow: 'none !important',
                                                        paddingLeft: '12px'
                                                    }}
                                                >
                                                    {statusOptions.map((option) => (
                                                        <MenuItem key={option.id} value={option.id}>
                                                            {option.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </div>
                                        ) : (
                                            column.label
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filterData?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">
                                        <Typography variant="subtitle1" color="textSecondary">
                                            No records found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filterData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row: any) => (
                                    <TableRow key={row.id}>
                                        <TableCell align="center" style={{ width: '80px' }}>
                                            <>
                                                <Typography textAlign={'center'} variant="caption">
                                                    {' '}
                                                    {console.log(row, 'for data')}
                                                    {row?.emp_code}
                                                </Typography>
                                            </>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.user?.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.user?.resource?.department?.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {/* <span>{moment(row?.date).format('Do MMM, YYYY')}</span> */}
                                                <span>{row?.date ? moment(row?.date).format('dddd - Do MMM, YYYY') : '-'}</span>
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.start_time ? (
                                                    <>
                                                        <span>{moment(row?.start_time).format('LT')}</span>
                                                    </>
                                                ) : (
                                                    <span>-</span>
                                                )}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.end_time ? (
                                                    <>
                                                        <span>{moment(row?.end_time).format('LT')}</span>
                                                        {/* <span>{moment().utc(row?.end_time).tz('Asia/Karachi').format('LT')}</span> */}
                                                    </>
                                                ) : (
                                                    <span>-</span>
                                                )}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.hours ?? '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.is_approved === 'APPROVED' ? (
                                                    <Chip
                                                        label={row?.is_approved?.slice(0, 1) + row?.is_approved?.slice(1).toLowerCase()}
                                                        sx={{
                                                            color: 'rgb(0, 200, 83)',
                                                            backgroundColor: 'rgba(185, 246, 202, 0.376)',
                                                            fontSize: '11px',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                ) : row?.is_approved === 'PENDING' ? (
                                                    <Chip
                                                        label={row?.is_approved?.slice(0, 1) + row?.is_approved?.slice(1).toLowerCase()}
                                                        sx={{
                                                            // color: 'rgb(255, 193, 7)',
                                                            color: '#BA8B00',
                                                            backgroundColor: 'rgb(255, 248, 225)',
                                                            fontSize: '11px',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label={row?.is_approved?.slice(0, 1) + row?.is_approved?.slice(1).toLowerCase()}
                                                        sx={{
                                                            color: 'rgb(216, 67, 21)',
                                                            backgroundColor: 'rgb(251, 233, 231)',
                                                            fontSize: '11px',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                )}
                                            </Typography>
                                        </TableCell>
                                        <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                            <MoreVertIcon
                                                dis-able={user?.role != 'Super Admin'}
                                                sx={{ cursor: 'pointer' }}
                                                onClick={() => OpenCommentModal(row)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[rowsPerPage]}
                        component="animate"
                        count={filterData?.length ?? 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>
            </SubCard>

            {open && (
                <div>
                    <Modal
                        open={addComment}
                        onClose={cancelModal}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <form onSubmit={handleSubmit(handleClose)}>
                                {/* <Typography id="modal-modal-title" variant="h4" component="h2">
                                    Comment
                                </Typography> */}
                                {/* <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                    {/* <TextField
                                    placeholder="Enter number of extra hours if any... "
                                    multiline={false}
                                    rows={4}
                                    value={hours}
                                    onChange={(e) => handleHoursChange(e)}
                                    style={{ width: '100%' }}
                                /> */}

                                {/* <TextFieldControlled
                                        placeholder="Enter number of extra hours if any... "
                                        multiline={false}
                                        rows={4}
                                        value={hours}
                                        // onChange={(e: any) => handleHoursChange(e)}
                                        // onChange={handleHoursChange}
                                        style={{ width: '100%' }}
                                        control={control}
                                        errors={!!errors?.hours}
                                        helperText={errors?.hours && errors?.hours?.message}
                                        fieldName="hours"
                                        disabled={user?.role?.name == 'Super Admin'}
                                        // (user?.role?.name == 'Super Admin'
                                    />
                                </Typography> */}
                                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                    <Typography id="modal-modal-title" variant="h4" component="h2">
                                        Users Comment
                                    </Typography>
                                    <TextFieldControlled
                                        placeholder="Enter Comment"
                                        multiline={true}
                                        rows={4}
                                        value={user_comment}
                                        // onChange={(e) => handleCommentChange(e)}
                                        style={{ width: '100%', minHeight: '100px' }}
                                        control={control}
                                        errors={!!errors?.user_comment}
                                        helperText={errors?.user_comment && errors?.user_comment?.message}
                                        fieldName="user_comment"
                                        disabled={user?.role?.name == 'Super Admin'}
                                    />
                                </Typography>

                                {user?.role?.name !== 'Super Admin' ? (
                                    <>
                                        <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right' }}>
                                            {' '}
                                            <Button variant="contained" onClick={() => cancelModal()}>
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="contained"
                                                // onClick={() => {
                                                //     handleClose();
                                                // }}
                                                type="submit"
                                            >
                                                Ok
                                            </Button>
                                        </Stack>
                                    </>
                                ) : (
                                    <>
                                        {' '}
                                        {/* <Button variant="contained" onClick={() => cancelModal()}> */}
                                        {rowData?.is_approved == 'APPROVED' || rowData?.is_approved == 'REJECTED' ? (
                                            <>
                                                <Stack
                                                    direction="row"
                                                    spacing={2}
                                                    sx={{ margin: 'auto', mt: 2, float: 'center', textAlign: 'center', width: '100%' }}
                                                >
                                                    <p style={{ fontWeight: '700' }}>Status: {rowData?.is_approved.toLowerCase()}</p>
                                                </Stack>
                                            </>
                                        ) : (
                                            <>
                                                <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right', width: '100%' }}>
                                                    <Button variant="contained" onClick={handleReject}>
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        // onClick={() => {
                                                        //     handleClose();
                                                        // }}
                                                        // type="submit"
                                                        onClick={handleApprove}
                                                    >
                                                        Approve
                                                    </Button>
                                                </Stack>
                                            </>
                                        )}
                                    </>
                                )}
                            </form>
                        </Box>
                    </Modal>
                </div>
            )}
        </>
    );
};

export default index;

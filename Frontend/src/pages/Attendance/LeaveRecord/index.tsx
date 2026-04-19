import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import React, { ReactNode, useEffect, useState } from 'react';
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
    Chip,
    Typography,
    InputBase,
    MenuItem,
    Select
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import SubCard from 'ui-component/cards/SubCard';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getEmployeLeaveRecords } from 'services/attendance';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import GenericModal from 'components/uiComopnents/GenericModal/GenericModal';
import ApprovalModal from 'components/ApprovalModal';
import BasicPopover from 'components/PopOver/PopOver';
import LeaveModalComment from 'components/LeaveModalComment/LeaveModalComment';
import Autocomplete from '@mui/material/Autocomplete';
import { getResourceCategory } from 'services/Allocation/taskServices';
import { AutoCompleteField } from 'ui-component/formsField/FormFields';
import { useForm } from 'react-hook-form';
import { styled } from '@mui/system';

enum ApplicationType {
    'Apply Leave' = 1,
    'Work From Home' = 2
}

enum LeaveType {
    'Sick Leave' = 1,
    'Casual Leave' = 2,
    'Planned Leave' = 3,
    'Annual Leave' = 4,
    'Paternity Leave' = 5,
    'Maternity Leave' = 6
}

const leavestatusoptions = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Approved', value: 'APPROVED' }
];

export const PaymentAction = ({ data, handleUserClick }: any) => {
    const [open, setOpen] = useState(false);
    // const navigate = useNavigate();
    const [modalChildren, setModalChildren] = useState<ReactNode | undefined>(undefined);
    // const viewMilestone = () => {
    //     handleUserClick(data);
    // };

    const handleClose = () => {
        setOpen(false);
        setModalChildren(() => undefined);
    };

    const viewReason = () => {
        setModalChildren(() => undefined);
        setOpen(true);
        setModalChildren(() => <LeaveModalComment data={data} handleClose={handleClose} />);
    };

    const commonDivStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        cursor: 'pointer',
        backgroundColor: '#ffffff'
    };

    return (
        <div>
            <GenericModal isOpen={open} onClose={handleClose} children={modalChildren} width={400} />
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    zIndex: '99999999 !important'
                }}
            >
                <p
                    style={{ color: '#757575', fontSize: '12px', margin: 0, cursor: 'pointer' }}
                    onClick={data?.reason_rejection ? viewReason : undefined}
                >
                    Rejection Comment
                </p>
            </div>
            {/* <div style={commonDivStyle} onClick={viewMilestone}> */}
            <div style={commonDivStyle} onClick={() => console.log(handleUserClick(data))}>
                <p style={{ color: '#757575', fontSize: '12px', margin: 0 }}>Approval Required</p>
            </div>
        </div>
    );
};

const statusOptions = [
    { id: undefined, name: 'All Applications' },
    { id: '1', name: 'Leave' },
    { id: '2', name: 'Work From Home' }
];

const LeaveRecord = () => {
    const {
        control,
        formState: { errors },
        setValue
    }: any = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange'
    });

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

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [state, setState] = useState<any>([]);
    const [openMOdel, setOpenModel] = useState(false);
    const [modalChildren, setModalChildren] = useState<ReactNode | undefined>(undefined);
    const [selectleaveStatus, setLeaveStatus] = useState(null);
    const [resource, setResource] = useState<any>([]);
    const [selectedResouce, setSelectedResource] = useState<any>({});
    const [selectedApplication, setSelectedApplication] = useState();

    const handleLaeveStatusChange = (event: any, newValue: any) => {
        setLeaveStatus(newValue);
    };

    const currentDate = new Date();
    const localUser: any = localStorage.getItem('user');
    const user: any = JSON.parse(localUser);

    const [startTime, setStartTime] = useState<any>(currentDate.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }).slice(0, -3));
    const [endTime, setEndTime] = useState<any>(currentDate.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }).slice(0, -3));

    const [startTimeOpen, setStartTimeOpen] = React.useState(false);
    const [startEndOpen, setEndTimeOpen] = React.useState(false);

    const dispatch = useDispatch();

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

    const columns = [
        { id: 'employement_code', label: 'Employee Code', minWidth: 40 },
        { id: 'name', label: 'Name', minWidth: 40 },
        { id: 'department', label: 'Department', minWidth: 40 },
        { id: 'start_date', label: 'Date', minWidth: 50 },
        { id: 'applicationTypeId', label: 'Application Type', minWidth: 50 },
        { id: 'leaveTypeId', label: 'Leave Type', minWidth: 50 },
        { id: 'is_halfday', label: 'Off', minWidth: 70 },
        { id: 'leave_status', label: 'Status', minWidth: 30 },
        { id: 'actions', label: 'Action', minWidth: 30 }
    ];

    const getEmployeLeaveData = (
        startTime: any,
        endTime: any,
        selectleaveStatus?: any,
        employement_code?: string,
        applicationTypeId?: string
    ) => {
        dispatch(spinLoaderShow(true));
        getEmployeLeaveRecords(startTime, endTime, selectleaveStatus, employement_code, applicationTypeId)
            .then((res: any) => {
                res?.forEach((x: any) => {
                    x.isOff = x?.is_halfday ? 'Half Day' : 'Full Day';
                });
                setState(res);
                setPage(0);
            })
            .catch((err) => {
                console.log('err', err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const onSearch = () => {
        getEmployeLeaveData(startTime, endTime, selectleaveStatus, selectedResouce, selectedApplication);
    };

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const handleResouceChange = (e: any) => {
        if (e) {
            setSelectedResource(e?.user?.[0]?.employement_code);
        } else {
            setSelectedResource(null);
        }
    };

    const getResourceCategoryData = () => {
        dispatch(spinLoaderShow(true));
        getResourceCategory()
            .then((res) => {
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
        getResourceCategoryData();
        getEmployeLeaveData(startTime, endTime);
    }, []);

    const handleClose = () => {
        setOpenModel(false);
        setModalChildren(() => undefined);
    };

    const handleAssetId = (data: any) => {
        // if (user?.role?.name == 'Super Admin' || user?.role?.name == 'Team Lead' || user.resource_id != data?.resource_id) {
        //     if (user?.role?.name == 'Super Admin' || user?.role?.name == 'Team Lead' || user?.resource?.is_team_lead == true) {
        //         if (data?.leave_status != 'PENDING') {
        //             return;
        //         }
        //         let days = calculateDays(moment(data.start_date), moment(data.end_date));
        //         if (days > 2 && user?.role?.name != 'Super Admin' && user?.role?.name != 'Team Lead') {
        //             return;
        //         }
        //         setOpenModel(true);
        //         setModalChildren(() => <ApprovalModal data={data} closingModal={handleClose} onSearch={onSearch} />);
        //     }
        // }

        const isSuperAdminOrTeamLead =
            user?.role?.name === 'Super Admin' ||
            user?.role?.name === 'Team Lead' ||
            user?.role?.name === 'Human Resource' ||
            user?.role?.name === 'Human Resource Operations';
        const isTeamLeadResource = user?.resource?.is_team_lead === true;
        const isResourceMismatch = user?.resource_id !== data?.resource_id;
        const isPendingStatus = data?.leave_status === 'PENDING';

        if ((isSuperAdminOrTeamLead || isResourceMismatch) && (isSuperAdminOrTeamLead || isTeamLeadResource)) {
            if (!isPendingStatus) return;

            const days = calculateDays(moment(data.start_date), moment(data.end_date));

            if (days > 2 && !isSuperAdminOrTeamLead) return;

            setOpenModel(true);
            setModalChildren(() => <ApprovalModal data={data} closingModal={handleClose} onSearch={onSearch} />);
        }
    };

    function calculateDays(startDate: any, endDate: any) {
        const currentMoment = startDate.clone();
        let businessDays = 0;

        while (currentMoment.isBefore(endDate) || currentMoment.isSame(endDate)) {
            businessDays++;
            currentMoment.add(1, 'day');
        }

        return businessDays == 0 ? 1 : businessDays;
    }

    const handleStatusChange = (event: any) => {
        const selectedStatus = event.target.value;
        setSelectedApplication(selectedStatus);

        getEmployeLeaveData(startTime, endTime, selectleaveStatus, selectedResouce, selectedStatus);
    };

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'Leave Records'} icon title rightAlign />
            <GenericModal isOpen={openMOdel} onClose={handleClose} children={modalChildren} width={400} />
            <SubCard>
                <Grid container display={'flex'} alignItems={'center'}>
                    <Grid item xs={2} md={2} sm={2} sx={{ marginRight: '10px' }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                open={startTimeOpen}
                                onOpen={() => setStartTimeOpen(true)}
                                onClose={() => setStartTimeOpen(false)}
                                renderInput={(props: any) => (
                                    <TextField fullWidth {...props} helperText="" onClick={() => setStartTimeOpen(true)} />
                                )}
                                label="Start Time"
                                value={startTime}
                                onChange={hanldeStartTimeChange}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={2} md={2} sm={2} sx={{ marginRight: '10px' }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                open={startEndOpen}
                                onOpen={() => setEndTimeOpen(true)}
                                onClose={() => setEndTimeOpen(false)}
                                renderInput={(props: any) => (
                                    <TextField fullWidth {...props} helperText="" onClick={() => setEndTimeOpen(true)} />
                                )}
                                label="End Time"
                                value={endTime}
                                onChange={hanldeEndTimeChange}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={2} md={2} sm={2} sx={{ marginRight: '10px' }}>
                        <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            options={leavestatusoptions}
                            value={selectleaveStatus}
                            onChange={handleLaeveStatusChange}
                            sx={{ width: '100%' }}
                            renderInput={(params: any) => <TextField {...params} label="Select Leave Status" />}
                        />
                    </Grid>
                    {['Super Admin', 'Human Resource', 'Human Resource Operations'].includes(user?.role?.name) && (
                        <Grid item xs={3} md={3} sm={3} sx={{ paddingBottom: '10px', marginRight: '10px' }}>
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
                                    onChange: handleResouceChange
                                }}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.resourceId && errors?.resourceId?.message}
                            />
                        </Grid>
                    )}

                    <Grid item xs={2} md={2} sm={2} sx={{ marginRight: '10px' }}>
                        <Button onClick={onSearch} variant="contained">
                            Search
                        </Button>
                    </Grid>

                    <TableContainer component={Paper} className="custom__table" sx={{ marginTop: '12px' }}>
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
                                            {/* {column.label} */}
                                            {column.id === 'applicationTypeId' ? (
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
                                {state?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row: any) => (
                                    <TableRow key={row.id}>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.employement_code}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                <TableCell
                                                    style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}
                                                >
                                                    <p style={{ fontSize: '12px', color: '#808080', lineHeight: 1.2, margin: 0 }}>
                                                        {row?.user?.name}
                                                    </p>
                                                    <p style={{ fontSize: '10px', color: '#808080', lineHeight: 1.2, margin: 0 }}>
                                                        {row?.user?.designation}
                                                    </p>
                                                </TableCell>
                                                {/* <>
                                                    {console.log(row?.user?.designation, 'kahfhdaf')}
                                                    {row?.user?.name}
                                                </> */}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                <span style={{ fontSize: '11px' }}>{row?.resource?.department?.name}</span>
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                <span>{moment(row?.start_date).format('dddd, Do MMM, YYYY')}</span>
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                <>
                                                    {ApplicationType[row?.applicationTypeId] === 'Apply Leave' ? (
                                                        <Chip
                                                            label={ApplicationType[row?.applicationTypeId]}
                                                            sx={{
                                                                color: 'rgb(216, 67, 21)',
                                                                backgroundColor: 'rgb(251, 233, 231)',
                                                                fontSize: '10px',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    ) : ApplicationType[row?.applicationTypeId] === 'Work From Home' ? (
                                                        <Chip
                                                            label={ApplicationType[row?.applicationTypeId]}
                                                            sx={{
                                                                // color: 'rgb(255, 193, 7)',
                                                                color: '#BA8B00',
                                                                backgroundColor: 'rgb(255, 248, 225)',
                                                                fontSize: '10px',
                                                                fontWeight: 600
                                                            }}
                                                            // />
                                                        />
                                                    ) : (
                                                        <p>{ApplicationType[row?.applicationTypeId] ?? '-'}</p>
                                                    )}
                                                </>
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.applicationTypeId == 1 ? LeaveType[row?.leaveTypeId] ?? '-' : '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.isOff}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {isNaN(row?.leave_status) ? (
                                                    row?.leave_status?.slice(0, 1) + row?.leave_status?.slice(1)?.toLowerCase() ===
                                                    'Pending' ? (
                                                        <Chip
                                                            label={'Pending'}
                                                            sx={{
                                                                color: '#BA8B00',
                                                                backgroundColor: 'rgb(255, 248, 225)',
                                                                fontSize: '10px',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    ) : row?.leave_status?.slice(0, 1) + row?.leave_status?.slice(1)?.toLowerCase() ===
                                                      'Rejected' ? (
                                                        <Chip
                                                            label={'Rejected'}
                                                            sx={{
                                                                color: 'rgb(216, 67, 21)',
                                                                backgroundColor: 'rgb(251, 233, 231)',
                                                                fontSize: '10px',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    ) : row?.leave_status?.slice(0, 1) + row?.leave_status?.slice(1)?.toLowerCase() ===
                                                      'Approved' ? (
                                                        <Chip
                                                            label={'Approved'}
                                                            sx={{
                                                                color: 'rgb(0, 200, 83)',
                                                                backgroundColor: 'rgba(185, 246, 202, 0.376)',
                                                                fontSize: '11px',
                                                                fontWeight: 600
                                                            }}
                                                        />
                                                    ) : (
                                                        ''
                                                    )
                                                ) : (
                                                    ''
                                                )}
                                            </Typography>
                                        </TableCell>
                                        <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                            <BasicPopover content={<PaymentAction data={row} handleUserClick={handleAssetId} />}>
                                                <MoreVertIcon sx={{ cursor: 'pointer' }} style={{ color: '#5e35b1' }} />
                                            </BasicPopover>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[rowsPerPage]}
                            component="animate"
                            count={state?.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </TableContainer>
                </Grid>
            </SubCard>
        </>
    );
};

export default LeaveRecord;

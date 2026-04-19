import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
// material-ui
import {
    Button,
    Grid,
    TextField,
    Typography,
    Box,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AutoCompleteField, SwitchFieldDefault } from 'ui-component/formsField/FormFields';
import * as yup from 'yup';
import { fixAttendance, fixMonthlyDeduction, getRemainingLeaves } from 'services/attendance';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getResourceCategory } from 'services/Allocation/taskServices';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';

const validationSchema = yup.object().shape({});

const FixAttendanceManage = () => {
    const defautlFormValues = {
        status: true,
        is_late: false,
        is_halfday: false,
        is_fullday: false,
        mark_late: false,
        mark_halfday: false,
        mark_fullday: false
    };
    const {
        control,
        register,
        reset,
        setError,
        formState: { errors },
        setValue,
        getValues,
        handleSubmit
    }: any = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defautlFormValues,
        resolver: yupResolver(validationSchema)
    });

    const [resource, setResource] = useState<any>([]);
    const [dateOpen, setDateOpen] = useState(false);
    const [dateTime, setDateTime] = useState<any>(null);
    const [timein, setTimein] = useState<any>(null);
    const [timeout, setTimeout] = useState<any>(null);
    const [remainingLeaves, setRemainingLeaves] = useState<any>(null);
    const [selectedResouce, setSelectedResource] = useState<any>({});
    const [openModal, setOpenModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getEmployeLeaveRecords = async (name: string) => {
        try {
            const res = await getRemainingLeaves(name?.trim());

            setRemainingLeaves(res);
        } catch (error) {
            console.log('error', error);
        }
    };

    const handleResouceChange = (e: any) => {
        if (e) {
            setSelectedResource(e);
            getEmployeLeaveRecords(e?.name);
        } else {
            setSelectedResource(null);
            setRemainingLeaves(null);
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

    const onSubmit = (data: any) => {
        if (data?.resourceId && data?.date) {
            data.timein = timein ? timein?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
            data.timeout = timeout ? timeout?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;

            if (timein) {
                let selectedCheckIn = new Date(data.date); // Example selected date
                selectedCheckIn.setHours(timein?.getHours() ?? 0);
                selectedCheckIn.setMinutes(timein?.getMinutes() ?? 0);

                // Format the date as 'MM/dd/yyyy, HH:mm:ss'
                let formattedCheckin =
                    selectedCheckIn.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }) +
                    ', ' +
                    selectedCheckIn.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                data.timein = formattedCheckin;
            }

            if (timeout) {
                let selectedCheckOut = new Date(data.date); // Example selected date
                selectedCheckOut.setHours(timeout?.getHours() ?? 0);
                selectedCheckOut.setMinutes(timeout?.getMinutes() ?? 0);

                // Format the date as 'MM/dd/yyyy, HH:mm:ss'
                let formattedCheckOut =
                    selectedCheckOut.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }) +
                    ', ' +
                    selectedCheckOut.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                data.timeout = formattedCheckOut;
            }

            let selectedDate = new Date(data.date);
            selectedDate.setHours(23);
            selectedDate.setMinutes(59);

            data.date = selectedDate;

            dispatch(spinLoaderShow(true));

            fixAttendance(data)
                .then((res) => {
                    toast.success('Attendance fixed sucessfully');
                    getEmployeLeaveRecords(selectedResouce?.name);
                })
                .catch((err) => {
                    console.log('err');
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        } else {
            toast.error('Please select date and employee');
        }
    };

    const handleSave = (rowData: any) => {
        dispatch(spinLoaderShow(true));
        setOpenModal(false);

        fixMonthlyDeduction(rowData)
            .then(() => {
                toast.success('Record Updated Successfully');
                getEmployeLeaveRecords(selectedResouce?.name);
            })
            .catch(() => {
                toast.error('Error');
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    useEffect(() => {
        getResourceCategoryData();
    }, []);

    return (
        <React.Fragment>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ width: '100%' }}>
                    <SubCard>
                        <Grid
                            container
                            item
                            sm={12}
                            md={12}
                            lg={12}
                            display={'flex'}
                            alignItems={'center'}
                            justifyContent={'space-between'}
                        >
                            <Grid item xs={3} md={3} sm={3}>
                                <Typography>Employee</Typography>
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

                            <Grid item xs={2.5} md={2.5} sm={2.5}>
                                <Typography sx={{ marginBottom: '8px' }}>Date *</Typography>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        open={dateOpen}
                                        onOpen={() => setDateOpen(true)}
                                        onClose={() => setDateOpen(false)}
                                        renderInput={(props: any) => (
                                            <TextField fullWidth {...props} helperText="" {...register('date', { required: true })} />
                                        )}
                                        label="Date"
                                        value={dateTime}
                                        onChange={(newValue: Date | null) => {
                                            const dateObject = new Date(newValue ?? '');
                                            const localISOString = dateObject
                                                .toLocaleString('en-US', { timeZone: 'Asia/Karachi' })
                                                .slice(0, -3);
                                            setDateTime(localISOString);
                                            setValue('date', localISOString);
                                        }}
                                    />
                                </LocalizationProvider>
                                <span style={{ color: 'red' }}>{errors?.date && errors?.date.message}</span>
                            </Grid>

                            <Grid item xs={2.5} md={2.5} sm={2.5}>
                                <Typography sx={{ marginBottom: '8px' }}>Check In</Typography>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <TimePicker
                                        value={timein}
                                        onChange={(newValue: any) => setTimein(newValue)}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item xs={2.5} md={2.5} sm={2.5}>
                                <Typography sx={{ marginBottom: '8px' }}>Check Out</Typography>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <TimePicker
                                        value={timeout}
                                        onChange={(newValue: any) => setTimeout(newValue)}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                            </Grid>
                        </Grid>

                        <Grid container item sm={12} md={12} lg={12} display={'flex'} alignItems={'center'}>
                            <Grid item xs={2.5} md={2} sm={2} sx={{ margin: '5px' }}>
                                <SwitchFieldDefault
                                    errors={!!errors?.mark_late}
                                    fieldName="mark_late"
                                    label="Mark Late"
                                    control={control}
                                    setValue={setValue}
                                    isLoading={true}
                                    helperText={errors?.mark_late && errors?.mark_late?.message}
                                />
                            </Grid>

                            <Grid item xs={2} md={2} sm={2} sx={{ margin: '5px' }}>
                                <SwitchFieldDefault
                                    errors={!!errors?.mark_halfday}
                                    fieldName="mark_halfday"
                                    label="Mark Halfday"
                                    control={control}
                                    setValue={setValue}
                                    isLoading={true}
                                    helperText={errors?.mark_halfday && errors?.mark_halfday?.message}
                                />
                            </Grid>

                            <Grid item xs={2} md={2} sm={2} sx={{ margin: '5px' }}>
                                <SwitchFieldDefault
                                    errors={!!errors?.mark_fullday}
                                    fieldName="mark_fullday"
                                    label="Mark fullday"
                                    control={control}
                                    setValue={setValue}
                                    isLoading={true}
                                    helperText={errors?.mark_fullday && errors?.mark_fullday?.message}
                                />
                            </Grid>
                        </Grid>

                        <Grid container item sm={12} md={12} lg={12} display={'flex'} alignItems={'center'}>
                            <Grid item xs={2} md={2} sm={2} sx={{ margin: '5px' }}>
                                <SwitchFieldDefault
                                    errors={!!errors?.is_late}
                                    fieldName="is_late"
                                    label="Fix Late"
                                    control={control}
                                    setValue={setValue}
                                    isLoading={true}
                                    helperText={errors?.is_late && errors?.is_late?.message}
                                />
                            </Grid>

                            <Grid item xs={2} md={2} sm={2} sx={{ margin: '5px' }}>
                                <SwitchFieldDefault
                                    errors={!!errors?.is_halfday}
                                    fieldName="is_halfday"
                                    label="Fix Halfday"
                                    control={control}
                                    setValue={setValue}
                                    isLoading={true}
                                    helperText={errors?.is_halfday && errors?.is_halfday?.message}
                                />
                            </Grid>

                            <Grid item xs={2} md={2} sm={2} sx={{ margin: '5px' }}>
                                <SwitchFieldDefault
                                    errors={!!errors?.is_fullday}
                                    fieldName="is_fullday"
                                    label="Fix fullday"
                                    control={control}
                                    setValue={setValue}
                                    isLoading={true}
                                    helperText={errors?.is_fullday && errors?.is_fullday?.message}
                                />
                            </Grid>
                        </Grid>

                        <Grid item xs={2} md={2} sm={2}>
                            <Button variant="contained" type="submit" sx={{ m: 3 }} className={'red'}>
                                Apply
                            </Button>
                        </Grid>
                    </SubCard>

                    {remainingLeaves && (
                        <SubCard sx={{ marginTop: '20px' }}>
                            <Grid item xs={12} md={12} sm={12} sx={{ mt: 2, mb: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={1.5} md={1.5} sm={1.5}>
                                        <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                                            Total Leaves
                                        </Typography>
                                        <h1 style={{ textAlign: 'center' }}>
                                            <span>{remainingLeaves?.total_leaves ?? 0}</span>
                                        </h1>
                                    </Grid>
                                    <Grid item xs={2} md={2} sm={2}>
                                        <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: '#4BB543' }}>
                                            Remaining Leaves
                                        </Typography>
                                        <h1 style={{ textAlign: 'center', color: '#4BB543' }}>
                                            {remainingLeaves?.remaining_leaves > 0 ? remainingLeaves?.remaining_leaves : 0}
                                        </h1>
                                    </Grid>
                                    <Grid item xs={1.5} md={1.5} sm={1.5}>
                                        <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'purple' }}>
                                            Availed Leaves
                                        </Typography>
                                        <h1 style={{ textAlign: 'center', color: 'purple' }}>{remainingLeaves?.availed_leaves ?? 0}</h1>
                                    </Grid>
                                    <Grid item xs={1.5} md={1.5} sm={1.5}>
                                        <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'blue' }}>
                                            Availed WFH
                                        </Typography>
                                        <h1 style={{ textAlign: 'center', color: 'blue' }}>{remainingLeaves?.availed_wfh ?? 0}</h1>
                                    </Grid>
                                    <Grid item xs={1.5} md={1.5} sm={1.5}>
                                        <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'orange' }}>
                                            Lates
                                        </Typography>
                                        <h1 style={{ textAlign: 'center', color: 'orange' }}>
                                            {remainingLeaves?.monthly_records?.reduce(
                                                (acc: any, entry: any) => acc + (entry?.late_count || 0),
                                                0
                                            ) ?? 0}
                                        </h1>
                                    </Grid>
                                    <Grid item xs={1.5} md={1.5} sm={1.5}>
                                        <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'red' }}>
                                            Deduction
                                        </Typography>
                                        <h1 style={{ textAlign: 'center', color: 'red' }}>
                                            {remainingLeaves?.monthly_records?.reduce(
                                                (acc: any, entry: any) =>
                                                    acc + (entry?.deduction_leaves || 0) + (entry?.deduction_late || 0),
                                                0
                                            ) ?? 0}
                                        </h1>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {remainingLeaves?.monthly_records?.length > 0 && (
                                <Grid item xs={12} md={12} sm={12}>
                                    <Typography variant="h4" component="h2" style={{ textAlign: 'center' }}>
                                        Monthly Record
                                    </Typography>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center">Month</TableCell>
                                                    <TableCell align="center">Late Count</TableCell>
                                                    <TableCell align="center">Deduction Late</TableCell>
                                                    <TableCell align="center">Deduction Leaves</TableCell>
                                                    <TableCell align="center">Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {remainingLeaves?.monthly_records?.map((x: any) => (
                                                    <TableRow key={x.month}>
                                                        <TableCell align="center">
                                                            {new Date(2022, x.month - 1, 1).toLocaleString('default', { month: 'long' })}
                                                        </TableCell>
                                                        <TableCell align="center">{x.late_count}</TableCell>
                                                        <TableCell align="center">{x.deduction_late}</TableCell>
                                                        <TableCell align="center">{x.deduction_leaves}</TableCell>
                                                        <TableCell align="center">
                                                            <IconButton
                                                                onClick={() => {
                                                                    setOpenModal(true);
                                                                    setSelectedRow(x);
                                                                }}
                                                            >
                                                                <EditIcon />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            )}
                        </SubCard>
                    )}
                </Box>
            </form>

            <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>Edit Deduction</DialogTitle>
                <DialogContent>
                    {selectedRow && (
                        <Grid sx={{ marginTop: '5px' }} container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Late Count"
                                    type="number"
                                    value={selectedRow.late_count}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (+value >= 0) {
                                            setSelectedRow({ ...selectedRow, late_count: value });
                                        }
                                    }}
                                    fullWidth
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Deduction Late Count"
                                    type="number"
                                    value={selectedRow.deduction_late}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (+value >= 0) {
                                            setSelectedRow({ ...selectedRow, deduction_late: value });
                                        }
                                    }}
                                    fullWidth
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Deduction Leaves Count"
                                    type="number"
                                    value={selectedRow.deduction_leaves}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (+value >= 0) {
                                            setSelectedRow({ ...selectedRow, deduction_leaves: value });
                                        }
                                    }}
                                    fullWidth
                                    inputProps={{ min: 0 }}
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => handleSave(selectedRow)} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default FixAttendanceManage;

import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
// material-ui
import { Button, Grid, Stack, TextField, Typography, Box } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AutoCompleteField, SwitchFieldDefault, TextFieldControlled } from 'ui-component/formsField/FormFields';
import AnimateButton from 'ui-component/extended/AnimateButton';
import * as yup from 'yup';
import { createLeaveRequest, getRemainingLeaves } from 'services/attendance';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const applicationType = [
    {
        id: 1,
        name: 'Apply Leave'
    },
    {
        id: 2,
        name: 'Work From Home'
    }
];

const leaveTypeData = [
    { id: 1, name: 'Sick Leave' },
    { id: 2, name: 'Casual Leave' },
    { id: 3, name: 'Planned Leave' },
    { id: 4, name: 'Annual Leave' }
];

const validationSchema = yup.object().shape({
    applicationTypeId: yup.string().required('Application Type is required').nullable(),
    leaveTypeId: yup.string().when('applicationTypeId', {
        is: '2',
        then: yup.string().notRequired(),
        otherwise: yup.string().required('Leave Type is required').nullable()
    }),
    start_date: yup
        .date()
        .typeError('Start Date must be a valid date')
        .required('Please select Start Date')
        .nullable()
        .transform((value) => (value ? new Date(value) : null)),
    end_date: yup
        .date()
        .typeError('End Date must be a valid date')
        .nullable()
        .when('leaveTypeId', {
            is: (leaveTypeId: any) => leaveTypeId === '5' || leaveTypeId === '6',
            then: yup.date().nullable(),
            otherwise: yup
                .date()
                .min(yup.ref('start_date'), { message: "End date can't be before Start date", inclusive: true })
                .required('Please select End Date')
                .nullable()
        })
        .transform((value) => (value ? new Date(value) : null)),
    reason: yup.string().required('Reason is required').nullable()
});

const LeaveCreateManage = () => {
    const defautlFormValues = {
        status: true,
        is_halfday: false,
        end_date: null
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

    const [startTime, setStartTime] = useState<any>(null);
    const [endTime, setEndTime] = useState<any>(null);
    const [startTimeOpen, setStartTimeOpen] = useState(false);
    const [startEndOpen, setEndTimeOpen] = useState(false);
    const [remainingLeaves, setRemainingLeaves] = useState<any>({});
    const [isLeaveTypeDisabled, setLeaveTypeDisabled] = useState(false);
    const [leaveType, setLeaveType] = useState(leaveTypeData);
    const [isEndDateDisabled, setEndDateDisabled] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getEmployeLeaveRecords = async () => {
        try {
            const res: any = await getRemainingLeaves();

            if (res?.user?.user_details?.[0]?.gender == 'male' && res?.user?.user_details?.[0]?.marital_status !== 'single') {
                let leaveTypeClone = JSON.parse(JSON.stringify(leaveType));
                leaveTypeClone.push({ id: 5, name: 'Paternity Leave' });
                setLeaveType(leaveTypeClone);
            } else if (res?.user?.user_details?.[0]?.gender == 'female' && res?.user?.user_details?.[0]?.marital_status !== 'single') {
                let leaveTypeClone = JSON.parse(JSON.stringify(leaveType));
                leaveTypeClone.push({ id: 6, name: 'Maternity Leave' });
                setLeaveType(leaveTypeClone);
            }

            setRemainingLeaves(res);
        } catch (error) {
            console.log('error', error);
        }
    };

    const handleLeaveTypeChange = (selectedLeaveType: any) => {
        if (selectedLeaveType?.id === 5 || selectedLeaveType?.id === 6) {
            setEndDateDisabled(true);

            setValue('end_date', null);
        } else {
            setEndDateDisabled(false);
        }
    };

    const handleApplicationTypeChange = (selectedApplicationType: any) => {
        setLeaveTypeDisabled(selectedApplicationType?.id === 2);
    };

    const onSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        createLeaveRequest(data)
            .then((res: any) => {
                toast.success(res);
                navigate('/leave/listing');
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    useEffect(() => {
        getEmployeLeaveRecords();
    }, []);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ width: '100%' }}>
                <SubCard>
                    <Grid item xs={12} md={12} sm={12} sx={{ mt: 2, mb: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={2} md={2} sm={2}>
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
                                <h1 style={{ textAlign: 'center', color: '#4BB543' }}>{remainingLeaves?.remaining_leaves ?? 0}</h1>
                            </Grid>
                            <Grid item xs={2} md={2} sm={2}>
                                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'purple' }}>
                                    Availed Leaves
                                </Typography>
                                <h1 style={{ textAlign: 'center', color: 'purple' }}>{remainingLeaves?.availed_leaves ?? 0}</h1>
                            </Grid>
                            <Grid item xs={2} md={2} sm={2}>
                                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'blue' }}>
                                    Availed WFH
                                </Typography>
                                <h1 style={{ textAlign: 'center', color: 'blue' }}>{remainingLeaves?.availed_wfh ?? 0}</h1>
                            </Grid>
                            <Grid item xs={2} md={2} sm={2}>
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
                            <Grid item xs={2} md={2} sm={2}>
                                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'red' }}>
                                    Deduction
                                </Typography>
                                <h1 style={{ textAlign: 'center', color: 'red' }}>
                                    {remainingLeaves?.monthly_records?.reduce(
                                        (acc: any, entry: any) => acc + (entry?.deduction_leaves || 0),
                                        0
                                    ) ?? 0}
                                </h1>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid container>
                        <SwitchFieldDefault
                            errors={!!errors?.is_halfday}
                            fieldName="is_halfday"
                            label="Half Day *"
                            control={control}
                            setValue={setValue}
                            isLoading={true}
                            helperText={errors?.is_halfday && errors?.is_halfday?.message}
                        />
                    </Grid>

                    <Grid container display={'flex'} alignItems={'center'}>
                        <Grid item xs={3} md={3} sm={3} sx={{ marginBottom: '6px', marginRight: '10px' }}>
                            <AutoCompleteField
                                errors={!!errors?.applicationTypeId}
                                fieldName="applicationTypeId"
                                autoComplete="off"
                                label="Application Type *"
                                control={control}
                                setValue={setValue}
                                options={applicationType}
                                returnObject={false}
                                iProps={{
                                    onChange: handleApplicationTypeChange
                                }}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.applicationTypeId && errors?.applicationTypeId?.message}
                            />
                        </Grid>
                        {!isLeaveTypeDisabled && (
                            <Grid item xs={3} md={3} sm={3} sx={{ marginBottom: '6px', marginRight: '10px' }}>
                                <AutoCompleteField
                                    errors={!!errors?.leaveTypeId}
                                    fieldName="leaveTypeId"
                                    autoComplete="off"
                                    label="Leave Type *"
                                    control={control}
                                    setValue={setValue}
                                    options={leaveType}
                                    returnObject={false}
                                    isLoading={true}
                                    optionKey="id"
                                    optionValue="name"
                                    helperText={errors?.leaveTypeId && errors?.leaveTypeId?.message}
                                    iProps={{
                                        onChange: handleLeaveTypeChange
                                    }}
                                />
                            </Grid>
                        )}
                        <Grid item xs={2} md={2} sm={2} sx={{ marginRight: '10px' }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    open={startTimeOpen}
                                    onOpen={() => setStartTimeOpen(true)}
                                    onClose={() => setStartTimeOpen(false)}
                                    renderInput={(props: any) => (
                                        <TextField fullWidth {...props} helperText="" {...register('start_date', { required: true })} />
                                    )}
                                    label="Start Date"
                                    value={startTime}
                                    onChange={(newValue: Date | null) => {
                                        const dateObject = new Date(newValue ?? '');
                                        const localISOString = dateObject
                                            .toLocaleString('en-US', { timeZone: 'Asia/Karachi' })
                                            .slice(0, -3);
                                        setStartTime(localISOString);
                                        setValue('start_date', localISOString);
                                    }}
                                    minDate={new Date(new Date().getFullYear(), 0, 1)}
                                />
                            </LocalizationProvider>
                            <span style={{ color: 'red' }}>{errors?.start_date && errors?.start_date.message}</span>
                        </Grid>

                        {!isEndDateDisabled && (
                            <Grid item xs={2} md={2} sm={2} sx={{ marginRight: '10px' }}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        open={startEndOpen}
                                        onOpen={() => setEndTimeOpen(true)}
                                        onClose={() => setEndTimeOpen(false)}
                                        renderInput={(props: any) => (
                                            <TextField fullWidth {...props} helperText="" {...register('end_date', { required: true })} />
                                        )}
                                        label="End Date"
                                        value={endTime}
                                        onChange={(newValue: Date | null) => {
                                            if (newValue) {
                                                const dateObject = new Date(newValue);
                                                const localISOString = dateObject
                                                    .toLocaleString('en-US', { timeZone: 'Asia/Karachi' })
                                                    .slice(0, -3);
                                                setEndTime(localISOString);
                                                setValue('end_date', localISOString);
                                            } else {
                                                setEndTime(null);
                                                setValue('end_date', null); // Clear value if date is null
                                            }
                                        }}
                                        minDate={new Date(new Date().getFullYear(), 0, 1)}
                                    />
                                </LocalizationProvider>
                                <span style={{ color: 'red' }}>{errors?.end_date && errors?.end_date.message}</span>
                            </Grid>
                        )}
                    </Grid>
                    <Grid container>
                        <Grid xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.reason}
                                fullWidth={true}
                                fieldName="reason"
                                type="text"
                                autoComplete="off"
                                label="Reason *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                multiline
                                rows={4}
                                helperText={errors?.reason && errors?.reason?.message}
                            />
                        </Grid>
                    </Grid>

                    <Grid sx={{ mb: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                        <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                            <Stack direction="row">
                                <AnimateButton>
                                    <Button
                                        variant="contained"
                                        type="submit"
                                        sx={{ m: 3 }}
                                        className={'red'}
                                        onClick={handleSubmit(onSubmit)}
                                    >
                                        Apply
                                    </Button>
                                </AnimateButton>
                            </Stack>
                        </Grid>
                    </Grid>
                </SubCard>
            </Box>
        </form>
    );
};

export default LeaveCreateManage;

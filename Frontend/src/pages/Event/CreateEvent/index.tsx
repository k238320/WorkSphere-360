import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Box from '@mui/material/Box';
import { IconChevronRight } from '@tabler/icons';
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import {
    AutoCompleteField,
    AutoCompleteMultipleField,
    TextFieldControlled,
    RadioField,
    GenericRadioGroup
} from 'ui-component/formsField/FormFields';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { toast } from 'react-toastify';
import { MuiDatePicker } from 'ui-component/formsField/FormFields';
import {
    Button,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Tab,
    Tabs
} from '@mui/material';
import { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createevent } from 'services/eventService';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const defautlFormValues = {
    title: '',
    working_hours: '',
    start_date: null,
    end_date: null
};

const addValidation = yup.object({
    title: yup.string().required('title is required'),
    working_hours: yup
        .number()
        .positive('working hours must be a positive number')
        .integer()
        .lessThan(24, 'hours should be less than 24')
        .required('working hours is required')
        .typeError('working hours is required'),
    start_date: yup.date().required('start date is required').typeError('end date is required'),
    end_date: yup.date().required('end date is required').typeError('end date is required')
});

const index = () => {
    const navigate = useNavigate();
    const [isLoading, setIsloading] = useState(false);

    const {
        control,
        register,
        reset,
        setError,
        formState: { errors },
        setValue,
        getValues,
        clearErrors,
        handleSubmit,
        watch,
        setResolver
    }: any = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defautlFormValues,
        // resolver: yupResolver(createEmployeeValidation)
        resolver: yupResolver(addValidation)
        // resolver: watch('resolver') ? yupResolver(createEmployeeValidation) : undefined
    });
    const onSubmit = async (data: any) => {
        setIsloading(true);
        const payload = { ...data, start_date: moment(data?.start_date).format('l'), end_date: moment(data?.end_date).format('l') };
        console.log(payload, 'onSubmit data');

        await createevent(payload)
            .then((res) => {
                toast.success('Event created successfully');
                // navigate('/hr/create');
                navigate('/event/event-listing');
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setIsloading(false);
            });
    };
    return (
        <Box sx={{ width: '100%' }}>
            <Breadcrumbs separator={IconChevronRight} heading={'Create Event'} icon title rightAlign />
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ width: '100%' }}>
                    <SubCard>
                        <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                            <Grid item xs={3} md={6} sm={3}>
                                <TextFieldControlled
                                    errors={!!errors?.title}
                                    fullWidth={true}
                                    fieldName="title"
                                    type="text"
                                    autoComplete="off"
                                    label="Title"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.title && errors?.title?.message}
                                    // disabled
                                />
                            </Grid>
                            <Grid item xs={3} md={6} sm={3}>
                                <TextFieldControlled
                                    errors={!!errors?.working_hours}
                                    fullWidth={true}
                                    fieldName="working_hours"
                                    type="text"
                                    autoComplete="off"
                                    label="Working Hours"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.working_hours && errors?.working_hours?.message}
                                />
                            </Grid>

                            <Grid item xs={3} md={6} sm={3} sx={{ mt: 0, padding: 0, textAlign: 'center', margin: 'auto' }}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <MuiDatePicker
                                        label={'Start Date'}
                                        name={`start_date`}
                                        control={control}
                                        margin="auto"
                                        error={!!errors.start_date}
                                        helperText={(errors.start_date && errors.start_date.message) || ''}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item xs={3} md={6} sm={3} sx={{ mt: 0, padding: 0, textAlign: 'center', margin: 'auto' }}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <MuiDatePicker
                                        label={'End Date '}
                                        margin="auto"
                                        name={`end_date`}
                                        control={control}
                                        // error={}
                                        // error={!!errors?.family_details?.[index]?.start_date}
                                        error={!!errors.end_date}
                                        // helperText={errors?.family_details?.[index]?.end_date?.message || ''}
                                        helperText={(errors.end_date && errors.end_date.message) || ''}
                                        // disabled={
                                        //     !(
                                        //         user?.role?.name === 'Super Admin' ||
                                        //         user?.role?.name === 'Human Resource'
                                        //     )
                                        // }
                                    />
                                </LocalizationProvider>
                            </Grid>

                            {/* {(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource') && ( */}
                            <>
                                <Grid
                                    sx={{ mb: 0, mt: 2 }}
                                    container
                                    spacing={3}
                                    direction="row"
                                    justifyContent="flex-end"
                                    alignItems="center"
                                >
                                    <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                        <Stack direction="row">
                                            <AnimateButton>
                                                <Button
                                                    variant="contained"
                                                    type="submit"
                                                    sx={{ m: 0, mr: 0, width: '64px', height: '36.5px' }}
                                                    className={'red'}
                                                    onClick={handleSubmit(onSubmit)}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? <CircularProgress sx={{ color: '#fff' }} size={14} /> : 'Save'}
                                                </Button>
                                            </AnimateButton>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </>
                            {/* )} */}
                        </Grid>
                    </SubCard>
                </Box>
            </form>
        </Box>
    );
};

export default index;

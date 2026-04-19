import { SetStateAction, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
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
    Box,
    Tab,
    Tabs
} from '@mui/material';

// assets
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
import { getDepartmentCategory } from 'services/categoryService';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { useDispatch } from 'react-redux';
import { getComments, getTaskById, getTaskCategory, postComments, postTask, updateTask } from 'services/Allocation/taskServices';
import { getProjects } from 'services/projectService';
import { yupResolver } from '@hookform/resolvers/yup';
// import { createTaskValidation } from './Validation';
import useAuth from 'hooks/useAuth';
import moment from 'moment';
// import ResourceManage from './ResourceManage';
import MainCard from 'ui-component/cards/MainCard';
import PropTypes from 'prop-types';
import { createEmployeeValidation } from './validation';
import CircularProgress from '@mui/material/CircularProgress';
import { getEmployeeDetail, createEmployeeDetail } from 'services/employmentService';
import { useParams } from 'react-router-dom';
import GenericTextarea from 'components/uiComopnents/GenericTextarea/GenericTextarea ';
import { MuiDatePicker } from 'ui-component/formsField/FormFields';

const emplymentOption = [
    {
        id: 'fulltime',
        name: 'Full Time'
    },
    {
        id: 'parttime',
        name: 'Part time'
    },
    {
        id: 'contract',
        name: 'Contract'
    },
    {
        id: 'leaved',
        name: 'Leaved'
    }
];

const locationTypeOtions = [
    {
        id: 1,
        name: 'Karachi'
    },
    {
        id: 2,
        name: 'Dubai'
    }
];

const jobStatusOptions = [
    {
        id: 1,
        name: 'Probation'
    },
    {
        id: 2,
        name: 'Permanent'
    },
    {
        id: 3,
        name: 'Resigned'
    }
];

const genderOption = [
    {
        id: 'male',
        name: 'Male'
    },
    {
        id: 'female',
        name: 'Female'
    },
    {
        id: 'other',
        name: 'Other'
    }
];

const userOption = [
    {
        id: 'saqib',
        name: 'Saqib bhatti'
    },
    {
        id: 'saqib2',
        name: 'saqib'
    }
];
const designationOption = [
    {
        id: 'senior',
        name: 'Senior'
    },
    {
        id: 'junior',
        name: 'Junior'
    }
];

const departmentOption = [
    {
        id: 'fullstack',
        name: 'Full Stack'
    },
    {
        id: 'php',
        name: 'PHP'
    }
];

const emplyeestatusoption = [
    { value: 'employee', label: 'Employee' },
    { value: 'resigned', label: 'Resigned' }
];

const defautlFormValues = {
    employmentcode: '',
    emplymentstatus: '',
    gender: '',
    fullname: '',
    designation: '',
    employmentStatus: 'employee',
    department: '',
    personal_phone_number: '',
    emergency_contact_number: '',
    cnic: '',
    company_email_address: '',
    personal_email_address: '',
    address: '',
    accounttitle: '',
    bankname: '',
    ibn_number: '',
    account_number: '',
    location_type_id: 0,
    date_of_birth: null,
    date_of_joining: null
};

function CustomTabPanel(props: { [x: string]: any; children: any; value: any; index: any }) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && (
                <Box sx={{ py: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
};

const index = () => {
    const params = useParams();

    const [userInfo, setUserInfo] = useState<any>(null);

    const [isLoading, setIsloading] = useState(false);
    const [addValidation, setAddValidation] = useState<any>(undefined);

    const { user } = useAuth();

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
        resolver: addValidation
        // resolver: watch('resolver') ? yupResolver(createEmployeeValidation) : undefined
    });

    // ================================|| Onsubmit ||================================ //

    const onSubmit = async (data: any) => {
        setIsloading(true);
        const newData = data;
        newData.user_id = params?.id;
        newData.employment_status = newData?.emplymentstatus;
        newData.date_of_birth = moment(newData?.date_of_birth).format('l');
        newData.date_of_joining = moment(newData?.date_of_joining).format('l');
        newData.phone_number = newData?.personal_phone_number;
        newData.CNIC = newData?.cnic;
        newData.emergency_relation_name = newData?.emergency_contact_person_name;
        newData.emergency_contact = newData?.emergency_contact_number;
        newData.account_title = newData?.accounttitle;
        newData.bank_name = newData?.bankname;
        newData.resignation_status = newData?.job_status === 3 ? true : false;

        // newData.resignation_status = newData?.emplyeestatusoption;
        newData.account_number = newData?.account_number;

        delete newData?.emplymentstatus;
        delete newData?.personal_phone_number;
        delete newData?.cnic;
        delete newData?.emergency_contact_person_name;
        delete newData?.emergency_contact_number;
        delete newData?.accounttitle;
        delete newData?.bankname;
        delete newData?.employmentStatus;
        delete newData?.fullname;
        delete newData?.employmentstatus;
        delete newData?.emplyeestatusoption;
        delete newData?.designation;
        delete newData?.department;
        delete newData?.company_email_address;

        await createEmployeeDetail(newData)
            .then((res) => {
                toast.success('user details updated successfully');
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setIsloading(false);
            });
    };

    useEffect(() => {
        getEmployeeDetail(params?.id)
            .then((res: any) => {
                setUserInfo(res);
                setValue('employmentcode', res?.user?.employement_code || '');
                setValue('emplymentstatus', res?.userDeatils?.employment_status || 0);
                setValue('job_status', res?.userDeatils?.job_status || 0);
                setValue('gender', res?.userDeatils?.gender || '');
                setValue('fullname', res?.user?.name || '');
                setValue('designation', res?.user?.designation || '');
                setValue('employmentStatus', res?.userDeatils?.employment_status || 'employee');
                setValue('department', res?.user?.department || '');
                setValue('personal_phone_number', res?.userDeatils?.phone_number || null);
                setValue('emergency_contact_number', res?.userDeatils?.emergency_contact || null);
                setValue('emergency_contact_person_name', res?.userDeatils?.emergency_relation_name || '');
                setValue('cnic', res?.userDeatils?.CNIC || null);
                setValue('company_email_address', res?.user?.email || '');
                setValue('personal_email_address', res?.userDeatils?.personal_email_address || '');
                setValue('address', res?.userDeatils?.address || '');
                setValue('accounttitle', res?.userDeatils?.account_title || '');
                setValue('bankname', res?.userDeatils?.bank_name || '');
                setValue('ibn_number', res?.userDeatils?.ibn_number || '');
                setValue('account_number', res?.userDeatils?.account_number || '');
                setValue('location_type_id', res?.userDeatils?.location_type_id || 0);
                setValue('date_of_birth', res?.userDeatils?.date_of_birth ? moment(res?.userDeatils?.date_of_birth)?.format('l') : null);
                setValue(
                    'date_of_joining',
                    res?.userDeatils?.date_of_joining ? moment(res?.userDeatils?.date_of_joining)?.format('l') : null
                );
                setValue('emplyeestatusoption', res?.userDeatils?.job_status == 3 ? 'resigned' : 'employee');
                setValue('resign_comment', res?.userDeatils?.resign_comment || '');
            })
            .catch((err: any) => console.log(err));
    }, []);
    const watchedValues = watch('job_status');

    useEffect(() => {
        if (watchedValues === 3) {
            // setValue('resolver', undefined);
            // setResolver(yupResolver(createEmployeeValidation));
            setAddValidation(() => undefined);
            // setError('resign_comment', {
            //     type: 'required',
            //     message: 'Please Enter The Reason'
            // });
        } else {
            setAddValidation(() => yupResolver(createEmployeeValidation));
            // clearErrors('resign_comment');
            // setResolver(yupResolver(createEmployeeValidation));
        }
    }, [watchedValues, setResolver]);

    // console.log(getValues('emplyeestatusoption'), 'tweriot');

    return (
        <>
            {/* {user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' ? ( */}
            <>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ width: '100%' }}>
                        <SubCard>
                            <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                <Grid item xs={3} md={6} sm={3}>
                                    <TextFieldControlled
                                        errors={!!errors?.employmentcode}
                                        fullWidth={true}
                                        fieldName="employmentcode"
                                        type="text"
                                        autoComplete="off"
                                        label="Employee Code"
                                        control={control}
                                        valueGot={''}
                                        setValue={setValue}
                                        helperText={errors?.employmentcode && errors?.employmentcode?.message}
                                        disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations')}
                                    />
                                </Grid>
                                <Grid item xs={3} md={6} sm={3}>
                                    <AutoCompleteField
                                        errors={!!errors?.job_status}
                                        fieldName="job_status"
                                        autoComplete="off"
                                        label="Job Status"
                                        control={control}
                                        setValue={setValue}
                                        options={jobStatusOptions}
                                        returnObject={false}
                                        isLoading={true}
                                        optionKey="id"
                                        optionValue="name"
                                        helperText={errors?.job_status && errors?.job_status?.message}
                                        valueGot={
                                            userInfo &&
                                            jobStatusOptions?.find(({ id }: any) => {
                                                return id == userInfo?.userDeatils?.job_status;
                                            })
                                        }
                                        disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations')}
                                    />
                                </Grid>
                                <Grid item xs={3} md={6} sm={3}>
                                    <AutoCompleteField
                                        errors={!!errors?.emplymentstatus}
                                        fieldName="emplymentstatus"
                                        autoComplete="off"
                                        label="Employment Status"
                                        control={control}
                                        setValue={setValue}
                                        options={emplymentOption}
                                        returnObject={false}
                                        isLoading={true}
                                        optionKey="id"
                                        optionValue="name"
                                        helperText={errors?.emplymentstatus && errors?.emplymentstatus?.message}
                                        valueGot={
                                            userInfo &&
                                            emplymentOption?.find(({ id }: any) => {
                                                return id == userInfo?.userDeatils?.employment_status;
                                            })
                                        }
                                    />
                                </Grid>
                                <Grid item xs={3} md={6} sm={3}>
                                    <AutoCompleteField
                                        errors={!!errors?.location_type_id}
                                        fieldName="location_type_id"
                                        autoComplete="off"
                                        label="Location"
                                        control={control}
                                        setValue={setValue}
                                        options={locationTypeOtions}
                                        returnObject={false}
                                        isLoading={true}
                                        optionKey="id"
                                        optionValue="name"
                                        helperText={errors?.location_type_id && errors?.location_type_id?.message}
                                        valueGot={
                                            userInfo &&
                                            locationTypeOtions?.find(({ id }: any) => {
                                                return id == userInfo?.userDeatils?.location_type_id;
                                            })
                                        }
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} sm={6}>
                                    <AutoCompleteField
                                        errors={!!errors?.gender}
                                        fieldName="gender"
                                        autoComplete="off"
                                        label="Gender"
                                        control={control}
                                        setValue={setValue}
                                        options={genderOption}
                                        returnObject={false}
                                        isLoading={true}
                                        optionKey="id"
                                        optionValue="name"
                                        helperText={errors?.gender && errors?.gender?.message}
                                        // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                        valueGot={
                                            userInfo &&
                                            genderOption?.find(({ id }: any) => {
                                                return id == userInfo?.userDeatils?.gender;
                                            })
                                        }
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} sm={6}>
                                    <TextFieldControlled
                                        errors={!!errors?.fullname}
                                        fullWidth={true}
                                        fieldName="fullname"
                                        type="text"
                                        autoComplete="off"
                                        label="Full Name"
                                        control={control}
                                        valueGot={''}
                                        setValue={setValue}
                                        helperText={errors?.fullname && errors?.fullname?.message}
                                        disabled
                                    />
                                </Grid>
                                {/* <Grid item xs={3} md={6} sm={3} sx={{ mt: 2 }}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            renderInput={(props: any) => (
                                                <TextField
                                                    fullWidth
                                                    {...props}
                                                    helperText={errors.date_of_birth && errors.date_of_birth.message}
                                                    error={!!errors.date_of_birth}
                                                    {...register('date_of_birth', { required: true })}
                                                />
                                            )}
                                            // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                            label="Date of Birth"
                                            value={dateofbirth}
                                            onChange={(newValue: Date | null) => {
                                                try {
                                                    setDateofbirth(newValue);
                                                } catch (error) {
                                                    console.error('DATA C ERR', error);
                                                }
                                                setValue('date_of_birth', newValue);
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid> */}

                                <Grid item xs={3} md={6} sm={3} sx={{ mt: 0, padding: 0, textAlign: 'center', margin: 'auto' }}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <MuiDatePicker
                                            label={'Date Of Birth'}
                                            name={`date_of_birth`}
                                            control={control}
                                            // margin={'auto'}
                                            margin="auto"
                                            // error={}
                                            // error={!!errors?.family_details?.[index]?.date_of_birth}
                                            error={!!errors.date_of_birth}
                                            // helperText={errors?.family_details?.[index]?.date_of_birth?.message || ''}
                                            helperText={(errors.date_of_birth && errors.date_of_birth.message) || ''}
                                            // disabled={
                                            //     !(
                                            //         user?.role?.name === 'Super Admin' ||
                                            //         user?.role?.name === 'Human Resource'
                                            //     )
                                            // }
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                {/* <Grid item xs={3} md={6} sm={3} sx={{ mt: 2 }}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            renderInput={(props: any) => (
                                                <TextField
                                                    fullWidth
                                                    {...props}
                                                    helperText={errors.date_of_joining && errors.date_of_joining.message}
                                                    error={!!errors.date_of_joining}
                                                    {...register('date_of_joining', { required: true })}
                                                />
                                            )}
                                            // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                            label="Date of joining"
                                            value={dateOfJoining}
                                            onChange={(newValue: Date | null) => {
                                                setDateOfJoining(newValue);
                                                setValue('date_of_joining', newValue);
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid> */}

                                <Grid item xs={3} md={6} sm={3} sx={{ mt: 0, padding: 0, textAlign: 'center', margin: 'auto' }}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <MuiDatePicker
                                            label={'Date of joining'}
                                            margin="auto"
                                            name={`date_of_joining`}
                                            control={control}
                                            // error={}
                                            // error={!!errors?.family_details?.[index]?.date_of_birth}
                                            error={!!errors.date_of_joining}
                                            // helperText={errors?.family_details?.[index]?.date_of_joining?.message || ''}
                                            helperText={(errors.date_of_joining && errors.date_of_joining.message) || ''}
                                            // disabled={
                                            //     !(
                                            //         user?.role?.name === 'Super Admin' ||
                                            //         user?.role?.name === 'Human Resource'
                                            //     )
                                            // }
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                <Grid item xs={6} md={6} sm={6}>
                                    <TextFieldControlled
                                        errors={!!errors?.designation}
                                        fullWidth={true}
                                        fieldName="designation"
                                        type="text"
                                        autoComplete="off"
                                        label="Designation"
                                        control={control}
                                        valueGot={''}
                                        setValue={setValue}
                                        helperText={errors?.designation && errors?.designation?.message}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} sm={6}>
                                    <TextFieldControlled
                                        errors={!!errors?.department}
                                        fullWidth={true}
                                        fieldName="department"
                                        type="text"
                                        autoComplete="off"
                                        label="Department"
                                        control={control}
                                        valueGot={''}
                                        setValue={setValue}
                                        helperText={errors?.department && errors?.department?.message}
                                        disabled
                                        // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} sm={6}>
                                    <TextFieldControlled
                                        errors={!!errors?.personal_phone_number}
                                        fullWidth={true}
                                        fieldName="personal_phone_number"
                                        type="text"
                                        autoComplete="off"
                                        label="Personal Phone Number"
                                        control={control}
                                        valueGot={''}
                                        setValue={setValue}
                                        helperText={errors?.personal_phone_number && errors?.personal_phone_number?.message}
                                        // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} sm={6}>
                                    <TextFieldControlled
                                        errors={!!errors?.cnic}
                                        fullWidth={true}
                                        fieldName="cnic"
                                        type="text"
                                        autoComplete="off"
                                        label="CNIC"
                                        control={control}
                                        valueGot={''}
                                        setValue={setValue}
                                        multiline
                                        helperText={errors?.cnic && errors?.cnic?.message}
                                        // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} sm={6}>
                                    <TextFieldControlled
                                        errors={!!errors?.emergency_contact_person_name}
                                        fullWidth={true}
                                        fieldName="emergency_contact_person_name"
                                        type="text"
                                        autoComplete="off"
                                        label="Emergency Contact Person Relation & Name"
                                        control={control}
                                        valueGot={''}
                                        setValue={setValue}
                                        multiline
                                        helperText={errors?.emergency_contact_person_name && errors?.emergency_contact_person_name?.message}
                                        // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} sm={6}>
                                    <TextFieldControlled
                                        errors={!!errors?.emergency_contact_number}
                                        fullWidth={true}
                                        fieldName="emergency_contact_number"
                                        type="text"
                                        autoComplete="off"
                                        label="Emergency Contact Number"
                                        control={control}
                                        valueGot={''}
                                        setValue={setValue}
                                        multiline
                                        helperText={errors?.emergency_contact_number && errors?.emergency_contact_number?.message}
                                        // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                    />
                                </Grid>

                                <Grid item xs={6} md={6} sm={6}>
                                    <TextFieldControlled
                                        errors={!!errors?.company_email_address}
                                        fullWidth={true}
                                        fieldName="company_email_address"
                                        type="text"
                                        autoComplete="off"
                                        label="Company Email Address"
                                        control={control}
                                        valueGot={''}
                                        setValue={setValue}
                                        multiline
                                        helperText={errors?.company_email_address && errors?.company_email_address?.message}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} sm={6}>
                                    <TextFieldControlled
                                        errors={!!errors?.personal_email_address}
                                        fullWidth={true}
                                        fieldName="personal_email_address"
                                        type="text"
                                        autoComplete="off"
                                        label="Personal Email Address"
                                        control={control}
                                        valueGot={''}
                                        setValue={setValue}
                                        multiline
                                        helperText={errors?.personal_email_address && errors?.personal_email_address?.message}
                                        // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                    />
                                </Grid>

                                <Grid item xs={12} md={12} sm={12}>
                                    <TextFieldControlled
                                        errors={!!errors?.address}
                                        fullWidth={true}
                                        fieldName="address"
                                        type="text"
                                        autoComplete="off"
                                        label="Address"
                                        control={control}
                                        valueGot={''}
                                        setValue={setValue}
                                        multiline
                                        helperText={errors?.address && errors?.address?.message}
                                        // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                    />
                                </Grid>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        margin: '24px',
                                        padding: '12px',
                                        fontWeight: 500,
                                        width: '100%',
                                        border: '1px solid #F3E9F3',
                                        backgroundColor: '#fff',
                                        borderRadius: '12px 12px 0 0'
                                    }}
                                    gutterBottom
                                >
                                    Bank Account Details
                                </Typography>
                                <Grid item xs={6} md={6} sm={6}>
                                    <TextFieldControlled
                                        errors={!!errors?.accounttitle}
                                        fullWidth={true}
                                        fieldName="accounttitle"
                                        type="text"
                                        autoComplete="off"
                                        label="Account Title"
                                        control={control}
                                        valueGot={''}
                                        setValue={setValue}
                                        multiline
                                        helperText={errors?.accounttitle && errors?.accounttitle?.message}
                                        // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} sm={6}>
                                    <TextFieldControlled
                                        errors={!!errors?.bankname}
                                        fullWidth={true}
                                        fieldName="bankname"
                                        type="text"
                                        autoComplete="off"
                                        label="Bank Name"
                                        control={control}
                                        valueGot={''}
                                        setValue={setValue}
                                        multiline
                                        helperText={errors?.bankname && errors?.bankname?.message}
                                        // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} sm={6}>
                                    <TextFieldControlled
                                        errors={!!errors?.account_number}
                                        fullWidth={true}
                                        fieldName="account_number"
                                        type="text"
                                        autoComplete="off"
                                        label="Account Number"
                                        control={control}
                                        valueGot={''}
                                        setValue={setValue}
                                        multiline
                                        helperText={errors?.account_number && errors?.account_number?.message}
                                        // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} sm={6}>
                                    <>
                                        <TextFieldControlled
                                            errors={!!errors?.ibn_number}
                                            fullWidth={true}
                                            fieldName="ibn_number"
                                            type="text"
                                            autoComplete="off"
                                            label="IBN Number"
                                            control={control}
                                            valueGot={''}
                                            setValue={setValue}
                                            multiline
                                            helperText={errors?.ibn_number && errors?.ibn_number?.message}
                                            // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                        />
                                    </>
                                </Grid>
                                {/* <GenericRadioGroup
                                    label=""
                                    options={emplyeestatusoption}
                                    control={control}
                                    setValue={setValue}
                                    fieldName="emplyeestatusoption"
                                    defaultValue={userInfo?.userDeatils?.job_status == 3 ? 'employee' : 'resigned'}
                                    // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                /> */}
                                {watchedValues === 3 && (
                                    <>
                                        <Grid item md={12}>
                                            <GenericTextarea
                                                fieldName="resign_comment"
                                                placeholder="Pumble inactive and Delete Status?  Gmail inactive and Delete Status? Data handover details to?"
                                                setValue={setValue}
                                                control={control}
                                                errors={!!errors?.resign_comment}
                                                helperText={errors?.resign_comment?.message || ''}
                                            />
                                        </Grid>
                                    </>
                                )}

                                {/* {(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource') && ( */}
                                <>
                                    <Grid
                                        sx={{ mb: 3 }}
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
                                                        sx={{ m: 3, mr: 0, width: '64px', height: '36.5px' }}
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
            </>
            {/* ) : (
                <SubCard>
                    <div className="tasks__list__wrapper">
                        <div className="task__detail">
                            <p>Employee Code</p>
                            <span>{userInfo?.user?.employement_code ? userInfo?.user?.employement_code : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>Employment Status</p>
                            <span>
                                {userInfo?.userDeatils?.employment_status
                                    ? String(userInfo?.userDeatils?.employment_status).slice(0, 1).toUpperCase() +
                                      String(userInfo?.userDeatils?.employment_status).slice(1)
                                    : 'N/A'}
                            </span>
                        </div>
                        <div className="task__detail">
                            <p>Gender</p>
                            <span>{userInfo?.userDeatils?.gender ? userInfo?.userDeatils?.gender : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>Full Name</p>
                            <span>{userInfo?.user?.name ? userInfo?.user?.name : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>Date of Birth</p>
                            <span>{userInfo?.userDeatils?.date_of_birth ? userInfo?.userDeatils?.date_of_birth : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>Date of Joining</p>
                            <span>{userInfo?.userDeatils?.date_of_joining ? userInfo?.userDeatils?.date_of_joining : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>Designation</p>
                            <span>{userInfo?.user?.designation ? userInfo?.user?.designation : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>Department</p>
                            <span>{userInfo?.user?.department ? userInfo?.user?.department : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>Personal Phone Number</p>
                            <span>{userInfo?.userDeatils?.phone_number ? userInfo?.userDeatils?.phone_number : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>CNIC</p>
                            <span>{userInfo?.userDeatils?.CNIC ? userInfo?.userDeatils?.CNIC : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>Emergency Contact Person Relation & Name</p>
                            <span>
                                {userInfo?.userDeatils?.emergency_relation_name ? userInfo?.userDeatils?.emergency_relation_name : 'N/A'}
                            </span>
                        </div>
                        <div className="task__detail">
                            <p>Emergency Contact Number</p>
                            <span>{userInfo?.userDeatils?.emergency_contact ? userInfo?.userDeatils?.emergency_contact : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>Company Email Address</p>
                            <span>{userInfo?.user?.email ? userInfo?.user?.email : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>Personal Email Address</p>
                            <span>
                                {userInfo?.userDeatils?.personal_email_address ? userInfo?.userDeatils?.personal_email_address : 'N/A'}
                            </span>
                        </div>
                        <div className="task__detail">
                            <p>Address</p>
                            <span>{userInfo?.userDeatils?.address ? userInfo?.userDeatils?.address : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>Account Title</p>
                            <span>{userInfo?.userDeatils?.account_title ? userInfo?.userDeatils?.account_title : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>Bank Name</p>
                            <span>{userInfo?.userDeatils?.bank_name ? userInfo?.userDeatils?.bank_name : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>Account Number</p>
                            <span>{userInfo?.userDeatils?.account_number ? userInfo?.userDeatils?.account_number : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>IBN Number</p>
                            <span>{userInfo?.userDeatils?.ibn_number ? userInfo?.userDeatils?.ibn_number : 'N/A'}</span>
                        </div>
                        <div className="task__detail">
                            <p>Employment Status</p>
                            <span>{userInfo?.userDeatils?.resignation_status == false ? 'employee' : 'resigned' || 'N/A'}</span>
                        </div>
                    </div>
                </SubCard>
            )} */}
        </>
    );
};

export default index;

import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, Divider, FormControlLabel, Grid, IconButton, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';

// project imports
import SubCard from 'ui-component/cards/SubCard';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { gridSpacing } from 'store/constant';

// assets
import DesktopWindowsTwoToneIcon from '@mui/icons-material/DesktopWindowsTwoTone';
import HighlightOffTwoToneIcon from '@mui/icons-material/HighlightOffTwoTone';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import SmartphoneTwoToneIcon from '@mui/icons-material/SmartphoneTwoTone';
import PhoneIphoneTwoToneIcon from '@mui/icons-material/PhoneIphoneTwoTone';
import { TextFieldControlled } from 'ui-component/formsField/FormFields';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// import { FusionAuthClientInstance } from 'services/FusionAuthClient';
// import { updateAdmin } from 'services/UserService';
import useAuth from 'hooks/useAuth';
import { toast } from 'react-toastify';
import { dispatch } from 'store';

const deviceStateSX = {
    display: 'inline-flex',
    alignItems: 'center',
    '& >svg': {
        width: 12,
        height: 12,
        mr: 0.5
    }
};

// select options
// const currencies = [
//     {
//         value: 'Washington',
//         label: 'Washington'
//     },
//     {
//         value: 'India',
//         label: 'India'
//     },
//     {
//         value: 'Africa',
//         label: 'Africa'
//     },
//     {
//         value: 'New-York',
//         label: 'New York'
//     },
//     {
//         value: 'Malaysia',
//         label: 'Malaysia'
//     }
// ];

// const experiences = [
//     {
//         value: 'Startup',
//         label: 'Startup'
//     },
//     {
//         value: '2-year',
//         label: '2 year'
//     },
//     {
//         value: '3-year',
//         label: '3 year'
//     },
//     {
//         value: '4-year',
//         label: '4 year'
//     },
//     {
//         value: '5-year',
//         label: '5 year'
//     }
// ];

// ==============================|| PROFILE 1 - MY ACCOUNT ||============================== //

const MyAccount = () => {
    const theme = useTheme();
    const { dispatchLoader } = useAuth();
    const [currency, setCurrency] = useState('Washington');
    const handleChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrency(event.target.value);
    };

    const [experience, setExperience] = useState('Startup');
    const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setExperience(event.target.value);
    };
    const {
        control,
        formState: { errors },
        setValue,
        getValues,
        handleSubmit
    } = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange'
        // defaultValues: defautlFormValues,
        // resolver: yupResolver(AdminValidation)
    });

    const [state1, setState1] = useState({
        checkedB: false
    });
    const [state2, setState2] = useState({
        checkedB: false
    });
    const [state3, setState3] = useState({
        checkedB: true
    });
    const handleSwitchChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState1({ ...state1, [event.target.name]: event.target.checked });
    };
    const handleSwitchChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState2({ ...state2, [event.target.name]: event.target.checked });
    };
    const handleSwitchChange3 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState3({ ...state3, [event.target.name]: event.target.checked });
    };
    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        dispatchLoader(true);
        // const serviceToken: any = window.localStorage.getItem('serviceToken');
        // let getUser = await FusionAuthClientInstance.retrieveUserUsingJWT(serviceToken);
        // console.log('getUser', getUser?.response?.user);
        // setValue('first_name', getUser?.response?.user?.firstName);
        // setValue('last_name', getUser?.response?.user?.lastName);
        // setValue('email', getUser?.response?.user?.email);
        // setValue('user_type', getUser?.response?.user?.data?.type);
        // setValue('uuid', getUser?.response?.user?.id);
        dispatchLoader(false);
    };
    const onSubmit = (data: any) => {
        if (data) {
            // dispatchLoader(true);
            // updateAdmin(data)
            //     .then((res: any) => {
            //         dispatchLoader(false);
            //         toast.success('Record updated successfully');
            //     })
            //     .catch((err: any) => {
            //         dispatchLoader(false);
            //     });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <SubCard title="General Settings">
                        <Grid container spacing={gridSpacing}>
                            <Grid item xs={12} md={6}>
                                <TextFieldControlled
                                    errors={!!errors?.first_name}
                                    fullWidth={true}
                                    fieldName="first_name"
                                    type="text"
                                    autoComplete="off"
                                    label="First Name *"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.first_name && errors?.first_name?.message}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextFieldControlled
                                    errors={!!errors?.last_name}
                                    fullWidth={true}
                                    fieldName="last_name"
                                    type="text"
                                    autoComplete="off"
                                    label="Last Name *"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.last_name && errors?.last_name?.message}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextFieldControlled
                                    errors={!!errors?.email}
                                    fullWidth={true}
                                    fieldName="email"
                                    type="text"
                                    autoComplete="off"
                                    label="Email *"
                                    disabled={true}
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.email && errors?.email?.message}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextFieldControlled
                                    errors={!!errors?.user_type}
                                    fullWidth={true}
                                    fieldName="user_type"
                                    type="text"
                                    autoComplete="off"
                                    label="User Type *"
                                    disabled={true}
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.user_type && errors?.user_type?.message}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Stack direction="row" justifyContent="flex-end">
                                    <AnimateButton>
                                        <Button variant="contained" type="submit">
                                            Submit
                                        </Button>
                                    </AnimateButton>
                                </Stack>
                            </Grid>
                        </Grid>
                    </SubCard>
                </Grid>
            </Grid>
        </form>
    );
};

export default MyAccount;

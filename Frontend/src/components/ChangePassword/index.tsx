// material-ui
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Alert, AlertTitle, Button, Grid, IconButton, InputAdornment, TextField } from '@mui/material';

// project imports
import SubCard from 'ui-component/cards/SubCard';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { gridSpacing } from 'store/constant';
import { TextFieldControlled } from 'ui-component/formsField/FormFields';
import { useForm } from 'react-hook-form';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { yupResolver } from '@hookform/resolvers/yup';
import { passwordValidation } from './validations/changepassword.validations';
import useAuth from 'hooks/useAuth';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { changeAdminPasssword } from 'services/userService';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
// ==============================|| PROFILE 1 - CHANGE PASSWORD ||============================== //

const ChangePassword = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const [showPassword, setShowPassword] = React.useState<any>(false);
    const [showNewPassword, setshowNewPassword] = React.useState<any>(false);
    const [showconfirmPassword, setShowconfirmPassword] = React.useState<any>(false);

    const defaultFormValues = {
        currentpassword: '',
        password: '',
        confirm_password: ''
    };

    const {
        control,
        formState: { errors },
        setValue,
        getValues,
        handleSubmit,
        reset
    } = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultFormValues,
        resolver: yupResolver(passwordValidation)
    });
    const handleClickShowPassword = () => {
        // console.log("handleClickShowPassword");
        setShowPassword(!showPassword);
    };
    const handleClickShowNewPassword = () => {
        // console.log("handleClickShowNewPassword");
        setshowNewPassword(!showNewPassword);
    };
    const handleClickShowConfirmPassword = () => {
        // console.log("handleClickShowConfirmPassword");
        setShowconfirmPassword(showconfirmPassword);
    };

    useEffect(() => {
        // console.log('sessionStorage', user?.id);
    }, []);

    const onSubmit = (data: any) => {
        let modifyData: any = {
            current_password: data?.currentpassword,
            new_password: data?.confirm_password
        };
        if (modifyData) {
            dispatch(spinLoaderShow(true));
            changeAdminPasssword(modifyData)
                .then((res: any) => {
                    toast.success('Password has been changes successfully');
                    dispatch(spinLoaderShow(false));
                    reset(defaultFormValues);
                })
                .catch((err: any) => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };
    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <SubCard title="Change Passwords">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={gridSpacing} sx={{ mb: 1.75 }}>
                            <Grid item xs={6}>
                                <TextFieldControlled
                                    errors={!!errors?.currentpassword}
                                    fullWidth={true}
                                    fieldName="currentpassword"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="off"
                                    label="Current Password *"
                                    control={control}
                                    valueGot={''}
                                    iProps={{
                                        InputProps: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword}>
                                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                    setValue={setValue}
                                    helperText={errors?.currentpassword && errors?.currentpassword?.message}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextFieldControlled
                                    errors={!!errors?.password}
                                    fullWidth={true}
                                    fieldName="password"
                                    type={showNewPassword ? 'text' : 'password'}
                                    autoComplete="off"
                                    label="New Password *"
                                    control={control}
                                    valueGot={''}
                                    iProps={{
                                        InputProps: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowNewPassword}
                                                    >
                                                        {showNewPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                    setValue={setValue}
                                    helperText={errors?.password && errors?.password?.message}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextFieldControlled
                                    errors={!!errors?.confirm_password}
                                    fullWidth={true}
                                    fieldName="confirm_password"
                                    type={showNewPassword ? 'text' : 'password'}
                                    autoComplete="off"
                                    label="Confirm Password *"
                                    control={control}
                                    valueGot={''}
                                    iProps={{
                                        InputProps: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowConfirmPassword}
                                                    >
                                                        {showconfirmPassword ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                    setValue={setValue}
                                    helperText={errors?.confirm_password && errors?.confirm_password?.message}
                                />
                            </Grid>
                        </Grid>
                        <Grid spacing={2} container justifyContent="flex-end" sx={{ mt: 3 }}>
                            <Grid item>
                                <AnimateButton>
                                    <Button variant="contained" type="submit">
                                        Change Password
                                    </Button>
                                </AnimateButton>
                            </Grid>
                            <Grid item>
                                <Button
                                    sx={{ color: theme.palette.error.main }}
                                    onClick={() => {
                                        reset(defaultFormValues);
                                    }}
                                >
                                    Clear
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </SubCard>
            </Grid>
        </Grid>
    );
};

export default ChangePassword;

// material-ui
import { useTheme } from '@mui/material/styles';
import { Backdrop, Box, Button, CircularProgress, FormControl, FormHelperText, Grid, InputLabel, OutlinedInput } from '@mui/material';
import { useDispatch } from 'store';
import { useNavigate } from 'react-router-dom';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';
import { TextFieldControlled } from 'ui-component/formsField/FormFields';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// import { FusionAuthClientInstance } from 'services/FusionAuthClient';
import { ToastContainer, toast } from 'react-toastify';
import { useState } from 'react';
import { forgetValidations } from './Validation';
import { forgotPassword } from 'services/userService';
// import { forgetPasswordRequest } from 'services/UserService';
// import { forgetValidations } from './Validations/forget.validation';

// ========================|| FIREBASE - FORGOT PASSWORD ||======================== //

const AuthForgotPassword = ({ ...others }) => {
    const theme = useTheme();
    const scriptedRef = useScriptRef();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const defaultFormValues: any = {
        email: ''
    };
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setError,
        setValue,
        watch,
        getValues
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultFormValues,
        resolver: yupResolver(forgetValidations)
    });

    const { resetPassword } = useAuth();

    const onSubmit = (data: any) => {
        setLoading(true);

        forgotPassword(data)
            .then((res: any) => {
                if (res !== '') {
                    toast.success(res);
                    navigate('/');
                } else {
                    toast.error('Email not found!');
                }
            })
            .catch((err) => {
                console.log('err', err);
                toast.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <ToastContainer />
            <Backdrop open={loading} style={{ zIndex: 1500 }}>
                <CircularProgress color="primary" />
            </Backdrop>
            <Grid item xs={12} sx={{ mt: 1 }}>
                <TextFieldControlled
                    errors={!!errors?.email}
                    fieldName="email"
                    type="text"
                    autoComplete="off"
                    label="Email *"
                    control={control}
                    valueGot={''}
                    setValue={setValue}
                    helperText={errors?.email && errors?.email?.message}
                />
            </Grid>

            <Box sx={{ mt: 2 }}>
                <AnimateButton>
                    <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="secondary">
                        Send Mail
                    </Button>
                </AnimateButton>
            </Box>
        </form>
    );
};

export default AuthForgotPassword;

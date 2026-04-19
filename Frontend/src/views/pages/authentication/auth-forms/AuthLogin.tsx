import React from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Typography
} from '@mui/material';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useForm } from 'react-hook-form';
import { TextFieldControlled } from 'ui-component/formsField/FormFields';
import { yupResolver } from '@hookform/resolvers/yup';
// import { LoginValidation } from './Validations/login.validations';

// ===============================|| JWT LOGIN ||=============================== //

const JWTLogin = ({ loginProp, ...others }: { loginProp?: number }) => {
    const theme = useTheme();

    const { login } = useAuth();
    const scriptedRef = useScriptRef();

    const [checked, setChecked] = React.useState(true);

    const [showPassword, setShowPassword] = React.useState(false);

    const defaultFormValues: any = {
        email: '',
        password: '',
        status: true
    };
    // React Hook Form==========>
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
        defaultValues: defaultFormValues
        // resolver: yupResolver(LoginValidation)
    });

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const onSubmit = async (data: any) => {
        try {
            await login(data.email, data.password);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Grid item xs={12} sx={{ mt: 3 }}>
                <TextFieldControlled
                    errors={!!errors?.email}
                    fieldName="email"
                    type="text"
                    autoComplete="off"
                    label="*Email"
                    control={control}
                    valueGot={''}
                    setValue={setValue}
                    helperText={errors?.email && errors?.email?.message}
                />
            </Grid>

            <Grid item xs={12}>
                <TextFieldControlled
                    errors={!!errors?.password}
                    sx={{ mt: 3 }}
                    label="Password"
                    // fullWidth
                    fieldName="password"
                    control={control}
                    type={showPassword ? 'text' : 'password'}
                    valueGot={''}
                    setValue={setValue}
                    helperText={errors?.password && errors?.password?.message}
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
                />
            </Grid>

            <Grid container alignItems="center" justifyContent="space-between">
                {/* <Grid item>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checked}
                                        onChange={(event) => setChecked(event.target.checked)}
                                        name="checked"
                                        color="primary"
                                    />
                                }
                                label="Keep me logged in"
                            />
                        </Grid> */}
                <Grid item>
                    <Typography
                        variant="subtitle1"
                        component={Link}
                        to={'/forgot-password'}
                        color="secondary"
                        sx={{ textDecoration: 'none' }}
                    >
                        Forgot Password?
                    </Typography>
                </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
                <AnimateButton>
                    <Button color="secondary" fullWidth size="large" type="submit" variant="contained">
                        Sign In
                    </Button>
                </AnimateButton>
            </Box>
        </form>
    );
};

export default JWTLogin;

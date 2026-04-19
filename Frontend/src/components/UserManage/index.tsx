import React, { useEffect, useState } from 'react';
import { Button, Grid, IconButton, InputAdornment, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import { AutoCompleteField, AutoCompleteMultipleField, SwitchFieldDefault, TextFieldControlled } from 'ui-component/formsField/FormFields';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { createScreen, getScreen } from 'services/screenService';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { createUserValidation } from './Validation';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { getRoles } from 'services/rolesService';
import { getResources } from 'services/resource';
import { createUser } from 'services/userService';

const UserManage = () => {
    const defautlFormValues = {
        status: true,
        email: '',
        password: '',
        is_resource: false,
        employement_code: 0,
        super: false
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
    } = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        //Validations=================>
        defaultValues: defautlFormValues,
        resolver: yupResolver(createUserValidation)
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [roles, setRoles] = useState<any>([]);
    const [resource, setResource] = useState<any>([]);
    const [isResource, setIsResource] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClickShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const onSubmit = (data: any) => {
        if (data.is_resource) {
            data.name = resource?.find((x: any) => x.id == data?.resource_id)?.name;
        }
        data.employement_code = JSON.stringify(data?.employement_code);
        dispatch(spinLoaderShow(true));
        createUser(data)
            .then(() => {
                toast.success('User Created Successfully!');
                navigate('/user/listing');
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const getRolesData = () => {
        dispatch(spinLoaderShow(true));
        getRoles()
            .then((res) => {
                setRoles(res);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const getResourcesData = () => {
        dispatch(spinLoaderShow(true));
        getResources()
            .then((res) => {
                setResource(res);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const isResourceChange = (e: any) => {
        setIsResource(e);
    };

    const resourceChange = (e: any) => {
        if (e?.id) {
            setIsResource(true);
            setValue('is_resource', true);
        } else {
            setIsResource(false);
            setValue('is_resource', false);
        }
    };

    useEffect(() => {
        setValue('email', '');
        getRolesData();
        getResourcesData();
    }, []);

    return (
        <>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <SubCard>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={12} md={12} sm={12}>
                            <SwitchFieldDefault
                                errors={!!errors?.is_resource}
                                fieldName="is_resource"
                                label="Is Resource *"
                                control={control}
                                setValue={setValue}
                                isLoading={true}
                                helperText={errors?.is_resource && errors?.is_resource?.message}
                                iProps={{
                                    onChange: isResourceChange
                                }}
                            />
                        </Grid>

                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.employement_code}
                                fullWidth={true}
                                fieldName="employement_code"
                                type="number"
                                label="Employment ID *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.employement_code && errors?.employement_code?.message}
                                autoComplete={'off'}
                                iProps={{
                                    autoComplete: 'off'
                                }}
                            />
                        </Grid>

                        <Grid item xs={6} md={6} sm={6}>
                            <AutoCompleteField
                                errors={!!errors?.resource_id}
                                fieldName="resource_id"
                                autoComplete="off"
                                label="Select Resource *"
                                control={control}
                                setValue={setValue}
                                options={resource}
                                returnObject={false}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.resource_id && errors?.resource_id?.message}
                                iProps={{
                                    onChange: resourceChange
                                }}
                            />
                        </Grid>

                        {!isResource && (
                            <Grid item xs={6} md={6} sm={6}>
                                <TextFieldControlled
                                    errors={!!errors?.name}
                                    fullWidth={true}
                                    fieldName="name"
                                    type="text"
                                    autoComplete="off"
                                    label="Full Name *"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.name && errors?.name?.message}
                                />
                            </Grid>
                        )}

                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.email}
                                fullWidth={true}
                                fieldName="email"
                                type="email"
                                label="Email *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.email && errors?.email?.message}
                                autoComplete={'off'}
                                iProps={{
                                    autoComplete: 'off'
                                }}
                            />
                        </Grid>

                        <Grid item xs={6} md={6} sm={6}>
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
                                    },
                                    autoComplete: 'off'
                                }}
                                autoComplete="off"
                            />
                        </Grid>

                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.confirm_password}
                                sx={{ mt: 3 }}
                                label="Confirm Password"
                                // fullWidth
                                fieldName="confirm_password"
                                control={control}
                                type={showConfirmPassword ? 'text' : 'password'}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.confirm_password && errors?.confirm_password?.message}
                                iProps={{
                                    InputProps: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle confirm password visibility"
                                                    onClick={handleClickShowConfirmPassword}
                                                >
                                                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    },
                                    autoComplete: 'off'
                                }}
                                autoComplete="off"
                            />
                        </Grid>

                        <Grid item xs={6} md={6} sm={6}>
                            <AutoCompleteField
                                errors={!!errors?.role_id}
                                fieldName="role_id"
                                autoComplete="off"
                                label="Select Role *"
                                control={control}
                                setValue={setValue}
                                options={roles}
                                returnObject={false}
                                // iProps={{
                                //     onChange: getSpecialitiesByCategory,
                                //     disabled: apiData
                                // }}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.role_id && errors?.role_id?.message}
                                // valueGot={
                                //     apiData &&
                                //     departmentData?.find(({ id }: any) => {
                                //         return id == apiData?.role_id;
                                //     })
                                // }
                            />
                        </Grid>

                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.designation}
                                fullWidth={true}
                                fieldName="designation"
                                type="designation"
                                label="Designation *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.designation && errors?.designation?.message}
                                autoComplete={'off'}
                                iProps={{
                                    autoComplete: 'off'
                                }}
                            />
                        </Grid>

                        <Grid item xs={6} md={12} sm={6} sx={{ mt: 2 }}>
                            <Grid sx={{ mb: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                                <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                    <Stack direction="row">
                                        <AnimateButton>
                                            <Button variant="contained" type="submit" sx={{ m: 3 }} className={'red'}>
                                                save
                                            </Button>
                                        </AnimateButton>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </SubCard>
            </form>
        </>
    );
};

export default UserManage;

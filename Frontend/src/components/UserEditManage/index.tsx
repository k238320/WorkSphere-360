import { useEffect, useState } from 'react';
import { Button, Grid, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import { AutoCompleteField, SwitchFieldDefault, TextFieldControlled } from 'ui-component/formsField/FormFields';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { updateUserValidation } from './Validation';
import { getRoles } from 'services/rolesService';
import { getResources } from 'services/resource';
import { getUserById, updateUser } from 'services/userService';
import { spinLoaderShow } from 'store/actions/spinLoader';

const UserEditManage = () => {
    const defautlFormValues = {
        status: true,
        email: '',
        password: '',
        is_resource: false,
        super: false,
        employement_code: 0
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
        resolver: yupResolver(updateUserValidation)
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const uuid = searchParams.get('uuid');

    const [roles, setRoles] = useState<any>([]);
    const [resource, setResource] = useState<any>([]);
    const [selectedRole, setSelectRole] = useState<any>([]);
    const [selectedResource, setSelectResource] = useState<any>([]);
    const [isResource, setIsResource] = useState(false);

    const isResourceChange = (e: any) => {
        if (e?.id) {
            setIsResource(true);
        } else {
            setIsResource(false);
        }
    };

    const onSubmit = (data: any) => {
        if (data.is_resource) {
            data.name = resource?.find((x: any) => x.id == data?.resource_id)?.name;
        }
        data.employement_code = JSON.stringify(data?.employement_code);
        dispatch(spinLoaderShow(true));
        updateUser(uuid, data)
            .then((res: any) => {
                toast.success(res);
                navigate('/user/listing');
            })
            .catch(() => {
                toast.error('Something went wrong');
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

    const getUserByIdData = () => {
        getUserById(uuid).then((res: any) => {
            setValue('name', res.name);
            setValue('email', res.email);
            setValue('employement_code', +res.employement_code);
            setValue('designation', res.designation);
            setSelectRole(res?.role);
            setSelectResource(res.resource);
            setValue('is_resource', res.resource ? true : false);
            setValue('status', res?.status ? true : false);
        });
    };

    useEffect(() => {
        setValue('email', '');
        getRolesData();
        getResourcesData();
        getUserByIdData();
    }, [uuid]);

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
                            />

                            <SwitchFieldDefault
                                errors={!!errors?.status}
                                fieldName="status"
                                label="Status *"
                                control={control}
                                setValue={setValue}
                                isLoading={true}
                                helperText={errors?.status && errors?.status?.message}
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

                        {!selectedResource?.id && !isResource && (
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
                                valueGot={selectedRole}
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
                                // valueGot={
                                //     apiData &&
                                //     departmentData?.find(({ id }: any) => {
                                //         return id == apiData?.role_id;
                                //     })
                                // }
                                iProps={{
                                    onChange: isResourceChange
                                }}
                                valueGot={selectedResource}
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

export default UserEditManage;

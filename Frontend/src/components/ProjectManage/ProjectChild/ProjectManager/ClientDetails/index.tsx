/* eslint-disable no-useless-rename */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
// ================================|| Core Import  ||================================ //

import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Grid, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import SubCard from 'ui-component/cards/SubCard';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { TextFieldControlled } from 'ui-component/formsField/FormFields';
import ClientListing from '../ClientListing';
import { ClientDetailValidation } from './Validation';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { createClientDetails, getClientDetails } from 'services/clientDetails';

// ================================|| Sales Component ||================================ //

export function ClientDetailComponent(props: any) {
    const dispatch = useDispatch();
    const [tableData, setTableData] = useState<any>([]);

    const log: any = window.localStorage.getItem('user');
    const localUsers = JSON.parse(log);

    // ================================||use Hook Form ||================================ //

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
        resolver: yupResolver(ClientDetailValidation)
    });
    // create admin data
    const createonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        createClientDetails(data)
            .then((res: any) => {
                // props?.refreshData();
                getClients();
                toast.success('Record created Successfully');
                dispatch(spinLoaderShow(false));
                // navigate("/dashboard/default" )
            })
            .catch((err: any) => {
                dispatch(spinLoaderShow(false));
            });
    };

    const onSubmit = (data: any) => {
        data.name = data?.client_name;
        data.number = data?.client_number;
        data.email = data?.client_email;
        data.project_id = props?.projectId;
        data.role_id = localUsers?.role_id;

        delete data?.client_email;
        delete data?.client_name;
        delete data?.client_number;
        delete data?.uuid;

        createonSubmit(data);
        reset();
    };

    const getClients = () => {
        getClientDetails(props?.projectId)
            .then((res) => {
                setTableData(res);
            })
            .catch((err: any) => {
                console.log('err', err);
            });
    };

    useEffect(() => {
        getClients();
    }, []);

    useEffect(() => {
        console.log('errors', errors);
    }, [errors]);

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* // ================================|| Client Details||================================ // */}
                <Grid item xs={12} md={12} sm={12} direction="row" justifyContent="center" alignItems="center">
                    <SubCard title="Client Details" sx={{ mb: 3 }}>
                        <Grid container spacing={2}>
                            {/* // ================================|| Client Detail||================================ // */}
                            {/* // ================================||  Client Listing||================================ // */}
                            <Grid item xs={12} md={12} sm={12} sx={{ mb: 3 }}>
                                <ClientListing tableData={tableData} refreshData={getClients} />
                            </Grid>
                            {/* // ================================||  Client Listing||================================ // */}

                            <Grid item xs={3} md={3} sm={3}>
                                <TextFieldControlled
                                    errors={!!errors?.client_name}
                                    fullWidth={true}
                                    fieldName="client_name"
                                    type="text"
                                    autoComplete="off"
                                    label="Client Name *"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.client_name && errors?.client_name?.message}
                                />
                            </Grid>

                            <Grid item xs={3} md={3} sm={3}>
                                <TextFieldControlled
                                    errors={!!errors?.designation}
                                    fullWidth={true}
                                    fieldName="designation"
                                    type="text"
                                    autoComplete="off"
                                    label="Client Designation *"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.designation && errors?.designation?.message}
                                />
                            </Grid>

                            <Grid item xs={3} md={3} sm={3}>
                                <TextFieldControlled
                                    errors={!!errors?.client_number}
                                    fullWidth={true}
                                    fieldName="client_number"
                                    type="text"
                                    autoComplete="off"
                                    label="Client Number *"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.client_number && errors?.client_number?.message}
                                />
                            </Grid>
                            <Grid item xs={3} md={3} sm={3}>
                                <TextFieldControlled
                                    errors={!!errors?.client_email}
                                    fullWidth={true}
                                    fieldName="client_email"
                                    type="text"
                                    autoComplete="off"
                                    label="Client Email *"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.client_email && errors?.client_email?.message}
                                />
                            </Grid>

                            <Grid item xs={6} md={12} sm={6}>
                                <Grid sx={{ mt: 2 }} container direction="row" justifyContent="flex-end" alignItems="center">
                                    <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                        <Stack direction="row">
                                            <AnimateButton>
                                                <Button
                                                    variant="contained"
                                                    sx={{ m: 1 }}
                                                    name={'ClientDetails'}
                                                    onClick={handleSubmit(onSubmit)}
                                                >
                                                    add
                                                </Button>
                                            </AnimateButton>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </SubCard>
                </Grid>
                {/* // ================================|| Client Details||================================ // */}
            </form>
        </>
    );
}

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
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { createClientDetails, getClientDetails } from 'services/clientDetails';
import { ClientDetailValidation } from './Validation';
import ClientListing from './ClientListing';
// import ClientListing from '../../ProjectManager/ClientListing';

// ================================|| Sales Component ||================================ //

interface Iprops {
    errors: any;
    setValue: any;
    reset: any;
    control: any;
    handleSubmit: any;
}

export function ClientDetailComponentForSale(props: any) {
    const dispatch = useDispatch();

    const log: any = window.localStorage.getItem('user');
    const localUsers = JSON.parse(log);

    let { clientDetails, setClientDetails, projectId } = props;

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

    // ================================||use Hook Form ||================================ //

    // const {
    //     control,
    //     register,
    //     reset,
    //     setError,
    //     formState: { errors },
    //     setValue,
    //     getValues,
    //     handleSubmit
    // } = useForm<any>({
    //     mode: 'onChange',
    //     reValidateMode: 'onChange',
    //     //Validations=================>
    //     resolver: yupResolver(ClientDetailValidation)
    // });
    // create admin data
    // const createonSubmit = (data: any) => {
    //     dispatch(spinLoaderShow(true));
    //     createClientDetails(data)
    //         .then((res: any) => {
    //             // props?.refreshData();

    //             toast.success('Record created Successfully');
    //             dispatch(spinLoaderShow(false));
    //             // navigate("/dashboard/default" )
    //         })
    //         .catch((err: any) => {
    //             dispatch(spinLoaderShow(false));
    //         });
    // };

    const onSubmit = (data: any) => {
        data.role_id = localUsers?.role_id;
        // data.project_id = props?.projectId;

        // delete data?.uuid;
        data.is_add = true;

        const clone: any = JSON.parse(JSON.stringify(clientDetails));

        clone?.push(data);

        setClientDetails(clone);

        reset();
    };

    return (
        <>
            <form>
                {/* // ================================|| Client Details||================================ // */}
                <Grid item xs={12} md={12} sm={12} direction="row" justifyContent="center" alignItems="center">
                    <SubCard title="Client Details" sx={{ mb: 3 }}>
                        <Grid container spacing={2}>
                            {/* // ================================|| Client Detail||================================ // */}
                            {/* // ================================||  Client Listing||================================ // */}
                            <Grid item xs={12} md={12} sm={12} sx={{ mb: 3 }}>
                                <ClientListing tableData={clientDetails} setClientDetails={setClientDetails} projectId={projectId} />
                            </Grid>
                            {/* // ================================||  Client Listing||================================ // */}

                            <Grid item xs={3} md={3} sm={3}>
                                <TextFieldControlled
                                    errors={!!errors?.name}
                                    fullWidth={true}
                                    fieldName="name"
                                    type="text"
                                    autoComplete="off"
                                    label="Client Name *"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.name && errors?.name?.message}
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
                                    errors={!!errors?.number}
                                    fullWidth={true}
                                    fieldName="number"
                                    type="text"
                                    autoComplete="off"
                                    label="Client Number *"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.number && errors?.number?.message}
                                />
                            </Grid>
                            <Grid item xs={3} md={3} sm={3}>
                                <TextFieldControlled
                                    errors={!!errors?.email}
                                    fullWidth={true}
                                    fieldName="email"
                                    type="text"
                                    autoComplete="off"
                                    label="Client Email *"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.email && errors?.email?.message}
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

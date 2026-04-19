/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/*eslint-Disable */
/**
 *
 * ProjectManage
 *
 */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import { Button, Grid, Stack, Typography } from '@mui/material';

// assets
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import { AutoCompleteField, SwitchFieldDefault, TextFieldControlled } from 'ui-component/formsField/FormFields';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { createDepartment, getDepartmentById, updateDepartment } from 'services/departmentService';
import { createAssetCategory, getAssetCategoryById, updateAssetCategory } from 'services/assetCategoryService';
import { yupResolver } from '@hookform/resolvers/yup';
import { createVendorValidation } from './Validation';
import { createVendor, getVendorById, updateVendor } from 'services/vendorService';

const LocationOptions = [
    {
        id: 'Karachi, Pakistan',
        name: 'Karachi, Pakistan'
    },
    {
        id: 'Dubai, UAE',
        name: 'Dubai, UAE'
    }
];

export function VendorManage(props: any) {
    const dispatch = useDispatch();
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    const navigate = useNavigate();

    const [apiData, setApiData] = useState<any>(null);

    const defautlFormValues = {};
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
        resolver: yupResolver(createVendorValidation)
    });

    useEffect(() => {
        if (uuid) {
            getAssetCategoryByIdData();
        } else {
            reset();
            // setValue('status', true);
            setApiData(null);
        }
    }, [uuid]);

    useEffect(() => {
        if (apiData) {
            setValue('name', apiData?.name);
            setValue('phone_number', +apiData?.phone_number);
            setValue('email', apiData?.email);
            setValue('location', apiData?.location);
            setValue('account_title', apiData?.account_title);
            setValue('bank_name', apiData?.bank_name);
            setValue('account_number', apiData?.account_number);
            setValue('ibn_number', apiData?.ibn_number);
            setValue('NTN', apiData?.NTN);
            setValue('CNIC', apiData?.CNIC);
            setValue('address', apiData?.address);
        }
    }, [apiData]);

    const getAssetCategoryByIdData = async () => {
        dispatch(spinLoaderShow(true));
        getVendorById(uuid)
            .then((res: any) => {
                setApiData(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };
    // create onsubmit data
    const createonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        data.phone_number = parseInt(data?.phone_number) || null;
        data.account_number = data?.account_number || '';

        createVendor(data)
            .then((res: any) => {
                toast.success('Record inserted Successfully');
                dispatch(spinLoaderShow(false));
                // navigate("/dashboard/admin/listing" )
                navigate('/vendor/listing');
            })
            .catch((err: any) => {
                dispatch(spinLoaderShow(false));
                toast.error(err);
            });
    };
    // create updateonSubmit data
    const updateonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));

        data.phone_number = parseInt(data?.phone_number) || null;
        data.account_number = data?.account_number || '';
        updateVendor(uuid, data)
            .then((res: any) => {
                toast.success('Record Update Successfully');
                dispatch(spinLoaderShow(false));
                // navigate("/dashboard/admin/listing" )
            })
            .catch((err: any) => {
                dispatch(spinLoaderShow(false));
                toast.error(err);
            });
    };

    const onSubmit = (data: any) => {
        if (uuid) {
            updateonSubmit(data);
            // navigate('/resource/listing' );
        } else {
            createonSubmit(data);
            // navigate('/vendor/listing');
        }
    };
    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <SubCard>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.name}
                                fullWidth={true}
                                fieldName="name"
                                type="text"
                                autoComplete="off"
                                label="Name *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.name && errors?.name?.message}
                            />
                        </Grid>

                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.phone_number}
                                fullWidth={true}
                                fieldName="phone_number"
                                type="number"
                                autoComplete="off"
                                label="Phone Number *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.phone_number && errors?.phone_number?.message}
                            />
                        </Grid>

                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.email}
                                fullWidth={true}
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

                        {/* <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.location}
                                fullWidth={true}
                                fieldName="location"
                                type="text"
                                autoComplete="off"
                                label="Location *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.location && errors?.location?.message}
                            />
                        </Grid> */}
                        <Grid item xs={6} md={6} sm={6}>
                            <AutoCompleteField
                                errors={!!errors?.location}
                                fieldName="location"
                                autoComplete="off"
                                label="Location"
                                control={control}
                                setValue={setValue}
                                options={LocationOptions}
                                returnObject={false}
                                // disabled={apiData ? true : false}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.location && errors?.location?.message}
                                // valueGot={
                                //     apiData &&
                                //     taskCategory?.find(({ id }: any) => {
                                //         return id == apiData?.gender?.id;
                                //     })
                                // }
                                valueGot={
                                    apiData &&
                                    LocationOptions?.find(({ id }: any) => {
                                        return id == apiData?.location;
                                    })
                                }
                            />
                        </Grid>

                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.NTN}
                                fullWidth={true}
                                fieldName="NTN"
                                type="text"
                                autoComplete="off"
                                label="NTN# *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.NTN && errors?.NTN?.message}
                            />
                        </Grid>

                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.CNIC}
                                fullWidth={true}
                                fieldName="CNIC"
                                type="text"
                                autoComplete="off"
                                label="CNIC *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.CNIC && errors?.CNIC?.message}
                            />
                        </Grid>

                        <Grid item xs={12} md={12} sm={12}>
                            <TextFieldControlled
                                errors={!!errors?.address}
                                fullWidth={true}
                                fieldName="address"
                                type="text"
                                autoComplete="off"
                                label="Address *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.address && errors?.address?.message}
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
                                errors={!!errors?.account_title}
                                fullWidth={true}
                                fieldName="account_title"
                                type="text"
                                autoComplete="off"
                                label="Account Title"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                multiline
                                helperText={errors?.account_title && errors?.account_title?.message}
                                // disabled={apiData ? true : false}
                            />
                        </Grid>
                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.bank_name}
                                fullWidth={true}
                                fieldName="bank_name"
                                type="text"
                                autoComplete="off"
                                label="Bank Name"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                multiline
                                helperText={errors?.bank_name && errors?.bank_name?.message}
                                // disabled={apiData ? true : false}
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
                                    // disabled={apiData ? true : false}
                                />
                            </>
                        </Grid>

                        {/* <Grid item xs={3} md={3} sm={3} style={{ marginTop: '15px', display: 'flex', justifyContent: 'right' }}>
                            <SwitchFieldDefault
                                errors={!!errors?.status}
                                fieldName="status"
                                label="status *"
                                control={control}
                                setValue={setValue}
                                isLoading={true}
                                helperText={errors?.status && errors?.status?.message}
                            />
                        </Grid> */}

                        <Grid sx={{ mb: 1, mt: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                            <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                <Stack direction="row">
                                    <AnimateButton>
                                        <Button
                                            variant="contained"
                                            type="submit"
                                            sx={{ m: 3 }}
                                            className={'red'}
                                            onClick={handleSubmit(onSubmit)}
                                        >
                                            Submit
                                        </Button>
                                    </AnimateButton>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Grid>
                </SubCard>
            </form>
        </>
    );
}

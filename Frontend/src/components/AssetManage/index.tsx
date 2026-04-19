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
import { Button, Grid, Stack, TextField, Typography } from '@mui/material';

// assets
import { useFieldArray, useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import { AutoCompleteField, MuiDatePicker, SwitchFieldDefault, TextFieldControlled } from 'ui-component/formsField/FormFields';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { createDepartment, getDepartmentById, updateDepartment } from 'services/departmentService';
import { createAssetCategory, getAllAssetCategory, getAssetCategoryById, updateAssetCategory } from 'services/assetCategoryService';
import { yupResolver } from '@hookform/resolvers/yup';
import { createAssetValidation } from './Validation';
import { createVendor, getAllVendors, getVendorById, updateVendor } from 'services/vendorService';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/lab';
import { createAsset, getAssetById, updateAsset } from 'services/assetService';
import { DropzoneComponent } from 'ui-component/Dropzone';
import { uploadFiles } from 'services/uploadService';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';

const LocationOptions = [
    {
        id: 'KHI',
        name: 'Karachi, Pakistan'
    },
    {
        id: 'DXB',
        name: 'Dubai, UAE'
    }
];

type dropdown = {
    vendordropdown: any;
    assetcategorydropdown: any;
};

export function AssetManage(props: dropdown) {
    const dispatch = useDispatch();
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    const navigate = useNavigate();

    const [apiData, setApiData] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [assetCategoryOptions, setAssetCategoryOptions] = useState<any>();
    const [vendorOptions, setVendorsOptions] = useState<any>();
    const [purchasedDate, setPurchasedDate] = useState<any>(null);
    const [warrantyExpiration, setWarrantyExpiration] = useState<any>(null);
    const [invoiceData, setinvoiceData] = useState<any>('');
    const [invoice2Data, setinvoice2Data] = useState<any>('');

    const defautlFormValues = {
        // invoice: ''
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
        resolver: yupResolver(createAssetValidation)
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'specification'
    });

    const handleAddInstance = (e: any) => {
        e?.preventDefault();

        append({});
    };

    const handleRemoveInstance = (index: number) => {
        remove(index);
    };

    useEffect(() => {
        append({});
    }, []);

    const getAssetByIdData = async () => {
        dispatch(spinLoaderShow(true));
        getAssetById(uuid)
            .then((res: any) => {
                setApiData(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    useEffect(() => {
        if (uuid) {
            getAssetByIdData();
        } else {
            reset();

            setApiData(null);
        }
    }, [uuid]);

    useEffect(() => {
        if (apiData) {
            setValue('cost', apiData?.cost);
            setValue('brand', apiData?.brand);
            setValue('model_number', apiData?.model_number);
            setValue('approved_by', apiData?.approved_by);
            setValue('specification', apiData?.specification);
            setValue('purchased_date', apiData?.purchased_date);
            setValue('warranty_expiration', apiData?.warranty_expiration);
            setValue('invoice', apiData?.invoice);
            setValue('invoice2', apiData?.invoice2);
        }
    }, [apiData]);
    // create onsubmit data
    const createonSubmit = async (data: any) => {
        dispatch(spinLoaderShow(true));
        data.purchased_date = moment(data.purchased_date, 'MM/DD/YYYY').toDate();
        data.warranty_expiration = moment(data.warranty_expiration, 'MM/DD/YYYY').toDate();

        createAsset(data)
            .then((res: any) => {
                toast.success('Record inserted Successfully');
                dispatch(spinLoaderShow(false));
                navigate('/asset/listing');
            })
            .catch((err: any) => {
                dispatch(spinLoaderShow(false));
                toast.error(err);
            });
    };
    // create updateonSubmit data
    const updateonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        updateAsset(uuid, data)
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
            // navigate('/asset/listing' );
        } else {
            createonSubmit(data);
            // navigate('/asset/listing');
        }
    };

    const InvoiceDocumentHandleSave = async (files: String) => {
        if (files[0]) {
            dispatch(spinLoaderShow(true));

            const formData = new FormData();
            formData.append('file', files[0]);
            uploadFiles(formData)
                .then((res: any) => {
                    setValue('invoice', res);
                })
                .catch((err) => {
                    console.log('errror', err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    const Invoice2DocumentHandleSave = async (files: String) => {
        if (files[0]) {
            dispatch(spinLoaderShow(true));

            const formData = new FormData();
            formData.append('file', files[0]);
            uploadFiles(formData)
                .then((res: any) => {
                    setValue('invoice2', res);
                })
                .catch((err) => {
                    console.log('errror', err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };
    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <SubCard>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        {props?.assetcategorydropdown && (
                            <Grid item xs={4} md={4} sm={4}>
                                <AutoCompleteField
                                    errors={!!errors?.asset_category_id}
                                    fieldName="asset_category_id"
                                    autoComplete="off"
                                    label="Asset Category"
                                    control={control}
                                    setValue={setValue}
                                    options={props.assetcategorydropdown}
                                    returnObject={false}
                                    // disabled={apiData ? true : false}
                                    isLoading={true}
                                    optionKey="id"
                                    optionValue="name"
                                    helperText={errors?.asset_category_id && errors?.asset_category_id?.message}
                                    valueGot={
                                        apiData &&
                                        props.assetcategorydropdown?.find(({ id }: any) => {
                                            return id == apiData?.asset_category_id;
                                        })
                                    }
                                />
                            </Grid>
                        )}

                        <Grid item xs={4} md={4} sm={4}>
                            <AutoCompleteField
                                fieldName="location"
                                autoComplete="off"
                                label="Location"
                                control={control}
                                setValue={setValue}
                                options={LocationOptions}
                                returnObject={false}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.location && errors?.location?.message}
                                valueGot={
                                    apiData &&
                                    LocationOptions?.find(({ id }: any) => {
                                        return id == apiData?.location;
                                    })
                                }
                            />
                        </Grid>

                        {/* <Grid item xs={4} md={4} sm={4}>
                            <TextFieldControlled
                                // errors={!!errors?.email}
                                fullWidth={true}
                                fieldName="asset_id"
                                type="text"
                                autoComplete="off"
                                label="Asset ID *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                // helperText={errors?.email && errors?.email?.message}
                                disabled={true}
                            />
                        </Grid> */}

                        <Grid item xs={4} md={4} sm={4}>
                            <TextFieldControlled
                                errors={!!errors?.brand}
                                fullWidth={true}
                                fieldName="brand"
                                type="text"
                                autoComplete="off"
                                label="Brand *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.brand && errors?.brand?.message}
                            />
                        </Grid>

                        <Grid item xs={4} md={4} sm={4}>
                            <TextFieldControlled
                                errors={!!errors?.model_number}
                                fullWidth={true}
                                fieldName="model_number"
                                type="text"
                                autoComplete="off"
                                label="Model No. *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.model_number && errors?.model_number?.message}
                            />
                        </Grid>
                        {props?.vendordropdown && (
                            <Grid item xs={4} md={4} sm={4}>
                                <AutoCompleteField
                                    errors={!!errors?.vendor_id}
                                    fieldName="vendor_id"
                                    autoComplete="off"
                                    label="Vendor"
                                    control={control}
                                    setValue={setValue}
                                    options={props.vendordropdown}
                                    returnObject={false}
                                    // disabled={apiData ? true : false}
                                    isLoading={true}
                                    optionKey="id"
                                    optionValue="name"
                                    helperText={errors?.vendor_id && errors?.vendor_id?.message}
                                    // isOptionEqualToValue= {}
                                    valueGot={
                                        apiData &&
                                        props.vendordropdown?.find(({ id }: any) => {
                                            return id == apiData?.vendor_id;
                                        })
                                    }
                                />
                            </Grid>
                        )}
                        <Grid item xs={4} md={4} sm={4}>
                            <TextFieldControlled
                                errors={!!errors?.cost}
                                fullWidth={true}
                                fieldName="cost"
                                type="text"
                                autoComplete="off"
                                label="Asset Cost *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.cost && errors?.cost?.message}
                            />
                        </Grid>
                        <Grid item xs={4} md={4} sm={4}>
                            <TextFieldControlled
                                errors={!!errors?.approved_by}
                                fullWidth={true}
                                fieldName="approved_by"
                                type="text"
                                autoComplete="off"
                                label="Approved By *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.approved_by && errors?.approved_by?.message}
                            />
                        </Grid>

                        <Grid item xs={4} md={4} sm={4}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <MuiDatePicker
                                    label={'Purchased Date *'}
                                    name={`purchased_date`}
                                    control={control}
                                    margin="16px 0px 0px 0px"
                                    // error={}
                                    error={!!errors?.purchased_date}
                                    helperText={errors?.purchased_date && errors?.purchased_date?.message}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={4} md={4} sm={4}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <MuiDatePicker
                                    label={'Warranty Expiration Date *'}
                                    name={`warranty_expiration`}
                                    control={control}
                                    margin="16px 0px 0px 0px"
                                    // error={}
                                    error={!!errors?.warranty_expiration}
                                    helperText={errors?.warranty_expiration && errors?.warranty_expiration?.message}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={12} sm={12}>
                            {fields &&
                                fields?.map((fieldItem: any, index: any) => {
                                    return (
                                        <Grid item md={12} key={fieldItem.id}>
                                            <Grid container spacing={3}>
                                                <Grid item xs={4} md={4} sm={4}>
                                                    <TextFieldControlled
                                                        fullWidth={true}
                                                        fieldName={`specification.[${index}].fieldname`}
                                                        type="text"
                                                        autoComplete="off"
                                                        label="Field Name *"
                                                        control={control}
                                                        valueGot={''}
                                                        setValue={setValue}
                                                        // errors={!!errors?.family_details?.[index]?.family_detail}
                                                        // helperText={errors?.family_details?.[index]?.family_detail?.message || ''}
                                                    />
                                                </Grid>
                                                <Grid item xs={4} md={4} sm={4}>
                                                    <TextFieldControlled
                                                        fullWidth={true}
                                                        fieldName={`specification.[${index}].value`}
                                                        type="text"
                                                        autoComplete="off"
                                                        label="Value *"
                                                        control={control}
                                                        valueGot={''}
                                                        setValue={setValue}
                                                        // errors={!!errors?.family_details?.[index]?.relationship}
                                                        // helperText={errors?.family_details?.[index]?.relationship?.message || ''}
                                                    />
                                                </Grid>
                                                <Grid item md={2} sx={{ mt: 3 }}>
                                                    <DeleteIcon
                                                        sx={{ width: 27, height: 27 }}
                                                        color="error"
                                                        onClick={() => {
                                                            handleRemoveInstance(index);
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    );
                                })}
                        </Grid>

                        <Grid sx={{ mb: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                            <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                <Stack direction="row">
                                    <AnimateButton>
                                        <Button
                                            variant="contained"
                                            type="button"
                                            sx={{ m: 3, mr: 0 }}
                                            className={'red'}
                                            onClick={handleAddInstance}
                                        >
                                            Add Specification
                                        </Button>
                                    </AnimateButton>
                                </Stack>
                            </Grid>
                        </Grid>

                        <Grid item xs={6} md={6} sm={6}>
                            <SubCard title="Add Invoice *">
                                <>
                                    <DropzoneComponent
                                        handleSave={InvoiceDocumentHandleSave}
                                        documentData={apiData?.invoice}
                                        acceptedFiles={['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx']}
                                    />
                                </>
                                {/* ) : (
                                    <DropzoneComponent handleSave={PmoDocumentHandleSave} message={false} />
                                )} */}
                                <input {...register('invoice')} hidden />
                                <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                                    {/* {errors?.invoice && errors?.invoice?.message} */}
                                </p>
                            </SubCard>
                        </Grid>

                        <Grid item xs={6} md={6} sm={6}>
                            <SubCard title="Add 2nd Invoice">
                                <>
                                    <DropzoneComponent
                                        handleSave={Invoice2DocumentHandleSave}
                                        documentData={apiData?.invoice2}
                                        acceptedFiles={['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx']}
                                    />
                                </>
                                {/* ) : (
                                    <DropzoneComponent handleSave={PmoDocumentHandleSave} message={false} />
                                )} */}
                                <input {...register('invoice2')} hidden />
                                {/* <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                                    {errors?.pmo_documents && errors?.pmo_documents?.message}
                                </p> */}
                            </SubCard>
                        </Grid>
                    </Grid>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mt: 3 }}>
                        <Grid sx={{ mb: 1, mt: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                            <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                <Stack direction="row">
                                    <AnimateButton>
                                        <Button
                                            variant="contained"
                                            type="button"
                                            sx={{ m: 3 }}
                                            className={'red'}
                                            onClick={handleSubmit(onSubmit)}
                                        >
                                            Save
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

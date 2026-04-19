import React, { useState, useEffect } from 'react';
import { spinLoaderShow } from 'store/actions/spinLoader';
import {
    Button,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Box,
    Tab,
    Tabs
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
    TextFieldControlled,
    AutoCompleteField,
    GenericRadioGroup,
    AutoCompleteMultipleField,
    DateField
} from 'ui-component/formsField/FormFields';
import AnimateButton from 'ui-component/extended/AnimateButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { createFamilyInfoValidation } from './validation';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { toast } from 'react-toastify';
import { getEmployeeDetail, createEmployeeDetail } from 'services/employmentService';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { MuiDatePicker } from 'ui-component/formsField/FormFields';
import useAuth from 'hooks/useAuth';
// import { GenericDatePicker } from 'ui-component/formsField/FormFields';

import * as yup from 'yup';
import SubCard from 'ui-component/cards/SubCard';
import { DropzoneComponent } from 'ui-component/Dropzone';
import { uploadFiles } from 'services/uploadService';

const maritalstatusOption = [
    {
        id: 'single',
        name: 'Single'
    },
    {
        id: 'married',
        name: 'Married'
    }
];
const emplyeestatusoption = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
];

const createEmployeeValidation = yup.object({
    marital_status: yup
        .string()
        .required('Please select Marital Status')
        .oneOf(maritalstatusOption.map((option) => option.id))
});

const FamilyInformation = () => {
    const [isMarried, setIsMarried] = useState(true);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [dateofbirth, setDateofbirth] = useState<any>(null);
    const [isLoading, setIsloading] = useState(false);
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { user } = useAuth();

    const {
        control: controlcheck,
        register: registercheck,
        reset: resetcheck,
        setError: setErrorcheck,
        formState: { errors: errorscheck },
        setValue: setValuecheck,
        getValues: getValuescheck,
        handleSubmit: handleSubmitcheck
    } = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        // defaultValues: defautlFormValues,
        resolver: yupResolver(createEmployeeValidation)
    });
    const {
        control,
        register,
        reset,
        setError,
        formState: { errors },
        setValue,
        getValues,
        handleSubmit,
        clearErrors
    }: any = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        // defaultValues: defautlFormValues,
        resolver: yupResolver(createFamilyInfoValidation)
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'family_details'
    });

    const handleAddInstance = (e: any) => {
        e?.preventDefault();

        append({});
    };

    const handleRemoveInstance = (index: number) => {
        remove(index);
    };

    const onSubmit = async (data: any) => {
        if (data?.marital_status === 'married') {
            setIsMarried(false);
        } else {
            // toast.success('Marital Status updated successfully');
            // navigate('/hr/create');
            setIsloading(true);
            const newData = data;
            newData.user_id = params?.id;
            await createEmployeeDetail(newData)
                .then((res) => {
                    toast.success('user details updated successfully');
                    // navigate('/hr/create');
                    // navigate('/hr/lisitng');
                })
                .catch((err) => {
                    console.log(err);
                })
                .finally(() => {
                    setIsloading(false);
                });
        }
    };
    const onSubmitfamilyInfo = async (data: any) => {
        setIsloading(true);
        const newData = data;
        newData.user_id = params?.id;
        Boolean(newData.maternity_provision);
        delete newData?.employmentid;

        await createEmployeeDetail(newData)
            .then((res) => {
                toast.success('user details updated successfully');
                // navigate('/hr/create');
                // navigate('/hr/listing');
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setIsloading(false);
            });
    };

    useEffect(() => {
        dispatch(spinLoaderShow(true));

        getEmployeeDetail(params?.id)
            .then((res: any) => {
                setUserInfo(res);
                setValue('employmentid', res?.user?.employement_code);
                setValue('marital_status', 'married');
                setValue('number_dependents', res?.userDeatils?.number_dependents);
                res?.userDeatils?.family_details.forEach((item: any, index: any) => {
                    append({});
                    setValue(`family_details[${index}].family_detail`, item.family_detail);
                    setValue(`family_details[${index}].relationship`, item.relationship);
                    setValue(`family_details[${index}].date_of_birth`, item.date_of_birth);
                    setValue(`family_details[${index}].cnic`, item.cnic);
                });
            })

            .catch((err) => {})
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    }, []);
    useEffect(() => {
        userInfo?.userDeatils?.marital_status === 'married' && setIsMarried(false);
    }, [userInfo]);
    useEffect(() => {
        append({});
    }, []);

    // Note: You were missing the 'async' keyword for the function
    const SingedDocumentHandleSave = async (files: File[], filekey: any) => {
        if (files[0]) {
            dispatch(spinLoaderShow(true));

            const formData = new FormData();
            formData.append('file', files[0]);
            await uploadFiles(formData)
                .then((res: any) => {
                    setValue(filekey, res);
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
        <div>
            {isMarried ? (
                <>
                    {' '}
                    <form onSubmit={handleSubmitcheck(onSubmit)}>
                        <Grid container spacing={2}>
                            <Grid item xs={6} md={6} sm={6}>
                                <AutoCompleteField
                                    errors={!!errorscheck?.marital_status}
                                    fieldName="marital_status"
                                    autoComplete="off"
                                    label="Marital Status"
                                    control={controlcheck}
                                    setValue={setValuecheck}
                                    options={maritalstatusOption}
                                    returnObject={false}
                                    isLoading={true}
                                    optionKey="id"
                                    optionValue="name"
                                    onClick={() => errorscheck?.marital_status && clearErrors('firstName')}
                                    helperText={errorscheck?.marital_status && errorscheck?.marital_status?.message}
                                    // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                    valueGot={
                                        userInfo &&
                                        maritalstatusOption?.find(({ id }: any) => {
                                            return id == userInfo?.userDeatils?.marital_status;
                                        })
                                    }
                                />
                            </Grid>
                            {/* {(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource') && ( */}
                            <>
                                <Grid sx={{ mb: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                                    <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                        <Stack direction="row">
                                            <AnimateButton>
                                                <Button
                                                    variant="contained"
                                                    type="submit"
                                                    sx={{ m: 3, mr: 0 }}
                                                    className={'red'}
                                                    onClick={handleSubmitcheck(onSubmit)}
                                                >
                                                    save
                                                </Button>
                                            </AnimateButton>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </>
                            {/* )} */}
                        </Grid>
                    </form>
                </>
            ) : (
                <>
                    <form onSubmit={handleSubmit(onSubmitfamilyInfo)}>
                        <Grid container spacing={2}>
                            <Grid item xs={6} md={6} sm={6}>
                                <TextFieldControlled
                                    errors={!!errors?.employmentid}
                                    fullWidth={true}
                                    fieldName="employmentid"
                                    type="text"
                                    autoComplete="off"
                                    label="Employment Code"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.employmentid && errors?.employmentid?.message}
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={6} md={6} sm={6}>
                                {/* <TextFieldControlled
                                    errors={!!errors?.marital_status}
                                    fullWidth={true}
                                    fieldName="marital_status"
                                    type="text"
                                    autoComplete="off"
                                    label="Marital Status"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.marital_status && errors?.marital_status?.message}
                                    disabled
                                /> */}
                                <AutoCompleteField
                                    errors={!!errors?.marital_status}
                                    fieldName="marital_status"
                                    autoComplete="off"
                                    label="Marital Status"
                                    control={control}
                                    setValue={setValue}
                                    options={maritalstatusOption}
                                    returnObject={false}
                                    isLoading={true}
                                    optionKey="id"
                                    optionValue="name"
                                    onClick={() => errors?.marital_status && clearErrors('marital_status')}
                                    helperText={errors?.marital_status && errors?.marital_status?.message}
                                    // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                    valueGot={
                                        userInfo &&
                                        maritalstatusOption?.find(({ id }: any) => {
                                            // return id == userInfo?.userDeatils?.marital_status;
                                            return id == 'married';
                                        })
                                    }
                                />
                            </Grid>
                            <Grid item xs={6} md={6} sm={6}>
                                <TextFieldControlled
                                    errors={!!errors?.number_dependents}
                                    fullWidth={true}
                                    fieldName="number_dependents"
                                    type="text"
                                    autoComplete="off"
                                    label="No. of dependent"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.number_dependents && errors?.number_dependents?.message}
                                    // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                />
                            </Grid>

                            <Grid container spacing={2}>
                                {fields &&
                                    fields.map((fieldItem: any, index: any) => (
                                        <Grid item xs={12} key={fieldItem.id}>
                                            <SubCard title={`Family Member ${index + 1}`} sx={{ marginBottom: '16px' }}>
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item xs={12} sm={6} md={4}>
                                                        <TextFieldControlled
                                                            fullWidth
                                                            fieldName={`family_details.[${index}].family_detail`}
                                                            type="text"
                                                            autoComplete="off"
                                                            label="Family Detail"
                                                            control={control}
                                                            valueGot={''}
                                                            setValue={setValue}
                                                            errors={!!errors?.family_details?.[index]?.family_detail}
                                                            helperText={errors?.family_details?.[index]?.family_detail?.message || ''}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6} md={4}>
                                                        <TextFieldControlled
                                                            fullWidth
                                                            fieldName={`family_details.[${index}].relationship`}
                                                            type="text"
                                                            autoComplete="off"
                                                            label="Relationship"
                                                            control={control}
                                                            valueGot={''}
                                                            setValue={setValue}
                                                            errors={!!errors?.family_details?.[index]?.relationship}
                                                            helperText={errors?.family_details?.[index]?.relationship?.message || ''}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6} md={4}>
                                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                            <MuiDatePicker
                                                                label="Date Of Birth"
                                                                name={`family_details.[${index}].date_of_birth`}
                                                                control={control}
                                                                error={!!errors?.family_details?.[index]?.date_of_birth}
                                                                helperText={errors?.family_details?.[index]?.date_of_birth?.message || ''}
                                                            />
                                                        </LocalizationProvider>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <DropzoneComponent
                                                            handleSave={(files: File[]) =>
                                                                SingedDocumentHandleSave(files, `family_details.[${index}].cnic`)
                                                            }
                                                            documentData={fieldItem?.cnic || null}
                                                            message="Drag 'n' drop files here, or click to select files"
                                                            sx={{ border: '1px dashed #ccc', borderRadius: '8px', padding: '8px' }}
                                                        />
                                                        <input {...register(`family_details.[${index}].cnic`)} hidden />
                                                        {errors?.family_details?.[index]?.cnic?.message && (
                                                            <p style={{ color: 'red', textAlign: 'center' }}>
                                                                {errors?.family_details?.[index]?.cnic?.message}
                                                            </p>
                                                        )}
                                                    </Grid>
                                                    <Grid item xs={12} sm={12} md={12} textAlign="right">
                                                        <DeleteIcon
                                                            sx={{ width: 27, height: 27, cursor: 'pointer' }}
                                                            color="error"
                                                            onClick={() => handleRemoveInstance(index)}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </SubCard>
                                        </Grid>
                                    ))}
                            </Grid>

                            {/* {(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource') && ( */}
                            <>
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
                                                    Add
                                                </Button>
                                            </AnimateButton>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </>
                            {/* )} */}

                            <Grid item xs={6} md={6} sm={6}>
                                <>
                                    <GenericRadioGroup
                                        label="Would you choose Maternity provision?"
                                        options={emplyeestatusoption}
                                        control={control}
                                        fieldName="maternity_provision"
                                        defaultValue={userInfo?.userDeatils?.maternity_provision ? true : false}
                                        // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                    />
                                </>
                            </Grid>

                            {/* {(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource') && ( */}
                            <>
                                <Grid sx={{ mb: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                                    <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                        <Stack direction="row">
                                            <AnimateButton>
                                                <Button
                                                    variant="contained"
                                                    type="submit"
                                                    sx={{ m: 3, mr: 0 }}
                                                    className={'red'}
                                                    onClick={handleSubmit(onSubmitfamilyInfo)}
                                                >
                                                    save
                                                </Button>
                                            </AnimateButton>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </>
                            {/* )} */}
                        </Grid>
                    </form>
                </>
            )}
        </div>
    );
};

export default FamilyInformation;

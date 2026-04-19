/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/*eslint-Disable */
/**
 *
 * ProjectManage
 *
 */
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Button, Chip, Grid, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';

// assets
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import { AutoCompleteField, AutoCompleteMultipleField, SwitchFieldDefault, TextFieldControlled } from 'ui-component/formsField/FormFields';
import { LocalizationProvider, DateTimePicker, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { createResource, getAllDesignations, getResourceByID, updateResource } from 'services/resource';
import { getDepartmentCategory } from 'services/categoryService';

export function ResourceManage(props: any) {
    const dispatch = useDispatch();
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    const navigate = useNavigate();

    const [departmentData, setDepartmentData] = useState<any>([]);
    const [apiData, setApiData] = useState<any>(null);

    const defautlFormValues = {
        status: true,
        is_team_lead: false,
        is_atl: false,
        show_in_calendar: true
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
        defaultValues: defautlFormValues
        // resolver: yupResolver(FinanceValidation)
    });

    useEffect(() => {
        getDepartmentData();
    }, []);

    useEffect(() => {
        if (uuid) {
            getResourceDataByID();
        } else {
            reset();
        }
    }, [uuid]);

    useEffect(() => {
        if (apiData) {
            setValue('name', apiData?.name);
            setValue('is_team_lead', apiData?.is_team_lead);
            setValue('is_atl', apiData?.is_atl);
            setValue('status', apiData?.status);
        }
    }, [apiData]);

    const getResourceDataByID = async () => {
        dispatch(spinLoaderShow(true));
        getResourceByID(uuid)
            .then((res: any) => {
                setApiData(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const getDepartmentData = async () => {
        dispatch(spinLoaderShow(true));
        getDepartmentCategory()
            .then((res: any) => {
                setDepartmentData(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    // create onsubmit data
    const createonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        createResource(data)
            .then((res: any) => {
                toast.success('Record inserted Successfully');
                dispatch(spinLoaderShow(false));
                // navigate("/dashboard/admin/listing" )
            })
            .catch((err: any) => {
                dispatch(spinLoaderShow(false));
                toast.error(err);
            });
    };
    // create updateonSubmit data
    const updateonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        updateResource(data)
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
        if (apiData) {
            data.id = apiData?.id;
            data.show_in_calendar = apiData?.show_in_calendar || true;
            updateonSubmit(data);
        } else {
            data.status = data.status;
            createonSubmit(data);
            navigate('/resource/listing');
        }
    };
    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <SubCard>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={3} md={3} sm={3}>
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
                        <Grid item xs={3} md={3} sm={3}>
                            <AutoCompleteField
                                errors={!!errors?.department_id}
                                fieldName="department_id"
                                autoComplete="off"
                                label="Select Department *"
                                control={control}
                                setValue={setValue}
                                options={departmentData}
                                returnObject={false}
                                // iProps={{
                                //     onChange: getSpecialitiesByCategory,
                                //     disabled: apiData
                                // }}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.department_id && errors?.department_id?.message}
                                valueGot={
                                    apiData &&
                                    departmentData?.find(({ id }: any) => {
                                        return id == apiData?.department_id;
                                    })
                                }
                            />
                        </Grid>
                        <Grid item xs={2} md={2} sm={2} sx={{ marginTop: '18px', justifyContent: 'center' }}>
                            <SwitchFieldDefault
                                errors={!!errors?.is_team_lead}
                                fieldName="is_team_lead"
                                label="Team Lead"
                                control={control}
                                setValue={setValue}
                                isLoading={true}
                                helperText={errors?.is_team_lead && errors?.is_team_lead?.message}
                            />
                        </Grid>

                        <Grid item xs={2} md={2} sm={2} sx={{ marginTop: '18px', justifyContent: 'center' }}>
                            <SwitchFieldDefault
                                errors={!!errors?.is_atl}
                                fieldName="is_atl"
                                label="Assistance Team Lead"
                                control={control}
                                setValue={setValue}
                                isLoading={true}
                                helperText={errors?.is_atl && errors?.is_atl?.message}
                            />
                        </Grid>

                        <Grid item xs={2} md={2} sm={2} sx={{ marginTop: '18px', justifyContent: 'center' }}>
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

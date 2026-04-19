/* eslint-disable no-useless-rename */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
// ================================|| Core Import  ||================================ //

import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Grid, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { AutoCompleteField, TextFieldControlled } from 'ui-component/formsField/FormFields';
import AdditionalHoursListing from '../AdditionalHoursListing';
import { AdditionalHoursValidation } from './Validation';
import { createHourDetail, getAllDepartments, getProjectById, getProjectHourDetail } from 'services/projectService';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import moment from 'moment';

// ================================|| Sales Component ||================================ //

export function AdditionalHoursComponent({
    hoursCategory,
    departmentCategory,
    projectId
}: {
    hoursCategory: any;
    departmentCategory: any;
    projectId: any;
}) {
    const dispatch = useDispatch();

    const [totalHours, setTotalHours] = useState<any>([]);
    const [totalCost, setTotalCost] = useState<any>([]);
    const [totalWeeks, setTotalWeeks] = useState(0);
    const [upsel, setUpsel] = useState<any>([]);
    const [upselhours, setUpselhours] = useState<any>([]);
    const [AditionalCategory, seAdditioonalCategory] = useState<any>([]);
    const [projectHoursData, setProjectHoursData] = useState<any>([]);
    const [departmentWiseCost, setDepartmentWiseCost] = useState<any>([]);
    const [SaleData, setSaleData] = useState<any>({});

    const log: any = window.localStorage.getItem('user');
    const user = JSON.parse(log);

    const defautlFormValues = {
        status: true
    };
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
        defaultValues: defautlFormValues,
        resolver: yupResolver(AdditionalHoursValidation)
    });

    useEffect(() => {
        getAllDepartmentsData();
        getProjectHoursData();
        getProjectByIdData();
    }, [projectId]);

    const getAllDepartmentsData = () => {
        getAllDepartments()
            .then((res: any) => {
                setDepartmentWiseCost(res);
            })
            .catch((err) => {
                console.log('err', err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const getProjectHoursData = async () => {
        dispatch(spinLoaderShow(true));
        getProjectHourDetail(projectId)
            .then((res: any) => {
                res?.forEach((element: any) => {
                    // const findCost = departmentWiseCost?.find((x: any) => x.department_id == element?.department?.id);
                    element.cost = +element.hours * 40;
                });
                setProjectHoursData(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    // ================================|| Onsubmit ||================================ //
    // create onsubmit data
    const createonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        createHourDetail(data)
            .then((res: any) => {
                toast.success('Record inserted Successfully');
                getProjectHoursData();
                dispatch(spinLoaderShow(false));
                // navigate("/dashboard/admin/listing" )
            })
            .catch((err) => {
                dispatch(spinLoaderShow(false));
                toast.error(err);
            });
    };
    const onSubmit = (data: any) => {
        const currentDate = moment();
        var obj = {
            modified_date: currentDate.format('YYYY-MM-DD'),
            department_id: data.department_id,
            project_catgory_hours_id: data?.category_id,
            no_of_resources: isNaN(+data.no_resource) ? 0 : +data.no_resource,
            hours: +data.hours,
            role_id: user?.role_id,
            project_id: projectId
        };
        createonSubmit(obj);
        reset();
    };

    const getProjectByIdData = () => {
        dispatch(spinLoaderShow(true));
        getProjectById(projectId)
            .then((res: any) => {
                setTotalWeeks(res?.no_of_weeks);
                setSaleData(res);
            })
            .catch(() => {
                setTotalWeeks(0);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    useEffect(() => {
        let Hours = 0;
        let CurrentApiData = 0;
        let temp = projectHoursData?.map(
            (item: any, index: any) => item?.project_category_hours?.name !== 'Additional' && (Hours += item?.hours)
        );

        setTotalHours(Hours);

        let Cost = 0;
        let temp2 = projectHoursData?.map((item: any, index: any) => (Cost += item?.cost));

        setTotalCost(Cost);

        //set for upsell================>
        let upsel = 0;
        let upselhours = 0;

        let upsell = projectHoursData?.filter((e: any) => {
            return e?.project_category_hours?.name == 'Upsell';
        });

        let totleUpsell = upsell?.map((item: any, index: any) => (upsel += +item.hours * 40));
        let totleUp = upsell?.map((item: any, index: any) => (upselhours += +item.hours));

        setUpsel(upsel);
        setUpselhours(upselhours);

        //set for additionsl
        let aditional = 0;

        let additional = projectHoursData?.filter((e: any) => {
            return e?.project_category_hours?.name == 'Additional';
        });
        let totleAdditional = additional?.map((item: any, index: any) => (aditional += item?.hours));

        seAdditioonalCategory(aditional);
    }, [projectHoursData]);

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* // ================================|| Hours Details||================================ // */}
                <Grid item xs={12} md={12} sm={12} direction="row" justifyContent="center" alignItems="center">
                    <SubCard title="Upsell / Additional Hours " sx={{ mb: 3 }}>
                        <Grid container spacing={2}>
                            {/* // ================================|| Display additional hours Detail||================================ // */}
                            <Grid item xs={12} md={12} sm={12} sx={{ mt: 2, mb: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={2} md={1.5} sm={2}></Grid>
                                    <Grid item xs={4} md={2} sm={4}>
                                        <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                                            Total Hours
                                        </Typography>
                                        <h1 style={{ textAlign: 'center' }}>
                                            {totalHours}
                                            <span style={{ color: 'red', fontSize: '22px' }}>{` +${AditionalCategory}`}</span>
                                            <span style={{ color: 'blue', fontSize: '22px' }}>{` +${upselhours}`}</span>
                                        </h1>
                                    </Grid>
                                    <Grid item xs={4} md={2} sm={4}>
                                        <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                                            Consumed Hours
                                        </Typography>
                                        <h1 style={{ textAlign: 'center' }}>
                                            {SaleData && SaleData?.project_consumed_hours?.length > 0
                                                ? SaleData.project_consumed_hours.reduce((accumulator: any, current: any) => {
                                                      return accumulator + current.consumed_hours;
                                                  }, 0)
                                                : 0}
                                        </h1>
                                    </Grid>
                                    <Grid item xs={4} md={2} sm={4}>
                                        <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                                            Total Cost
                                        </Typography>
                                        <h1 style={{ textAlign: 'center' }}>{totalCost}</h1>
                                    </Grid>
                                    <Grid item xs={4} md={2} sm={4}>
                                        <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                                            Total Week
                                        </Typography>
                                        <h1 style={{ textAlign: 'center' }}>{totalWeeks ?? 0}</h1>
                                    </Grid>
                                    <Grid item xs={4} md={2} sm={4}>
                                        <Typography variant="h3" component="h2" style={{ textAlign: 'center', color: 'blue' }}>
                                            Upsell
                                        </Typography>
                                        <h1 style={{ textAlign: 'center', color: 'blue' }}>{Math.round(upsel)}</h1>
                                    </Grid>
                                    <Grid item xs={4} md={2.5} sm={4}></Grid>
                                </Grid>
                            </Grid>
                            {/* // ================================|| Display additional hours Detail||================================ // */}

                            {/* // ================================||  additional hours Listing||================================ // */}
                            <Grid item xs={12} md={12} sm={12} sx={{ mb: 3 }}>
                                <AdditionalHoursListing
                                    apiData={projectHoursData}
                                    refreshData={getProjectHoursData}
                                    project_consumed_hours={SaleData?.project_consumed_hours}
                                />
                            </Grid>
                            {/* // ================================||  additional hours Listing||================================ // */}

                            <Grid item xs={3} md={4} sm={3}>
                                <AutoCompleteField
                                    errors={!!errors?.department_id}
                                    fieldName="department_id"
                                    autoComplete="off"
                                    label="Department Name *"
                                    control={control}
                                    setValue={setValue}
                                    options={departmentCategory}
                                    returnObject={false}
                                    isLoading={true}
                                    optionKey="id"
                                    optionValue="name"
                                    helperText={errors?.department_id && errors?.department_id?.message}
                                />
                            </Grid>
                            <Grid item xs={3} md={4} sm={3}>
                                <AutoCompleteField
                                    errors={!!errors?.category_id}
                                    fieldName="category_id"
                                    autoComplete="off"
                                    label="Category *"
                                    control={control}
                                    setValue={setValue}
                                    options={hoursCategory}
                                    returnObject={false}
                                    isLoading={true}
                                    optionKey="id"
                                    optionValue="name"
                                    helperText={errors?.category_id && errors?.category_id?.message}
                                />
                            </Grid>
                            <Grid item xs={3} md={4} sm={3}>
                                <TextFieldControlled
                                    errors={!!errors?.hours}
                                    fullWidth={true}
                                    fieldName="hours"
                                    type="text"
                                    autoComplete="off"
                                    label="Hours*"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.hours && errors?.hours?.message}
                                />
                            </Grid>

                            <Grid item xs={6} md={12} sm={6}>
                                <Grid sx={{ mt: 2 }} container direction="row" justifyContent="flex-end" alignItems="center">
                                    <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                        <Stack direction="row">
                                            <AnimateButton>
                                                <Button variant="contained" sx={{ m: 1 }} type={'submit'} onClick={handleSubmit(onSubmit)}>
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
                {/* // ================================|| milestone Details||================================ // */}
            </form>
        </>
    );
}

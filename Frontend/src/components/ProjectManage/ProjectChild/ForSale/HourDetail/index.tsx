/* eslint-disable no-useless-rename */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
// ================================|| Core Import  ||================================ //

import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Grid, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getDepartmentCost } from 'services/projectService';
import SubCard from 'ui-component/cards/SubCard';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { AutoCompleteField, TextFieldControlled } from 'ui-component/formsField/FormFields';
import HoursListing from '../HoursListing';
import { HoursDetailsValidation } from './Validation';
import { useDispatch } from 'react-redux';
import moment from 'moment';

// ================================|| Sales Component ||================================ //

export function HourDetailComponent(props: any) {
    const dispatch = useDispatch();
    const { departmentCategory, hoursCategory, projectHours, setProjectHours, SaleData, refreshData, projectId } = props;

    const [totalHours, setTotalHours] = useState<any>([]);
    const [totalCost, setTotalCost] = useState({
        total: 0,
        additionalCost: 0,
        upsellCost: 0
    });
    const [totalWeeks, setTotalWeeks] = useState(0);
    const [projectHorusListing, setProjectHoursListing] = useState<any>([]);
    const [cost, setCost] = useState(40);

    const log: any = window.localStorage.getItem('user');
    const user = JSON.parse(log);

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
        resolver: yupResolver(HoursDetailsValidation)
    });

    const onSubmit = (data: any) => {
        const currentDate = moment();

        const department_name = departmentCategory?.find((x: any) => x.id == data.department_id);
        const project_catgory_hours_name = hoursCategory?.find((x: any) => x.id == data.category_id);

        const obj = {
            modified_date: currentDate.format('YYYY-MM-DD'),
            department_id: department_name,
            project_catgory_hours_id: project_catgory_hours_name,
            no_of_resources: +data.number_of_resource,
            hours: +data.hours,
            role_id: user?.role_id,
            cost: +data.hours * cost,
            is_add: true
        };

        const clone: any = JSON.parse(JSON.stringify(projectHorusListing));

        clone.push(obj);
        setProjectHours(clone);
        setProjectHoursListing(clone);

        // reset();
    };

    const getDepartmentWiseCost = (departmentId: string) => {
        getDepartmentCost(departmentId)
            .then((res: any) => {
                setCost(res?.department_wise_cost);
            })
            .catch((error) => {
                console.log('error', error);
            });
    };

    const onDepartmentChange = (e: any) => {
        getDepartmentWiseCost(e?.id);
    };

    useEffect(() => {
        let Hours = 0;
        let temp = projectHorusListing?.map((item: any, index: any) => {
            if (item?.project_category_hours?.name == 'Sale Hours' || item?.project_catgory_hours_id?.name == 'Sale Hours') {
                Hours += item?.hours;
            }
        });

        setTotalHours(Hours);

        setTotalWeeks(Math.floor(Hours / 7));

        let Cost = 0;
        let AdditionalCost = 0;
        let UpsellCost = 0;
        let temp2 = projectHorusListing?.map((item: any, index: any) => {
            if (item?.project_category_hours?.name == 'Sale Hours' || item?.project_catgory_hours_id?.name == 'Sale Hours') {
                Cost += +item.hours * cost;
            } else if (item?.project_category_hours?.name == 'Additional' || item?.project_catgory_hours_id?.name == 'Additional') {
                AdditionalCost += +item.hours * cost;
            } else if (item?.project_category_hours?.name == 'Upsell' || item?.project_catgory_hours_id?.name == 'Upsell') {
                UpsellCost += +item.hours * cost;
            }
        });

        setTotalCost({
            total: Cost,
            additionalCost: AdditionalCost,
            upsellCost: UpsellCost
        });
    }, [projectHorusListing]);

    useEffect(() => {
        if (projectHours) {
            setProjectHoursListing(projectHours);
        }
    }, [projectHours]);

    let UpsellHour = 0;
    let additionalHour = 0;

    const test = projectHorusListing?.filter((x: any) => x.project_catgory_hours_id?.name == 'Additional');
    let additionalHours = test?.map((item: any, index: any) => {
        additionalHour += item?.hours;
    });

    const test1 = projectHorusListing?.filter((x: any) => x.project_catgory_hours_id?.name == 'Upsell');
    let UpsellHours = test1?.map((item: any, index: any) => {
        return (UpsellHour += item?.hours);
    });

    return (
        <>
            <form>
                {/* // ================================|| Hours Details||================================ // */}
                <Grid item xs={12} md={12} sm={12} direction="row" justifyContent="center" alignItems="center">
                    <SubCard title="Hours Details" sx={{ mb: 3 }}>
                        <Grid container spacing={2}>
                            {/* // ================================|| Display Hour Detail||================================ // */}
                            <Grid item xs={12} md={12} sm={12} sx={{ mt: 2, mb: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={2} md={1.5} sm={2}></Grid>
                                    <Grid item xs={4} md={2} sm={4}>
                                        <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                                            Total Hours
                                        </Typography>
                                        <h2 style={{ textAlign: 'center' }}>
                                            <span>{totalHours}</span>
                                            <span style={{ color: 'red', fontSize: '15px' }}>{` +${additionalHour} `}</span>
                                            <span style={{ color: 'blue', fontSize: '15px' }}>{` +${UpsellHour} `}</span>
                                        </h2>
                                    </Grid>
                                    <Grid item xs={4} md={2} sm={4}>
                                        <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                                            Consumed Hours
                                        </Typography>
                                        <h2 style={{ textAlign: 'center' }}>
                                            <span>
                                                {SaleData && SaleData.project_consumed_hours?.length > 0
                                                    ? SaleData.project_consumed_hours.reduce((accumulator: any, current: any) => {
                                                          return accumulator + current.consumed_hours;
                                                      }, 0)
                                                    : 0}
                                            </span>
                                        </h2>
                                    </Grid>
                                    <Grid item xs={4} md={2} sm={4}>
                                        <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                                            Total Cost
                                        </Typography>
                                        <h2 style={{ textAlign: 'center' }}>
                                            <span>{totalCost.total}</span>
                                            <span style={{ color: 'red', fontSize: '15px' }}>{` +${totalCost.additionalCost} `}</span>
                                            <span style={{ color: 'blue', fontSize: '15px' }}>{` +${totalCost.upsellCost} `}</span>
                                        </h2>
                                    </Grid>
                                    <Grid item xs={4} md={2} sm={4}>
                                        <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                                            Total Week
                                        </Typography>
                                        <h1 style={{ textAlign: 'center' }}>{SaleData?.no_of_weeks ?? 0}</h1>
                                    </Grid>
                                    <Grid item xs={4} md={3} sm={4}></Grid>
                                </Grid>
                            </Grid>
                            {/* // ================================|| Display Hour Detail||================================ // */}
                            {/* // ================================||  Hour Listing||================================ // */}
                            <Grid item xs={12} md={12} sm={12} sx={{ mb: 3 }}>
                                <HoursListing
                                    projectHorusListing={projectHorusListing}
                                    setProjectHoursListing={setProjectHoursListing}
                                    setProjectHours={setProjectHours}
                                    project_consumed_hours={SaleData.project_consumed_hours}
                                    refreshData={refreshData}
                                    projectId={projectId}
                                />
                            </Grid>

                            {/* // ================================||  Hour Listing||================================ // */}
                            <Grid item xs={3} md={3} sm={3}>
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
                                    iProps={{
                                        onChange: onDepartmentChange
                                    }}
                                    helperText={errors?.department_id && errors?.department_id?.message}
                                />
                            </Grid>
                            <Grid item xs={3} md={3} sm={3}>
                                <AutoCompleteField
                                    errors={!!errors?.category_id}
                                    fieldName="category_id"
                                    autoComplete="off"
                                    label="Category *"
                                    control={control}
                                    setValue={setValue}
                                    // iProps={{
                                    //     onChange: onHoursCategory
                                    // }}
                                    options={hoursCategory ?? []}
                                    returnObject={false}
                                    isLoading={true}
                                    optionKey="id"
                                    optionValue="name"
                                    helperText={errors?.category_id && errors?.category_id?.message}
                                />
                            </Grid>
                            <Grid item xs={3} md={2.5} sm={3}>
                                <TextFieldControlled
                                    errors={!!errors?.number_of_resource}
                                    fullWidth={true}
                                    fieldName="number_of_resource"
                                    type="text"
                                    autoComplete="off"
                                    label="No of resources *"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.number_of_resource && errors?.number_of_resource?.message}
                                />
                            </Grid>
                            <Grid item xs={3} md={2.5} sm={3}>
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
                            {/* <Grid item xs={3} md={1} sm={3}>
                                <TextFieldControlled
                                    errors={!!errors?.cost}
                                    fullWidth={true}
                                    fieldName="cost"
                                    type="text"
                                    autoComplete="off"
                                    label="Cost*"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.cost && errors?.cost?.message}
                                />
                            </Grid> */}

                            <Grid item xs={6} md={12} sm={6}>
                                <Grid sx={{ mt: 2 }} container direction="row" justifyContent="flex-end" alignItems="center">
                                    <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                        <Stack direction="row">
                                            <AnimateButton>
                                                <Button
                                                    variant="contained"
                                                    sx={{ m: 1 }}
                                                    name={'hourDetail'}
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
                {/* // ================================|| Hours Details||================================ // */}
            </form>
        </>
    );
}

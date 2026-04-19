/* eslint-disable no-useless-rename */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
// ================================|| Core Import  ||================================ //

import { yupResolver } from '@hookform/resolvers/yup';
import { Grid, Typography } from '@mui/material';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createProjects } from 'services/projectService';
import SubCard from 'ui-component/cards/SubCard';
import { TextFieldControlled } from 'ui-component/formsField/FormFields';
import { DiscountPriceValidation } from './Validation';

// ================================|| Sales Component ||================================ //

export const DiscountPriceComponent = forwardRef((props: any, ref) => {
    const [totalCost, setTotalCost] = useState<any>();
    const [discountedPrice, setDiscountedPrice] = useState(0);
    const [cost, setCost] = useState(40);
    const [profit, setProfit] = useState(false);
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
        resolver: yupResolver(DiscountPriceValidation)
    });

    // create onsubmit data
    const createonSubmit = (data: any) => {
        createProjects(data)
            .then((res: any) => {
                toast.success('Record inserted Successfully');
                // navigate("/dashboard/admin/listing" )
            })
            .catch((err) => {
                toast.error(err);
            });
    };

    const onSubmit = (data: any) => {
        return data;
    };

    const handleDiscountedCost = (e: any) => {
        setDiscountedPrice(e.target.value);

        const loss = calculatePercentageDiscount(totalCost, e.target.value);

        debugger;

        if (+loss < 0) {
            setProfit(true);
        } else {
            setProfit(false);
        }
    };

    // Function to calculate the percentage discount
    function calculatePercentageDiscount(actualCost: number, discountedFinalCost: number) {
        if (actualCost !== 0 && discountedFinalCost !== 0) {
            const percentageDiscount = ((actualCost - discountedFinalCost) / actualCost) * 100;

            return percentageDiscount?.toFixed(2);
        } else {
            return 0;
        }
    }

    useImperativeHandle(ref, () => ({
        priceOnSubmit: () => onSubmit(getValues())
    }));

    useEffect(() => {
        let Cost = 0;
        let temp1 = props?.projectHours?.map((item: any, index: any) => (Cost += +item.hours * cost));

        setTotalCost(Cost);
    }, [props?.projectHours]);

    useEffect(() => {
        if (props?.apiData) {
            setValue('discount_cost', props?.apiData?.dicsounted_cost);
            setValue('reason', props?.apiData?.reason);
            setDiscountedPrice(props?.apiData?.dicsounted_cost);
        }

        if (!props?.projectId) {
            reset();
        }
    }, [props?.apiData]);

    useEffect(() => {
        if(totalCost > 0){
            let price = {
                target: {
                    value: props?.apiData?.dicsounted_cost
                }
            };
    
            handleDiscountedCost(price);
        }
    }, [totalCost]);

    return (
        <>
            <Grid item xs={12} md={12} sm={12} direction="row" justifyContent="center" alignItems="center">
                <SubCard title="Total Price" sx={{ mb: 3 }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* // ================================|| Display Costing Discount Precentage||================================ // */}
                        <Grid item xs={12} md={12} sm={12} sx={{ mt: 2, mb: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={4} md={4} sm={4}>
                                    <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                                        Actual Costing
                                    </Typography>
                                    <h1 style={{ textAlign: 'center' }}>{totalCost}</h1>
                                </Grid>
                                <Grid item xs={4} md={4} sm={4}>
                                    <Typography variant="h3" component="h2" style={{ textAlign: 'center', color: 'rgb(66, 186, 150)' }}>
                                        Final Cost
                                    </Typography>
                                    <h1 style={{ textAlign: 'center', color: 'rgb(66, 186, 150)' }}>{discountedPrice ?? 0}</h1>
                                </Grid>

                                <Grid item xs={4} md={4} sm={4}>
                                    <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                                        {profit ? 'Profit percentage' : 'Discounted Percentage'}
                                    </Typography>
                                    <h1 style={{ textAlign: 'center' }}>
                                        {calculatePercentageDiscount(totalCost, discountedPrice) == 'NaN'
                                            ? 0
                                            : +calculatePercentageDiscount(totalCost, discountedPrice) < 0
                                            ? +calculatePercentageDiscount(totalCost, discountedPrice) * -1
                                            : calculatePercentageDiscount(totalCost, discountedPrice)}
                                        %{' '}
                                    </h1>
                                </Grid>
                                <Grid item xs={4} md={2} sm={4}></Grid>
                            </Grid>
                        </Grid>
                        {/* // ================================|| Display Costing Discount Precentage||================================ // */}
                        <Grid item xs={6} md={12} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.discount_cost}
                                fullWidth={true}
                                fieldName="discount_cost"
                                type="text"
                                autoComplete="off"
                                label="Final Cost *"
                                control={control}
                                iProps={{
                                    onChange: handleDiscountedCost
                                }}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.discount_cost && errors?.discount_cost?.message}
                            />
                        </Grid>
                        <Grid item xs={6} md={12} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.reason}
                                fullWidth={true}
                                fieldName="reason"
                                type="text"
                                autoComplete="off"
                                label="Reason *"
                                control={control}
                                valueGot={''}
                                multiline
                                rows={2}
                                setValue={setValue}
                                helperText={errors?.reason && errors?.reason?.message}
                            />
                        </Grid>
                    </form>
                </SubCard>
            </Grid>
        </>
    );
});

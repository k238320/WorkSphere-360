/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/*eslint-Disable */
/**
 *
 * ProjectManage
 *
 */

// material-ui
import { Button, Grid, Stack } from '@mui/material';

// assets
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import { MuiDatePicker, SwitchFieldDefault, TextFieldControlled } from 'ui-component/formsField/FormFields';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import moment from 'moment';
import { createHoliday } from 'services/holidayService';

const validation = yup.object().shape({
    title: yup.string().required('Please enter title').nullable()
    // pmo_documents: yup.string().required('Please select date').nullable()
});

export function HolidayManage(props: any) {
    const dispatch = useDispatch();

    const defautlFormValues = {
        // title: ''
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
        // Validations=================>
        defaultValues: defautlFormValues,
        resolver: yupResolver(validation)
    });

    // create onsubmit data
    const createonSubmit = (data: any) => {
        let dataDate = new Date(data?.date);
        const n = dataDate.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }).slice(0, -3);
        data.date = n;
        dispatch(spinLoaderShow(true));

        createHoliday(data)
            .then((res: any) => {
                toast.success('Record inserted Successfully');
                dispatch(spinLoaderShow(false));
                // navigate('/pmo-document/listing');
            })
            .catch((err: any) => {
                dispatch(spinLoaderShow(false));
                toast.error(err);
            });
    };
    const onSubmit = async (data: any) => {
        data.date = await moment(data.date, 'MM/DD/YYYY').toDate();
        createonSubmit(data);
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <SubCard>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.title}
                                fullWidth={true}
                                fieldName="title"
                                type="text"
                                autoComplete="off"
                                label="Title *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.title && errors?.title?.message}
                            />
                        </Grid>
                        <Grid item xs={6} md={6} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <MuiDatePicker
                                    label={'Date *'}
                                    name={`date`}
                                    control={control}
                                    margin="16px 0px 0px 0px"
                                    // error={}
                                    error={!!errors?.date}
                                    helperText={errors?.date && errors?.date?.message}
                                />
                            </LocalizationProvider>
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

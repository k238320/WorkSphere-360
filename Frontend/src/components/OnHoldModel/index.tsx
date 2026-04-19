import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import DatePickerComponent from 'components/ProjectManage/ProjectChild/ForFinance/DatePicker';
import { Button } from '@mui/material';
import Switch from '@mui/material/Switch';
import { useForm } from 'react-hook-form';
import { updateOnHold } from 'services/projectService';
import moment from 'moment';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    datestart: Yup.date()
        .when('permanentlyhold', {
            is: true,
            then: Yup.date().nullable(),
            otherwise: Yup.date().required('Start Date is required when End Date is provided').nullable()
        })
        .nullable(),
    dateend: Yup.date()
        .when('permanentlyhold', {
            is: true,
            then: Yup.date().nullable(),
            otherwise: Yup.date()
                .required('End Date is required when Start Date is provided')
                .min(Yup.ref('datestart'), 'End Date must be equal or after Start Date')
                .nullable()
        })
        .nullable(),
    permanentlyhold: Yup.bool(),
    reason: Yup.string().required('Reason is required.')
});

const initalValue = {
    datestart: null,
    dateend: null,
    permanentlyhold: false,
    reason: '',
    status: true
};

const OnHoldModel = (dataid: any, props: any) => {
    const [startDate, setStartNewDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isLoading, setIsloading] = useState(false);
    const { setOpenModel } = props;

    const {
        register,
        setValue,
        handleSubmit,
        getValues,
        formState: { errors }
    } = useForm({ resolver: yupResolver(validationSchema), mode: 'onChange', defaultValues: initalValue });

    // console.log(setOpenModel, 'setOpenModel');
    // console.log(handleClose, 'handleClose');
    const onSubmit = (data: any) => {
        const mileStoneObj = data;

        if (mileStoneObj?.permanentlyhold) {
            setIsloading(true);
            mileStoneObj.datestart = 'N/A';
            mileStoneObj.dateend = 'N/A';

            const newObject = {
                onhold: [mileStoneObj]
            };
            updateOnHold(dataid?.data?.data?.id, newObject)
                .then(() => {
                    toast.success(' Successfully!');
                    setIsloading(false);
                    dataid?.closingModal();
                    dataid?.setPropsChanged?.refreshData();
                })
                .catch((err) => {
                    toast.error(err);
                });
        } else {
            setIsloading(true);
            mileStoneObj.datestart = moment(mileStoneObj.datestart)?.format('YYYY-MM-DD');
            mileStoneObj.dateend = moment(mileStoneObj.dateend)?.format('YYYY-MM-DD');

            const newObject = {
                onhold: [mileStoneObj]
            };
            updateOnHold(dataid?.data?.data?.id, newObject)
                .then(() => {
                    toast.success(' Successfully!');
                    setIsloading(false);
                    dataid?.closingModal();
                })
                .catch((err) => {
                    toast.error(err);
                });
        }
        // setIsloading(false);
    };

    const handleStartDate = (e: any) => {
        setStartNewDate(e);
        setValue('datestart', e);
    };
    const handleEndDate = (e: any) => {
        setEndDate(e);
        setValue('dateend', e);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <h3 style={{ color: '#212121', fontWeight: 700, lineHeight: '20px' }}>On-Hold Detail</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                        <div>
                            <p>Start Date</p>
                            <div
                                style={{
                                    backgroundColor: '#fafafa',
                                    padding: '7px 16px',
                                    borderRadius: '12px',
                                    marginBottom: '25px',
                                    flex: 1
                                }}
                            >
                                <DatePickerComponent date={startDate} onChange={handleStartDate} disabled={getValues()?.permanentlyhold} />
                                {/* <input {...register('datestart')} hidden /> */}
                                <input {...register('datestart')} hidden />
                            </div>
                            <p style={{ color: 'red' }}>{errors?.datestart && errors?.datestart?.message?.toString()}</p>
                        </div>
                        <div>
                            {' '}
                            <p>End Date</p>
                            <div
                                style={{
                                    backgroundColor: '#fafafa',
                                    padding: '7px 16px',
                                    borderRadius: '12px',
                                    marginBottom: '25px',
                                    flex: 1
                                }}
                            >
                                <DatePickerComponent date={endDate} onChange={handleEndDate} disabled={getValues()?.permanentlyhold} />
                                {/* <input
                                    {...register('dateend')}
                                    hidden
                                    validationSchema={Yup.date()
                                        .nullable()
                                        .when('datestart', (datestart, schema) => {
                                            return datestart ? schema.min(datestart, 'End Date must be equal or after Start Date') : schema;
                                        })}
                                /> */}
                                <input {...register('dateend')} hidden />
                            </div>
                            {/* <p style={{ color: 'red' }}>{errors?.dateend && errors?.dateend?.message?.toString()}</p> */}
                            <p style={{ color: 'red' }}>
                                {errors?.dateend &&
                                    (errors?.dateend?.message?.toString() || 'End Date must be greater than or equal to Start Date')}
                            </p>
                        </div>
                    </div>

                    <div
                        style={{
                            padding: '7px 16px',
                            borderRadius: '12px',
                            marginBottom: '25px',
                            flex: 1
                        }}
                    >
                        {/* <Switch
                            {...register('permanentlyhold', { required: 'permanently hold required' })}
                            inputRef={(el) => el && register('permanentlyhold', { required: 'permanently hold required' })}
                        /> */}
                        <Switch
                            {...register('permanentlyhold')}
                            name="permanentlyhold"
                            inputRef={(el) => el && register('permanentlyhold')}
                        />
                        Permanently hold*
                    </div>
                    <p style={{ color: 'red' }}>{errors?.permanentlyhold && errors?.permanentlyhold?.message?.toString()}</p>
                </div>

                <TextField
                    fullWidth
                    id="outlined-multiline-flexible"
                    label="Reason*"
                    multiline
                    rows={3}
                    defaultValue=""
                    sx={{ borderRadius: '12px', marginBottom: '27px' }}
                    {...register('reason')}
                />
                <p style={{ color: 'red' }}>{errors?.reason && errors?.reason?.message?.toString()}</p>

                <div style={{ textAlign: 'right' }}>
                    <Button variant="contained" type="button" sx={{ width: '64px', height: '36.5px' }} onClick={dataid?.closingModal}>
                        Cancel
                    </Button>{' '}
                    <Button variant="contained" type="submit" disabled={isLoading} sx={{ width: '64px', height: '36.5px' }}>
                        {isLoading ? <CircularProgress sx={{ color: '#fff' }} size={14} /> : 'Save'}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default OnHoldModel;

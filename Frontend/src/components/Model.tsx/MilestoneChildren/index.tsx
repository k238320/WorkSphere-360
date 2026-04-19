import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import { TextField, Button } from '@mui/material';
import DatePickerComponent from 'components/ProjectManage/ProjectChild/ForFinance/DatePicker';
import { updateTargetDate } from 'services/projectService';
import { toast } from 'react-toastify';
import moment from 'moment';
import CircularProgress from '@mui/material/CircularProgress';

interface FormInputs {
    date: string;
    text: string;
}
interface MileStoneModalProps {
    date: any;
    closingModal: () => void;
    setPropsChanged: () => void;
}

const MileStoneModal: React.FC<MileStoneModalProps> = (date: any) => {
    const [newDate, setNewDate] = useState(date?.date?.date);
    const [isLoading, setIsloading] = useState(false);

    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors }
    } = useForm<FormInputs>();

    const onSubmit: SubmitHandler<FormInputs> = (data) => {
        setIsloading(true);
        const mileStoneObj = {
            ...data,
            ...date?.date
        };
        delete mileStoneObj.id;
        mileStoneObj.date = moment(data?.date)?.format('YYYY-MM-DD');
        const newObject = {
            mileStones: [mileStoneObj],
            targeted_month: mileStoneObj?.date
        };
        console.log(mileStoneObj, 'new obj');
        updateTargetDate(date?.date?.id, newObject)
            .then(() => {
                toast.success('Successfully!');
                setIsloading(false);
                date?.closingModal();
                date?.setPropsChanged?.refreshData();

                // date?.setPropsChanged((prevPropsChanged: any) => !prevPropsChanged);
                // window?.location?.reload();
            })
            .catch((err) => {
                toast.error(err);
            });
    };

    useEffect(() => {
        setValue('date', newDate);
    }, [newDate]);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <h3 style={{ color: '#212121', fontWeight: 700, lineHeight: '20px' }}>Milestone</h3>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px',
                        marginBottom: '25px'
                    }}
                >
                    <div style={{ backgroundColor: '#fafafa', padding: '7px 16px', borderRadius: '12px', flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '10px', color: '#616161', marginBottom: '2px' }}>Milestone Phase</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#616161', fontWeight: 500 }}>{date?.date?.milestonephase}</p>
                    </div>
                    <input hidden />
                    <div
                        style={{
                            flex: 1
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: '#fafafa',
                                padding: '7px 16px',
                                borderRadius: '12px',
                                marginBottom: '25px',
                                flex: 1,
                                border: '1px solid #C1C1C1'
                            }}
                        >
                            <DatePickerComponent date={newDate} disabled={false} onChange={setNewDate} />
                        </div>
                        <input {...register('date', { required: 'Date is required' })} hidden />
                        <p style={{ color: 'red' }}>{errors?.date && errors?.date?.message}</p>
                    </div>
                </div>

                <TextField
                    fullWidth
                    id="outlined-multiline-flexible"
                    label="Reason*"
                    multiline
                    rows={3}
                    defaultValue=""
                    sx={{ borderRadius: '12px', marginBottom: '27px' }}
                    {...register('text', { required: 'Reason is required' })}
                />
                {errors.text && <span style={{ color: 'red' }}>{errors.text.message}</span>}

                <div style={{ textAlign: 'right' }}>
                    <Button variant="contained" type="button" sx={{ width: '64px', height: '36.5px' }} onClick={date?.closingModal}>
                        Cancel
                    </Button>{' '}
                    <Button type="submit" variant="contained" disabled={isLoading} sx={{ width: '64px', height: '36.5px' }}>
                        {/* Save */}
                        {isLoading ? <CircularProgress sx={{ color: '#fff' }} size={14} /> : 'Save'}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default MileStoneModal;

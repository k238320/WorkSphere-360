import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { approveLeave } from 'services/attendance';
import { useNavigate } from 'react-router-dom';
import { width } from '@mui/system';
import GenericTextarea from 'components/uiComopnents/GenericTextarea/GenericTextarea ';

const validationSchema = Yup.object().shape({
    reason: Yup.string().required()
});

const initalValue = {
    reason: ''
};

const ApprovalModal = (props: any) => {
    const [isReasonEnabled, setIsReasonEnabled] = useState(false);
    const [isLoading, setIsloading] = useState(false);
    const { setOpenModel, data, closingModal, onSearch } = props;
    const [addValidation, setAddValidation] = useState<any>(undefined);

    const {
        register,
        setValue,
        handleSubmit,
        getValues,
        control,
        watch,
        setResolver,
        formState: { errors }
    }: any = useForm({ resolver: addValidation, mode: 'onChange', defaultValues: initalValue });

    const navigate = useNavigate();

    const onSubmit = (formData: any) => {
        const newObject = {
            start_date: data.start_date,
            end_date: data.end_date,
            is_halfday: data.is_halfday,
            work_from_home: data.work_from_home,
            leaveTypeId: data.leaveTypeId,
            approved: isReasonEnabled ? false : true,
            reason: formData.reason,
            employement_code: data.employement_code,
            applicationTypeId: data.applicationTypeId,
            employee: { id: data.user.id, resource_id: data.user.resource_id }
        };

        approveLeave(newObject)
            .then(() => {
                toast.success(' Successfully!');
                setIsloading(false);
                closingModal();
                onSearch();
                navigate('/leave/listing');
            })
            .catch((err) => {
                toast.error(err);
            });
        setIsloading(false);
    };

    const watchedValues = watch('reason');

    useEffect(() => {
        console.log('Watched Values: resigned', watchedValues);
        if (isReasonEnabled) {
            // if (watchedValues.length > 0) {
            setAddValidation(() => yupResolver(validationSchema));
            // }
        } else {
            setAddValidation(() => undefined);
        }
    }, [watchedValues, setResolver, isReasonEnabled]);

    return (
        // <form onSubmit={handleSubmit(onSubmit)}>
        //     <div>
        //         <h3 style={{ color: '#212121', fontWeight: 700 }}>Approval Required</h3>
        //         <div style={{ display: 'flex', alignItems: 'center' }}>
        //             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
        //                 <div>
        //                     <p style={{ fontWeight: 500 }}>Start Date</p>
        //                     <p style={{}}>{moment(data.start_date).format('MMM Do YYYY')}</p>
        //                 </div>
        //                 <div>
        //                     {' '}
        //                     <p style={{ fontWeight: 500 }}>End Date</p>
        //                     <p style={{}}>{moment(data.end_date).format('MMM Do YYYY')}</p>
        //                 </div>
        //             </div>
        //         </div>

        //         {isReasonEnabled && (
        //             <TextField
        //                 fullWidth
        //                 id="outlined-multiline-flexible"
        //                 label="Reason*"
        //                 multiline
        //                 rows={3}
        //                 defaultValue=""
        //                 sx={{ borderRadius: '12px', marginBottom: '27px' }}
        //                 {...register('reason')}
        //             />
        //         )}
        //         <p style={{ color: 'red' }}>{errors?.reason && errors?.reason?.message?.toString()}</p>

        //         <div
        //             style={{
        //                 borderRadius: '12px',
        //                 marginBottom: '25px',
        //                 flex: 1
        //             }}
        //         >
        //             <Button
        //                 variant="contained"
        //                 type="submit"
        //                 sx={{ m: 3 }}
        //                 className={'red'}
        //                 onClick={() => {
        //                     setIsReasonEnabled(true);
        //                 }}
        //             >
        //                 Reject
        //             </Button>
        //             <Button variant="contained" type="submit" sx={{ m: 3 }} className={'red'} onClick={handleSubmit(onSubmit)}>
        //                 Accept
        //             </Button>
        //         </div>
        //     </div>
        // </form>
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <h3 style={{ color: '#212121', fontWeight: 700, marginBottom: '20px' }}>Approval Required</h3>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px' }}>
                        <div>
                            <p style={{ fontWeight: 500 }}>Start Date</p>
                            <p style={{}}>{moment(data.start_date).format('MMM Do YYYY')}</p>
                        </div>
                        <div>
                            <p style={{ fontWeight: 500 }}>End Date</p>
                            <p style={{}}>{moment(data.end_date).format('MMM Do YYYY')}</p>
                        </div>
                    </div>
                </div>

                {isReasonEnabled && (
                    // <TextField
                    //     fullWidth
                    //     id="outlined-multiline-flexible"
                    //     label="Reason*"
                    //     multiline
                    //     rows={3}
                    //     defaultValue=""
                    //     sx={{ borderRadius: '12px', marginBottom: '20px' }}
                    //     {...register('reason')}
                    // />
                    <GenericTextarea
                        fieldName="reason"
                        placeholder="Reason*"
                        setValue={setValue}
                        control={control}
                        rows="5"
                        errors={!!errors?.reason}
                        helperText={errors?.reason?.message || ''}
                        // sx={{ borderRadius: '12px', marginBottom: '20px' }}
                        className="testing"
                    />
                )}
                {/* <p style={{ color: 'red', marginBottom: '20px' }}>{errors?.reason && errors?.reason?.message?.toString()}</p> */}

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '20px',
                        marginTop: isReasonEnabled ? '20px' : '0'
                    }}
                >
                    <Button
                        variant="contained"
                        // type="submit"
                        // type="button"
                        // type=`${watchedValues.length > 0 ? 'submit' : 'button'}`
                        // type={`${watchedValues.length > 0 ? 'submit' : 'button'}`}
                        type={isReasonEnabled ? (watchedValues.length > 0 ? 'submit' : 'button') : 'button'}
                        sx={{ flex: 1, marginRight: '10px' }}
                        className={'red'}
                        onClick={() => {
                            setIsReasonEnabled(true);
                        }}
                        // onSubmit={handleSubmit(onSubmit)}
                    >
                        Reject
                    </Button>
                    <Button
                        variant="contained"
                        type="submit"
                        sx={{ flex: 1 }}
                        className={'green'}

                        // onSubmit={handleSubmit(onSubmit)}
                    >
                        Accept
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default ApprovalModal;

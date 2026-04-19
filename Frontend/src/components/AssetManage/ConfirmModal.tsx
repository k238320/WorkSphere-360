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

const ConfirmModal = ({ handleClose, id, handleApproved }: any) => {
    const [isLoading, setIsloading] = useState(false);

    const handleConfirm = () => {
        setIsloading(true);
        handleApproved(id);
    };
    useEffect(() => {
        return () => {
            setIsloading(false);
        };
    }, []);

    return (
        <div>
            <h3 style={{ color: '#212121', fontWeight: 700, lineHeight: '24px', textAlign: 'center' }}>
                Are you sure you want to confirm?
            </h3>

            <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button
                    variant="outlined"
                    type="button"
                    sx={{ width: '80px', height: '40px', marginRight: '8px' }}
                    onClick={() => handleClose()}
                >
                    Cancel
                </Button>{' '}
                {/* () => handleApproved(id)} */}
                <Button
                    variant="contained"
                    type="button"
                    disabled={isLoading}
                    sx={{ width: '80px', height: '40px' }}
                    // onClick={() => handleApproved(id)}
                    onClick={handleConfirm}
                    // onClick={() => console.log(handleApproved, id)}
                >
                    {isLoading ? <CircularProgress sx={{ color: '#fff' }} size={20} /> : 'Confirm'}
                </Button>
            </div>
        </div>
    );
};

export default ConfirmModal;

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Switch, FormControlLabel } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { toast } from 'react-toastify';
import { toggleHrPolicyStatus } from 'services/hrPolicyService';
import { useEffect } from 'react';

interface EditStatusModalProps {
    open: boolean;
    onClose: () => void;
    data: any;
    onUpdate: () => void;
}

export const EditStatusModal = ({ open, onClose, data, onUpdate }: EditStatusModalProps) => {
    const dispatch = useDispatch();
    const { control, handleSubmit, reset, watch } = useForm({
        defaultValues: {
            name: data?.name,
            is_active: !!data?.is_active
        }
    });

    const watchStatus = watch('is_active');

    useEffect(() => {
        reset({ name: data?.name, is_active: !!data?.is_active });
    }, [data]);

    const onSubmit = async (formData: any) => {
        try {
            dispatch(spinLoaderShow(true));
            await toggleHrPolicyStatus(data.id, formData.is_active);
            toast.success('Policy updated successfully');
            onUpdate();
            onClose();
        } catch {
            toast.error('Failed to update policy');
        } finally {
            dispatch(spinLoaderShow(false));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit HR Policy</DialogTitle>
            <DialogContent>
                <Controller
                    name="name"
                    control={control}
                    render={({ field }) => <TextField {...field} label="Policy Name" fullWidth margin="normal" />}
                />
                <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={<Switch {...field} checked={watchStatus} />}
                            label={watchStatus ? 'Active' : 'Inactive'}
                        />
                    )}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit(onSubmit)}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

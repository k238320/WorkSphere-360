// EditResourceModal.tsx
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { TableData } from './types';

interface EditResourceModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: TableData) => void;
    rowData: TableData | null;
}

export const EditResourceModal = ({ open, onClose, onSave, rowData }: EditResourceModalProps) => {
    const [formData, setFormData] = useState<TableData | null>(null);

    useEffect(() => {
        setFormData(rowData);
    }, [rowData]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        if (formData) {
            onSave(formData);
            // onClose();
        }
    };

    if (!formData) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit Resource Info</DialogTitle>
            <DialogContent dividers>
                <TextField
                    label="Task Hours"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={formData.task_hours}
                    onChange={(e) => handleChange('task_hours', parseFloat(e.target.value))}
                />
                <TextField
                    label="Start Date"
                    type="date"
                    fullWidth
                    margin="normal"
                    value={moment(formData.start_date).format('YYYY-MM-DD')}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="End Date"
                    type="date"
                    fullWidth
                    margin="normal"
                    value={moment(formData.end_date).format('YYYY-MM-DD')}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.is_overtime}
                            onChange={(e) => handleChange('is_overtime', e.target.checked)}
                        />
                    }
                    label="Overtime Task"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

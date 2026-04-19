import { Modal, Typography, TextField, Button, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { updateHourDetail } from 'services/projectService';
import { spinLoaderShow } from 'store/actions/spinLoader';

// Style for the modal
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4
};

interface IModal {
    open: boolean;
    handleClose: () => void;
    refreshData: () => void;
    // handleSave : (data : any) => void;
    rowData: any;
}

// Edit modal component
const EditModal = ({ open, handleClose, rowData, refreshData }: IModal) => {
    const [formData, setFormData] = useState(rowData);

    const dispatch = useDispatch();

    useEffect(() => {
        setFormData(rowData);
    }, [rowData]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        dispatch(spinLoaderShow(true));

        updateHourDetail(formData, formData.id)
            .then((res: any) => {
                toast.success('Hours updated successfully');
                handleClose();
                dispatch(spinLoaderShow(true));
                refreshData();
            })
            .catch(() => {
                console.log('error');
                dispatch(spinLoaderShow(true));
            });
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" component="h2">
                    Edit Hours
                </Typography>
                <TextField
                    label="Department"
                    name="department_id"
                    value={formData.department_id?.name || ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    disabled
                />
                <TextField
                    label="Category"
                    name="project_catgory_hours_id"
                    value={formData.project_catgory_hours_id?.name || ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    disabled
                />
                <TextField
                    label="Number of Resource"
                    name="no_of_resources"
                    value={formData.no_of_resources || ''}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField label="Hours" name="hours" value={formData.hours || ''} onChange={handleChange} fullWidth margin="normal" />
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Save
                </Button>
                <Button variant="contained" color="info" onClick={handleClose} sx={{ marginLeft: 2 }}>
                    Cancel
                </Button>
            </Box>
        </Modal>
    );
};

export default EditModal;

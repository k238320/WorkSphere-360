import { useState } from 'react';
import { Modal, Box, TextField, Button } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4
};

interface iProps {
    open: boolean;
    handleClose: () => void;
    row: any;
    handleUpdate: (id: number, milestonePayment: number) => void;
}

const EditMilestonePaymentModal = ({ open, handleClose, row, handleUpdate }: iProps) => {
    const [milestonePayment, setMilestonePayment] = useState(row?.milestone_payment);

    const handleSubmit = () => {
        handleUpdate(row.id, milestonePayment);
        handleClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="edit-milestone-payment-modal"
            aria-describedby="edit-milestone-payment-modal"
        >
            <Box sx={style}>
                <TextField
                    fullWidth
                    label="Milestone Payment"
                    value={milestonePayment}
                    onChange={(e) => setMilestonePayment(e.target.value)}
                />
                <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2 }}>
                    OK
                </Button>
            </Box>
        </Modal>
    );
};

export default EditMilestonePaymentModal;

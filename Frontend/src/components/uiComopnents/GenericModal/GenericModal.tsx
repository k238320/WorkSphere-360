import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

interface GenericModalProps {
    isOpen: boolean;
    onClose: any;
    children: any;
    width?: number;
}

const GenericModal: React.FC<GenericModalProps> = ({ isOpen, onClose, children, width = 700 }) => {
    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width,
        bgcolor: 'background.paper',
        // border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        zIndex: 9999999,
        outline: 'none !important',
        border: 'none !important',
        borderRadius: '12px'
    };
    return (
        <div>
            <Modal open={isOpen} onClose={onClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={style}>{children}</Box>
            </Modal>
        </div>
    );
};

export default GenericModal;

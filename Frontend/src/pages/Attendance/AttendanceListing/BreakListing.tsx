import React from 'react';
import { Box, Button, Modal, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { calculateTimeFromMinutes } from 'utils/helper';
import moment from 'moment';

interface BreakDetails {
    checkout: string;
    checkin: string;
    duration: number;
}

interface Iprops {
    breaks: BreakDetails[];
    isModalOpen: boolean;
    setIsModalOpen: (bool: boolean) => void;
}

const BreakListing = (props: Iprops) => {
    const handleClose = () => props.setIsModalOpen(false);

    return (
        <Modal open={props.isModalOpen} onClose={handleClose} aria-labelledby="modal-title">
            <Box sx={modalStyle}>
                {/* Modal Header */}
                <Typography id="modal-title" variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 2 }}>
                    Break Details
                </Typography>
                <Typography variant="subtitle1" sx={{ textAlign: 'center', marginBottom: 3, color: 'text.secondary' }}>
                    Date: {moment(props?.breaks?.[0]?.checkin).format('dddd, Do MMMM YYYY')}
                </Typography>

                {/* Table Display */}
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>
                                    <strong>Checkout</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Checkin</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Duration (HH:MM:SS)</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {props?.breaks?.map((breakDetail: BreakDetails, index: number) => (
                                <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                                    <TableCell>{new Date(breakDetail.checkout).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</TableCell>
                                    <TableCell>{new Date(breakDetail.checkin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</TableCell>
                                    <TableCell>{calculateTimeFromMinutes(breakDetail.duration)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Close Button */}
                <Box textAlign="center" marginTop={3}>
                    <Button variant="contained" color="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

// Modal styling
const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: '10px',
};

export default BreakListing;

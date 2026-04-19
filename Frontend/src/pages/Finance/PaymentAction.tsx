import { ReactNode, useState } from 'react';
import { Box, Button, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import FinanceModal from 'components/FInanceModal/FInanceModal';
import useAuth from 'hooks/useAuth';
import 'jspdf-autotable';

export const PaymentAction = ({ projectId, projectRoute, comments, milestone_id }: any) => {
    const [open, setOpen] = useState(false);
    const [openPMStatus, setOpenStatus] = useState(false);

    const navigate = useNavigate();
    const [modalChildren, setModalChildren] = useState<ReactNode | undefined>(undefined);
    const { user } = useAuth();

    const handleClose = () => {
        setOpen(false);
        setModalChildren(() => undefined);
    };

    const handleClosePMStatus = () => {
        setOpenStatus(false);
    };

    const viewMilestone = (id: string) => {
        setModalChildren(() => undefined);
        setOpen(true);
        setModalChildren(() => <FinanceModal milestone_id={id} handleClose={handleClose} />);
    };

    const commonDivStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        cursor: 'pointer',
        backgroundColor: '#ffffff'
    };

    return (
        <div>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        maxHeight: '80vh',
                        bgcolor: '#f9f9f9',
                        borderRadius: '12px',
                        boxShadow: 24,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Modal Header */}
                    <Box
                        sx={{
                            p: 2,
                            color: '#1976d2',
                            fontWeight: 'bold',
                            borderBottom: '1px solid #ddd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Typography id="modal-title" variant="h6" component="h2">
                            Finance Status
                        </Typography>

                        <a href={`/project/create?uuid=${projectId}`} target="_blank">
                            <Button variant="outlined" size="small">
                                Add Comment
                            </Button>
                        </a>
                    </Box>

                    {/* Modal Content */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            p: 2
                        }}
                    >
                        {modalChildren}
                    </Box>

                    {/* Sticky Close Button in Modal Actions */}
                    <Box
                        sx={{
                            position: 'sticky',
                            bottom: 0,
                            bgcolor: '#f9f9f9',
                            borderTop: '1px solid #ddd',
                            p: 2,
                            textAlign: 'right'
                        }}
                    >
                        <Button
                            variant="contained"
                            onClick={handleClose}
                            sx={{
                                backgroundColor: '#1976d2',
                                color: '#fff',
                                textTransform: 'none'
                            }}
                        >
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <>
                <div
                    onClick={() => setOpenStatus(true)}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px',
                        backgroundColor: '#ffffff',
                        zIndex: '99999999 !important'
                    }}
                >
                    <p style={{ color: '#757575', fontSize: '14px', margin: 0, cursor: 'pointer' }}>PM's Status</p>
                </div>
            </>

            <div style={commonDivStyle} onClick={() => viewMilestone(milestone_id)}>
                <p style={{ color: '#757575', fontSize: '14px', margin: 0 }}>Finance Status</p>
            </div>

            {/* Modal for All Comments */}
            <Modal open={openPMStatus} onClose={handleClosePMStatus} aria-labelledby="modal-title" aria-describedby="modal-description">
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        maxHeight: '80vh',
                        bgcolor: '#f9f9f9',
                        borderRadius: '12px',
                        boxShadow: 24,
                        p: 4,
                        overflowY: 'auto'
                    }}
                >
                    <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                        All Status
                    </Typography>

                    <TableContainer component={Paper} sx={{ overflowY: 'auto' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" sx={{ fontWeight: 'bold', color: '#1976d2', width: '12%' }}>
                                        Date
                                    </TableCell>
                                    <TableCell align="left" sx={{ fontWeight: 'bold', width: '15%', color: '#1976d2' }}>
                                        Status
                                    </TableCell>
                                    <TableCell align="left" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                        Comment
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {comments?.map((comment: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell align="left">{moment(comment.created_at).format('Do MMM, YYYY')}</TableCell>
                                        <TableCell align="left">{comment?.project_statuses?.name}</TableCell>
                                        <TableCell align="left" sx={{ fontSize: '13px' }}>
                                            <div
                                                style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                                                dangerouslySetInnerHTML={{ __html: comment.comment }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Button
                        variant="contained"
                        onClick={handleClosePMStatus}
                        sx={{
                            mt: 3,
                            backgroundColor: '#1976d2',
                            color: '#fff',
                            display: 'block',
                            ml: 'auto',
                            textTransform: 'none'
                        }}
                    >
                        Close
                    </Button>
                </Box>
            </Modal>
        </div>
    );
};

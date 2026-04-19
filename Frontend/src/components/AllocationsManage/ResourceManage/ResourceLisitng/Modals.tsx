// Modals.tsx
import { Modal, Box, Typography, Button, Stack, TextField } from '@mui/material';
import { red } from '@mui/material/colors';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import moment from 'moment';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4
};

interface ModalProps {
    disable: boolean;
    handleClose: () => void;
    cancelModal: () => void;
    reason: string;
    handleReasonChange: (event: any) => void;
    iscompleted: boolean;
    handleCompletion: () => void;
    cancelCompletionModal: () => void;
    showReason: boolean;
    OpenshowReason: boolean;
    otReason?: any;
    closeShowReasonModal: () => void;
    showOnholdReason: boolean;
    OpenshowOnholdReason: boolean;
    onholdReason?: any;
    closeShowOnholdReasonModal: () => void;
    startDate: Date | null;
    endDate: Date | null;
    handleStartDateChange: (date: string | null) => void;
    handleEndDateChange: (date: string | null) => void;
    error: string;
}

export const ResourceModals = ({
    disable,
    handleClose,
    cancelModal,
    reason,
    handleReasonChange,
    iscompleted,
    handleCompletion,
    cancelCompletionModal,
    showReason,
    OpenshowReason,
    otReason,
    closeShowReasonModal,
    showOnholdReason,
    OpenshowOnholdReason,
    onholdReason,
    closeShowOnholdReasonModal,
    startDate,
    endDate,
    handleStartDateChange,
    handleEndDateChange,
    error
}: ModalProps) => {
    return (
        <>
            {/* {disable && (
                <Modal open={disable} onClose={handleClose}>
                    <Box sx={style}>
                        <Typography variant="h6" color={red[500]}>
                            Are you sure you want to hold this resource?
                        </Typography>
                        <TextField
                            placeholder="Enter the reason for on-holding this resource..."
                            multiline
                            rows={4}
                            value={reason}
                            onChange={handleReasonChange}
                            sx={{ mt: 2, width: '100%' }}
                        />
                        <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right' }}>
                            <Button variant="contained" onClick={cancelModal}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={handleClose}>
                                Confirm
                            </Button>
                        </Stack>
                    </Box>
                </Modal>
            )} */}

            {disable && (
                <Modal open={disable} onClose={handleClose}>
                    <Box sx={style}>
                        <Typography variant="h6" color={red[500]}>
                            Temporarily disable this resource?
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        handleStartDateChange(new Date(newValue).toLocaleDateString('en-CA'));
                                    }
                                }}
                                renderInput={(params) => <TextField {...params} sx={{ mt: 2, width: '100%' }} />}
                            />

                            <DatePicker
                                label="End Date"
                                value={endDate}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        handleEndDateChange(new Date(newValue).toLocaleDateString('en-CA'));
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} sx={{ mt: 2, width: '100%' }} error={!!error} helperText={error} />
                                )}
                            />
                        </LocalizationProvider>

                        <TextField
                            placeholder="Enter reason for disabling..."
                            multiline
                            rows={4}
                            value={reason}
                            onChange={handleReasonChange}
                            sx={{ mt: 2, width: '100%' }}
                        />

                        <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right' }}>
                            <Button variant="contained" onClick={cancelModal}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={handleClose} disabled={!!error}>
                                Confirm
                            </Button>
                        </Stack>
                    </Box>
                </Modal>
            )}

            {iscompleted && (
                <Modal open={iscompleted} onClose={handleCompletion}>
                    <Box sx={style}>
                        <Typography variant="h6" color={red[500]}>
                            Are you sure you want to mark this task as completed?
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right' }}>
                            <Button variant="contained" onClick={cancelCompletionModal}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={handleCompletion}>
                                Confirm
                            </Button>
                        </Stack>
                    </Box>
                </Modal>
            )}
            {showReason && (
                <Modal open={OpenshowReason}>
                    <Box sx={style}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, borderBottom: '2px solid #1976D2', pb: 1 }}>
                            OverTime Reason
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2, color: '#333' }}>
                            {otReason?.overtime_reason}
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right' }}>
                            <Button variant="contained" onClick={closeShowReasonModal}>
                                Ok
                            </Button>
                        </Stack>
                    </Box>
                </Modal>
            )}
            {showOnholdReason && (
                <Modal open={OpenshowOnholdReason}>
                    <Box sx={style}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, borderBottom: '2px solid #1976D2', pb: 1 }}>
                            On-Hold Reason
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2, color: '#333' }}>
                            {onholdReason?.reason}
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right' }}>
                            <Button variant="contained" onClick={closeShowOnholdReasonModal}>
                                Ok
                            </Button>
                        </Stack>
                    </Box>
                </Modal>
            )}
        </>
    );
};

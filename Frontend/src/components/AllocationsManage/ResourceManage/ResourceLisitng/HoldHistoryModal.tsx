import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Divider } from '@mui/material';
import moment from 'moment';

export const HoldHistoryModal = ({ open, onClose, historyData }: any) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Hold History</DialogTitle>
            <DialogContent dividers>
                {historyData && historyData.length > 0 ? (
                    historyData.map((item: any, index: number) => (
                        <div key={index} style={{ marginBottom: '12px' }}>
                            <Typography variant="subtitle2">
                                {moment(item.hold_start_date).format('DD MMM YYYY')} - {moment(item.hold_end_date).format('DD MMM YYYY')}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Reason: {item.reason || 'No reason provided'}
                            </Typography>
                            {index !== historyData.length - 1 && <Divider sx={{ my: 1 }} />}
                        </div>
                    ))
                ) : (
                    <Typography>No hold history found.</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

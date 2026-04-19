import type React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Stack,
    Divider,
    Paper,
    List,
    ListItem,
    ListItemText,
    Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Save, Cancel, Info, Warning } from '@mui/icons-material';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.spacing(2),
        minWidth: '500px',
        maxWidth: '600px'
    }
}));

const InfoBox = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    backgroundColor: '#E3F2FD', // Light blue background
    border: '1px solid #2196F3',
    borderRadius: theme.spacing(1.5),
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        backgroundColor: '#2196F3',
        borderRadius: '4px 0 0 4px'
    }
}));

interface ValidationIssue {
    projectId: string;
    projectName: string;
    departmentId: string;
    departmentName: string;
    totalAllocated: number;
    consumedHours: number;
    projectLimit: number;
    type: 'hard_limit' | 'consumed_conflict';
}

interface SaveConfirmationDialogProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    changesCount: number;
    changes: Record<string, number>;
    projects: Array<{
        id: string;
        name: string;
        type: string;
        pm: string;
        projectHours: Record<string, number>;
    }>;
    departments: Array<{
        id: string;
        name: string;
        color: string;
        resourceCount: number;
    }>;
    validationIssues: ValidationIssue[]; // NEW: Add validation issues
}

const SaveConfirmationDialog: React.FC<SaveConfirmationDialogProps> = ({
    open,
    onConfirm,
    onCancel,
    changesCount,
    changes,
    projects,
    departments,
    validationIssues // NEW: Destructure validation issues
}) => {
    const formatMonth = (monthKey: string) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const getChangeDetails = () => {
        return Object.entries(changes).map(([key, hours]) => {
            const [projectId, departmentId, month] = key.split('_');
            const project = projects.find((p) => p.id === projectId);
            const department = departments.find((d) => d.id === departmentId);
            return {
                projectName: project?.name || projectId,
                department: department?.name || departmentId.toUpperCase(),
                month: formatMonth(month),
                hours,
                isZero: hours === 0 // Track if this is a zero value
            };
        });
    };

    const changeDetails = getChangeDetails();

    // UPDATED: Only consider hard_limit issues as blocking
    const blockingIssues = validationIssues.filter((issue) => issue.type === 'hard_limit');
    const warningIssues = validationIssues.filter((issue) => issue.type === 'consumed_conflict');
    const hasBlockingIssues = blockingIssues.length > 0;
    const hasWarningIssues = warningIssues.length > 0;

    return (
        <StyledDialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ pb: 1, backgroundColor: '#F8F9FA' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    {hasBlockingIssues ? (
                        <Warning sx={{ color: '#F44336' }} />
                    ) : hasWarningIssues ? (
                        <Warning sx={{ color: '#FF9800' }} />
                    ) : (
                        <Info sx={{ color: '#2196F3' }} />
                    )}
                    <Typography variant="h6" fontWeight="600" color="#2C3E50">
                        {hasBlockingIssues
                            ? 'Cannot Save - Issues Found'
                            : hasWarningIssues
                            ? 'Confirm Changes with Warnings'
                            : 'Confirm Capacity Changes'}
                    </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {/* Show blocking issues */}
                {hasBlockingIssues && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>🚫 Blocking Issues (Must Fix Before Saving):</strong>
                        </Typography>
                        {blockingIssues.map((issue, index) => (
                            <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                                •{' '}
                                <strong>
                                    {issue.projectName} - {issue.departmentName}:
                                </strong>{' '}
                                Total allocated ({issue.totalAllocated}h) + consumed ({issue.consumedHours}h) ={' '}
                                {issue.totalAllocated + issue.consumedHours}h exceeds limit ({issue.projectLimit}h)
                            </Typography>
                        ))}
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                            Please reduce allocated hours to resolve these issues.
                        </Typography>
                    </Alert>
                )}

                {/* Show warning issues */}
                {hasWarningIssues && !hasBlockingIssues && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>⚠️ Warning - Consumed Hours Issues (Can still save):</strong>
                        </Typography>
                        {warningIssues.map((issue, index) => (
                            <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                                •{' '}
                                <strong>
                                    {issue.projectName} - {issue.departmentName}:
                                </strong>{' '}
                                Consumed hours ({issue.consumedHours}h) exceed project limit ({issue.projectLimit}h)
                            </Typography>
                        ))}
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                            These issues require updating project limits or consumed hours in the system, but you can still save capacity
                            allocations.
                        </Typography>
                    </Alert>
                )}

                <InfoBox elevation={0}>
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                        You are about to save <strong>{changesCount}</strong> capacity allocation changes. Please review the changes below:
                    </Typography>

                    <List dense sx={{ mt: 2, maxHeight: '300px', overflowY: 'auto' }}>
                        {changeDetails.map((change, index) => (
                            <ListItem key={index} sx={{ px: 0 }}>
                                <ListItemText
                                    primary={
                                        <Typography variant="body2" fontWeight="500">
                                            {change.projectName} - {change.department}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography
                                            variant="caption"
                                            color={change.isZero ? 'warning.main' : 'text.secondary'}
                                            sx={{ fontWeight: change.isZero ? 600 : 400 }}
                                        >
                                            {change.month}: {change.hours} hours {change.isZero ? '(Set to Zero)' : ''}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </InfoBox>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {hasBlockingIssues
                        ? '🚫 Cannot save due to allocation conflicts. Please fix the issues above.'
                        : hasWarningIssues
                        ? '⚠️ These changes contain consumed hours warnings but can still be saved.'
                        : 'These changes will be saved immediately and will update the capacity planning data.'}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button onClick={onCancel} variant="outlined" startIcon={<Cancel />} sx={{ mr: 1 }}>
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    startIcon={<Save />}
                    color={hasBlockingIssues ? 'error' : hasWarningIssues ? 'warning' : 'primary'}
                    disabled={hasBlockingIssues} // UPDATED: Only disable for blocking issues
                >
                    {hasBlockingIssues ? 'Cannot Save (Issues Found)' : hasWarningIssues ? 'Save with Warnings' : 'Save All Changes'}
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default SaveConfirmationDialog;

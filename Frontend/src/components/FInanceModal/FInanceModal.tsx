import { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { getCommentsByMilestone, createComment, updateComment, deleteComment } from 'services/milestone-comments';
import { TableContainer, Button, TextField, Box } from '@mui/material';
import moment from 'moment';
import { toast } from 'react-toastify';
import useAuth from 'hooks/useAuth';

interface MileStoneModalProps {
    milestone_id: any;
    handleClose: any;
}

const FinanceModal: React.FC<MileStoneModalProps> = ({ milestone_id, handleClose }) => {
    const [getComment, setGetComment] = useState<any[]>([]);

    const { user } = useAuth();

    useEffect(() => {
        getCommentsByMilestone(milestone_id)
            .then((res: any) => {
                setGetComment(res || []);
            })
            .catch((err) => {});
    }, [milestone_id]);

    return (
        <>
            <TableContainer component={Paper} sx={{ overflowY: 'auto', maxHeight: 400, marginTop: '10px' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" sx={{ fontWeight: 'bold', color: '#1976d2', width: '12%' }}>
                                Date
                            </TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold', color: '#1976d2', width: '78%' }}>
                                Comment
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {getComment.map((comment, index) => (
                            <TableRow key={index}>
                                <TableCell align="left">{moment(comment.created_at).format('Do MMM, YYYY')}</TableCell>
                                <TableCell align="left" sx={{ fontSize: '13px' }}>
                                    {comment.comment || 'No comment available'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {getComment?.length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '8px', marginBottom: '0', fontSize: '0.9rem' }}>No data available.</p>
            )}
        </>
    );
};

export default FinanceModal;

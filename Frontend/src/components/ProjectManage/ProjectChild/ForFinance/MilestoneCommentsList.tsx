import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    TableContainer,
    Box,
    TextField,
    Button,
    Grid,
    IconButton,
    Typography,
    Autocomplete,
    Modal,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { getCommentsByProject, createComment, updateComment, deleteComment } from 'services/milestone-comments';
import { getProjectMileStone } from 'services/projectService';
import useAuth from 'hooks/useAuth';
import SubCard from 'ui-component/cards/SubCard';

const MilestoneCommentsList = ({ projectId }: { projectId: any }) => {
    const [milestones, setMilestones] = useState<any>([]);
    const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
    const [comments, setComments] = useState<any>([]);
    const [newComment, setNewComment] = useState('');
    const [editCommentId, setEditCommentId] = useState<string | null>(null);
    const [editedComment, setEditedComment] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { user } = useAuth();
    const dispatch = useDispatch();

    // Fetch milestones and comments on component mount
    useEffect(() => {
        const fetchData = async () => {
            dispatch(spinLoaderShow(true));
            try {
                const [milestonesRes, commentsRes] = await Promise.all([getProjectMileStone(projectId), getCommentsByProject(projectId)]);
                setMilestones(milestonesRes);
                setComments(commentsRes || []);
            } catch (err) {
                toast.error('Failed to fetch data');
                console.error('Error fetching data:', err);
            } finally {
                dispatch(spinLoaderShow(false));
            }
        };
        fetchData();
    }, [projectId, dispatch]);

    // Handle adding a new comment
    const handleAddComment = async () => {
        if (!selectedMilestone || !newComment.trim()) return;

        dispatch(spinLoaderShow(true));
        try {
            const res = await createComment(selectedMilestone.id, newComment);
            if (res) {
                const updatedComments = await getCommentsByProject(projectId);
                setComments(updatedComments || []);
                setNewComment('');
                setIsAddModalOpen(false);
                toast.success('Comment added successfully');
            }
        } catch (error) {
            toast.error('Failed to add comment');
            console.error('Error adding comment:', error);
        } finally {
            dispatch(spinLoaderShow(false));
        }
    };

    // Handle opening the edit modal
    const handleEditClick = (commentId: string, comment: string) => {
        setEditCommentId(commentId);
        setEditedComment(comment);
        setIsEditModalOpen(true);
    };

    // Handle saving an edited comment
    const handleSaveEditedComment = async () => {
        if (!editedComment.trim() || !editCommentId) return;

        dispatch(spinLoaderShow(true));
        try {
            await updateComment(editCommentId, editedComment);
            const updatedComments = await getCommentsByProject(projectId);
            setComments(updatedComments || []);
            setEditCommentId(null);
            setEditedComment('');
            setIsEditModalOpen(false);
            toast.success('Comment updated successfully');
        } catch (error) {
            toast.error('Failed to update comment');
            console.error('Error updating comment:', error);
        } finally {
            dispatch(spinLoaderShow(false));
        }
    };

    // Handle deleting a comment
    const handleDeleteComment = async (commentId: string) => {
        try {
            dispatch(spinLoaderShow(true));
            await deleteComment(commentId);
            const updatedComments = await getCommentsByProject(projectId);
            setComments(updatedComments || []);
            toast.success('Comment deleted successfully');
        } catch (error) {
            toast.error('Failed to delete comment');
            console.error('Error deleting comment:', error);
        } finally {
            dispatch(spinLoaderShow(false));
        }
    };

    return (
        <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={12} md={12} sm={12}>
                <SubCard
                    title="Weekly milestones status"
                    secondary={
                        <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => setIsAddModalOpen(true)}>
                            Add Comment
                        </Button>
                    }
                    sx={{ mb: 3 }}
                >
                    {/* Comments Table */}
                    <TableContainer component={Paper} sx={{ overflowY: 'auto', maxHeight: 400, marginBottom: 2 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', width: '20%' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', width: '20%' }}>Milestone</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', width: '45%' }}>Comment</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2', width: '15%' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {comments.map((comment: any) => (
                                    <TableRow key={comment.id}>
                                        <TableCell>{moment(comment.created_at).format('Do MMM, YYYY')}</TableCell>
                                        <TableCell>{comment?.milestone?.milestone_phase?.name}</TableCell>
                                        <TableCell>{comment.comment || 'No comment available'}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleEditClick(comment.id, comment.comment)}
                                                sx={{ color: '#1976d2' }}
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteComment(comment.id)} sx={{ color: '#d32f2f' }}>
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* No Data Message */}
                    {comments.length === 0 && (
                        <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
                            No comments available.
                        </Typography>
                    )}
                </SubCard>
            </Grid>

            {/* Add Comment Modal */}
            <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Add Comment</DialogTitle>
                    <DialogContent>
                        <Box sx={{ marginTop: 2 }}>
                            <Autocomplete
                                options={milestones}
                                getOptionLabel={(option) => option?.milestone_phase?.name || ''}
                                renderInput={(params) => <TextField {...params} label="Select Milestone" />}
                                value={selectedMilestone}
                                onChange={(event, newValue) => setSelectedMilestone(newValue)}
                                sx={{ marginBottom: 2 }}
                            />
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                sx={{ marginBottom: 2 }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsAddModalOpen(false)} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleAddComment} color="primary" disabled={!newComment.trim() || !selectedMilestone}>
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>
            </Modal>

            {/* Edit Comment Modal */}
            <Modal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Edit Comment</DialogTitle>
                    <DialogContent>
                        <Box sx={{ marginTop: 2 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                placeholder="Edit your comment..."
                                value={editedComment}
                                onChange={(e) => setEditedComment(e.target.value)}
                                sx={{ marginBottom: 2 }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsEditModalOpen(false)} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEditedComment} color="primary" disabled={!editedComment.trim()}>
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </Modal>
        </Grid>
    );
};

export default MilestoneCommentsList;

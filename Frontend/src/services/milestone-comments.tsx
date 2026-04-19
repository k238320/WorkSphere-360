import httpservice from './httpservice';

export function getCommentsByMilestone(milestone_id: string) {
    return httpservice.get(`/milestone-comments/${milestone_id}`);
}

export function createComment(milestone_id: string, comment: string) {
    return httpservice.post('/milestone-comments', { milestone_id, comment });
}

export function updateComment(commentId: any, comment: string) {
    return httpservice.put(`/milestone-comments/${commentId}`, { comment });
}

export function deleteComment(commentId: string) {
    return httpservice.delete(`/milestone-comments/${commentId}`);
}

export function getCommentsByProject(projectId: string) {
    return httpservice.get(`/milestone-comments/getCommentsByProject/${projectId}`);
}

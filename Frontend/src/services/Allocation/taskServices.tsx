import httpservice from '../httpservice';

//Department  ===================>

export function getDepartmentCategory(body: any = null) {
    return httpservice.get('/department');
}
export function postDepartmentCategory(body: any) {
    return httpservice.post('/department', body);
}
export function updateDepartmentCategory(body: any) {
    return httpservice.put('/department', body);
}

//Resource   ===================>

export function getResourceCategory(body: any = null) {
    return httpservice.get('/resource/resourceAll');
}
export function postResourceCategory(body: any) {
    return httpservice.post('/resource', body);
}
export function updateResourcetCategory(body: any) {
    return httpservice.put('/resource', body);
}

//Tasks ===================>

export function getTask(body: any = null) {
    return httpservice.get('/task');
}
export function getTaskById(id: any) {
    return httpservice.get('/task/' + id);
}
export function getTaskName(id: any) {
    return httpservice.get('/task/name/' + id);
}
export function postTask(body: any) {
    return httpservice.post('/task', body);
}
export function updateTask(body: any) {
    return httpservice.put('/task/' + body?.id, body);
}

export function getHourDetails(body: any) {
    return httpservice.get('/task?' + body);
}

export function deleteTask(id: any) {
    return httpservice.delete('/task/' + id);
}
export function taskCompletion(id: any) {
    return httpservice.put('/task/task-completion/' + id);
}

export function getTaskCount() {
    return httpservice.get('/task/count');
}

//Tasks Status ===================>

export function getTaskStatus(body: any = null) {
    return httpservice.get('/task-status');
}
export function postTaskStatus(body: any) {
    return httpservice.post('/task-status', body);
}
export function updateTaskStatus(body: any) {
    return httpservice.put('/task-status', body);
}
//iftikhar
export function disableUserAllocation(body: any) {
    return httpservice.put('/task/disable-allocation', body);
}

export function temporaryDisableUserAllocation(body: any) {
    return httpservice.post('/task/temporary-disable', body);
}

export function updateCompletion(body: any) {
    return httpservice.put('/task/update-completion', body);
}

export function getComments(task_id: any) {
    return httpservice.get(`/task/comments/${task_id}`);
}

export function postComments(task_id: any, body: any) {
    return httpservice.post(`/task/comments/${task_id}`, body);
}
//Tasks Status ===================>

export function getTaskCategory(body: any = null) {
    return httpservice.get('/task-category');
}
export function postTaskCategory(body: any) {
    return httpservice.post('/task-category', body);
}
export function updateTaskCategory(body: any) {
    return httpservice.put('/task-category', body);
}

//Tasks Hours Data ===================>

export function getTaskHours(department_id: string, project_id: string) {
    return httpservice.get('/task/hours-detail', {
        params: {
            department_id: department_id,
            project_id: project_id
        }
    });
}
export function updateAllocation(id: string, payload: any) {
    return httpservice.put(`/task/allocation/${id}`, payload);
}

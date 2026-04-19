import httpservice from './httpservice';
export function getProjectStatus(body: any) {
    return httpservice.get('/project-statuses/listing?' + body);
}

export function createProjectStatus(body: any) {
    return httpservice.post('/project-statuses', body);
}
export function updateProjectStatus(body: any) {
    return httpservice.put('/project-statuses/' + body?.id, body);
}
export function getProjectStatusByID(id: any) {
    return httpservice.get('/project-statuses/' + id);
}

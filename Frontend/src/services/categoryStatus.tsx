import httpservice from './httpservice';
export function getProjectCategoryStatus(body: any) {
    return httpservice.get('/project-status-category/listing?' + body);
}
export function createProjectCategoryStatus(body: any) {
    return httpservice.post('/project-status-category', body);
}
export function updatesProjectCategoryStatus(body: any) {
    return httpservice.put('/project-status-category/' + body?.id, body);
}
export function getProjectCategoryStatusByID(id: any) {
    return httpservice.get('/project-status-category/' + id);
}

import httpservice from './httpservice';

export function getTaskCategoryListing(body: any) {
    return httpservice.get('/task-category/listing?' + body);
}

export function getTaskCategoryById(id: any) {
    return httpservice.get('/task-category/' + id);
}

export function createTaskCategory(body: any) {
    return httpservice.post('/task-category', body);
}

export function updateTaskCategory(id: any, body: any) {
    return httpservice.put('/task-category/' + id, body);
}

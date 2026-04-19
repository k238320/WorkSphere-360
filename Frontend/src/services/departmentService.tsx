import httpservice from './httpservice';

export function getDepartmentListing(body: any) {
    return httpservice.get('/department/listing?' + body);
}

export function getDepartmentById(id: any) {
    return httpservice.get('/department/' + id);
}

export function createDepartment(body: any) {
    return httpservice.post('/department', body);
}

export function updateDepartment(id: any, body: any) {
    return httpservice.put('/department/' + id, body);
}

export function getAllDepartments() {
    return httpservice.get('/department');
}

import httpservice from './httpservice';

export function getRoleListing(body: any) {
    return httpservice.get('/roles/listing?' + body);
}

export function getRoleById(id: any) {
    return httpservice.get('/roles/' + id);
}

export function getRoles() {
    return httpservice.get('/roles');
}

export function createRole(body: any) {
    return httpservice.post('/roles', body);
}

export function updateRole(id: any, body: any) {
    return httpservice.put('/roles/' + id, body);
}

export function getRolePermissions() {
    return httpservice.get('/roles-permission');
}

import httpservice from './httpservice';

export function getProjectManagers() {
    return httpservice.get('/user/project-managers');
}
export function changeAdminPasssword(body: any) {
    return httpservice.post('/user/change-password', body);
}

export function createUser(body: any) {
    return httpservice.post('/user', body);
}

export function updateUser(id: any, body: any) {
    return httpservice.put('/user/' + id, body);
}

export function getUserListing(body: any) {
    return httpservice.get('/user/listing?' + body);
}

export function getUserListingByAdmin(department?: string, name?: string) {
    // const url = '/user-detail' + (name ? `?name=${name}` : '');
    // return httpservice.get(url);
    let url = '/user-detail';

    // Check if either department or name is provided to construct the URL
    if (department || name) {
        url += '?';

        // Add department parameter if provided
        if (department) {
            url += `department_id=${department}`;
        }

        // Add name parameter if provided
        if (name) {
            // Add "&" if department parameter is also present
            if (department) {
                url += '&';
            }
            url += `name=${name}`;
        }
    }

    return httpservice.get(url);
}

export function getUserById(id: any) {
    return httpservice.get('/user/' + id);
}

export function forgotPassword(body: any) {
    return httpservice.post('/user/forgot-password', body);
}

export function resetPassword(body: any) {
    return httpservice.post('/user/reset-password', body);
}

export function getNotifications() {
    // return httpservice.get('/notification/' + user_id);
    return httpservice.get(`/notification`);
}

export function updateNotifications(id: any) {
    // return httpservice.get('/notification/' + user_id);
    return httpservice.put(`/notification/${id}`);
}

export function getAllUser() {
    return httpservice.get(`/user`);
}

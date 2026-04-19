import httpservice from './httpservice';

// get employee details
export function getEmployeeDetail(id: any) {
    return httpservice.get('/user-detail/' + id);
}

// create employee details
export function createEmployeeDetail(body: any) {
    return httpservice.post('/user-detail', body);
}

// create employee details
// export function updateEmployeeDetail(body: any) {
//     return httpservice.post('/user-detail', body);
// }

export function createUserDocuments(body: any) {
    return httpservice.post('/user-detail/document', body);
}

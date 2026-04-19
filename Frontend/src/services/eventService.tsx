import httpservice from './httpservice';

// get employee details
// export function getEmployeeDetail(id: any) {
//     return httpservice.get('/user-detail/' + id);
// }

// create employee details
export function createevent(body: any) {
    return httpservice.post('/event', body);
}

// create employee details
// export function updateEmployeeDetail(body: any) {
//     return httpservice.post('/user-detail', body);
// }

export function getEventListing(body: any) {
    return httpservice.get('/event/listing?' + body);
}

export function deleteEvent(id: any) {
    return httpservice.delete('/event/' + id);
}

// export function createUserDocuments(body: any) {
//     return httpservice.post('/user-detail/document', body);
// }

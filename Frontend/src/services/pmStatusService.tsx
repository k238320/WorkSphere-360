import httpservice from './httpservice';

export function getPmStatusListing(body: any) {
    return httpservice.get('/pm-status?' + body);
}
export function createPmStatus(body: any) {
    return httpservice.post('/pm-status', body);
}

export function getPmStatusById(id: any) {
    return httpservice.get('/pm-status/' + id);
}

import httpservice from './httpservice';

export function uploadFiles(body: any) {
    return httpservice.post('/upload', body);
}

export function uploadImage(body: any) {
    return httpservice.post('/upload/image', body);
}
export function getFiles(key: any) {
    return httpservice.get('/upload/signed-url', { params: { path: key } });
}

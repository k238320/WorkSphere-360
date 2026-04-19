import httpservice from './httpservice';

export function getScreenShots(params: any) {
    return httpservice.get('/upload/getall', { params });
}

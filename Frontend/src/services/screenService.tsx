import httpservice from './httpservice';

export function createScreen(body: any) {
    return httpservice.post('/screens', body);
}

export function getScreen() {
    return httpservice.get('/screens');
}

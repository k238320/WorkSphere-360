import httpservice from './httpservice';

export function getModules() {
    return httpservice.get('/modules');
}

import httpservice from './httpservice';
export function getTechnology(body: any = null) {
    return httpservice.get('/technology', { params: body });
}
// export function createProjects(body: any) {
//     return httpservice.post("http://localhost:5010/api/v1/projects", body);
// }
// export function updateProjects(body: any) {
//     return httpservice.put("http://localhost:5010/api/v1/projects", body);
// }

export function getTechnologyData(body: any) {
    return httpservice.get('/technology/listing?' + body);
}
export function createTechnology(body: any) {
    return httpservice.post('/technology', body);
}
export function updateTechnology(body: any) {
    return httpservice.put('/technology/' + body?.id, body);
}
export function getTechnologyByID(id: any) {
    return httpservice.get('/technology/' + id);
}

import httpservice from './httpservice';
export function getIndustry(body: any = null) {
    return httpservice.get('/industry', { params: body });
}
// export function createProjects(body: any) {
//     return httpservice.post("http://localhost:5010/api/v1/projects", body);
// }
// export function updateProjects(body: any) {
//     return httpservice.put("http://localhost:5010/api/v1/projects", body);
// }

export function getProjectIndustry(body: any) {
    return httpservice.get('/industry/listing?' + body);
}
export function createProjectIndustry(body: any) {
    return httpservice.post('/industry', body);
}
export function updateProjectIndustry(body: any) {
    return httpservice.patch('/industry/' + body?.id, body);
}
export function getProjectIndustryByID(id: any) {
    return httpservice.get('/industry/' + id);
}

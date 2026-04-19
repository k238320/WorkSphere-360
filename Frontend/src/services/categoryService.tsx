import httpservice from './httpservice';
export function getProjectCategory(body: any = null) {
    return httpservice.get('/category');
}
// export function createProjects(body: any) {
//     return httpservice.post("http://192.168.20.125:5010/api/v1/projects", body);
// }
// export function updateProjects(body: any) {
//     return httpservice.put("http://192.168.20.125:5010/api/v1/projects", body);
// }

//Hours Category ===================>
export function getHoursCategory(body: any = null) {
    return httpservice.get('/project-category-hours', { params: body });
}
//Department  Category ===================>
export function getDepartmentCategory(body: any = null) {
    return httpservice.get('/department', { params: body });
}
//Project Category crud ===================>
export function getProjectCategoryData(body: any) {
    return httpservice.get('/category/listing?' + body);
}
export function createCategory(body: any) {
    return httpservice.post('/category', body);
}
export function updateCategory(body: any) {
    return httpservice.put('/category/' + body?.id, body);
}
export function getCategoryByID(id: any) {
    return httpservice.get('/category/' + id);
}

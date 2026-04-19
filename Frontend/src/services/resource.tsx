import httpservice from './httpservice';

export function getResource(body: any) {
    return httpservice.get('/resource/listing?' + body);
}
export function createResource(body: any) {
    return httpservice.post('/resource', body);
}
export function updateResource(body: any) {
    return httpservice.put('/resource/' + body?.id, body);
}
export function getResourceByID(id: any) {
    return httpservice.get('/resource/' + id);
}

export function getResources() {
    return httpservice.get('/resource');
}

export function getDepartmentWise(departmentId?: any) {
    return httpservice.get('/resource/department-wise', {
        params: {
            departmentId: departmentId
        }
    });
}

export function resourceUtilization(params: any) {
    return httpservice.get('/resource/resource-utilization', { params });
}

export function resourceListing(departmentId?: any, name?: string) {
    return httpservice.get('/resource/get-resources', {
        params: {
            department_id: departmentId
            // name: name
        }
    });
}

export function getAllResources() {
    // return httpservice.get('/user/userDropdown');
    return httpservice.get('/user/userDropdown');
}

export function multipleUpdate(body: any) {
    return httpservice.put('/resource/multiple-update', body);
}

export function extraHourRequest(body: any) {
    return httpservice.post('/attendance/commentStatus', body);
}

export function getResourceCount() {
    return httpservice.get('/resource/count');
}

export async function createAllocation(body: any) {
    try {
        return await httpservice.post('/task/allocation', body);
    } catch (error: any) {
        return Promise.reject(error);
    }
}

export function getAllocations(task_id: string, department_id: any) {
    return httpservice.get(`/task/allocation/${task_id}/${department_id}`);
}

export function getPmAllocations(task_id: string, department_ids: any) {
    return httpservice.get(`/task/pmallocation/${task_id}/${department_ids}`);
}
export function getDepartmentResource(departmentId?: any) {
    return httpservice.get('/resource/department-resource', {
        params: {
            departmentId: departmentId
        }
    });
}

export function getFilteredResources() {
    return httpservice.get('/resource/getFilteredResources', {});
}


export function resourceAll(){
    return httpservice.get('/resource/resourceAll', {});
}

export function getAllDesignations() {
    return httpservice.get('/resource/getAllDesignations', {});
}

export function getAllCapacities() {
    return httpservice.get('/resource/getAllCapacities', {});
}
export function getAllRates() {
    return httpservice.get('/resource/getAllRates', {});
}

export function updateResourceCapacityRecord(body: any) {
    return httpservice.put('/resource/updateResourceCapacityRecord/' + body?.id, body);
}

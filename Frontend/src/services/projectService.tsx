import httpservice from './httpservice';
export function getProjects(userId: any) {
    return httpservice.get('/project', {
        params: {
            user_id: userId
        }
    });
}

export function getProjectById(id: string) {
    return httpservice.get('/project/' + id);
}

export function getProjectName(id: string) {
    return httpservice.get('/project/name/' + id);
}

export function getProjectListing(body: any = null) {
    return httpservice.get('/project/listing?' + body);
}

export function getProjectForSale(projectId: string) {
    return httpservice.get('/project/for-sale/' + projectId);
}

export function getProjectForPM(projectId: string) {
    return httpservice.get(`/project/for-pm/${projectId}`);
}

export function createProjects(body: any) {
    return httpservice.post('/project', body);
}
export function updateProjects(id: string, body: any) {
    return httpservice.put(`/project/${id}`, body);
}

export function updateForSale(body: any) {
    return httpservice.put(`/project/updateForSale`, body);
}

export function overallProfitability(name?: string) {
    return httpservice.get('/project/overallProfitability', {
        params: {
            name
        }
    });
}

export function getProjectDetails(projectId?: string) {
    return httpservice.get('/project/getProjectDetails', {
        params: {
            projectId
        }
    });
}

export function ProjectTrackers(body: any = null) {
    return httpservice.get('/project/ProjectTrackers?' + body);
}

//ProjectHourDetail==========================>
export function getProjectHourListing(project?: String, project_manager?: String, page?: number, rowsPerPage?: number) {
    let url = `/project/projectHours?page=${page}&rowsPerPage=${rowsPerPage}`;
    if (project || project_manager) {
        if (project && project != '') {
            url += `&project=${project}`;
        }
        if (project_manager && project != '') {
            // if (project) {
            //     url += '&';
            // }
            url += `&project_manager=${project_manager}`;
        }
    }
    return httpservice.get(url);
}

export function getProjectHourDetail(project_id: String) {
    return httpservice.get('/project-hours/' + project_id);
}
export function createHourDetail(body: any) {
    return httpservice.post('/project-hours', body);
}
export function updateHourDetail(body: any, id: string) {
    return httpservice.put('/project-hours/' + id, body);
}
export function deleteHourDetail(id: any) {
    return httpservice.delete('/project-hours/' + id);
}

//============================Project Milestone Phase ================//

export function getProjectMileStonePhase(body: any = null) {
    return httpservice.get('/milestone-phase');
}
export function getMilestonePhase(body: any) {
    return httpservice.get('/milestone-phase/listing?' + body);
}

export function createMilestonePhase(body: any) {
    return httpservice.post('/milestone-phase', body);
}
export function updateMilestonePhase(body: any) {
    return httpservice.put('/milestone-phase/' + body?.id, body);
}
export function getMilestonePhaseByID(id: any) {
    return httpservice.get('/milestone-phase/' + id);
}

//============================Project Payment Milestone Phase ================//
export function getPaymentMileStone(body: any = null) {
    return httpservice.get('/project-milestone?' + body);
}
//============================Project Milestone ================//

export function getProjectMileStone(project_id: any) {
    return httpservice.get('project-milestone/' + project_id);
}
export function createProjectMileStone(body: any) {
    return httpservice.post('/project-milestone', body);
}
export function updateProjectMileStone(id: any, body: any) {
    return httpservice.put(`/project-milestone/${id}`, body);
}
export function updateTargetDate(id: string, body: any) {
    return httpservice.patch(`/project-milestone/${id}`, body);
}
export function getTargetMonthHistry(id: string) {
    return httpservice.get(`/project-milestone/info/${id}`);
}
export function updateOnHold(id: string, body: any) {
    return httpservice.patch(`/project-milestone/onhold/${id}`, body);
}

export function deleteProjectMileStone(id: string) {
    return httpservice.delete(`/project-milestone/${id}`);
}

//============================Project Finance weekly ================//

export function getProjectFinanceWeekly(body: any = null) {
    return httpservice.get('/project/finance', { params: body });
}
export function getFinanceWeeklystatusId(project_id: any) {
    return httpservice.get('/weekly-status/' + project_id);
}
export function createFinanceWeeklystatus(body: any) {
    return httpservice.post('/weekly-status', body);
}
export function updateProjectFinanceWeekly(body: any) {
    return httpservice.put('/project/finance', body);
}
export function deleteFinanceWeeklystatus(id: any) {
    return httpservice.delete('/weekly-status/' + id);
}

//============================Project Statuses ================//
export function getProjectStatus() {
    return httpservice.get('/project-statuses');
}
export function createProjectStatus(body: any) {
    return httpservice.post('http://192.168.20.125:5010/api/v1/project/status', body);
}
export function updateProjectStatus(body: any) {
    return httpservice.put('http://192.168.20.125:5010/api/v1/project/status', body);
}

// Project Status Details
export function getProjectStatusDetails(projectId: string) {
    return httpservice.get('/project-status/' + projectId);
}
export function createProjectStatusDetails(body: any) {
    return httpservice.post('/project-status', body);
}
export function deleteProjectStatusDetails(id: any) {
    return httpservice.delete('/project-status/' + id);
}

// Project Status Category
export function getProjectStatusCategory() {
    return httpservice.get('/project-status-category');
}

// cost

export function getDepartmentCost(departmentId: string) {
    return httpservice.get(`/cost/${departmentId}`);
}

export function getAllDepartments() {
    return httpservice.get(`/cost`);
}

// Project manager Details

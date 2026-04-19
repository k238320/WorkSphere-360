import httpservice from './httpservice';

export function milestoneDashboadCount({ startDate, endDate }: any) {
    return httpservice.get('/project-milestone/milestoneDashboadCount', {
        params: { startDate, endDate }
    });
}

export function milestoneDashboardCountInvoiceWise({ startDate, endDate }: any) {
    return httpservice.get('/project-milestone/milestoneDashboardCountInvoiceWise', {
        params: { startDate, endDate }
    });
}

export function getSalesTargetData({ startDate, endDate }: any) {
    return httpservice.get('/project/getSalesTargetData', {
        params: { startDate, endDate }
    });
}

export function dashboardOverViewCountAttendance(startDate: any, endDate: any, departmentid: any, isTeamLeads: boolean) {
    return httpservice.get('/attendance/dashboardOverViewCount', {
        params: { startDate, endDate, departmentid, isTeamLeads }
    });
}

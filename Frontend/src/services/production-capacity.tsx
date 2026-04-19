import { UpdateProjectHoursDto } from 'pages/ProductionCapacity/dto/update-project-hour.dto';
import httpservice from './httpservice';
import { IDepartment, IProjects } from 'pages/ProductionCapacity/interface';
import { APIResourceEntry } from 'pages/Reports/ProfitByResource/types';

export function productionCapacity() {
    return httpservice.get('/production-capacity');
}

export function departmentForPoductionCapacity() {
    return httpservice.get('/department');
}

export function updateProjectHours(data: UpdateProjectHoursDto) {
    return httpservice.patch('/production-capacity/update-hours', data);
}

// NEW: Monthly capacity data with month filter
export function getMonthlyCapacityData(month: string): Promise<{
    data: {
        departments: IDepartment[];
        monthlyUtilization: Record<
            string,
            {
                utilization: number;
                threshold: number;
                resourcesRequired: number;
            }
        >;
    };
}> {
    return httpservice.get(`/production-capacity/monthly?month=${month}`);
}

// NEW: Get capacity data for specific month range
export function getCapacityDataByDateRange(
    startMonth: string,
    endMonth: string
): Promise<{
    data: {
        projects: IProjects[];
        allocatedCapacityData: Record<string, number>;
        departments: IDepartment[];
    };
}> {
    return httpservice.get(`/production-capacity/range?start=${startMonth}&end=${endMonth}`);
}

export function getProfitByResource(
    startDate: string,
    endDate: string,
    departmentId?: string,
    resourceId?: string
): Promise<{
    data: Array<APIResourceEntry>;
}> {
    const params = new URLSearchParams({ startDate, endDate });
    if (departmentId) params.append('departmentId', departmentId);
    if (resourceId) params.append('resourceId', resourceId);

    return httpservice.get(`/production-capacity/profit-by-resource?${params.toString()}`);
}

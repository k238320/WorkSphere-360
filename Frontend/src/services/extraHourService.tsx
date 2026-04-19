import httpservice from './httpservice';
import moment from 'moment';

export function getExtraHour(
    startTime: any,
    endTime: any,
    department_id?: string,
    name?: string,
    emp_code?: string,
    selectleaveStatus?: any
) {
    return httpservice.get('/extra-hour', {
        params: {
            start_date: startTime,
            end_date: endTime,
            department_id,
            name,
            emp_code,
            ...(selectleaveStatus && { leave_status: selectleaveStatus?.value })
        }
    });
}

export function extraHourStatus(body: any) {
    return httpservice.put('/extra-hour/status', body);
}

export function createExtraHour(body: any) {
    return httpservice.post('/extra-hour', body);
}

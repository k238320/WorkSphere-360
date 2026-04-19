import httpservice from './httpservice';

export function createLeaveRequest(body: any) {
    return httpservice.post('/attendance', body);
}
export function approveLeave(body: any) {
    return httpservice.post('/attendance/approveLeave', body);
}

export function addUserComment(body: any) {
    return httpservice.post('/attendance/addComment', body);
}

export function getAttendance(
    startTime: any,
    endTime: any,
    department_id?: string,
    name?: string,
    emp_code?: string,
    location_type_id?: number
) {
    return httpservice.get('/attendance', {
        params: {
            startTime,
            endTime,
            department_id,
            name,
            emp_code,
            location_type_id
        }
    });
}

export function getEmployeLeaveRecords(
    startTime: any,
    endTime: any,
    selectleaveStatus?: any,
    employement_code?: string,
    applicationTypeId?: string
) {
    return httpservice.get('/attendance/listing', {
        params: {
            start_date: startTime,
            end_date: endTime,
            employement_code,
            applicationTypeId,
            ...(selectleaveStatus && { leave_status: selectleaveStatus?.value })
        }
    });
}

export function getRemainingLeaves(name?: any, emp_code?: any) {
    return httpservice.get('/attendance/remaining-leaves', {
        params: {
            name,
            emp_code
        }
    });
}

export function fixAttendance(body: any) {
    return httpservice.post('/attendance/fix-attendance', body);
}

export function fixMonthlyDeduction(body: any) {
    return httpservice.post('/attendance/fix-monthly-deduction', body);
}

export function resourceYearlyRecord(emp_code: any, year: any) {
    return httpservice.get('attendance/yearlyRecord', {
        params: {
            emp_code,
            year
        }
    });
}

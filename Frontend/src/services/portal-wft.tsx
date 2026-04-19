import httpservice from './httpservice';

export function GetCheckinCheckout(startTime: any, endTime: any, emp_code: string, location_type_id: number) {
    return httpservice.get('/portal-wfh/checkin-checkout', {
        params: {
            startTime,
            endTime,
            emp_code,
            location_type_id
        }
    });
}

export function Checkin(emp_code: string, location_type_id: number) {
    return httpservice.post('/portal-wfh/checkin', {
        empCode: emp_code,
        location_type_id: location_type_id
    });
}

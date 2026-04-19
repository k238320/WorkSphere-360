import httpservice from "./httpservice";


export function createPayslip(body:any) {
    return httpservice.post('/payslip', body);
}

export function findAll (query = '') {
    return httpservice.get(`/payslip${query}`);
}



export function deletePayslip (id:string) {
    return httpservice.delete('/payslip/'+ id);
}
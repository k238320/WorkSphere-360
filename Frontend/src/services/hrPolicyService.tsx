import httpservice from './httpservice';

export function getHrPolicy() {
    return httpservice.get('/hr-policy');
}
export function createHrPolicy(body: any) {
    return httpservice.post('/hr-policy', body);
}

export function getHrPolicyListing(body: any) {
    return httpservice.get('/hr-policy/listing?' + body);
}

export function toggleHrPolicyStatus(id: string, is_active: boolean) {
    return httpservice.patch(`/hr-policy/${id}/toggle`, { is_active });
}

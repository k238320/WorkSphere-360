import httpservice from './httpservice';

export function getClientDetails(projectId: string) {
    return httpservice.get(`/client-detail/${projectId}`);
}

export function createClientDetails(body: any) {
    return httpservice.post(`/client-detail`, body);
}

export function deleteClientDetails(id: string) {
    return httpservice.delete(`/client-detail/${id}`);
}

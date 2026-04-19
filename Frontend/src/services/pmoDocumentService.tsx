import httpservice from './httpservice';

export function getPmoDocument() {
    return httpservice.get('/pmo-document');
}
export function createPmoDocument(body: any) {
    return httpservice.post('/pmo-document', body);
}

export function getPmoDocumentListing(body: any) {
    return httpservice.get('/pmo-document/listing?' + body);
}

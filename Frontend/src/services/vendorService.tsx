import httpservice from './httpservice';

export function getVendorListing(body: any) {
    return httpservice.get('/vendor/listing?' + body);
}

export function getVendorById(id: any) {
    return httpservice.get('/vendor/' + id);
}

export function createVendor(body: any) {
    return httpservice.post('/vendor', body);
}

export function updateVendor(id: any, body: any) {
    return httpservice.put('/vendor/' + id, body);
}

export function getAllVendors() {
    return httpservice.get('/vendor');
}

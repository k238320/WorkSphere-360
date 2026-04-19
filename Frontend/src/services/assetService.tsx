import httpservice from './httpservice';

// export function getAssetListing(body?: any) {
// export function getAssetListing(location?: String, asset?: string, startDate?: string, endDate?: String, brand?: string, vender?: string) {
//     // return httpservice.get('/asset/listing?' + body);
//     const url = '/asset/listing' + (body ? `?${body}` : '');
//     return httpservice.get(url);
// }
export function getAssetListing(location?: string, asset?: string, startDate?: string, endDate?: string, brand?: string, vendor?: string) {
    const queryParams: string[] = [];

    if (location) queryParams.push(`location=${encodeURIComponent(location)}`);
    if (asset) queryParams.push(`asset_category_id=${encodeURIComponent(asset)}`);
    if (startDate) queryParams.push(`from_date=${encodeURIComponent(startDate)}`);
    if (endDate) queryParams.push(`to_date=${encodeURIComponent(endDate)}`);
    if (brand) queryParams.push(`brand=${encodeURIComponent(brand)}`);
    if (vendor) queryParams.push(`vendor_id=${encodeURIComponent(vendor)}`);

    const queryString = queryParams.join('&');
    const url = '/asset/listing' + (queryString ? `?${queryString}` : '');

    return httpservice.get(url);
}

export function getAllAsset() {
    return httpservice.get('/asset');
}

export function getAssetById(id: any) {
    return httpservice.get('/asset/' + id);
}

export function createAsset(body: any) {
    return httpservice.post('/asset', body);
}

export function updateAsset(id: any, body: any) {
    return httpservice.put('/asset/' + id, body);
}

export function getUnassignedAssets(id: any) {
    return httpservice.get('/asset/unassign-asset/' + id);
}

export function assignAsset(body: any) {
    return httpservice.post('/asset/assign-asset', body);
}

export function getUserAssets(id: any) {
    return httpservice.get('/asset/assign-asset/' + id);
}

// Removeed
export function unassignAsset(body: any) {
    return httpservice.post('/asset/unassign-asset', body);
}

// Create asset complain
export function createAssetComplain(body: any) {
    return httpservice.post('/asset/asset-complaint', body);
}

// get compalin by users
export function getAssetComplainByUser(id: any) {
    return httpservice.get('/asset/asset-complaint/' + id);
}
// create confirm asset by users
export function createConfirmAsset(body: any) {
    return httpservice.post('/asset/confirm-asset', body);
}

// Get All complaints
export function getAllAssetComplain(body: any) {
    return httpservice.get('/asset/asset-complaint?' + body);
}

// Get All complaints
export function resolveComplaint(id: any, body: any) {
    return httpservice.post(`/asset/resolve-complaint/` + id, body);
}

// Get All complaints
export function resolveComplaintByIT(id: any, body: any) {
    return httpservice.post(`/asset/admin/resolve-complaint/` + id, body);
}

import httpservice from './httpservice';

export function getAssetCategoryListing(body: any) {
    return httpservice.get('/asset-category/listing?' + body);
}

export function getAllAssetCategory() {
    return httpservice.get('/asset-category');
}

export function getAssetCategoryById(id: any) {
    return httpservice.get('/asset-category/' + id);
}

export function createAssetCategory(body: any) {
    return httpservice.post('/asset-category', body);
}

export function updateAssetCategory(id: any, body: any) {
    return httpservice.put('/asset-category/' + id, body);
}

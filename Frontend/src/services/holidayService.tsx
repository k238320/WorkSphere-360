import httpservice from './httpservice';

export function getHolidays() {
    return httpservice.get('/holiday');
}
export function createHoliday(body: any) {
    return httpservice.post('/holiday', body);
}

export function getHolidayListing(body: any) {
    return httpservice.get('/holiday/listing?' + body);
}

export function deleteHoliday(id: any) {
    return httpservice.delete('/holiday/' + id);
}

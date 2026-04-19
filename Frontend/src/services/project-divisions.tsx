import httpservice from './httpservice';

export function GetAllProjectDivisions() {
    return httpservice.get('/project-divisions' );
}
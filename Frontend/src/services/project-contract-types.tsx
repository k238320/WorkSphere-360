import httpservice from './httpservice';

export function GetAllProjectContractTypes() {
    return httpservice.get('/project-contract-type' );
}
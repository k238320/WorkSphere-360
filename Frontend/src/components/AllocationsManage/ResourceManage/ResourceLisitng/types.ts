// types.ts
export interface TableData {
    id: string;
    resource: { name: string };
    department?: { name: string };
    task_hours: number;
    start_date: string;
    end_date: string;
    status: boolean;
    is_completed: boolean;
    is_overtime: boolean;
    overtime_reason?: string;
    reason?: string;
    task_id: string;
    department_id: string;
    resource_id: string;
    disable_start_date: any;
    disable_end_date: any;
    allocation_hold_history?: any;
    task : Itask,
}

export interface ResourceListingProps {
    tableData: TableData[];
    refreshData: () => void;
    task_id: string;
    userdata: any;
    getTaskHoursData?: () => void;
}

export interface Itask{
    id : string;
    name : string; 
    project_id : string;
}

export interface Idepartment{
    id:string;
    name:string;
}

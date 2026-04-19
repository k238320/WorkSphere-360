export interface IProjects {
    id: string;
    name: string;
    signed_document: string;
    commercial_proposal: string;
    technical_proposal: string;
    mou_document: string;
    no_of_weeks: number;
    specific_timeline: string;
    additional_documents: string;
    brief_commitments: string;
    dicsounted_cost: number;
    reason: string;
    kickoff_date: string;
    project_plan: string;
    project_srs: string;
    status_report: string;
    project_website: string;
    project_categories: ICategory[];
    project_technology: ICategory[];
    project_industry: ICategory[];
    created_at: string;
    updated_at: string;
    status: boolean;
    project_manager_details: IPerson[];
    go_live_date: string;
    project_win_date: string;
    projectDivisionId: string;
    project_contract_type_id: string;
    project_hours: IProjectHour[];
    project_contract_type: IContractType;
    production_capacity?: IProductionCapacity[];
    project_consumed_hours?: IProjectConsumedHour[];
}

export interface ICategory {
    id: string;
    name: string;
}

export interface IPerson {
    id: string;
    name: string;
}

export interface IProjectHour {
    id: string;
    modified_date: string;
    department_id: string;
    project_catgory_hours_id: string;
    project_id: string;
    no_of_resources: number;
    hours: number;
    role_id: string;
    created_at: string;
    updated_at: string;
    status: boolean;
    department: IDepartment;
}

export interface IDepartment {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    status: boolean;
    resource?: IResource[];
}

export interface IResource {
    id: string;
    name: string;
    status: boolean;
    is_team_lead: boolean;
    department_id: string;
    show_in_calendar: boolean;
    is_atl: boolean;
    created_at: string;
    updated_at: string;
}

export interface IContractType {
    id: string;
    name: string;
    status: string;
    createdDate: string;
    updatedDate: string;
    color: string;
}

export interface IProductionCapacity {
    id: string;
    projectId: string;
    departmentId: string;
    monthKey: string; // "YYYY-MM"
    hours: number;
    createdAt?: string;
    updatedAt?: string;
    status?: boolean;
}

export interface IProjectConsumedHour {
    id: string;
    department_id: string;
    project_id: string;
    consumed_hours: number;
}

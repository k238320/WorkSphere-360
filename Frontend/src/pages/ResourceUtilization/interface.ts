export type ResourceUtilzation = ResourceUtilzationRes[];

export interface ResourceUtilzationRes {
    employement_code: string;
    id: string;
    name: string;
    email: string;
    resource: Resource;
    emp_leaves: EmpLefe[];
    workingHours?: number;
    resourceUtilization: string;
    per_date_allocation_count?: number;
    YearlyLeaveRecord?: IYearlyLeaveRecord[];
    emp_leaves_count?: any;
    user_details? : IUserDetails[];
}

export interface IYearlyLeaveRecord {
    id: string;
    user_id: string;
    year: number;
    total_leaves: number;
    availed_leaves: number;
    remaining_leaves: number;
    availed_wfh: number;
    createdAt: string;
    updatedAt: string;
}

export interface Resource {
    per_date_allocation: PerDateAllocation[];
    department: Department;
}

export interface PerDateAllocation {
    id: string;
    allocation_id?: string;
    resource_id: string;
    date: string;
    status: boolean;
    task_hours: number;
    is_leave?: boolean;
    is_holiday: boolean;
}

export interface Department {
    name: string;
}

export interface EmpLefe {
    id: string;
    applicationTypeId: string;
    leaveTypeId?: string;
    reason_rejection?: string;
    approvedBy?: string;
    leave_status?: string;
    start_date: string;
    end_date: string;
    leave_count: number;
    is_halfday: boolean;
    work_from_home: boolean;
    employement_code: string;
    resource_id: string;
    status: boolean;
    created_at: string;
    updated_at: string;
}



export interface IUserDetails {
  id: string
  user_id: string
  employment_status: string
  gender: string
  date_of_birth: string
  date_of_joining?: string
  CNIC: string
  phone_number: string
  personal_email_address: string
  emergency_relation_name: string
  emergency_contact: string
  address: string
  account_title: string
  bank_name: string
  account_number: string
  ibn_number: string
  resign_comment: string
  location_type_id: number
  resignation_status: boolean
  marital_status: string
  maternity_provision: boolean
  number_dependents: number
  family_details: FamilyDetail[]
  job_status: number
}

export interface FamilyDetail {
  cnic: string
  date_of_birth: string
  relationship: string
  family_detail: string
}
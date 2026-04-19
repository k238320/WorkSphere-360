export interface TemporaryDisableUserAllocationDto {
  allocation_id: string;
  start_date: string; // ISO string format date
  end_date: string; // ISO string format date
  reason?: string;
  taskid?: string;
  departmentid?: string;
  workhours?: number;
  lefthours?: number;
}

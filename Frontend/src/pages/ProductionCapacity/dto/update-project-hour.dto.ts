export interface UpdateProjectHourItemDto {
  projectId: string
  departmentId: string;
  monthKey: string; 
  hours: number;
}

export interface UpdateProjectHoursDto {
  updates: UpdateProjectHourItemDto[];
}

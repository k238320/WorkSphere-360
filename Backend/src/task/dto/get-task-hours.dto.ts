import { IsNotEmpty, IsString } from 'class-validator';

export class TaskHoursDto {
  @IsNotEmpty()
  @IsString()
  department_id: string;

  @IsNotEmpty()
  @IsString()
  project_id: string;
}

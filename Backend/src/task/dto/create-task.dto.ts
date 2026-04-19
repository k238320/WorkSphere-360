import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  // @IsString()
  department: any;

  // @IsNotEmpty()
  // @IsString()
  // resource_id: string;

  @IsNotEmpty()
  @IsString()
  project_id: string;

  @IsNotEmpty()
  @IsString()
  task_category_id: string;

  @IsNotEmpty()
  completion_date: any;

  @IsNotEmpty()
  @IsString()
  attachment: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  // @IsNotEmpty()
  // start_date: Date;

  // @IsNotEmpty()
  // end_date: Date;

  // @IsNotEmpty()
  // @IsNumber()
  // task_hours: number;

  // @IsNotEmpty()
  // @IsString()
  // task_status_id: string;
}

import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProjectHourDto {
  @IsNotEmpty()
  @IsString()
  modified_date: string;

  @IsNotEmpty()
  @IsString()
  department_id: string;

  @IsNotEmpty()
  @IsString()
  project_catgory_hours_id: string;

  @IsNumber()
  no_of_resources: number;

  @IsNotEmpty()
  @IsNumber()
  hours: number;

  @IsNotEmpty()
  @IsString()
  role_id: string;

  @IsNotEmpty()
  @IsString()
  project_id: string;
}

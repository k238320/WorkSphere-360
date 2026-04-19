import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProjectStatusDto {
  @IsNotEmpty()
  @IsString()
  porject_statuses_id: string;

  @IsNotEmpty()
  @IsString()
  project_status_category_id: string;

  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsNotEmpty()
  @IsString()
  project_id: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsOptional()
  days_delayed: number;
}

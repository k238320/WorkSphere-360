import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  kickoff_date: string;

  @IsString()
  project_plan: string;

  @IsString()
  project_srs: string;

  @IsNotEmpty()
  @IsArray()
  project_manager: any;

  @IsString()
  project_website: string;

  @IsString()
  go_live_date: string;

  @IsOptional()
  status_report: string;
}

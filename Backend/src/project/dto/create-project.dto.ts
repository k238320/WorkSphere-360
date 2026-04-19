import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  signed_document: string;

  @IsOptional()
  commercial_proposal: string;

  @IsOptional()
  technical_proposal: string;

  @IsOptional()
  status_report: string;

  @IsNotEmpty()
  @IsNumber()
  no_of_weeks: number;

  @IsNotEmpty()
  specific_timeline: string;

  @IsString()
  additional_documents: string;

  @IsNotEmpty()
  @IsString()
  brief_commitments: string;

  @IsNotEmpty()
  @IsNumber()
  dicsounted_cost: number;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  project_categories: any[];

  @IsNotEmpty()
  project_technology: any[];

  @IsNotEmpty()
  project_industry: any[];

  @IsNotEmpty()
  project_hours: any[];

  @IsNotEmpty()
  client_details: any[];

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsOptional()
  go_live_date: string;

  @IsOptional()
  project_win_date: any;

  @IsOptional()
  projectDivisionId: string;

  @IsOptional()
  mou_document?: string;

  @IsOptional()
  project_contract_type_id?: string;
}

// export class ProjectHours {
//   @IsNotEmpty()
//   @IsString()
//   modified_date: string;

//   @IsNotEmpty()
//   @IsString()
//   department_id: string;

//   @IsNotEmpty()
//   @IsString()
//   project_catgory_hours_id: string;

//   @IsNotEmpty()
//   @IsString()
//   no_of_resources: string;

//   @IsNotEmpty()
//   @IsString()
//   hours: string;

//   @IsNotEmpty()
//   @IsString()
//   role_id: string;
// }

import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class updateForSaleProjectDto {
  @IsNotEmpty()
  @IsString()
  project_id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  signed_document: string;

  @IsOptional()
  commercial_proposal: string;

  @IsOptional()
  status_report: string;

  @IsOptional()
  technical_proposal: string;

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

  @IsOptional()
  dicsounted_cost: number;

  @IsOptional()
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

  @IsOptional()
  project_win_date: any;

  @IsOptional()
  projectDivisionId: string;

  @IsOptional()
  mou_document?: string;

  @IsOptional()
  project_contract_type_id?: string;
}

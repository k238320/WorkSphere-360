import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProjectMilestoneDto {
  @IsNotEmpty()
  @IsString()
  milestone_phase_id: string;

  @IsNotEmpty()
  @IsNumber()
  milestone_payment: number;

  targeted_month: any;

  @IsNotEmpty()
  @IsString()
  project_id: string;

  @IsNotEmpty()
  @IsString()
  role_id: string;

  @IsNotEmpty()
  @IsString()
  user_id: string;
}

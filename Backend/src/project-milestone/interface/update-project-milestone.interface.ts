import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectMilestoneDto } from './create-project-milestone.interface';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateProjectMilestoneDto {
  @IsNotEmpty()
  @IsString()
  milestone_phase_id: string;

  @IsNotEmpty()
  @IsNumber()
  milestone_payment: number;

  targeted_month: string | null;

  @IsBoolean()
  invoice: boolean;

  invoice_date: string | null;

  @IsBoolean()
  payment_recieved: boolean;

  payment_recieved_date: string | null;

  milestone: any;

  onhold: any;
}

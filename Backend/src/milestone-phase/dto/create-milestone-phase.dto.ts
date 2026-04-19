import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class MilestonePhaseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsBoolean()
  status: boolean;
}

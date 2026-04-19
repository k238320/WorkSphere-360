import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCostDto {
  @IsNotEmpty()
  @IsNumber()
  department_wise_cost: number;

  @IsNotEmpty()
  @IsDate()
  start_date: Date;

  @IsNotEmpty()
  @IsString()
  department_id: string;
}

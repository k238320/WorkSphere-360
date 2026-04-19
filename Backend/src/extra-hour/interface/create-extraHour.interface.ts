import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class ExtraHourDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  hours: string;

  @IsOptional()
  @IsString()
  emp_code: string;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsString()
  start_time: string;

  @IsNotEmpty()
  @IsString()
  end_time: string;
}

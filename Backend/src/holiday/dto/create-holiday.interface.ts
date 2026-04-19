import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateHolidayDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  date: any;
}

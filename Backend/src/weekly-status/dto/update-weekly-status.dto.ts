import { PartialType } from '@nestjs/mapped-types';
import { CreateWeeklyStatusDto } from './create-weekly-status.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateWeeklyStatusDto extends PartialType(CreateWeeklyStatusDto) {
  @IsNotEmpty()
  @IsString()
  name: string;
}

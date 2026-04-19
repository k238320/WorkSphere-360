import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWeeklyStatusDto {
  @IsNotEmpty()
  @IsString()
  project_id: string;
  @IsNotEmpty()
  @IsString()
  commet: string;
  @IsNotEmpty()
  @IsString()
  user_id: string;
}

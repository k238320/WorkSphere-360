import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectCategoryHourDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectStatusCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsBoolean()
  status: boolean;
}

import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsBoolean()
  status: boolean;
}

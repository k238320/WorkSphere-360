import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class DepartmentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsBoolean()
  status: boolean;
}

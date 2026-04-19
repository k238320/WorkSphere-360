import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectStatusDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsBoolean()
  status: boolean;
}

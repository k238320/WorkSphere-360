import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateScreenDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  child: string;

  @IsNotEmpty()
  @IsString()
  route: string;

  @IsBoolean()
  status: boolean;
}

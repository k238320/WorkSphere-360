import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginUserInterface {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  isApp: boolean;
}

import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class JobfairUserInterface {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  fieldofInterest: string;

  @IsNotEmpty()
  @IsString()
  highestDegree: string;

  @IsNotEmpty()
  @IsString()
  jobFairLocation: string;
}

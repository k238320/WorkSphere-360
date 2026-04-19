import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDetailInterface {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  employment_status: string;

  @IsNotEmpty()
  @IsString()
  gender: string;

  @IsNotEmpty()
  @IsString()
  date_of_birth: string;

  @IsNotEmpty()
  @IsString()
  date_of_joining: string;

  @IsNotEmpty()
  @IsInt()
  phone_number: number;

  @IsNotEmpty()
  @IsString()
  CNIC: string;

  @IsNotEmpty()
  @IsString()
  personal_email_address: string;

  @IsNotEmpty()
  @IsString()
  emergency_relation_name: string;

  @IsNotEmpty()
  emergency_contact: number;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  account_title: string;

  @IsNotEmpty()
  @IsString()
  bank_name: string;

  @IsNotEmpty()
  account_number: number;

  number_dependents?: number;

  @IsNotEmpty()
  @IsString()
  ibn_number: string;

  @IsBoolean()
  resignation_status: boolean;

  @IsBoolean()
  @IsOptional()
  maternity_provision?: boolean;

  marital_status?: string;

  family_details: any;
}

import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDocsInterface {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsNotEmpty()
  @IsString()
  pay_slip: string;

  @IsNotEmpty()
  @IsString()
  cnic: string;

  @IsNotEmpty()
  @IsString()
  updated_resume: string;

  @IsNotEmpty()
  educational_documents: string[];

  @IsOptional()
  experience_letter?: string;

  @IsOptional()
  resignation_letter?: string;

  @IsOptional()
  power_picture?: string;
}

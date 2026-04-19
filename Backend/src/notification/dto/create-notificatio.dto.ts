import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsArray()
  reciever_ids: string[];

  @IsNotEmpty()
  @IsString()
  created_by: string;

  @IsNotEmpty()
  @IsString()
  link: string;
}

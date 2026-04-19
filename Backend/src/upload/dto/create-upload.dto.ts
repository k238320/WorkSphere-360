import { IsNotEmpty, IsString } from 'class-validator';
export class CreateUploadDto {
  @IsNotEmpty()
  folder: string;

  @IsNotEmpty()
  user_id: string;
}

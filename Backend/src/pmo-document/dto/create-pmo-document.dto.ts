import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreatePmoDocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  document_url: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskStatusDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

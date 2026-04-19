import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class IndustryInterface {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsBoolean()
  status: boolean;
}

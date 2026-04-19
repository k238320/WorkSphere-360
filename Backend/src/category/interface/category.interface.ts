import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CategoryInterface {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsBoolean()
  status: boolean;
}

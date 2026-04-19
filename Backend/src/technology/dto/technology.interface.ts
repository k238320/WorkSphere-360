import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class TechnologyInterface {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsBoolean()
  status: boolean;
}

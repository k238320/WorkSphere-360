import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
export class CreateResourceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  department_id: string;

  @IsBoolean()
  is_team_lead: boolean;

  @IsBoolean()
  status: boolean;

  @IsBoolean()
  is_atl:boolean;


}

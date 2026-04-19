import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  screens: any;

  @IsArray()
  module?: [
    {
      permission_id: string;
      module_id: string;
    },
  ];

  @IsBoolean()
  status: boolean;
}

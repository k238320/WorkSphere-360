import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssetCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}

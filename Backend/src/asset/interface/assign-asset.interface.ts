import {
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AssignAssetDto {
  @IsNotEmpty()
  @IsString()
  user_id: string;

  // @IsNotEmpty()
  // @IsString()
  // asset_category_id: string;

  @IsNotEmpty()
  @IsArray()
  asset_id: string[];
}

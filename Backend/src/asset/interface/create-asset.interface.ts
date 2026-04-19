import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AssetDto {
  //   @IsNotEmpty()
  //   @IsInt()
  //   asset_number: number;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  asset_category_id: string;

  @IsNotEmpty()
  @IsString()
  vendor_id: string;

  @IsNotEmpty()
  @IsInt()
  cost: number;

  @IsNotEmpty()
  @IsString()
  approved_by: string;

  @IsNotEmpty()
  purchased_date: any;

  @IsNotEmpty()
  warranty_expiration: any;

  @IsNotEmpty()
  @IsString()
  invoice: string;

  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsNotEmpty()
  @IsString()
  model_number: string;

  @IsOptional()
  @IsString()
  invoice2?: string;

  @IsNotEmpty()
  specification: any;
}

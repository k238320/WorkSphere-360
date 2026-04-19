import { IsString, IsNumber, IsNotEmpty, IsArray, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export class UpdateProjectHourItemDto {
  @IsString()
  @IsNotEmpty()
  projectId: string

  @IsString()
  @IsNotEmpty()
  departmentId: string

  @IsString() // Format like "YYYY-MM"
  @IsNotEmpty()
  monthKey: string

  @IsNumber()
  @IsNotEmpty()
  hours: number
}

export class UpdateProjectHoursDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProjectHourItemDto)
  updates: UpdateProjectHourItemDto[]
}

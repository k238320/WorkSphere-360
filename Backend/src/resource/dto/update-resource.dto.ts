import { PartialType } from '@nestjs/mapped-types';
import { CreateResourceDto } from './create-resource.dto';
import { IsBoolean } from 'class-validator';

export class UpdateResourceDto extends PartialType(CreateResourceDto) {
    @IsBoolean()
    show_in_calendar: boolean;
}

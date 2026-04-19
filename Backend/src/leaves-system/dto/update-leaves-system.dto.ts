import { PartialType } from '@nestjs/mapped-types';
import { CreateLeavesSystemDto } from './create-leaves-system.dto';

export class UpdateLeavesSystemDto extends PartialType(CreateLeavesSystemDto) {}

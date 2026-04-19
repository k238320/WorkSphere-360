import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDivisionDto } from './create-project-division.dto';

export class UpdateProjectDivisionDto extends PartialType(CreateProjectDivisionDto) {}

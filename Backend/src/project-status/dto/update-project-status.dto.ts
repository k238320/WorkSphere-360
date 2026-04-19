import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectStatusDto } from './create-project-status.dto';

export class UpdateProjectStatusDto extends PartialType(CreateProjectStatusDto) {}

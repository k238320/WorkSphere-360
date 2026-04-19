import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectStatusCategoryDto } from './create-project-status-category.dto';

export class UpdateProjectStatusCategoryDto extends PartialType(CreateProjectStatusCategoryDto) {}

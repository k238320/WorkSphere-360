import { Module } from '@nestjs/common';
import { ProjectCategoryHoursService } from './project-category-hours.service';
import { ProjectCategoryHoursController } from './project-category-hours.controller';

@Module({
  controllers: [ProjectCategoryHoursController],
  providers: [ProjectCategoryHoursService]
})
export class ProjectCategoryHoursModule {}

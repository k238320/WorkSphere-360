import { Module } from '@nestjs/common';
import { ProjectStatusCategoryService } from './project-status-category.service';
import { ProjectStatusCategoryController } from './project-status-category.controller';

@Module({
  controllers: [ProjectStatusCategoryController],
  providers: [ProjectStatusCategoryService]
})
export class ProjectStatusCategoryModule {}

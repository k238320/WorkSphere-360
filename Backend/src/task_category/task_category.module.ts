import { Module } from '@nestjs/common';
import { TaskCategoryService } from './task_category.service';
import { TaskCategoryController } from './task_category.controller';

@Module({
  controllers: [TaskCategoryController],
  providers: [TaskCategoryService]
})
export class TaskCategoryModule {}

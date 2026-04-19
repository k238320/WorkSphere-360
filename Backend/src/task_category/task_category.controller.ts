import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TaskCategoryService } from './task_category.service';
import { CreateTaskCategoryDto } from './dto/create-task_category.dto';
import { UpdateTaskCategoryDto } from './dto/update-task_category.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('task-category')
export class TaskCategoryController {
  constructor(private readonly taskCategoryService: TaskCategoryService) {}

  @Post()
  create(@Body() createTaskCategoryDto: CreateTaskCategoryDto) {
    return this.taskCategoryService.create(createTaskCategoryDto);
  }

  @Get()
  findAll() {
    return this.taskCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskCategoryService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskCategoryDto: UpdateTaskCategoryDto,
  ) {
    return this.taskCategoryService.update(id, updateTaskCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskCategoryService.remove(+id);
  }

  @Get('listing')
  listing(@Query() query: any) {
    return this.taskCategoryService.listing(query);
  }
}

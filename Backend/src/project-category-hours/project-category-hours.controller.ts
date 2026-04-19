import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProjectCategoryHoursService } from './project-category-hours.service';
import { CreateProjectCategoryHourDto } from './interface/create-project-category-hour.interface';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('project-category-hours')
export class ProjectCategoryHoursController {
  constructor(
    private readonly projectCategoryHoursService: ProjectCategoryHoursService,
  ) {}

  @Post()
  create(@Body() createProjectCategoryHourDto: CreateProjectCategoryHourDto) {
    return this.projectCategoryHoursService.create(
      createProjectCategoryHourDto,
    );
  }

  @Get()
  findAll() {
    return this.projectCategoryHoursService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectCategoryHoursService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectCategoryHourDto) {
    return this.projectCategoryHoursService.update(
      +id,
      updateProjectCategoryHourDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectCategoryHoursService.remove(+id);
  }
}

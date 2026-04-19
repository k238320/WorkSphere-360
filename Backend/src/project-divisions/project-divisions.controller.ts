import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectDivisionsService } from './project-divisions.service';
import { CreateProjectDivisionDto } from './dto/create-project-division.dto';
import { UpdateProjectDivisionDto } from './dto/update-project-division.dto';

@Controller('project-divisions')
export class ProjectDivisionsController {
  constructor(private readonly projectDivisionsService: ProjectDivisionsService) {}

  @Post()
  create(@Body() createProjectDivisionDto: CreateProjectDivisionDto) {
    return this.projectDivisionsService.create(createProjectDivisionDto);
  }

  @Get()
  findAll() {
    return this.projectDivisionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectDivisionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDivisionDto: UpdateProjectDivisionDto) {
    return this.projectDivisionsService.update(+id, updateProjectDivisionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectDivisionsService.remove(+id);
  }
}

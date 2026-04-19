import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ProjectHoursService } from './project-hours.service';
import { CreateProjectHourDto } from './interface/create-project-hour.interface';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('project-hours')
export class ProjectHoursController {
  constructor(private readonly projectHoursService: ProjectHoursService) {}

  @Post()
  create(@Body() dto: CreateProjectHourDto) {
    return this.projectHoursService.create(dto);
  }

  @Get(':id')
  findAll(@Param('id') id: string) {
    return this.projectHoursService.findAll(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProjectHourDto) {
    return this.projectHoursService.update(id, updateProjectHourDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectHoursService.remove(id);
  }
}

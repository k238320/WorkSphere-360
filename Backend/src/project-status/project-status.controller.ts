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
import { ProjectStatusService } from './project-status.service';
import { CreateProjectStatusDto } from './dto/create-project-status.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('project-status')
export class ProjectStatusController {
  constructor(private readonly projectStatusService: ProjectStatusService) {}

  @Post()
  create(@Body() dto: CreateProjectStatusDto) {
    return this.projectStatusService.create(dto);
  }

  @Get(':id')
  findAll(@Param('id') id: string) {
    return this.projectStatusService.findAll(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectStatusDto) {
    return this.projectStatusService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectStatusService.remove(id);
  }
}

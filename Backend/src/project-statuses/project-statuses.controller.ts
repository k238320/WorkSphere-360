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
import { ProjectStatusesService } from './project-statuses.service';
import { CreateProjectStatusDto } from './dto/create-project-status.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('project-statuses')
export class ProjectStatusesController {
  constructor(
    private readonly projectStatusesService: ProjectStatusesService,
  ) {}

  @Post()
  create(@Body() createProjectStatusDto: CreateProjectStatusDto) {
    return this.projectStatusesService.create(createProjectStatusDto);
  }

  @Get()
  findAll() {
    return this.projectStatusesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectStatusesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectStatusDto) {
    return this.projectStatusesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectStatusesService.remove(id);
  }

  @Get('listing')
  getForListing(@Query() query: any) {
    return this.projectStatusesService.getForListing(query);
  }
}

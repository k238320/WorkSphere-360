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
import { ProjectStatusCategoryService } from './project-status-category.service';
import { CreateProjectStatusCategoryDto } from './dto/create-project-status-category.dto';
import { UpdateProjectStatusCategoryDto } from './dto/update-project-status-category.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('project-status-category')
export class ProjectStatusCategoryController {
  constructor(
    private readonly projectStatusCategoryService: ProjectStatusCategoryService,
  ) {}

  @Post()
  create(
    @Body() createProjectStatusCategoryDto: CreateProjectStatusCategoryDto,
  ) {
    return this.projectStatusCategoryService.create(
      createProjectStatusCategoryDto,
    );
  }

  @Get()
  findAll() {
    return this.projectStatusCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectStatusCategoryService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectStatusCategoryDto) {
    return this.projectStatusCategoryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectStatusCategoryService.remove(id);
  }

  @Get('listing')
  getForListing(@Query() query: any) {
    return this.projectStatusCategoryService.getForListing(query);
  }
}

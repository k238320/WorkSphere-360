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
  Req,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { updateForSaleProjectDto } from './dto/update-forSale-project.dto';

@UseGuards(AuthGuard)
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body() createProjectDto: any, @Req() request: any) {
    return this.projectService.create(createProjectDto, request);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.projectService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: any) {
    return this.projectService.findOne(id, request);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @Req() request: any,
  ) {
    return this.projectService.update(id, dto, request);
  }

  @Put('/updateForSale')
  updateForSale(@Body() dto: updateForSaleProjectDto) {
    return this.projectService.updateForSale(dto);
  }

  @Get('/for-sale/:id')
  getForSale(@Param('id') id: string, @Req() request: any) {
    return this.projectService.getForSale(id, request);
  }

  @Get('/for-pm/:id')
  getForPM(@Param('id') id: string, @Req() request: any) {
    return this.projectService.getForPM(id, request);
  }

  @Get('/name/:id')
  getProjectName(@Param('id') id: string) {
    return this.projectService.getProjectName(id);
  }

  @Get('/listing')
  getForListing(@Query() query: any) {
    return this.projectService.getForListing(query);
  }

  @Get('/projectHours')
  projectHours(@Query() query: any, @Req() request: any) {
    return this.projectService.projectHours(request, query);
  }

  // @Get('/permission')
  // permission(@Query() query: any) {
  //   return this.projectService.permission(query);
  // }

  @Get('/overallProfitability')
  overallProfitability(@Query() query: any, @Req() request: any) {
    return this.projectService.overallProfitability(query.name);
  }

  @Get('/getProjectDetails')
  getProjectDetails(@Query() query: any, @Req() request: any) {
    return this.projectService.getProjectDetails(query.projectId);
  }

  @Get('/ProjectTrackers')
  ProjectTrackers(@Query() query: any, @Req() request: any) {
    return this.projectService.ProjectTrackers(query, request);
  }

  @Get('/getSalesTargetData')
  getSalesTargetData(@Query() query: any, @Req() request: any) {
    return this.projectService.getSalesTargetData(query, request);
  }


  @Get('/projectRecord')
  projectRecord() {
    return this.projectService.projectRecord();
  }

  @Get('ensure-status')
  async ensureProjectStatuses() {
    await this.projectService.createDefaultStatusForProjects();
    return { message: 'Project statuses ensured.' };
  }
}

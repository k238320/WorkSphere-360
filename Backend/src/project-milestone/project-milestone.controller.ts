import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
  Patch,
  Req,
} from '@nestjs/common';
import { ProjectMilestoneService } from './project-milestone.service';
import { CreateProjectMilestoneDto } from './interface/create-project-milestone.interface';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('project-milestone')
export class ProjectMilestoneController {
  constructor(
    private readonly projectMilestoneService: ProjectMilestoneService,
  ) {}

  @Post()
  create(@Body() createProjectMilestoneDto: any) {
    return this.projectMilestoneService.create(createProjectMilestoneDto);
  }

  @Get()
  findAll(@Query() query) {
    return this.projectMilestoneService.findAll(query);
  }

  @Get(':projectId')
  findOne(@Param('projectId') projectId: string) {
    return this.projectMilestoneService.findOne(projectId);
  }

  @Get('info/:projectId')
  getTargetMonthHistry(@Param('projectId') projectId: string) {
    return this.projectMilestoneService.getTargetMonthHistry(projectId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.projectMilestoneService.update(id, dto);
  }

  @Patch(':id')
  updateTargetMonth(@Param('id') id: string, @Body() dto: any) {
    return this.projectMilestoneService.updateTargetMonth(id, dto);
  }

  @Patch('onhold/:id')
  updateOnHold(@Param('id') id: string, @Body() dto: any) {
    return this.projectMilestoneService.updateOnHold(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectMilestoneService.remove(id);
  }

  @Get('milestoneDashboadCount')
  milestoneDashboadCount(@Query() query, @Req() request: any) {
    return this.projectMilestoneService.milestoneDashboardCountPaymentWise(
      query,
      request,
    );
  }

  @Get('milestoneDashboardCountInvoiceWise')
  milestoneDashboardCountInvoiceWise(@Query() query, @Req() request: any) {
    return this.projectMilestoneService.milestoneDashboardCountInvoiceWise(
      query,
      request,
    );
  }
}

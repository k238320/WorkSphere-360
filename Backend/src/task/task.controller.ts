import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskHoursDto } from './dto/get-task-hours.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { TemporaryDisableUserAllocationDto } from './dto/TemporaryDisableUserAllocationDto';
import { handlePrismaError } from 'src/utils';
@UseGuards(AuthGuard)
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Req() request: any) {
    return this.taskService.create(createTaskDto, request);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.taskService.findAll(query);
  }

  @Get('detail/:id')
  taskDetails(@Param('id') id: string, @Req() request: any) {
    return this.taskService.taskDetails(id, request);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: any) {
    return this.taskService.findOne(id, request);
  }

  @Get('/name/:id')
  getTaskName(@Param('id') id: string) {
    return this.taskService.getTaskName(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(id, updateTaskDto);
  }

  @Delete(':task_id')
  remove(@Param('task_id') task_id: string, @Req() request: any) {
    return this.taskService.remove(task_id, request);
  }

  @Put('task-completion/:id')
  taskCompletion(@Param('id') id: string) {
    return this.taskService.taskCompletion(id);
  }

  @Get('hours-detail')
  getHourDetails(@Query() query: TaskHoursDto) {
    return this.taskService.getHourDetails(query);
  }

  @Post('allocation')
  createAllocation(@Body() dto: any, @Req() request: any) {
    return this.taskService.createAllocation(dto, request);
  }

  @Put('disable-allocation')
  disableUserAllocation(@Body() dto: any) {
    return this.taskService.disableUserAllocation(dto);
  }

  @Put('update-completion')
  updateAllocationCompletion(@Body() dto: any) {
    return this.taskService.updateAllocationCompletion(dto);
  }

  @Get('allocation/:task_id/:department_id')
  getAllocations(@Param() params: any) {
    return this.taskService.getAllocations(
      params?.task_id,
      params?.department_id,
    );
  }

  @Get('pmallocation/:task_id/:department_ids')
  getPmAllocations(@Param() params: any, @Req() request: any) {
    return this.taskService.getPmAllocations(
      params?.task_id,
      params?.department_ids,
      request,
    );
  }

  @Post('comments/:task_id')
  postMessage(@Param() params: any, @Body() comment: any, @Req() request: any) {
    return this.taskService.postComments(params?.task_id, comment, request);
  }
  @Get('comments/:task_id')
  getComments(@Param() params: any) {
    return this.taskService.getComments(params?.task_id);
  }

  @Get('task-calendar')
  getTaskForCalendar(@Query() query: any, @Req() request: any) {
    return this.taskService.getTaskForCalendar(query, request);
  }

  @Get('count')
  count() {
    return this.taskService.count();
  }

  @Get('allocation/listing')
  allocationListing(@Query() query: any, @Req() request: any) {
    return this.taskService.allocationListing(query, request);
  }

  @Get('allocation/tabs')
  taskTabs() {
    return this.taskService.taskTabs();
  }

  @Post('temporary-disable')
  async temporaryDisableUserAllocation(
    @Body() dto: TemporaryDisableUserAllocationDto,
  ) {
    return await this.taskService.temporaryDisableUserAllocation(dto);
  }

  @Put('allocation/:id')
  updateAllocation(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.taskService.updateAllocation(id, dto, req);
  }
}

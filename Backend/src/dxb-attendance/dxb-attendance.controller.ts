import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DxbAttendanceService } from './dxb-attendance.service';
import { CreateDxbAttendanceDto } from './dto/create-dxb-attendance.dto';
import { UpdateDxbAttendanceDto } from './dto/update-dxb-attendance.dto';

@Controller('dxb-attendance')
export class DxbAttendanceController {
  constructor(private readonly dxbAttendanceService: DxbAttendanceService) {}

  @Post()
  create(@Body() createDxbAttendanceDto: CreateDxbAttendanceDto) {
    return this.dxbAttendanceService.create(createDxbAttendanceDto);
  }

  @Get()
  findAll() {
    return this.dxbAttendanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dxbAttendanceService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDxbAttendanceDto: UpdateDxbAttendanceDto,
  ) {
    return this.dxbAttendanceService.update(+id, updateDxbAttendanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dxbAttendanceService.remove(+id);
  }

  @Get('markLateCronJob')
  markLateCronJob() {
    return this.dxbAttendanceService.markLateCronJob();
  }
  @Get('markHalfdayOffCroneJob')
  markHalfdayOffCroneJob() {
    return this.dxbAttendanceService.markHalfdayOffCroneJob();
  }

  @Get('markFulldayOffCroneJob')
  markFulldayOffCroneJob() {
    return this.dxbAttendanceService.markFulldayOffCroneJob();
  }
}

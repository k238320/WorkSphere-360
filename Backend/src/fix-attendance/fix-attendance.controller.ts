import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FixAttendanceService } from './fix-attendance.service';
import { CreateFixAttendanceDto } from './dto/create-fix-attendance.dto';
import { UpdateFixAttendanceDto } from './dto/update-fix-attendance.dto';

@Controller('fix-attendance')
export class FixAttendanceController {
  constructor(private readonly fixAttendanceService: FixAttendanceService) {}

  @Post()
  create(@Body() createFixAttendanceDto: CreateFixAttendanceDto) {
    return this.fixAttendanceService.create(createFixAttendanceDto);
  }

  @Get()
  findAll() {
    return this.fixAttendanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fixAttendanceService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFixAttendanceDto: UpdateFixAttendanceDto,
  ) {
    return this.fixAttendanceService.update(+id, updateFixAttendanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fixAttendanceService.remove(+id);
  }

  @Get('employePunchingInCroneJob')
  employePunchingInCroneJob(@Query() query: any) {
    return this.fixAttendanceService.employePunchingInCroneJob(query.date);
  }

  @Get('employePunchingOutCroneJob')
  employePunchingOutCroneJob(@Query() query: any) {
    return this.fixAttendanceService.employePunchingOutCroneJob(query.date);
  }

  @Get('manageDailyAttendance')
  manageDailyAttendance(@Query() query: any) {
    return this.fixAttendanceService.manageDailyAttendance(query.date);
  }

  @Get('updateAllEmployeeDeductions')
  updateAllEmployeeDeductions(@Query() query: any) {
    return this.fixAttendanceService.updateAllEmployeeDeductions();
  }

  @Get('manageSingleEmployeeAttendanceTags')
  manageSingleEmployeeAttendanceTags(@Query() query: any) {
    return this.fixAttendanceService.manageSingleEmployeeAttendanceTags(
      query.startDate,
      query.endDate,
    );
  }
}

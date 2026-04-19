import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  create(@Body() dto: any, @Req() request: any) {
    return this.attendanceService.create(dto, request);
  }
  @Post('approveLeave')
  approveLeave(@Body() dto: any, @Req() request: any) {
    return this.attendanceService.approveLeave(dto, request);
  }

  @Post('addComment')
  AddComment(@Body() dto: any, @Req() request: any) {
    return this.attendanceService.AddComment(dto, request);
  }

  @Post('commentStatus')
  CommentApprove(@Body() dto: any) {
    return this.attendanceService.CommentStatus(dto);
  }

  @Get()
  findAll(@Query() query: any, @Req() request: any) {
    return this.attendanceService.findAll(query, request);
  }
  @Get('verifyLeave')
  verifyLeave(@Query() query: any, @Req() request: any) {
    return this.attendanceService.verifyLeave(query);
  }

  @Get('listing')
  listing(@Query() query: any, @Req() request: any) {
    return this.attendanceService.listing(query, request);
  }

  @Get('yearlyRecord')
  yearlyRecord(@Query() query: any, @Req() request: any) {
    return this.attendanceService.yearlyRecord(query);
  }

  @Get('markLateCronJob')
  markLateCronJob() {
    return this.attendanceService.markLateCronJob();
  }

  @Get('markHalfdayOffCroneJob')
  markHalfdayOffCroneJob() {
    return this.attendanceService.markHalfdayOffCroneJob();
  }

  @Get('markFulldayOffCroneJob')
  markFulldayOffCroneJob() {
    return this.attendanceService.markFulldayOffCroneJob();
  }

  @Get('remaining-leaves')
  getRemainingLeaves(@Query() query: any, @Req() request: any) {
    return this.attendanceService.getRemainingLeaves(query, request);
  }

  @Get('getRemainingLeaves')
  addLeavesToEmploye(@Query() query: any, @Req() request: any) {
    return this.attendanceService.addLeavesToEmploye();
  }

  @Get('adjust-existing-data')
  async adjustExistingData() {
    return this.attendanceService.adjustExistingData();
  }

  @Post('fix-attendance')
  fixAttendance(@Body() dto: any) {
    return this.attendanceService.fixAttendance(dto);
  }

  @Post('fix-monthly-deduction')
  fixMonthlyDeduction(@Body() dto: any) {
    return this.attendanceService.fixMonthlyDeduction(dto);
  }

  @Get('deleteFulldayOffs')
  deleteFulldayOffs(@Query() query: any) {
    return this.attendanceService.deleteFulldayOffs(
      query.start_date,
      query.end_date,
    );
  }
  @Get('deleteHalfdayOffs')
  deleteHalfdayOffs(@Query() query: any) {
    return this.attendanceService.deleteHalfdayOffs(
      query.start_date,
      query.end_date,
    );
  }
  @Get('deleteLatedayOffs')
  deleteLatedayOffs(@Query() query: any) {
    return this.attendanceService.deleteLatedayOffs(
      query.start_date,
      query.end_date,
    );
  }
  @Get('deleteFulldayOffs2')
  deleteFulldayOffs2(@Query() query: any) {
    return this.attendanceService.deleteFulldayOffs2(
      query.start_date,
      query.end_date,
    );
  }

  @Get('updateLateDeductions')
  updateLateDeductions(@Query() query: any) {
    return this.attendanceService.updateLateDeductions(query?.emp_code);
  }

  @Get('dashboardOverViewCount')
  dashboardOverViewCount(@Query() query: any, @Req() request: any) {
    return this.attendanceService.dashboardOverViewCount(query, request);
  }

  @Get('SendAttendanceToHREmail')
  SendAttendanceToHREmail() {
    return this.attendanceService.SendAttendanceToHREmail();
  }


  @Get('SendAttendanceWarningToEmployees')
  SendAttendanceWarningToEmployees() {
    return this.attendanceService.SendAttendanceWarningToEmployees();
  }
}

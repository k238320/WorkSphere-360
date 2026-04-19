import { Module } from '@nestjs/common';
import { FixAttendanceService } from './fix-attendance.service';
import { FixAttendanceController } from './fix-attendance.controller';
import { AttendanceService } from 'src/attendance/attendance.service';
import { LeaveCreateService } from 'src/attendance/helperServices/leave-create.service';
import { LeaveApproveService } from 'src/attendance/helperServices/leave-approve.service';
import { LeaveRejectService } from 'src/attendance/helperServices/leave-reject.service';
import { DashboardOverview } from 'src/attendance/helperServices/dashboard';

@Module({
  controllers: [FixAttendanceController],
  providers: [
    FixAttendanceService,
    AttendanceService,
    LeaveCreateService,
    LeaveApproveService,
    LeaveRejectService,
    DashboardOverview,
  ],
})
export class FixAttendanceModule {}

import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { LeaveCreateService } from './helperServices/leave-create.service';
import { LeaveApproveService } from './helperServices/leave-approve.service';
import { LeaveRejectService } from './helperServices/leave-reject.service';
import { DashboardOverview } from './helperServices/dashboard';

@Module({
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    LeaveCreateService,
    LeaveApproveService,
    LeaveRejectService,
    DashboardOverview,
  ],
})
export class AttendanceModule {}

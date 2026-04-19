import { Module } from '@nestjs/common';
import { PortalWfhService } from './portal-wfh.service';
import { PortalWfhController } from './portal-wfh.controller';
import { AttendanceService } from 'src/attendance/attendance.service';
import { LeaveApproveService } from 'src/attendance/helperServices/leave-approve.service';
import { LeaveCreateService } from 'src/attendance/helperServices/leave-create.service';
import { LeaveRejectService } from 'src/attendance/helperServices/leave-reject.service';
import { DashboardOverview } from 'src/attendance/helperServices/dashboard';

@Module({
  controllers: [PortalWfhController],
  providers: [
    PortalWfhService,
    AttendanceService,
    LeaveCreateService,
    LeaveApproveService,
    LeaveRejectService,
    DashboardOverview,
  ],
})
export class PortalWfhModule {}

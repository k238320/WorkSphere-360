import { Module } from '@nestjs/common';
import { DxbAttendanceService } from './dxb-attendance.service';
import { DxbAttendanceController } from './dxb-attendance.controller';

@Module({
  controllers: [DxbAttendanceController],
  providers: [DxbAttendanceService],
})
export class DxbAttendanceModule {}

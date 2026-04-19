import { Module } from '@nestjs/common';
import { WeeklyStatusService } from './weekly-status.service';
import { WeeklyStatusController } from './weekly-status.controller';

@Module({
  controllers: [WeeklyStatusController],
  providers: [WeeklyStatusService]
})
export class WeeklyStatusModule {}

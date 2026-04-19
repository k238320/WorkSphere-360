import { Module } from '@nestjs/common';
import { PmStatusService } from './pm-status.service';
import { PmStatusController } from './pm-status.controller';

@Module({
  controllers: [PmStatusController],
  providers: [PmStatusService],
})
export class PmStatusModule {}

import { Module } from '@nestjs/common';
import { MilestonePhaseService } from './milestone-phase.service';
import { MilestonePhaseController } from './milestone-phase.controller';

@Module({
  controllers: [MilestonePhaseController],
  providers: [MilestonePhaseService]
})
export class MilestonePhaseModule {}

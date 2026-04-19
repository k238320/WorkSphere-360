import { Module } from '@nestjs/common';
import { LeavesSystemService } from './leaves-system.service';
import { LeavesSystemController } from './leaves-system.controller';

@Module({
  controllers: [LeavesSystemController],
  providers: [LeavesSystemService],
})
export class LeavesSystemModule {}

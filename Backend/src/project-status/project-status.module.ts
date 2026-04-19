import { Module } from '@nestjs/common';
import { ProjectStatusService } from './project-status.service';
import { ProjectStatusController } from './project-status.controller';

@Module({
  controllers: [ProjectStatusController],
  providers: [ProjectStatusService]
})
export class ProjectStatusModule {}

import { Module } from '@nestjs/common';
import { ProjectMilestoneService } from './project-milestone.service';
import { ProjectMilestoneController } from './project-milestone.controller';

@Module({
  controllers: [ProjectMilestoneController],
  providers: [ProjectMilestoneService]
})
export class ProjectMilestoneModule {}

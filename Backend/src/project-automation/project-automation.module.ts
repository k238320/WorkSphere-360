import { Module } from '@nestjs/common';
import { ProjectAutomationService } from './project-automation.service';
import { ProjectAutomationController } from './project-automation.controller';

@Module({
  controllers: [ProjectAutomationController],
  providers: [ProjectAutomationService],
})
export class ProjectAutomationModule {}

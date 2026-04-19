import { Module } from '@nestjs/common';
import { ProjectHoursService } from './project-hours.service';
import { ProjectHoursController } from './project-hours.controller';

@Module({
  controllers: [ProjectHoursController],
  providers: [ProjectHoursService]
})
export class ProjectHoursModule {}

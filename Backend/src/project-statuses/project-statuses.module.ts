import { Module } from '@nestjs/common';
import { ProjectStatusesService } from './project-statuses.service';
import { ProjectStatusesController } from './project-statuses.controller';

@Module({
  controllers: [ProjectStatusesController],
  providers: [ProjectStatusesService]
})
export class ProjectStatusesModule {}

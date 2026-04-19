import { Module } from '@nestjs/common';
import { ProjectDivisionsService } from './project-divisions.service';
import { ProjectDivisionsController } from './project-divisions.controller';

@Module({
  controllers: [ProjectDivisionsController],
  providers: [ProjectDivisionsService],
})
export class ProjectDivisionsModule {}

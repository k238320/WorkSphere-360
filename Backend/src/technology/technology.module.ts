import { Module } from '@nestjs/common';
import { TechnologyService } from './technology.service';
import { TechnologyController } from './technology.controller';

@Module({
  controllers: [TechnologyController],
  providers: [TechnologyService]
})
export class TechnologyModule {}

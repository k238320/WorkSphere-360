import { Module } from '@nestjs/common';
import { WFHService } from './wfh.service';
import { WFHController } from './wfh.controller';

@Module({
  providers: [WFHService],
  controllers: [WFHController],
})
export class WFHModule {}

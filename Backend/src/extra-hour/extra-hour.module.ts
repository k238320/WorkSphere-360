import { Module } from '@nestjs/common';

import { ExtraHourController } from './extra-hour.controller';
import { ExtraHourService } from './extra-hour.service';

@Module({
  controllers: [ExtraHourController],
  providers: [ExtraHourService],
})
export class ExtraHourModule {}

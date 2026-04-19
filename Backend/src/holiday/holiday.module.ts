import { Module } from '@nestjs/common';
import { HolidayService } from './holiday.serviece';
import { HolidayController } from './holiday.controller';

@Module({
  controllers: [HolidayController],
  providers: [HolidayService],
})
export class HolidayModule {}

import { Module } from '@nestjs/common';
import { ProductionCapacityService } from './production-capacity.service';
import { ProductionCapacityController } from './production-capacity.controller';

@Module({
  controllers: [ProductionCapacityController],
  providers: [ProductionCapacityService],
})
export class ProductionCapacityModule {}

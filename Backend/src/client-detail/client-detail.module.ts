import { Module } from '@nestjs/common';
import { ClientDetailService } from './client-detail.service';
import { ClientDetailController } from './client-detail.controller';

@Module({
  controllers: [ClientDetailController],
  providers: [ClientDetailService]
})
export class ClientDetailModule {}

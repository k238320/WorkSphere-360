import { Module } from '@nestjs/common';
import { ExternalController } from './external.controller';
import { ExternalService } from './external.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ExternalController],
  providers: [ExternalService, PrismaService],
})
export class ExternalModule {}

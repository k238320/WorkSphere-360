import { Module } from '@nestjs/common';
import { PmoDocumentService } from './pmo-document.service';
import { PmoDocumentController } from './pmo-document.controller';

@Module({
  controllers: [PmoDocumentController],
  providers: [PmoDocumentService],
})
export class PmoDocumentModule {}

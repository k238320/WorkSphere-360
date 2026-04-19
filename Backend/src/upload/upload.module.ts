import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { WFHService } from 'src/wfh/wfh.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, WFHService],
})
export class UploadModule {}

import { Module } from '@nestjs/common';
import { UserDetailService } from './user-detail.service';
import { UserDetailController } from './user-detail.controller';
import { AddUpdateService } from './HelperServices/add-update.service';
import { EmploymentCodeService } from './HelperServices/employment-code.service';

@Module({
  controllers: [UserDetailController],
  providers: [UserDetailService, EmploymentCodeService, AddUpdateService],
})
export class UserDetailModule {}

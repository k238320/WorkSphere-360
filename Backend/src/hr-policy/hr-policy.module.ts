import { Module } from '@nestjs/common';
import { HrPolicyService } from './hr-policy.service';
import { HrPolicyController } from './hr-policy.controller';

@Module({
  controllers: [HrPolicyController],
  providers: [HrPolicyService],
})
export class HrPolicyModule {}

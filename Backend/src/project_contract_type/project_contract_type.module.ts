import { Module } from '@nestjs/common';
import { ProjectContractTypeService } from './project_contract_type.service';
import { ProjectContractTypeController } from './project_contract_type.controller';

@Module({
  controllers: [ProjectContractTypeController],
  providers: [ProjectContractTypeService],
})
export class ProjectContractTypeModule {}

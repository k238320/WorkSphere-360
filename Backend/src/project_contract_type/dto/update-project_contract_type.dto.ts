import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectContractTypeDto } from './create-project_contract_type.dto';

export class UpdateProjectContractTypeDto extends PartialType(CreateProjectContractTypeDto) {}

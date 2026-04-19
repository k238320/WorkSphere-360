import { PartialType } from '@nestjs/mapped-types';
import { CreatePortalWfhDto } from './create-portal-wfh.dto';

export class UpdatePortalWfhDto extends PartialType(CreatePortalWfhDto) {}

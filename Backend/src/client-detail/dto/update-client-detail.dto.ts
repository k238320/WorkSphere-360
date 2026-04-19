import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDetailDto } from './create-client-detail.dto';

export class UpdateClientDetailDto extends PartialType(CreateClientDetailDto) {}

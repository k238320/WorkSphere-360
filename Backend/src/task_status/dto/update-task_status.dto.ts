import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskStatusDto } from './create-task_status.dto';

export class UpdateTaskStatusDto extends PartialType(CreateTaskStatusDto) {}

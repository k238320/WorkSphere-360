import { PartialType } from '@nestjs/mapped-types';
import { CreateDxbAttendanceDto } from './create-dxb-attendance.dto';

export class UpdateDxbAttendanceDto extends PartialType(CreateDxbAttendanceDto) {}

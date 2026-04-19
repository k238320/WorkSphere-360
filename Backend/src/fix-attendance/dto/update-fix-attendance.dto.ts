import { PartialType } from '@nestjs/mapped-types';
import { CreateFixAttendanceDto } from './create-fix-attendance.dto';

export class UpdateFixAttendanceDto extends PartialType(CreateFixAttendanceDto) {}

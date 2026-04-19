import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LeaveRejectService {
  constructor(private readonly prisma: PrismaService) {}

  async rejectLeave(dto: any, user: any, start_date: string, end_date: string) {
    const response = await this.updateLeaveStatus(
      dto,
      user,
      start_date,
      end_date,
      'REJECTED',
    );
    await this.removeAttendanceRecord(dto, start_date, end_date);
    await this.updateYearlyLeaveRecordForReject(dto, response.count);
  }

  async updateLeaveStatus(
    dto: any,
    user: any,
    start_date: string,
    end_date: string,
    status: any,
  ) {
    let count;
    if (dto?.leaveTypeId == '6' || dto?.leaveTypeId == '5') {
      count = await this.prisma.emp_leaves.updateMany({
        where: {
          employement_code: dto?.employement_code,
          leaveTypeId: dto?.leaveTypeId,
          leave_status: 'PENDING',
        },
        data: {
          reason_rejection: dto.reason,
          leave_status: status,
          approvedBy: user.id,
        },
      });
    } else {
      count = await this.prisma.emp_leaves.updateMany({
        where: {
          employement_code: dto?.employement_code,
          start_date: { gte: start_date },
          end_date: { lte: end_date },
          leave_status: 'PENDING',
        },
        data: {
          reason_rejection: dto.reason,
          leave_status: status,
          approvedBy: user.id,
        },
      });
    }

    return count;
  }

  async removeAttendanceRecord(dto: any, start_date: string, end_date: string) {
    let count;
    if (dto?.leaveTypeId == '5') {
      const leave = await this.prisma.emp_leaves.findFirst({
        where: {
          employement_code: dto?.employement_code,
          leaveTypeId: dto?.leaveTypeId,
          leave_status: 'PENDING',
        },
        orderBy: {
          end_date: 'asc',
        },
      });
      const LastLeave = await this.prisma.emp_leaves.findFirst({
        where: {
          employement_code: dto?.employement_code,
          leaveTypeId: dto?.leaveTypeId,
          leave_status: 'PENDING',
        },
        orderBy: {
          end_date: 'desc',
        },
      });
      return this.prisma.emp_attendance.deleteMany({
        where: {
          emp_code: dto?.employement_code,
          created_at: { gte: leave.start_date, lte: LastLeave.end_date },
        },
      });
    } else if (dto?.leaveTypeId == '6') {
      const leave = await this.prisma.emp_leaves.findFirst({
        where: {
          employement_code: dto?.employement_code,
          leaveTypeId: dto?.leaveTypeId,
          applicationTypeId: '1',
          leave_status: 'PENDING',
        },
        orderBy: {
          end_date: 'asc',
        },
      });
      const LastLeave = await this.prisma.emp_leaves.findFirst({
        where: {
          employement_code: dto?.employement_code,
          leaveTypeId: dto?.leaveTypeId,
          applicationTypeId: '1',
          leave_status: 'PENDING',
        },
        orderBy: {
          end_date: 'desc',
        },
      });
      if (leave) {
        const deleteLeave = await this.prisma.emp_attendance.deleteMany({
          where: {
            emp_code: dto?.employement_code,
            created_at: { gte: leave.start_date, lte: LastLeave.end_date },
          },
        });
      }
      const wfh = await this.prisma.emp_leaves.findFirst({
        where: {
          employement_code: dto?.employement_code,
          leaveTypeId: dto?.leaveTypeId,
          applicationTypeId: '2',
          leave_status: 'PENDING',
        },
        orderBy: {
          end_date: 'asc',
        },
      });
      const LastWfh = await this.prisma.emp_leaves.findFirst({
        where: {
          employement_code: dto?.employement_code,
          leaveTypeId: dto?.leaveTypeId,
          applicationTypeId: '2',
          leave_status: 'PENDING',
        },
        orderBy: {
          end_date: 'desc',
        },
      });
      if (wfh) {
        const deleteWfh = this.prisma.emp_attendance.deleteMany({
          where: {
            emp_code: dto?.employement_code,
            created_at: { gte: wfh.start_date, lte: LastWfh.end_date },
          },
        });
      }
    } else {
      return this.prisma.emp_attendance.deleteMany({
        where: {
          emp_code: dto?.employement_code,
          created_at: { gte: start_date, lte: end_date },
          is_leave: true,
        },
      });
    }
  }

  async updateYearlyLeaveRecordForReject(dto: any, responseCount: number) {
    const currentYear = new Date().getFullYear();
    const existingYearlyLeaveRecord =
      await this.prisma.yearlyLeaveRecord.findFirst({
        where: { user_id: dto?.employee.id, year: currentYear },
        include: { monthly_records: true },
      });

    if (dto.leaveTypeId == '5') {
      await this.prisma.yearlyLeaveRecord.update({
        where: { id: existingYearlyLeaveRecord.id },
        data: {
          maternity_leaves: 0,
          maternity_wfh_availed: 0,
        },
      });
    } else if (dto.leaveTypeId == '6') {
      await this.prisma.yearlyLeaveRecord.update({
        where: { id: existingYearlyLeaveRecord.id },
        data: {
          paternity_leaves: 0,
        },
      });
    } else {
      let {
        availed_leaves = 0,
        remaining_leaves = 0,
        availed_wfh = 0,
      } = existingYearlyLeaveRecord || {};

      if (dto?.applicationTypeId == 2) {
        availed_wfh -= dto?.is_halfday ? 0.5 : 1;
      } else {
        availed_leaves -= dto?.is_halfday ? responseCount * 0.5 : responseCount;
      }

      if (existingYearlyLeaveRecord) {
        const totalDeductions =
          existingYearlyLeaveRecord.monthly_records.reduce(
            (acc, entry) => acc + (entry.deduction_leaves || 0),
            0,
          );
        const updatedRemainingLeaves =
          existingYearlyLeaveRecord.total_leaves -
          totalDeductions -
          availed_leaves;

        await this.prisma.yearlyLeaveRecord.update({
          where: { id: existingYearlyLeaveRecord.id },
          data: {
            availed_leaves,
            availed_wfh,
            remaining_leaves: updatedRemainingLeaves,
          },
        });
      }
    }
  }
}

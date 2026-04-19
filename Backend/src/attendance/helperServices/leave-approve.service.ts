import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from 'src/notification/dto/create-notificatio.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { sendNotification } from 'src/utils/helper';

@Injectable()
export class LeaveApproveService {
  constructor(private readonly prisma: PrismaService) {}

  async approveLeaveRequest(
    dto: any,
    user: any,
    start_date: string,
    end_date: string,
  ) {
    await this.updateAttendanceRecords(dto, start_date, end_date);
    await this.updateLeaveStatus(dto, user, start_date, end_date, 'APPROVED');
    const leaveRecords = await this.fetchLeaveRecords(
      dto,
      start_date,
      end_date,
    );
    await this.handlePerDayAllocations(
      dto,
      user,
      leaveRecords,
      start_date,
      end_date,
    );
  }

  async updateAttendanceRecords(
    dto: any,
    start_date: string,
    end_date: string,
  ) {
    if (dto.employement_code) {
      const user = await this.prisma.user.findFirst({
        where: { employement_code: dto.employement_code },
      });

      const attendanceRecords = await this.prisma.emp_attendance.findMany({
        where: {
          emp_code: dto.employement_code?.toString(),
          created_at: { gte: start_date, lte: end_date },
          OR: [{ is_late: true }, { is_halfday: true }, { is_fullday: true }],
        },
      });

      let totalDeduction = 0;
      let lateCount = 0;

      attendanceRecords.forEach((record) => {
        if (record.is_fullday) {
          totalDeduction += 1;
        } else if (record.is_halfday) {
          totalDeduction += 0.5;
        } else if (record.is_late) {
          lateCount += 1;
        }
      });

      await this.prisma.emp_attendance.deleteMany({
        where: {
          emp_code: dto.employement_code?.toString(),
          created_at: { gte: start_date, lte: end_date },
          OR: [{ is_late: true }, { is_halfday: true }, { is_fullday: true }],
        },
      });

      if (user?.id) {
        const existingYearlyLeaveRecord =
          await this.prisma.yearlyLeaveRecord.findFirst({
            where: { user_id: user.id, year: new Date().getFullYear() },
            include: { monthly_records: true },
          });

        if (existingYearlyLeaveRecord) {
          let totalLeaveDeduction = 0;

          for (const monthlyRecord of existingYearlyLeaveRecord.monthly_records) {
            const monthStartDate = new Date(
              new Date().getFullYear(),
              monthlyRecord.month - 1,
              1,
            );
            const monthEndDate = new Date(
              new Date().getFullYear(),
              monthlyRecord.month,
              0,
            );

            const dateRangeStart = new Date(start_date);
            const dateRangeEnd = new Date(end_date);

            if (
              monthEndDate >= dateRangeStart &&
              monthStartDate <= dateRangeEnd
            ) {
              const matchingAttendanceRecords = attendanceRecords.filter(
                (record) => {
                  const recordDate = new Date(record.created_at);
                  return (
                    recordDate >= monthStartDate && recordDate <= monthEndDate
                  );
                },
              );

              const lateRecords = matchingAttendanceRecords.filter((record) => {
                return (
                  record.is_late && !record.is_halfday && !record.is_fullday
                );
              });
              if (lateRecords.length > 0 && monthlyRecord.late_count) {
                const updatedLateCount = Math.max(
                  0,
                  monthlyRecord.late_count - lateRecords.length,
                );

                await this.prisma.monthly_leave_record.update({
                  where: { id: monthlyRecord.id },
                  data: { late_count: updatedLateCount },
                });

                lateCount -= Math.min(lateCount, lateRecords.length);
              }

              const halfDayRecords = matchingAttendanceRecords.filter(
                (record) =>
                  record.is_late && record.is_halfday && !record.is_fullday,
              );
              if (halfDayRecords.length > 0 && monthlyRecord.deduction_leaves) {
                const updatedHalfDayCount = Math.max(
                  0,
                  monthlyRecord.deduction_leaves - 0.5 * halfDayRecords.length,
                );

                await this.prisma.monthly_leave_record.update({
                  where: { id: monthlyRecord.id },
                  data: { deduction_leaves: updatedHalfDayCount },
                });

                totalLeaveDeduction += 0.5 * halfDayRecords.length;
              }

              const fullDayRecords = matchingAttendanceRecords.filter(
                (record) => record.is_fullday,
              );
              if (fullDayRecords.length > 0 && monthlyRecord.deduction_leaves) {
                const updatedFullDayCount = Math.max(
                  0,
                  monthlyRecord.deduction_leaves - fullDayRecords.length,
                );

                await this.prisma.monthly_leave_record.update({
                  where: { id: monthlyRecord.id },
                  data: { deduction_leaves: updatedFullDayCount },
                });

                totalLeaveDeduction += fullDayRecords.length;
              }
            }
          }

          const updatedRemainingLeaves = Math.max(
            0,
            existingYearlyLeaveRecord.remaining_leaves + totalLeaveDeduction,
          );

          await this.prisma.yearlyLeaveRecord.update({
            where: { id: existingYearlyLeaveRecord.id },
            data: {
              remaining_leaves: updatedRemainingLeaves,
            },
          });
        }
      }
    }
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

  async fetchLeaveRecords(dto: any, start_date: string, end_date: string) {
    return this.prisma.emp_leaves.findMany({
      where: {
        employement_code: dto?.employement_code,
        start_date: { gte: start_date },
        end_date: { lte: end_date },
      },
    });
  }

  async handlePerDayAllocations(
    dto: any,
    user: any,
    leaveRecords: any[],
    start_date: string,
    end_date: string,
  ) {
    const firstDate = this.prisma.emp_leaves.findFirst({
      where: {
        employement_code: dto?.employement_code,
        leaveTypeId: dto?.leaveTypeId,
        NOT: {
          leave_status: 'REJECTED',
        },
      },
    });
    if (dto?.leaveTypeId == 6) {
      const filterLeavesRecords = leaveRecords?.filter(
        (x) => x?.leaveTypeId == 6 && x?.applicationTypeId == 1,
      );

      if (filterLeavesRecords?.length > 0) {
        const leaveStartDate = filterLeavesRecords?.[0]?.start_date;
        const leaveEndDate = filterLeavesRecords?.[0]?.end_date;

        const perDayAllocations =
          await this.prisma.per_date_allocation.findMany({
            where: {
              date: { gte: leaveStartDate, lte: leaveEndDate },
              resource_id: dto?.employee?.resource_id,
              allocation_id: { not: null },
            },
          });

        if (perDayAllocations.length > 0) {
          await this.processAllocations(dto, perDayAllocations, user);
        } else {
          await this.createPerDateAllocations(filterLeavesRecords);
        }
      }

      const workFromHomeRecords = leaveRecords?.filter(
        (x) => x?.leaveTypeId == 6 && x?.applicationTypeId == 2,
      );

      if (workFromHomeRecords?.length > 0) {
        const workfromStartRecords = workFromHomeRecords?.[0]?.start_date;
        const workfromEndRecords = workFromHomeRecords?.[0]?.end_date;

        const perDayAllocations =
          await this.prisma.per_date_allocation.findMany({
            where: {
              date: { gte: workfromStartRecords, lte: workfromEndRecords },
              resource_id: dto?.employee?.resource_id,
              allocation_id: { not: null },
            },
          });
        if (perDayAllocations.length > 0) {
          await this.processAllocations(dto, perDayAllocations, user);
        } else {
          await this.createPerDateAllocations(workFromHomeRecords);
        }
      }
    } else if (dto?.leaveTypeId == 5) {
      const filterLeavesRecords = leaveRecords?.filter(
        (x) => x?.leaveTypeId == 5 && x?.applicationTypeId == 1,
      );

      if (filterLeavesRecords?.length > 0) {
        const leaveStartDate = filterLeavesRecords?.[0]?.start_date;
        const leaveEndDate = filterLeavesRecords?.[0]?.end_date;

        const perDayAllocations =
          await this.prisma.per_date_allocation.findMany({
            where: {
              date: { gte: leaveStartDate, lte: leaveEndDate },
              resource_id: dto?.employee?.resource_id,
              allocation_id: { not: null },
            },
          });

        if (perDayAllocations.length > 0) {
          await this.processAllocations(dto, perDayAllocations, user);
        } else {
          await this.createPerDateAllocations(filterLeavesRecords);
        }
      }
    } else {
      const perDayAllocations = await this.prisma.per_date_allocation.findMany({
        where: {
          date: { gte: start_date, lte: end_date },
          resource_id: dto?.employee?.resource_id,
          allocation_id: { not: null },
        },
      });

      if (perDayAllocations.length > 0 && dto?.applicationTypeId != 2) {
        await this.processAllocations(dto, perDayAllocations, user);
      } else if (dto?.applicationTypeId != 2) {
        await this.createPerDateAllocations(leaveRecords);
      }
    }
  }

  async processAllocations(dto: any, perDayAllocations: any[], user: any) {
    let perDateAllocationIds: any[] = [];

    perDayAllocations.map((x) => {
      const index = perDateAllocationIds.findIndex(
        (y) => y.allocation_id == x.allocation_id,
      );
      if (index == -1) {
        perDateAllocationIds.push({
          allocation_id: x.allocation_id,
          task_hours: x.task_hours,
        });
      } else {
        perDateAllocationIds[index].task_hours += x.task_hours;
      }
    });

    perDateAllocationIds = perDateAllocationIds.filter(
      (x) => x.allocation_id != null || x.task_hours != null,
    );

    if (perDateAllocationIds.length > 0) {
      const allocations = await this.prisma.allocation.findMany({
        where: {
          id: { in: perDateAllocationIds.map((x) => x.allocation_id) },
        },
        include: { task: true },
      });
      perDateAllocationIds.forEach((x: any) => {
        for (let i = 0; i < allocations.length; i++) {
          if (x.allocation_id == allocations[i].id) {
            x.project_id = allocations[i].task.project_id;
          }
        }
      });

      if (allocations.length > 0) {
        const departmentId = await this.prisma.resource.findFirst({
          where: { id: dto?.employee.resource_id },
        });

        if (departmentId) {
          await this.updateProjectConsumedHours(
            allocations,
            perDateAllocationIds,
            departmentId,
          );
          await this.updateAllocations(allocations, perDateAllocationIds);
          await this.updatePerDateAllocations(perDayAllocations);
        }
      }
    }
  }

  async updateProjectConsumedHours(
    allocations: any[],
    perDateAllocationIds: any[],
    departmentId: any,
  ) {
    const projectConsumedHours =
      await this.prisma.project_consumed_hours.findMany({
        where: {
          department_id: departmentId.department_id,
          project_id: { in: allocations.map((x) => x.task.project_id) },
        },
      });

    for (const t_hours of projectConsumedHours) {
      const updateHours = perDateAllocationIds.find(
        (y) => y.project_id == t_hours.project_id,
      );
      await this.prisma.project_consumed_hours.update({
        where: { id: t_hours.id },
        data: {
          consumed_hours: t_hours.consumed_hours - updateHours.task_hours,
        },
      });
    }
  }

  async updateAllocations(allocations: any[], perDateAllocationIds: any[]) {
    const filterAllocations = allocations.map((x) => {
      const findHours = perDateAllocationIds.find(
        (y) => y.allocation_id == x.id,
      );
      return {
        id: x.id,
        project_id: x.task.project_id,
        task_hours: findHours.task_hours,
        delete_hours: x.task_hours - findHours.task_hours,
      };
    });

    for (const a of filterAllocations) {
      await this.prisma.allocation.update({
        where: { id: a.id },
        data: { task_hours: a.delete_hours },
      });
    }
  }

  async updatePerDateAllocations(perDayAllocations: any[]) {
    await this.prisma.per_date_allocation.updateMany({
      where: { id: { in: perDayAllocations.map((x) => x.id) } },
      data: {
        is_leave: true,
        task_hours: 0,
      },
    });
  }

  async createPerDateAllocations(leaveRecords: any[]) {
    await this.prisma.per_date_allocation.createMany({
      data: leaveRecords.map((x) => ({
        resource_id: x.resource_id,
        date: x.start_date,
        is_leave: true,
        task_hours: 0,
      })),
    });
  }
}

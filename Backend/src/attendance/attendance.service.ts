import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';
import {
  runAggregationLateAttendance,
  runAggregationPipeline,
  sendNotification,
} from 'src/utils/helper';
import { CreateNotificationDto } from 'src/notification/dto/create-notificatio.dto';
import * as fs from 'fs';
import * as path from 'path';
import { LeaveCreateService } from './helperServices/leave-create.service';
import { LeaveApproveService } from './helperServices/leave-approve.service';
import { LeaveRejectService } from './helperServices/leave-reject.service';
import * as moment from 'moment';
import { DashboardOverview } from './helperServices/dashboard';
import {
  getLatestAttendance,
  insertAttendanceIfNotExists,
} from 'src/utils/quries';
const lockFilePath = path.resolve(__dirname, 'cron-lock.txt');
const checkinLockFilePath = path.resolve(__dirname, 'checkin-cron-lock.txt');
const checkoutLockFilePath = path.resolve(__dirname, 'checkout-cron-lock.txt');

interface IFixAttendance {
  status: boolean;
  is_late: boolean;
  is_halfday: boolean;
  is_fullday: boolean;
  mark_late: boolean;
  mark_halfday: boolean;
  mark_fullday: boolean;
  resourceId: string;
  date: string;
  timein: string | null;
  timeout: string | null;
}

interface IEmployeeData {
  id: string;
  emp_code: string;
  date: string;
  name: string;
  checkin_time: string | null;
  checkout_time: string | null;
  hours_worked: number | null;
  user_comment: string | null;
  hours: number | null;
  approve_by: string | null;
  is_approved: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: {
    id: string;
    name: string;
    resource: {
      id: string;
      department: {
        id: string;
        name: string;
      };
    };
  };
  is_late: boolean;
  is_halfday: boolean;
  is_fullday: boolean;
  status:
    | 'On-Time'
    | 'Late'
    | 'Half Day'
    | 'Full Day Off'
    | 'Holiday'
    | 'On-Leave';
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private prisma: PrismaService,
    private leaveCreateService: LeaveCreateService,
    private leaveApproveService: LeaveApproveService,
    private leaveRejectService: LeaveRejectService,
    private dashboardOverview: DashboardOverview,
  ) {}
  ////////////////////////////////////////////   CREATE LEAVE /////////////////////////////////////////////////////////////////
  async create(dto: any, request) {
    try {
      const user = request?.user;
      const { start_date, end_date, applicationTypeId, leaveTypeId, reason  } = dto;

      this.leaveCreateService.validateDates(start_date, end_date);

      await this.leaveCreateService.checkExistingLeaveRecord(
        user,
        start_date,
        end_date,
        leaveTypeId,
      );

      const { leaveRecords, attendanceRecords, availed_leaves, availed_wfh } =
        await this.leaveCreateService.generateLeaveAndAttendanceRecords(
          user,
          dto,
          user?.location_type_id,
        );

      if (leaveRecords.length > 0) {
        const count = await this.prisma.emp_leaves.createMany({
          data: leaveRecords,
        });

        await this.leaveCreateService.updateYearlyLeaveRecord(
          user.id,
          availed_leaves,
          availed_wfh,
          leaveTypeId,
        );

        await this.prisma.emp_attendance.createMany({
          data: attendanceRecords,
        });

        if (count) {
          await this.leaveCreateService.sendNotification(
            user,
            applicationTypeId,
            leaveRecords,
          );

          await this.leaveCreateService.sendEmailNotification(
            user,
            applicationTypeId,
            leaveRecords,
            reason 
          );

          return handleSuccessResponse(
            '',
            200,
            leaveRecords.length == 1
              ? 'Leave Applied Successfully'
              : 'Leaves Applied Successfully',
          );
        }
      }

      throw new HttpException('Something went wrong', HttpStatus.BAD_REQUEST);
    } catch (error) {
      throw error;
    }
  }

  ////////////////////////////////////////////   APPROVE LEAVE /////////////////////////////////////////////////////////////////
  async approveLeave(dto: any, request: any) {
    try {
      const user = request?.user;
      const start_date = new Date(
        new Date(dto.start_date).setUTCHours(0, 0, 0, 0),
      ).toISOString();
      const end_date = new Date(
        new Date(dto.end_date).setUTCHours(23, 59, 59, 999),
      ).toISOString();

      if (!dto.approved) {
        await this.leaveRejectService.rejectLeave(
          dto,
          user,
          start_date,
          end_date,
        );
        return handleSuccessResponse(
          'Leave Request Rejected',
          HttpStatus.OK,
          '',
        );
      } else {
        await this.leaveApproveService.approveLeaveRequest(
          dto,
          user,
          start_date,
          end_date,
        );
        return handleSuccessResponse(
          'Leave Request Approved',
          HttpStatus.OK,
          '',
        );
      }
    } catch (error) {
      throw error;
    }
  }

  ////////////////////////////////////////////   APPROVE LEAVE /////////////////////////////////////////////////////////////////

  async findAll(query: any, request: any) {
    try {
      let startOfDay = new Date(query?.startTime);
      const endOfDay = new Date(query?.endTime);
      let isDepartmentPdf = false;
      let where: any = {
        user: {
          user_details: {
            every: {
              resignation_status: false,
            },
          },
        },
      };
      let isDashboard = query.isDashboard;

      const userRole = request?.user?.role?.name;
      const isSuperAdminOrHR =
        userRole === 'Super Admin' ||
        userRole === 'Human Resource' ||
        userRole === 'Human Resource Operations';
      const { department_id, name, emp_code } = query;

      let user = await this.prisma.user.findFirst({
        where: {
          employement_code: emp_code,
          user_details: {
            every: {
              location_type_id: +query.location_type_id,
            },
          },
        },
        select: {
          user_details: true,
        },
      });

      if (
        user?.user_details[0]?.date_of_joining &&
        user?.user_details[0]?.date_of_joining != undefined
      ) {
        let joiningDate = user?.user_details[0]?.date_of_joining;
        const joining_date = new Date(
          new Date(joiningDate).setHours(5, 0, 0, 0),
        );
        if (
          joining_date.getFullYear < startOfDay.getFullYear &&
          joining_date.getMonth < startOfDay.getMonth &&
          joining_date.getDay < startOfDay.getDay
        ) {
          startOfDay = joining_date;
        }
      }

      if (isSuperAdminOrHR) {
        if (department_id && name && emp_code) {
          where = {
            user: {
              resource: { department_id },
              employement_code: emp_code,
              user_details: {
                every: {
                  resignation_status: false,
                },
              },
              // name: { contains: name.trim(), mode: 'insensitive' },
            },
          };
        } else if (department_id) {
          where = {
            user: {
              resource: { department_id },
              user_details: {
                every: {
                  resignation_status: false,
                },
              },
            },
          };
          isDepartmentPdf = true;
        } else if (name && emp_code) {
          where = {
            // user: { name: { contains: name.trim(), mode: 'insensitive' } },
            user: {
              employement_code: emp_code,
              user_details: {
                every: {
                  resignation_status: false,
                },
              },
            },
            // employement_code: emp_code,
          };
        }

        let user = await this.prisma.user.findMany({
          where: {
            AND: [
              {
                OR: [
                  { employement_code: { not: null } },
                  { employement_code: { not: '' } },
                ],
              },
              {
                user_details: {
                  some: {
                    location_type_id: +query.location_type_id,
                  },
                },
              },
              { status: true },
              { super: false },
            ],
            ...(where?.user ?? {}),
          },
          include: { user_details: true },
        });

        if (user.length > 0) {
          let attendance;
          attendance = await runAggregationPipeline(
            user,
            new Date(startOfDay.setHours(5, 0, 0, 0)),
            endOfDay,
            isDashboard,
          );
          attendance.isDepartmentPdf = isDepartmentPdf;
          return handleSuccessResponse('', 200, attendance);
        }
      } else {
        const resource = await this.prisma.resource.findFirst({
          where: { id: request?.user?.resource_id, status: true },
          include: { department: true },
        });

        if (resource?.is_team_lead) {
          let leadUsers;
          if (resource?.department?.name === 'PM Lead') {
            let departmentId = (
              await this.prisma.resource.findFirst({
                where: { id: request?.user?.resource_id },
              })
            )?.department_id;
            leadUsers = await this.prisma.resource.findMany({
              where: {
                department_id: departmentId,
                status: true,
                user: {
                  every: {
                    user_details: {
                      every: {
                        resignation_status: false,
                      },
                    },
                  },
                },
              },
            });
          } else {
            leadUsers = await this.prisma.resource.findMany({
              where: { department_id: resource?.department_id, status: true },
            });
          }

          if (name && emp_code) {
            where = {
              // user: { name: { contains: name.trim(), mode: 'insensitive' } },
              // employement_code: emp_code,
              user: {
                employement_code: emp_code,
                user_details: {
                  every: {
                    resignation_status: false,
                  },
                },
              },
            };
          }

          let user = await this.prisma.user.findMany({
            where: {
              resource_id: { in: leadUsers.map((x) => x.id) },
              status: true,
              ...(where?.user ?? {}),
            },
          });

          user = user.filter((x) => x?.employement_code);

          if (user.length > 0) {
            let attendance;
            attendance = await runAggregationPipeline(
              user,
              new Date(startOfDay.setHours(5, 0, 0, 0)),
              endOfDay,
              isDashboard,
            );
            attendance.isDepartmentPdf = isDepartmentPdf;
            return handleSuccessResponse('', 200, attendance);
          }
        } else {
          const user = await this.prisma.user.findFirst({
            where: {
              resource_id: resource?.id,
              status: true,
              user_details: {
                every: {
                  resignation_status: false,
                },
              },
            },
          });

          if (user) {
            const attendance = await runAggregationPipeline(
              [user],
              new Date(startOfDay.setHours(5, 0, 0, 0)),
              endOfDay,
              isDashboard,
            );
            return handleSuccessResponse('', 200, attendance);
          }
        }
      }

      return handleSuccessResponse('', 200, []);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async verifyLeave(query: any) {
    let date = new Date();
    let startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    const { emp_code } = query;
    const user = await this.prisma.user.findFirst({
      where: {
        employement_code: emp_code,
        status: true,
      },
      select: {
        user_details: true,
      },
    });
    if (user) {
      const leave = await this.prisma.emp_leaves.findFirst({
        where: {
          employement_code: emp_code,
          start_date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          applicationTypeId: '2',
        },
      });
      return handleSuccessResponse('', 200, leave);
    }
    return handleSuccessResponse('User does not exist', 200, {});
  }

  /**
   * Marks users as late if they haven't recorded attendance for the day and updates monthly leave records.
   */
  // @Cron('1 11 * * 1-5')
  // @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_10AM)
  @Cron('0 20 09 * * 1-5')
  async markLateCronJob() {
    if (fs.existsSync(lockFilePath)) {
      console.log('Another instance is already running the job.');
      return;
    }

    try {
      // Create the lock file
      fs.writeFileSync(lockFilePath, '');

      const today = new Date();

      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const late_crone_job = await this.prisma.cronJob.findFirst({
        where: {
          runDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          name: 'late_crone_job',
        },
      });

      if (late_crone_job?.id) {
        return;
      } else {
        await this.prisma.cronJob.create({
          data: {
            name: 'late_crone_job',
            runDate: new Date(),
          },
        });
      }

      const holiday = await this.prisma.holidays.findFirst({
        where: {
          date: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      if (holiday?.id) {
        return;
      }

      const users = await this.getActiveUsers();

      const empAttendance = await runAggregationLateAttendance(
        users,
        startOfDay,
        endOfDay,
      );

      if (empAttendance?.length > 0) {
        const usersWithAttendance = this.filterUsersWithAttendance(
          users,
          empAttendance,
        );

        const usersWithoutAttendance = this.filterUsersWithoutAttendance(
          users,
          usersWithAttendance,
        );

        if (usersWithoutAttendance?.length > 0) {
          await this.markUsersAsLate(usersWithoutAttendance, startOfDay);

          await this.updateMonthlyLeaveRecords(usersWithoutAttendance);
        }
      }
    } catch (error) {
      handlePrismaError(error);
    } finally {
      // Remove the lock file
      fs.unlinkSync(lockFilePath);
    }
  }

  // Helper functions

  async getActiveUsers() {
    return await this.prisma.user.findMany({
      where: {
        OR: [
          { employement_code: { not: null } },
          { employement_code: { not: '' } },
        ],
        status: true,
        // employement_code_dxb: null,
        user_details: {
          some: {
            location_type_id: 1,
          },
        },
      },
      select: {
        id: true,
        employement_code: true,
        name: true,
      },
    });
  }

  filterUsersWithAttendance(users, empAttendance) {
    return users.filter((u) =>
      empAttendance.some((ea) => ea.emp_code === u.employement_code),
    );
  }

  filterUsersWithoutAttendance(users, usersWithAttendance) {
    return users.filter(
      (u) =>
        !usersWithAttendance.some(
          (ua) => ua.employement_code === u.employement_code,
        ),
    );
  }

  async markUsersAsLate(usersWithoutAttendance, startOfDay) {
    await this.prisma.emp_attendance.createMany({
      data: usersWithoutAttendance.map((x) => ({
        emp_code: x.employement_code,
        is_late: true,
        name: x.name,
        created_at: new Date(startOfDay.setHours(11, 0, 0, 0)),
        location_type_id: 1,
      })),
    });
  }

  async updateMonthlyLeaveRecords(usersWithoutAttendance) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    try {
      const userIds = usersWithoutAttendance.map((user) => user.id);

      // Fetch all existing yearly leave records for the users
      const yearlyLeaveRecords = await this.prisma.yearlyLeaveRecord.findMany({
        where: { user_id: { in: userIds }, year: currentYear },
        select: { id: true, user_id: true },
      });

      // Map to easily access yearly leave records by user id
      const yearlyLeaveRecordsMap = yearlyLeaveRecords.reduce((acc, record) => {
        acc[record.user_id] = record.id;
        return acc;
      }, {});

      for (const userDetails of usersWithoutAttendance) {
        const yearlyRecordId = yearlyLeaveRecordsMap[userDetails.id];

        if (yearlyRecordId) {
          const existingRecord =
            await this.prisma.monthly_leave_record.findFirst({
              where: { yearly_record_id: yearlyRecordId, month: currentMonth },
            });

          if (existingRecord) {
            const newLateCount = (existingRecord.late_count ?? 0) + 1;
            if (newLateCount > 0) {
              await this.prisma.monthly_leave_record.update({
                where: { id: existingRecord.id },
                data: { late_count: newLateCount },
              });
            }
          } else {
            await this.prisma.monthly_leave_record.create({
              data: {
                month: currentMonth,
                yearly_record_id: yearlyRecordId,
                late_count: 1,
              },
            });
          }
        }
      }
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Marks users as Half day if they haven't recorded attendance for the day and updates monthly leave records and deduct 0.5 leaves.
   */

  // @Cron('1 11 * * 1-5')
  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_11AM)
  async markHalfdayOffCroneJob() {
    if (fs.existsSync(lockFilePath)) {
      console.log('Another instance is already running the job.');
      return;
    }

    try {
      // Create the lock file
      fs.writeFileSync(lockFilePath, '');

      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Check if a half-day job has already been processed for today
      const existingJob = await this.prisma.cronJob.findFirst({
        where: {
          runDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          name: 'halfday_crone_job',
        },
      });

      if (existingJob) {
        return;
      }

      // Mark the half-day job as processed
      await this.prisma.cronJob.create({
        data: {
          name: 'halfday_crone_job',
          runDate: new Date(),
        },
      });

      const holiday = await this.prisma.holidays.findFirst({
        where: {
          date: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      if (holiday?.id) {
        return;
      }

      // Fetch employees without attendance records for today
      const usersWithoutAttendance = await this.getUsersWithoutAttendance(
        startOfDay,
        endOfDay,
      );

      if (usersWithoutAttendance?.length > 0) {
        // Process employees without attendance records
        await this.processUsersWithoutAttendance(
          usersWithoutAttendance,
          startOfDay,
          endOfDay,
        );
      }
    } catch (error) {
      handlePrismaError(error);
    } finally {
      // Remove the lock file
      fs.unlinkSync(lockFilePath);
    }
  }

  async getUsersWithoutAttendance(startOfDay: Date, endOfDay: Date) {
    const users = await this.getActiveUsers();
    const emp_attendance = await this.prisma.emp_attendance.findMany({
      where: {
        emp_code: { in: users?.map((x) => x.employement_code) },
        OR: [
          {
            punch_time: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          {
            created_at: {
              gte: startOfDay,
              lte: endOfDay,
            },
            is_late: true,
          },
        ],
      },
    });

    // const emp_attendance = await runAggregationHalfDayAttendance(
    //   users,
    //   startOfDay,
    //   endOfDay,
    // );

    const usersWithAttendance = users.filter((u) => {
      return (
        emp_attendance.some(
          (ea) =>
            ea.emp_code === u.employement_code &&
            ea.punch_time !== undefined &&
            ea.punch_time !== null,
        ) ||
        emp_attendance.some(
          (ea) => ea.emp_code === u.employement_code && ea.is_halfday === true,
        )
      );
    });

    const usersWithoutAttendance = users.filter((u) => {
      return !usersWithAttendance.some(
        (ua) => ua.employement_code === u.employement_code,
      );
    });

    return usersWithoutAttendance;
  }

  async processUsersWithoutAttendance(
    usersWithoutAttendance: any[],
    startOfDay: Date,
    endOfDay: Date,
  ) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const userIds = usersWithoutAttendance.map((user) => user.id);
    const userEmpCodes = usersWithoutAttendance.map(
      (user) => user.employement_code,
    );

    // Update the Half day status in attendance records
    await this.prisma.emp_attendance.updateMany({
      data: {
        is_halfday: true,
      },
      where: {
        created_at: {
          gte: startOfDay,
          lt: endOfDay,
        },
        is_leave: false,
        is_late: true,
        emp_code: {
          in: userEmpCodes,
        },
      },
    });

    try {
      // Fetch all existing yearly leave records for the users
      const yearlyLeaveRecords = await this.prisma.yearlyLeaveRecord.findMany({
        where: { user_id: { in: userIds }, year: currentYear },
        select: { id: true, user_id: true, remaining_leaves: true },
      });

      // Fetch all existing monthly leave records for the users
      const monthlyLeaveRecords =
        await this.prisma.monthly_leave_record.findMany({
          where: {
            yearly_record_id: {
              in: yearlyLeaveRecords.map((record) => record.id),
            },
            month: currentMonth,
          },
          select: {
            id: true,
            yearly_record_id: true,
            late_count: true,
            deduction_leaves: true,
          },
        });

      // Map to easily access yearly leave records and monthly leave records by user id
      const yearlyLeaveRecordsMap = yearlyLeaveRecords.reduce((acc, record) => {
        acc[record.user_id] = record;
        return acc;
      }, {});

      const monthlyLeaveRecordsMap = monthlyLeaveRecords.reduce(
        (acc, record) => {
          acc[record.yearly_record_id] = record;
          return acc;
        },
        {},
      );

      // Process each user without attendance
      for (const userDetails of usersWithoutAttendance) {
        const yearlyLeaveRecord = yearlyLeaveRecordsMap[userDetails.id];

        if (yearlyLeaveRecord?.id) {
          const monthlyLeaveRecord =
            monthlyLeaveRecordsMap[yearlyLeaveRecord.id];

          if (monthlyLeaveRecord) {
            const newLateCount = Math.max(monthlyLeaveRecord.late_count - 1, 0);
            const newDeductionLeaves =
              (monthlyLeaveRecord?.deduction_leaves ?? 0) + 0.5;

            // Ensure there are no negative entries for late count and deduction leaves
            await this.prisma.monthly_leave_record.update({
              where: {
                id: monthlyLeaveRecord.id,
              },
              data: {
                late_count: newLateCount,
                deduction_leaves: newDeductionLeaves,
              },
            });
          }

          const newRemainingLeaves =
            (yearlyLeaveRecord?.remaining_leaves ?? 0) - 0.5;

          // Ensure there are no negative entries for remaining leaves
          await this.prisma.yearlyLeaveRecord.update({
            where: { id: yearlyLeaveRecord.id },
            data: {
              remaining_leaves: newRemainingLeaves,
            },
          });
        }
      }
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Marks users as Full day if they haven't recorded attendance for the day and updates monthly leave records and deduct 0.5 +0.5 leaves.
   */
  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_2PM)
  async markFulldayOffCroneJob() {
    if (fs.existsSync(lockFilePath)) {
      console.log('Another instance is already running the job.');
      return;
    }

    try {
      // Create the lock file
      fs.writeFileSync(lockFilePath, '');

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const fullday_crone_job = await this.prisma.cronJob.findFirst({
        where: {
          runDate: { gte: startOfDay, lte: endOfDay },
          name: 'fullday_crone_job',
        },
      });

      if (fullday_crone_job) return;

      await this.prisma.cronJob.create({
        data: { name: 'fullday_crone_job', runDate: new Date() },
      });

      const holiday = await this.prisma.holidays.findFirst({
        where: { date: { gte: startOfDay, lt: endOfDay } },
      });

      if (holiday) return;

      const users = await this.getActiveUsers();

      const emp_attendance = await this.prisma.emp_attendance.findMany({
        where: {
          emp_code: { in: users?.map((x) => x.employement_code) },
          OR: [
            {
              punch_time: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
            {
              created_at: {
                gte: startOfDay,
                lte: endOfDay,
              },
              is_late: true,
              is_halfday: true,
            },
          ],
        },
      });

      const usersWithAttendance = users.filter((u) => {
        return (
          emp_attendance.some(
            (ea) =>
              ea.emp_code === u.employement_code &&
              ea.punch_time !== undefined &&
              ea.punch_time !== null,
          ) ||
          emp_attendance.some(
            (ea) =>
              ea.emp_code === u.employement_code && ea.is_fullday === true,
          )
        );
      });

      const usersWithoutAttendance = users.filter((u) => {
        return !usersWithAttendance.some(
          (ua) => ua.employement_code === u.employement_code,
        );
      });

      if (usersWithoutAttendance.length > 0) {
        await this.prisma.emp_attendance.updateMany({
          data: { is_fullday: true },
          where: {
            created_at: { gte: startOfDay, lt: endOfDay },
            is_leave: false,
            is_late: true,
            is_halfday: true,
            emp_code: {
              in: usersWithoutAttendance.map((x) => x.employement_code),
            },
          },
        });

        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const userIds = usersWithoutAttendance.map((user) => user.id);

        // Fetch all existing yearly leave records for the users
        const yearlyLeaveRecords = await this.prisma.yearlyLeaveRecord.findMany(
          {
            where: { user_id: { in: userIds }, year: currentYear },
            select: { id: true, user_id: true, remaining_leaves: true },
          },
        );

        // Fetch all existing monthly leave records for the users
        const yearlyLeaveRecordIds = yearlyLeaveRecords.map(
          (record) => record.id,
        );
        const monthlyLeaveRecords =
          await this.prisma.monthly_leave_record.findMany({
            where: {
              yearly_record_id: { in: yearlyLeaveRecordIds },
              month: currentMonth,
            },
            select: {
              id: true,
              yearly_record_id: true,
              deduction_leaves: true,
            },
          });

        // Map to easily access yearly leave records and monthly leave records by user id
        const yearlyLeaveRecordsMap = yearlyLeaveRecords.reduce(
          (acc, record) => {
            acc[record.user_id] = record;
            return acc;
          },
          {},
        );

        const monthlyLeaveRecordsMap = monthlyLeaveRecords.reduce(
          (acc, record) => {
            acc[record.yearly_record_id] = record;
            return acc;
          },
          {},
        );

        for (const userDetails of usersWithoutAttendance) {
          const yearlyLeaveRecord = yearlyLeaveRecordsMap[userDetails.id];

          if (yearlyLeaveRecord) {
            const monthlyLeaveRecord =
              monthlyLeaveRecordsMap[yearlyLeaveRecord.id];

            if (monthlyLeaveRecord) {
              await this.prisma.monthly_leave_record.update({
                where: { id: monthlyLeaveRecord.id },
                data: {
                  deduction_leaves:
                    (monthlyLeaveRecord.deduction_leaves ?? 0) + 0.5,
                },
              });
            }

            await this.prisma.yearlyLeaveRecord.update({
              where: { id: yearlyLeaveRecord.id },
              data: {
                remaining_leaves:
                  (yearlyLeaveRecord.remaining_leaves ?? 0) - 0.5,
              },
            });
          }
        }
      }
    } catch (error) {
      handlePrismaError(error);
    } finally {
      // Remove the lock file
      fs.unlinkSync(lockFilePath);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async employePunchingInCroneJob() {
    if (fs.existsSync(checkinLockFilePath)) {
      console.log('Another instance is already running the job. check-in');
      return;
    }

    try {
      // Create the lock file
      fs.writeFileSync(checkinLockFilePath, '');

      // const existing_data = await this.prisma.emp_attendance.findFirst({
      //   orderBy: {
      //     punch_time: 'desc',
      //   },
      //   where: {
      //     punch_state: 0,
      //     location_type_id: 1,
      //   },
      // });

      const existing_data = await getLatestAttendance(0);

      if (existing_data) {
        const query = `
            SELECT pe.first_name AS name, pe.emp_code, ict.punch_time, ict.punch_state
            FROM iclock_transaction ict
            INNER JOIN personnel_employee pe ON pe.emp_code = ict.emp_code and ict.punch_state = '0'
            WHERE ict.punch_time > to_timestamp('${existing_data?.punch_time?.toISOString()}', 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')
            GROUP BY ict.id, ict.punch_time, pe.emp_code, pe.first_name, ict.punch_state
            ORDER BY ict.punch_time ASC;
        `;

        const results: any[] = await this.entityManager.query(query);

        if (results?.length > 0) {
          // Adjust the date if punch time is before 6 AM
          const adjustedResults = results.map((x) => ({
            ...x,
            punch_time:
              new Date(x?.punch_time)?.getHours() < 6
                ? new Date(
                    new Date(x?.punch_time).setDate(
                      new Date(x?.punch_time)?.getDate() - 1,
                    ),
                  )
                : x.punch_time,
          }));

          await insertAttendanceIfNotExists(adjustedResults);
        }

        return {
          existing_data,
          results,
        };
      }
    } catch (error) {
      console.log('error-->', error);
    } finally {
      // Remove the lock file
      fs.unlinkSync(checkinLockFilePath);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async employePunchingOutCroneJob() {
    if (fs.existsSync(checkoutLockFilePath)) {
      console.log('Another instance is already running the job. check out');
      return;
    }

    try {
      // Create the lock file
      fs.writeFileSync(checkoutLockFilePath, '');

      // const existing_data = await this.prisma.emp_attendance.findFirst({
      //   orderBy: {
      //     punch_time: 'desc',
      //   },
      //   where: {
      //     punch_state: 1,
      //     location_type_id: 1,
      //   },
      // });
      const existing_data = await getLatestAttendance(1);

      if (existing_data) {
        const query = `
          SELECT pe.first_name AS name, pe.emp_code, ict.punch_time, ict.punch_state
          FROM iclock_transaction ict
          INNER JOIN personnel_employee pe ON pe.emp_code = ict.emp_code and ict.punch_state = '1'
          WHERE ict.punch_time > to_timestamp('${existing_data?.punch_time?.toISOString()}', 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')
          GROUP BY ict.id, ict.punch_time, pe.emp_code, pe.first_name, ict.punch_state
          ORDER BY ict.punch_time ASC;
      `;

        const results: any[] = await this.entityManager.query(query);

        if (results?.length > 0) {
          // Adjust the date if punch time is before 6 AM
          const adjustedResults = results.map((x) => ({
            ...x,
            punch_time:
              new Date(x?.punch_time)?.getHours() < 6
                ? new Date(
                    new Date(x?.punch_time).setDate(
                      new Date(x?.punch_time)?.getDate() - 1,
                    ),
                  )
                : x.punch_time,
          }));

          await insertAttendanceIfNotExists(adjustedResults);
        }

        return {
          existing_data,
          results,
        };
      }
    } catch (error) {
      console.log('error-->', error);
    } finally {
      // Remove the lock file
      fs.unlinkSync(checkoutLockFilePath);
    }
  }

  async listing(query: any, request: any) {
    try {
      const user = request?.user;

      // Set start and end dates
      const startOfDay = new Date(query?.start_date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(query?.end_date);
      endOfDay.setHours(23, 59, 59, 999);

      let where: any = {};
      if (
        query?.leave_status &&
        !query?.employement_code &&
        !query?.applicationTypeId
      ) {
        where.leave_status = query?.leave_status;
      } else if (
        query?.employement_code &&
        !query?.leave_status &&
        !query?.applicationTypeId
      ) {
        where.employement_code = query?.employement_code;
      } else if (
        query?.applicationTypeId &&
        !query?.leave_status &&
        !query?.employement_code
      ) {
        where.applicationTypeId = query?.applicationTypeId;
      } else if (
        query?.leave_status &&
        query?.employement_code &&
        !query?.applicationTypeId
      ) {
        where.leave_status = query?.leave_status;
        where.employement_code = query?.employement_code;
      } else if (
        query?.leave_status &&
        query?.applicationTypeId &&
        !query?.employement_code
      ) {
        where.leave_status = query?.leave_status;
        where.applicationTypeId = query?.applicationTypeId;
      } else if (
        query?.employement_code &&
        query?.applicationTypeId &&
        !query?.leave_status
      ) {
        where.employement_code = query?.employement_code;
        where.applicationTypeId = query?.applicationTypeId;
      } else if (
        query?.leave_status &&
        query?.employement_code &&
        query?.applicationTypeId
      ) {
        where.leave_status = query?.leave_status;
        where.employement_code = query?.employement_code;
        where.applicationTypeId = query?.applicationTypeId;
      }

      // Fetch leaves data based on user role
      if (
        ['Super Admin', 'Human Resource', 'Human Resource Operations', 'CSM'].includes(
          user?.role?.name,
        )
      ) {
        return await this.fetchLeavesData({
          start_date: { gte: startOfDay, lte: endOfDay },
          ...where,
        });
      } else if (['Team Lead', 'PM Lead'].includes(user?.role?.name)) {
        const department = await this.prisma.resource.findFirst({
          where: { id: user?.resource_id },
          select: { department: true },
        });

        const departmentId = department?.department?.id;
        // user?.role?.name === 'PM Lead'
        //   ? '64eef8334a3912fea3a48ba8'
        //   : department?.department?.id;

        return await this.fetchLeavesData({
          start_date: { gte: startOfDay, lte: endOfDay },
          ...where,
          resource: { department: { id: departmentId } },
          status: true,
        });
      } else {
        return await this.fetchLeavesData({
          employement_code: user?.employement_code,
          start_date: { gte: startOfDay, lte: endOfDay },
          ...where,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // Helper function to fetch leaves data
  private async fetchLeavesData(where: any) {
    const emp_leaves_data = await this.prisma.emp_leaves.findMany({
      // where,
      where: {
        user: {
          status: true,
        },
        ...where,
      },
      include: {
        user: true,
        resource: {
          include: { department: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return handleSuccessResponse('', 200, emp_leaves_data);
  }

  async getRemainingLeaves(query: any, request: any) {
    try {
      const user = request?.user;

      const currentYear = new Date().getFullYear();

      if (query?.name || query?.emp_code) {
        const existingYearlyLeaveRecord =
          await this.prisma.yearlyLeaveRecord.findFirst({
            where: {
              year: currentYear,
              user: {
                OR: [
                  {
                    name: {
                      contains: query?.name,
                      mode: 'insensitive',
                    },
                  },
                  { employement_code: query?.emp_code },
                ],
              },
            },
            include: {
              monthly_records: true,
              user: {
                include: { user_details: true },
              },
            },
          });

        return handleSuccessResponse('', 200, existingYearlyLeaveRecord);
      }

      const existingYearlyLeaveRecord =
        await this.prisma.yearlyLeaveRecord.findFirst({
          where: {
            user_id: user?.id,
            year: currentYear,
          },
          include: {
            monthly_records: true,
            user: {
              include: { user_details: true },
            },
          },
        });

      return handleSuccessResponse('', 200, existingYearlyLeaveRecord);
    } catch (error) {
      throw error;
    }
  }

  // @Cron(CronExpression.EVERY_YEAR)
  async addLeavesToEmploye() {
    try {
      // Get the current year
      const currentYear = new Date().getFullYear();

      // Find all user details records
      const allUserDetails = await this.prisma.user.findMany({
        where: {
          OR: [
            { employement_code: { not: '' } },
            { employement_code: { not: null } },
          ],
          status: true,
        },
        include: { user_details: true },
      });

      const today = moment(); // Get today's date

      const filter = allUserDetails?.filter((user) => {
        // Check if user's joining date is less than today and total duration is 3 months or more
        const joiningDate = moment(user.user_details?.[0]?.date_of_joining); // Assuming joiningDate is in user.details
        const durationInMonths = today.diff(joiningDate, 'months'); // Calculate the duration in months

        return (
          joiningDate.isBefore(today) &&
          durationInMonths >= 3 &&
          user.user_details?.[0]?.location_type_id == 1
        ); // Filter the users
      });

      for (const userDetails of filter) {
        // Check if the record for the current year already exists
        const existingYearlyLeaveRecord =
          await this.prisma.yearlyLeaveRecord.findFirst({
            where: {
              user_id: userDetails.id,
              year: currentYear,
            },
          });

        if (!existingYearlyLeaveRecord) {
          // Create a new yearly leave record for the current year
          await this.prisma.yearlyLeaveRecord.create({
            data: {
              user_id: userDetails.id,
              year: currentYear,
              total_leaves: 22,
              remaining_leaves: 22,
            },
          });
        } else {
          // Update total leaves to 22
          await this.prisma.yearlyLeaveRecord.update({
            where: { id: existingYearlyLeaveRecord.id },
            data: {
              remaining_leaves:
                existingYearlyLeaveRecord?.total_leaves -
                existingYearlyLeaveRecord?.availed_leaves,
            },
          });
        }
      }
    } catch (error) {
      return error;
    }
  }

  // @Cron('0 12 * * 6') // This will run every Saturday at 12:00 PM
  async threeLatesPerWeekDeduction() {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            {
              employement_code: { not: null },
            },
            {
              employement_code: { not: '' },
            },
          ],
          status: true,
        },
        select: {
          id: true,
          employement_code: true,
          name: true,
        },
      });

      const userIds = users.map((user) => user.id);

      // Fetch all existing yearly leave records for the users
      const yearlyLeaveRecords = await this.prisma.yearlyLeaveRecord.findMany({
        where: { user_id: { in: userIds }, year: currentYear },
        include: { monthly_records: true },
      });

      const yearlyLeaveRecordsMap = yearlyLeaveRecords.reduce((acc, record) => {
        acc[record.user_id] = record;
        return acc;
      }, {});

      for (const user of users) {
        const yearlyRecord = yearlyLeaveRecordsMap[user.id];

        if (yearlyRecord) {
          let totalAvailedLeaves = 0;

          for (const record of yearlyRecord.monthly_records) {
            if (record.month === currentMonth && record.late_count >= 3) {
              const numberOfUpdates = Math.floor(record.late_count / 3);
              const updatedDeductionLeaves = 0.5 * numberOfUpdates;

              await this.prisma.monthly_leave_record.update({
                where: { id: record.id },
                data: {
                  deduction_late: updatedDeductionLeaves,
                },
              });

              totalAvailedLeaves += updatedDeductionLeaves;
            }
          }

          const totalLeavesUsed =
            totalAvailedLeaves +
            yearlyRecord.availed_leaves +
            yearlyRecord.monthly_records.reduce(
              (sum, record) => sum + (record.deduction_leaves || 0),
              0,
            );

          const remainingLeaves = Math.max(
            yearlyRecord.total_leaves - totalLeavesUsed,
            0,
          );

          await this.prisma.yearlyLeaveRecord.update({
            where: { id: yearlyRecord.id },
            data: { remaining_leaves: remainingLeaves },
          });
        }
      }
    } catch (error) {
      console.log('err', error);
    }
  }

  async AddComment(data: any, req: any) {
    try {
      const user = req?.user;
      const comment = await this.prisma.emp_attendance.update({
        where: {
          id: data?.id,
        },
        data: {
          user_comment: data?.user_comment,
          hours: data.hours,
          approve_by: data?.approve_by,
          is_approved: 'PENDING',
        },
      });
      // 6548c8ec1a21e5fecc0d40bb is bhayya user id
      const notification: CreateNotificationDto = {
        title: 'Asset Assigned',
        message: `Kindly review ${user?.name}'s comment on date ${data?.date}.`,
        reciever_ids: [data?.approve_by, '6548c8ec1a21e5fecc0d40bb'],
        created_by: user?.id,
        link: `/attendance/listing`,
      };
      try {
        const sendNotification1 = await sendNotification(notification);
      } catch (error) {
        return error?.message;
      }
      return handleSuccessResponse('', 200, comment);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async CommentStatus(data: any) {
    try {
      const updateComment = await this.prisma.emp_attendance.update({
        where: {
          id: data?.id,
        },
        data: {
          is_approved: data?.is_approved,
        },
      });
      return handleSuccessResponse('', 200, updateComment);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async adjustExistingData() {
    try {
      const existingData = await this.prisma.emp_attendance.findMany({
        where: {
          punch_state: 0,
        },
      });

      // Adjust punch times if necessary
      const adjustedData = existingData.map((entry) => {
        const punchTime = new Date(entry.punch_time);

        // Adjust the date if the time is before 6 AM
        if (punchTime.getHours() < 6) {
          punchTime.setDate(punchTime.getDate() - 1);
          return { ...entry, punch_time: punchTime };
        }

        return entry;
      });

      // Update the adjusted data in the database
      for (const entry of adjustedData) {
        await this.prisma.emp_attendance.update({
          where: { id: entry.id },
          data: { punch_time: entry.punch_time },
        });
      }

      return {
        success: true,
        message: 'Existing data adjusted successfully',
      };
    } catch (error) {
      console.error('Error adjusting existing data:', error);
      return {
        success: false,
        message: 'An error occurred while adjusting existing data',
        error: error.message,
      };
    }
  }

  async fixAttendance(request: IFixAttendance) {
    try {
      const currentDate = new Date(request?.date);
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      // Set timeIn to 00:00:00
      const timeIn = new Date(currentDate);
      timeIn.setHours(0, 0, 0, 0);

      // Set timeOut to 23:59:59
      const timeOut = new Date(currentDate);
      timeOut.setHours(23, 59, 59, 999);

      const user = await this.prisma.user.findFirst({
        where: { resource_id: request.resourceId },
      });

      if (!user) return;

      const existingYearlyLeaveRecord =
        await this.prisma.yearlyLeaveRecord.findFirst({
          where: { user_id: user.id, year: currentYear },
        });

      const createAttendance = async (punchTime: Date, punchState: number) => {
        await this.prisma.emp_attendance.create({
          data: {
            punch_time: punchTime,
            punch_state: punchState,
            name: user.name,
            emp_code: user.employement_code,
            created_at: punchTime,
            location_type_id: 1,
          },
        });
      };

      const updateMonthlyLeaveRecord = async (
        existingRecord: any,
        data: any,
      ) => {
        if (existingRecord) {
          await this.prisma.monthly_leave_record.update({
            where: { id: existingRecord.id },
            data,
          });
        } else {
          await this.prisma.monthly_leave_record.create({
            data: {
              month: currentMonth,
              yearly_record_id: existingYearlyLeaveRecord?.id,
              ...data,
            },
          });
        }
      };

      if (request?.timein) {
        const requestTimeInLocal = new Date(request?.timein);
        requestTimeInLocal.setHours(requestTimeInLocal.getHours() - 1);
        await createAttendance(requestTimeInLocal, 0);
      }

      if (request?.timeout) {
        const requestCheckoutLocal = new Date(request?.timeout);
        requestCheckoutLocal.setHours(requestCheckoutLocal.getHours() - 1);
        await createAttendance(requestCheckoutLocal, 1);
      }

      if (request?.mark_late) {
        const existingLateRecord = await this.prisma.emp_attendance.findFirst({
          where: {
            emp_code: user.employement_code,
            created_at: { gte: timeIn, lte: timeOut },
            is_late: true,
          },
        });

        if (!existingLateRecord) {
          await this.prisma.emp_attendance.create({
            data: {
              is_late: true,
              emp_code: user.employement_code,
              name: user.name,
              created_at: new Date(currentDate.setHours(6, 0, 0, 0)),
              location_type_id: 1,
            },
          });

          if (existingYearlyLeaveRecord?.id) {
            const existingRecord =
              await this.prisma.monthly_leave_record.findFirst({
                where: {
                  yearly_record_id: existingYearlyLeaveRecord?.id,
                  month: currentMonth,
                },
              });

            await updateMonthlyLeaveRecord(existingRecord, {
              late_count: (existingRecord?.late_count ?? 0) + 1,
            });
          }
        }
      }

      const handleLeaveMarking = async (
        attendanceField: string,
        deductionAmount: number,
      ) => {
        const records = await this.prisma.emp_attendance.findMany({
          where: {
            created_at: { gte: timeIn, lte: timeOut },
            emp_code: user.employement_code,
          },
        });

        const alreadyExists = records.some(
          (record) => record[attendanceField] === true,
        );
        if (alreadyExists) return; // Do not deduct leaves if already marked

        if (records.length > 0) {
          const existingRecord =
            await this.prisma.monthly_leave_record.findFirst({
              where: {
                yearly_record_id: existingYearlyLeaveRecord?.id,
                month: currentMonth,
              },
            });

          for (const record of records) {
            await this.prisma.emp_attendance.update({
              where: { id: record.id },
              data: {
                [attendanceField]: true,
                created_at: new Date(currentDate.setHours(0, 0, 0, 0)),
                ...(attendanceField === 'is_fullday' && {
                  is_halfday: false,
                  is_late: false,
                }),
                ...(attendanceField === 'is_halfday' && { is_late: false }),
              },
            });
          }

          await updateMonthlyLeaveRecord(existingRecord, {
            deduction_leaves:
              (existingRecord?.deduction_leaves ?? 0) + deductionAmount,
          });

          if (existingYearlyLeaveRecord?.id) {
            await this.prisma.yearlyLeaveRecord.update({
              where: { id: existingYearlyLeaveRecord.id },
              data: {
                remaining_leaves:
                  (existingYearlyLeaveRecord?.remaining_leaves ?? 0) -
                  deductionAmount,
              },
            });
          }
        }
      };

      if (request?.mark_halfday) await handleLeaveMarking('is_halfday', 0.5);
      if (request?.mark_fullday) await handleLeaveMarking('is_fullday', 1);

      const resetLeaveMarking = async (
        attendanceField: string,
        deductionAmount: number,
      ) => {
        const records = await this.prisma.emp_attendance.findMany({
          where: {
            created_at: { gte: timeIn, lte: timeOut },
            emp_code: user.employement_code,
            [attendanceField]: true,
          },
        });

        if (records.length > 0) {
          const existingRecord =
            await this.prisma.monthly_leave_record.findFirst({
              where: {
                yearly_record_id: existingYearlyLeaveRecord?.id,
                month: currentMonth,
              },
            });

          for (const record of records) {
            await this.prisma.emp_attendance.update({
              where: { id: record.id },
              data: {
                [attendanceField]: false,
                ...(attendanceField === 'is_fullday' && {
                  is_halfday: false,
                  is_late: false,
                }),
                ...(attendanceField === 'is_halfday' && { is_late: false }),
              },
            });
          }

          await updateMonthlyLeaveRecord(existingRecord, {
            deduction_leaves: Math.max(
              (existingRecord?.deduction_leaves ?? 0) - deductionAmount,
              0,
            ),
          });

          if (
            existingYearlyLeaveRecord?.id &&
            existingYearlyLeaveRecord.remaining_leaves < 22
          ) {
            await this.prisma.yearlyLeaveRecord.update({
              where: { id: existingYearlyLeaveRecord.id },
              data: {
                remaining_leaves:
                  (existingYearlyLeaveRecord?.remaining_leaves ?? 0) +
                  deductionAmount,
              },
            });
          }
        }
      };

      if (request?.is_late) {
        const existingLateRecord = await this.prisma.emp_attendance.findFirst({
          where: {
            emp_code: user.employement_code,
            created_at: { gte: timeIn, lte: timeOut },
            is_late: true,
          },
        });

        if (existingLateRecord) {
          await resetLeaveMarking('is_late', 0);
        }
      }

      if (request?.is_halfday) {
        const existingHalfdayRecord =
          await this.prisma.emp_attendance.findFirst({
            where: {
              emp_code: user.employement_code,
              created_at: { gte: timeIn, lte: timeOut },
              is_halfday: true,
            },
          });

        if (existingHalfdayRecord) {
          await resetLeaveMarking('is_halfday', 0.5);
        }
      }

      if (request?.is_fullday) {
        const existingFulldayRecord =
          await this.prisma.emp_attendance.findFirst({
            where: {
              emp_code: user.employement_code,
              created_at: { gte: timeIn, lte: timeOut },
              is_fullday: true,
            },
          });

        if (existingFulldayRecord) {
          await resetLeaveMarking('is_fullday', 1);
        }
      }

      return handleSuccessResponse('', 200, 'success');
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async fixMonthlyDeduction(dto) {
    try {
      const monthly_records = await this.prisma.monthly_leave_record.update({
        where: {
          id: dto?.id,
        },
        data: {
          deduction_late: +dto.deduction_late,
          deduction_leaves: +dto.deduction_leaves,
          late_count: +dto.late_count,
        },
      });

      const existingYearlyLeaveRecord =
        await this.prisma.yearlyLeaveRecord.findFirst({
          where: { id: dto.yearly_record_id },
          include: { monthly_records: true },
        });

      if (existingYearlyLeaveRecord) {
        await this.prisma.yearlyLeaveRecord.update({
          where: {
            id: existingYearlyLeaveRecord?.id,
          },
          data: {
            remaining_leaves:
              existingYearlyLeaveRecord?.total_leaves -
              (existingYearlyLeaveRecord?.monthly_records?.reduce(
                (acc: any, entry) =>
                  acc +
                  (entry?.deduction_leaves || 0) +
                  (entry?.deduction_late || 0),
                0,
              ) +
                (existingYearlyLeaveRecord?.availed_leaves ?? 0)),
          },
        });
      }
    } catch (error) {
      return error;
    }
  }

  // not for normal use
  async setDeduction(attendance: IEmployeeData[]) {
    try {
      const filterAttendance = attendance?.filter(
        (x) =>
          x.status == 'Late' ||
          x.status == 'Half Day' ||
          x.status == 'Full Day Off',
      );

      for (let att of filterAttendance) {
        const currentDate = new Date(att.date);
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const existingYearlyLeaveRecord =
          await this.prisma.yearlyLeaveRecord.findFirst({
            where: { user_id: att.user?.id, year: currentYear },
          });

        const existingRecord = await this.prisma.monthly_leave_record.findFirst(
          {
            where: {
              yearly_record_id: existingYearlyLeaveRecord?.id,
              month: currentMonth,
            },
          },
        );

        if (att.status == 'Late') {
          if (existingRecord) {
            await this.prisma.monthly_leave_record.update({
              where: { id: existingRecord.id },
              data: { late_count: (existingRecord.late_count ?? 0) + 1 },
            });
          } else {
            await this.prisma.monthly_leave_record.create({
              data: {
                month: currentMonth,
                yearly_record_id: existingYearlyLeaveRecord?.id,
                late_count: 1,
              },
            });
          }
        }

        if (att.status == 'Half Day') {
          if (existingRecord) {
            await this.prisma.monthly_leave_record.update({
              where: {
                id: existingRecord.id,
              },
              data: {
                deduction_leaves: (existingRecord?.deduction_leaves ?? 0) + 0.5,
              },
            });
          } else {
            await this.prisma.monthly_leave_record.create({
              data: {
                yearly_record_id: existingYearlyLeaveRecord?.id,
                month: currentMonth,
                deduction_leaves: 0.5,
              },
            });
          }
          if (existingYearlyLeaveRecord?.id) {
            await this.prisma.yearlyLeaveRecord.update({
              where: { id: existingYearlyLeaveRecord?.id },
              data: {
                remaining_leaves:
                  (existingYearlyLeaveRecord?.remaining_leaves ?? 0) - 0.5,
              },
            });
          }
        }

        if (att.status == 'Full Day Off') {
          if (existingRecord) {
            await this.prisma.monthly_leave_record.update({
              where: {
                id: existingRecord.id,
              },
              data: {
                deduction_leaves: (existingRecord?.deduction_leaves ?? 0) + 1,
              },
            });
          } else {
            await this.prisma.monthly_leave_record.create({
              data: {
                yearly_record_id: existingYearlyLeaveRecord?.id,
                month: currentMonth,
                deduction_leaves: 1,
              },
            });
          }
          if (existingYearlyLeaveRecord?.id) {
            await this.prisma.yearlyLeaveRecord.update({
              where: { id: existingYearlyLeaveRecord?.id },
              data: {
                remaining_leaves:
                  (existingYearlyLeaveRecord?.remaining_leaves ?? 0) - 1,
              },
            });
          }
        }
      }

      return handleSuccessResponse('', 200, filterAttendance);
    } catch (error) {
      return error;
    }
  }

  async deleteFulldayOffs(start_date: any, end_date: any) {
    // const start_date = new Date(date).setHours(0, 0, 0, 0);
    // const end_date = new Date(date).setHours(23, 59, 59, 999);

    const startDate = new Date(
      new Date(start_date).setUTCHours(0, 0, 0, 0),
    ).toISOString();
    const endDate = new Date(
      new Date(end_date).setUTCHours(23, 59, 59, 999),
    ).toISOString();

    const users = await this.getActiveUsers();
    const dayAttendance = await this.prisma.emp_attendance.findMany({
      where: {
        emp_code: { in: users?.map((x) => x.employement_code) },
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        is_fullday: true,
      },
      // select: {
      //   emp_code: true,
      //   punch_time: true,
      //   punch_state: true,
      //   id: true,
      //   is_fullday: true,
      //   is_halfday: true,
      //   is_late: true,
      //   created_at: true,
      //   leave_status: true,
      //   user: {
      //     select: {
      //       name: true,
      //     },
      //   },
      // },
    });

    const filteredRecords = dayAttendance.filter(
      (record) =>
        record.punch_time ||
        record.leave_status === 'Work From Home' ||
        record.leave_status === 'Holiday',
    );

    const uniqueDateMap = new Map();

    filteredRecords.forEach((record) => {
      const date = new Date(record.created_at);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const dateOnly = `${year}-${month}-${day}`;
      const key = `${record.emp_code}-${dateOnly}`;

      if (!uniqueDateMap.has(key)) {
        uniqueDateMap.set(key, []);
      }
      uniqueDateMap.get(key).push(record);
    });

    const result = [];

    uniqueDateMap.forEach((records) => {
      if (records.every((record) => record.is_fullday)) {
        result.push(...records);
      }
    });

    const recordIdsToDelete = result.map((x) => x.id);
    const batchSize = 100; // Adjust the batch size as needed
    const deleteAttendanceRecords = [];

    for (let i = 0; i < recordIdsToDelete.length; i += batchSize) {
      const batch = recordIdsToDelete.slice(i, i + batchSize);

      // const abc = await this.prisma.emp_attendance.deleteMany({
      //   where: {
      //     id: { in: batch },
      //   },
      // });
      const abc = await this.prisma.emp_attendance.updateMany({
        where: {
          id: { in: batch },
        },
        data: {
          is_fullday: false,
          is_halfday: false,
          is_late: false,
        },
      });
      deleteAttendanceRecords.push(abc);
    }

    const data = {
      deleteAttendanceRecords: deleteAttendanceRecords,
      result: result,
    };

    return data;
  }

  async deleteHalfdayOffs(start_date: any, end_date: any) {
    // const start_date = new Date(date).setHours(0, 0, 0, 0);
    // const end_date = new Date(date).setHours(23, 59, 59, 999);

    const startDate = new Date(
      new Date(start_date).setUTCHours(0, 0, 0, 0),
    ).toISOString();
    const endDate = new Date(
      new Date(end_date).setUTCHours(23, 59, 59, 999),
    ).toISOString();

    const users = await this.getActiveUsers();
    const dayAttendance = await this.prisma.emp_attendance.findMany({
      where: {
        emp_code: { in: users?.map((x) => x.employement_code) },
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        is_halfday: true,
      },
      // select: {
      //   emp_code: true,
      //   punch_time: true,
      //   punch_state: true,
      //   id: true,
      //   is_fullday: true,
      //   is_halfday: true,
      //   is_late: true,
      //   created_at: true,
      //   leave_status: true,
      //   user: {
      //     select: {
      //       name: true,
      //     },
      //   },
      // },
    });

    const filteredRecords = dayAttendance.filter(
      (record) =>
        record.punch_time ||
        record.leave_status === 'Work From Home' ||
        record.leave_status === 'Holiday',
    );

    const uniqueDateMap = new Map();

    filteredRecords.forEach((record) => {
      const date = new Date(record.created_at);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const dateOnly = `${year}-${month}-${day}`;
      const key = `${record.emp_code}-${dateOnly}`;

      if (!uniqueDateMap.has(key)) {
        uniqueDateMap.set(key, []);
      }
      uniqueDateMap.get(key).push(record);
    });

    const result = [];

    uniqueDateMap.forEach((records) => {
      if (records.every((record) => record.is_halfday)) {
        result.push(...records);
      }
    });

    const recordIdsToDelete = result.map((x) => x.id);
    const batchSize = 100; // Adjust the batch size as needed
    const deleteAttendanceRecords = [];

    for (let i = 0; i < recordIdsToDelete.length; i += batchSize) {
      const batch = recordIdsToDelete.slice(i, i + batchSize);

      // const abc = await this.prisma.emp_attendance.deleteMany({
      //   where: {
      //     id: { in: batch },
      //   },
      // });
      const abc = await this.prisma.emp_attendance.updateMany({
        where: {
          id: { in: batch },
        },
        data: {
          is_fullday: false,
          is_halfday: false,
          is_late: false,
        },
      });
      deleteAttendanceRecords.push(abc);
    }

    const data = {
      deleteAttendanceRecords: deleteAttendanceRecords,
      result: result,
    };

    return data;
  }

  async deleteLatedayOffs(start_date: any, end_date: any) {
    // const start_date = new Date(date).setHours(0, 0, 0, 0);
    // const end_date = new Date(date).setHours(23, 59, 59, 999);

    const startDate = new Date(
      new Date(start_date).setUTCHours(0, 0, 0, 0),
    ).toISOString();
    const endDate = new Date(
      new Date(end_date).setUTCHours(23, 59, 59, 999),
    ).toISOString();

    const users = await this.getActiveUsers();
    const dayAttendance = await this.prisma.emp_attendance.findMany({
      where: {
        emp_code: { in: users?.map((x) => x.employement_code) },
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        is_late: true,
      },
      // select: {
      //   emp_code: true,
      //   punch_time: true,
      //   punch_state: true,
      //   id: true,
      //   is_fullday: true,
      //   is_halfday: true,
      //   is_late: true,
      //   created_at: true,
      //   leave_status: true,
      //   user: {
      //     select: {
      //       name: true,
      //     },
      //   },
      // },
    });

    const filteredRecords = dayAttendance.filter(
      (record) =>
        record.punch_time ||
        record.leave_status === 'Work From Home' ||
        record.leave_status === 'Holiday',
    );

    const uniqueDateMap = new Map();

    filteredRecords.forEach((record) => {
      const date = new Date(record.created_at);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const dateOnly = `${year}-${month}-${day}`;
      const key = `${record.emp_code}-${dateOnly}`;

      if (!uniqueDateMap.has(key)) {
        uniqueDateMap.set(key, []);
      }
      uniqueDateMap.get(key).push(record);
    });

    const result = [];

    uniqueDateMap.forEach((records) => {
      if (records.every((record) => record.is_late)) {
        result.push(...records);
      }
    });

    const recordIdsToDelete = result.map((x) => x.id);
    const batchSize = 100; // Adjust the batch size as needed
    const deleteAttendanceRecords = [];

    for (let i = 0; i < recordIdsToDelete.length; i += batchSize) {
      const batch = recordIdsToDelete.slice(i, i + batchSize);

      // const abc = await this.prisma.emp_attendance.deleteMany({
      //   where: {
      //     id: { in: batch },
      //   },
      // });
      const abc = await this.prisma.emp_attendance.updateMany({
        where: {
          id: { in: batch },
        },
        data: {
          is_fullday: false,
          is_halfday: false,
          is_late: false,
        },
      });
      deleteAttendanceRecords.push(abc);
    }

    const data = {
      deleteAttendanceRecords: deleteAttendanceRecords,
      result: result,
    };

    return data;
  }

  async deleteFulldayOffs2(start_date: any, end_date: any) {
    // const start_date = new Date(date).setHours(0, 0, 0, 0);
    // const end_date = new Date(date).setHours(23, 59, 59, 999);

    const startDate = new Date(
      new Date(start_date).setUTCHours(0, 0, 0, 0),
    ).toISOString();
    const endDate = new Date(
      new Date(end_date).setUTCHours(23, 59, 59, 999),
    ).toISOString();

    const users = await this.getActiveUsers();
    const dayAttendance = await this.prisma.emp_attendance.findMany({
      where: {
        emp_code: { in: users?.map((x) => x.employement_code) },
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      // select: {
      //   emp_code: true,
      //   punch_time: true,
      //   punch_state: true,
      //   id: true,
      //   is_fullday: true,
      //   is_halfday: true,
      //   is_late: true,
      //   is_leave: true,
      //   created_at: true,
      //   leave_status: true,
      //   user: {
      //     select: {
      //       name: true,
      //     },
      //   },
      // },
    });

    const groupedRecords = new Map();

    dayAttendance.forEach((record) => {
      const date = new Date(record.created_at);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const dateOnly = `${year}-${month}-${day}`;
      const key = `${record.emp_code}-${dateOnly}`;

      if (!groupedRecords.has(key)) {
        groupedRecords.set(key, []);
      }
      groupedRecords.get(key).push(record);
    });

    const recordsToDelete = [];

    // Identify groups with both is_fullday = true and is_leave = true
    groupedRecords.forEach((records, key) => {
      const hasFullDay = records.some((record) => record.is_fullday);
      const hasHalfDay = records.some((record) => record.is_halfday);
      const hasLate = records.some((record) => record.is_late);
      const hasLeave = records.some((record) => record.is_leave);
      const haswWfh = records.some(
        (record) => record.leave_status === 'Work From Home',
      );

      if (hasFullDay && hasLeave) {
        // Keep the entry with is_leave = true and mark the entry with is_fullday = true for deletion
        records.forEach((record) => {
          if (record.is_fullday && !record.is_leave) {
            recordsToDelete.push(record);
          }
        });
      }
      if (hasHalfDay && hasLeave) {
        // Keep the entry with is_leave = true and mark the entry with is_halfday = true for deletion
        records.forEach((record) => {
          if (record.is_halfday && !record.is_leave) {
            recordsToDelete.push(record);
          }
        });
      }
      if (hasLate && hasLeave) {
        // Keep the entry with is_leave = true and mark the entry with is_late = true for deletion
        records.forEach((record) => {
          if (record.is_late && !record.is_leave) {
            recordsToDelete.push(record);
          }
        });
      }
      if (hasFullDay && haswWfh) {
        records.forEach((record) => {
          if (record.is_fullday && record.leave_status !== 'Work From Home') {
            recordsToDelete.push(record);
          }
        });
      }
      if (hasHalfDay && haswWfh) {
        records.forEach((record) => {
          if (record.is_halfday && record.leave_status !== 'Work From Home') {
            recordsToDelete.push(record);
          }
        });
      }
      if (hasLate && haswWfh) {
        records.forEach((record) => {
          if (record.is_late && record.leave_status !== 'Work From Home') {
            recordsToDelete.push(record);
          }
        });
      }
    });

    const recordIdsToDelete = recordsToDelete.map((x) => x.id);
    const batchSize = 100; // Adjust the batch size as needed
    const deleteAttendanceRecords = [];

    for (let i = 0; i < recordIdsToDelete.length; i += batchSize) {
      const batch = recordIdsToDelete.slice(i, i + batchSize);

      // const abc = await this.prisma.emp_attendance.deleteMany({
      //   where: {
      //     id: { in: batch },
      //   },
      // });
      const abc = await this.prisma.emp_attendance.updateMany({
        where: {
          id: { in: batch },
        },
        data: {
          is_fullday: false,
          is_halfday: false,
          is_late: false,
        },
      });
      deleteAttendanceRecords.push(abc);
    }

    const data = {
      deleteAttendanceRecords: deleteAttendanceRecords,
      // result: result,
      recordsToDelete: recordsToDelete,
    };

    return data;
  }

  async updateLateDeductions(emp_code: any) {
    try {
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      const date = new Date();
      const currentMonth = date.getMonth();
      const year = 2024;

      let monthlyLateDeduction = 0;

      for (let month = 0; month <= currentMonth; month++) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
        const lates = await this.prisma.emp_attendance.findMany({
          where: {
            created_at: {
              gte: startDate,
              lte: endDate,
            },
            emp_code: emp_code,
            is_late: true,
            is_halfday: false,
            is_fullday: false,
          },
          select: { created_at: true },
          distinct: ['created_at', 'emp_code'],
        });
        const formatDate = (date) => date.toISOString().split('T')[0];
        const lateDates = lates.map((item) => formatDate(item.created_at));
        const uniqueLateDates = new Set(lateDates);
        const lateCount = uniqueLateDates.size;
        const lateDeduction = Math.floor(lateCount / 6);

        monthlyLateDeduction = monthlyLateDeduction + lateDeduction;
      }

      console.log('monthlyLateDeduction', monthlyLateDeduction);
      // console.log('lateCount', lateCount);
    } catch {
      console.log('error');
    }
  }

  async dashboardOverViewCount(query, request: any) {
    const departmentid = '64eda57056fd245f8b3b4c25';

    const result = await this.dashboardOverview.getDashboardOverview(
      query,
      query?.startDate,
      query?.endDate,
      request,
    );
    return result;
  }

  async yearlyRecord(query: any) {
    if (!query?.emp_code?.trim()) {
      throw new HttpException(
        'Kindly provide Resource Employment Code',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!query?.year?.trim()) {
      throw new HttpException('Kindly provide Year', HttpStatus.BAD_REQUEST);
    }

    const emp_code = query.emp_code.toString();
    const year = parseInt(query.year, 10);
    const date = new Date();
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const monthsToProcess = year < currentYear ? 12 : currentMonth + 1;
    const monthlyDataPromises = [];

    for (let month = 0; month < monthsToProcess; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

      monthlyDataPromises.push(
        Promise.all([
          runAggregationPipeline(
            [{ employement_code: emp_code }],
            startDate,
            endDate,
            false,
          ),
        ]),
      );
    }

    const monthlyDataResults = await Promise.all(monthlyDataPromises);

    const monthlyData = monthlyDataResults.map((result, index) => {
      const aggregationData = result[0]?.data || [];

      const totalHours = aggregationData.reduce((sum, d) => {
        // Regular office hours
        if (d.check_in && d.check_out && d.status !== 'Work From Home') {
          return (
            sum +
            (+new Date(d.check_out) - +new Date(d.check_in)) / (1000 * 60 * 60)
          );
        }
        // WFH hours (using wfh_hours if available, otherwise default to 9 hours)
        if (d.status === 'Work From Home') {
          return sum + 9;
        }
        return sum;
      }, 0);

      // Count different day types
      const lateDays = aggregationData.filter(
        (d) => d.status === 'Late',
      ).length;
      const halfDays = aggregationData.filter(
        (d) => d.status === 'Half Day',
      ).length;
      const fullDaysOff = aggregationData.filter(
        (d) => d.status === 'Full Day Off',
      ).length;
      const wfhDays = aggregationData.filter(
        (d) => d.status === 'Work From Home',
      ).length;
      const leaveDays = aggregationData.filter(
        (d) => d.status === 'On-Leave',
      ).length;
      const holidayDays = aggregationData.filter(
        (d) => d.status === 'Holiday',
      ).length;
      const presentDays = aggregationData.filter(
        (d) =>
          d.status === 'On-Time' ||
          d.status === 'Late' ||
          d.status === 'Work From Home',
      ).length;

      const requiredHours = result[0]?.netWorkingHours;

      return {
        month: monthNames[index],
        wfhData: wfhDays,
        lateData: lateDays,
        halfdayData: halfDays,
        fulldayData: fullDaysOff,
        leaveData: leaveDays,
        holidayData: holidayDays,
        totalReqHours: requiredHours,
        hours: Math.round(totalHours),
        presentDays,
      };
    });

    return handleSuccessResponse(
      '',
      200,
      monthlyData.map((data) => ({
        month: data.month,
        wfhData: data.wfhData,
        lateData: data.lateData,
        halfdayData: data.halfdayData,
        fulldayData: data.fulldayData,
        leaveData: data.leaveData,
        holidayData: data.holidayData,
        totalReqHours: data.totalReqHours,
        hours: data.hours,
      })),
    );
  }

  @Cron('30 11 * * 1-5')
  async SendAttendanceToHREmail() {
    if (fs.existsSync(lockFilePath)) {
      console.log('Another instance is already running the job.');
      return;
    }

    try {
      // Create the lock file
      fs.writeFileSync(lockFilePath, '');

      const data = await this.dashboardOverview.SendAttendanceToHREmail();
      console.log(data.data);
    } catch (error) {
      console.log('email to hr', error);
    } finally {
      // Remove the lock file
      fs.unlinkSync(lockFilePath);
    }
  }

  @Cron('10 14 * * 1-5')
  async SendAttendanceToHREmailAt4Oclock() {
    if (fs.existsSync(lockFilePath)) {
      console.log('Another instance is already running the job.');
      return;
    }

    try {
      // Create the lock file
      fs.writeFileSync(lockFilePath, '');

      const data = await this.dashboardOverview.SendAttendanceToHREmail();
      console.log(data.data);
    } catch (error) {
      console.log('email to hr', error);
    } finally {
      // Remove the lock file
      fs.unlinkSync(lockFilePath);
    }
  }

  // @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_4PM)
  async SendAttendanceWarningToEmployees() {
    if (fs.existsSync(lockFilePath)) {
      console.log('Another instance is already running the job.');
      return;
    }

    try {
      // Create the lock file
      fs.writeFileSync(lockFilePath, '');

      const data =
        await this.dashboardOverview.SendAttendanceWarningToEmployees();
      console.log(data.data);
    } catch (error) {
      console.log('email to hr', error);
    } finally {
      // Remove the lock file
      fs.unlinkSync(lockFilePath);
    }
  }
}

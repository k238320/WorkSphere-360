import { Injectable } from '@nestjs/common';
import { CreateFixAttendanceDto } from './dto/create-fix-attendance.dto';
import { UpdateFixAttendanceDto } from './dto/update-fix-attendance.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityManager } from 'typeorm';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';
import { runAggregationPipeline } from 'src/utils/helper';
import { AttendanceService } from 'src/attendance/attendance.service';
import { Cron, CronExpression } from '@nestjs/schedule';

interface MonthlyData {
  month: string;
  wfhData: number;
  lateData: number;
  halfdayData: number;
  fulldayData: number;
  leaveData: number;
  totalReqHours: number;
  hours: number;
}

@Injectable()
export class FixAttendanceService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private prisma: PrismaService,
    private readonly attendanceService: AttendanceService,
  ) {}

  create(createFixAttendanceDto: CreateFixAttendanceDto) {
    return 'This action adds a new fixAttendance';
  }

  findAll() {
    return `This action returns all fixAttendance`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fixAttendance`;
  }

  update(id: number, updateFixAttendanceDto: UpdateFixAttendanceDto) {
    return `This action updates a #${id} fixAttendance`;
  }

  remove(id: number) {
    return `This action removes a #${id} fixAttendance`;
  }

  async employePunchingInCroneJob(date: string) {
    const startDate = new Date(`${date}T00:00:00Z`);
    const endDate = new Date(`${date}T23:00:00Z`);
    try {
      const empCode = 315;

      const query = `SELECT pe.first_name AS name, pe.emp_code, ict.punch_time, ict.punch_state
               FROM iclock_transaction ict
               INNER JOIN personnel_employee pe ON pe.emp_code = ict.emp_code
               WHERE ict.punch_state = '0' 
               AND ict.emp_code = '${empCode}' 
               AND ict.punch_time BETWEEN to_timestamp('${startDate.toISOString()}', 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')
               AND to_timestamp('${endDate.toISOString()}', 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')
               GROUP BY ict.id, ict.punch_time, pe.emp_code, pe.first_name, ict.punch_state
               ORDER BY ict.punch_time ASC;`;

      // const query = `SELECT pe.first_name AS name, pe.emp_code, ict.punch_time, ict.punch_state
      //                 FROM iclock_transaction ict
      //                 INNER JOIN personnel_employee pe ON pe.emp_code = ict.emp_code
      //                 WHERE ict.punch_state = '0'
      //                 AND ict.punch_time BETWEEN to_timestamp('${startDate.toISOString()}', 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')
      //                 AND to_timestamp('${endDate.toISOString()}', 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')
      //                 GROUP BY ict.id, ict.punch_time, pe.emp_code, pe.first_name, ict.punch_state
      //                 ORDER BY ict.punch_time ASC;`;

      const results: any[] = await this.entityManager.query(query);
      // return results;

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

        const personnel_employee = await this.prisma.emp_attendance.createMany({
          data: adjustedResults.map((x) => ({
            emp_code: x?.emp_code,
            name: x?.name,
            punch_state: +x?.punch_state,
            punch_time: x?.punch_time,
            created_at: x?.punch_time,
            location_type_id: 1,
          })),
        });
      }

      return {
        results,
      };
    } catch (error) {
      console.log('error-->', error);
    }
  }

  async employePunchingOutCroneJob(date: string) {
    const startDate = new Date(`${date}T00:00:00Z`);
    const endDate = new Date(`${date}T23:00:00Z`);
    try {
      const query = `SELECT pe.first_name AS name, pe.emp_code, ict.punch_time, ict.punch_state
                      FROM iclock_transaction ict
                      INNER JOIN personnel_employee pe ON pe.emp_code = ict.emp_code
                      WHERE ict.punch_state = '1' 
                      AND ict.punch_time BETWEEN to_timestamp('${startDate.toISOString()}', 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')
                      AND to_timestamp('${endDate.toISOString()}', 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')
                      GROUP BY ict.id, ict.punch_time, pe.emp_code, pe.first_name, ict.punch_state
                      ORDER BY ict.punch_time ASC;`;

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

        const personnel_employee = await this.prisma.emp_attendance.createMany({
          data: adjustedResults.map((x) => ({
            emp_code: x?.emp_code,
            name: x?.name,
            punch_state: +x?.punch_state,
            punch_time: x?.punch_time,
            created_at: x?.punch_time,
            location_type_id: 1,
          })),
        });
      }

      return {
        results,
      };
    } catch (error) {
      console.log('error-->', error);
    }
  }

  async manageDailyAttendance(date: string) {
    try {
      // Parse the date from the query parameter
      const parsedDate = new Date(date);

      // Check if the parsed date is valid
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format');
      }

      const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
      const LateDay = new Date(parsedDate.setHours(10, 15, 0, 0));
      const HalfDay = new Date(parsedDate.setHours(12, 0, 0, 0));
      const FullDay = new Date(parsedDate.setHours(15, 0, 0, 0));
      const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            { employement_code: { not: null } },
            { employement_code: { not: '' } },
          ],
          status: true,
        },
      });

      if (users.length > 0) {
        const attendance = await runAggregationPipeline(
          users,
          startOfDay,
          endOfDay,
          false,
        );

        for (const user of users) {
          const emp_code = user.employement_code;
          const userAttendance = attendance?.data?.filter(
            (att) => att.emp_code === emp_code,
          );
          const earliestPunch = userAttendance?.reduce((earliest, record) => {
            return record.check_in;
          }, userAttendance[0]);

          if (earliestPunch) {
            const punchTime = new Date(earliestPunch);
            const hours = punchTime.getHours();
            const minutes = punchTime.getMinutes();

            if (hours < 10 || (hours === 10 && minutes < 16)) {
              const existing = await this.prisma.emp_attendance.findMany({
                where: {
                  emp_code: emp_code,
                  created_at: {
                    gte: startOfDay,
                    lt: endOfDay,
                  },
                  OR: [
                    {
                      punch_time: {
                        equals: null,
                      },
                    },
                    {
                      is_late: true,
                    },
                    {
                      is_halfday: true,
                    },
                    {
                      is_fullday: true,
                    },
                  ],
                },
              });

              if (existing?.length > 0) {
                await this.prisma.emp_attendance.deleteMany({
                  where: {
                    id: { in: existing?.map((x) => x.id) },
                  },
                });
              }
            } else if (hours === 10 && minutes >= 16) {
              const existing = await this.prisma.emp_attendance.findMany({
                where: {
                  emp_code: emp_code,
                  created_at: {
                    gte: startOfDay,
                    lt: endOfDay,
                  },
                  OR: [
                    {
                      punch_time: {
                        equals: null,
                      },
                    },
                    {
                      is_late: true,
                    },
                    {
                      is_halfday: true,
                    },
                    {
                      is_fullday: true,
                    },
                  ],
                },
              });

              if (existing?.length > 0) {
                await this.prisma.emp_attendance.deleteMany({
                  where: {
                    id: { in: existing?.map((x) => x.id) },
                  },
                });
              }

              await this.prisma.emp_attendance.create({
                data: {
                  emp_code: emp_code,
                  created_at: LateDay,
                  is_fullday: false,
                  is_late: true,
                  is_halfday: false,
                  location_type_id: 1,
                },
              });
            } else if (hours >= 12 && hours < 15) {
              const existing = await this.prisma.emp_attendance.findMany({
                where: {
                  emp_code: emp_code,
                  created_at: {
                    gte: startOfDay,
                    lt: endOfDay,
                  },
                  OR: [
                    {
                      punch_time: {
                        equals: null,
                      },
                    },
                    {
                      is_late: true,
                    },
                    {
                      is_halfday: true,
                    },
                    {
                      is_fullday: true,
                    },
                  ],
                },
              });

              if (existing?.length > 0) {
                await this.prisma.emp_attendance.deleteMany({
                  where: {
                    id: { in: existing?.map((x) => x.id) },
                  },
                });
              }

              await this.prisma.emp_attendance.create({
                data: {
                  emp_code: emp_code,
                  created_at: HalfDay,
                  is_fullday: false,
                  is_late: true,
                  is_halfday: true,
                  location_type_id: 1,
                },
              });
            } else if (hours >= 15) {
              const existing = await this.prisma.emp_attendance.findMany({
                where: {
                  emp_code: emp_code,
                  created_at: {
                    gte: startOfDay,
                    lt: endOfDay,
                  },
                  OR: [
                    {
                      punch_time: {
                        equals: null,
                      },
                    },
                    {
                      is_late: true,
                    },
                    {
                      is_halfday: true,
                    },
                    {
                      is_fullday: true,
                    },
                  ],
                },
              });

              if (existing?.length > 0) {
                await this.prisma.emp_attendance.deleteMany({
                  where: {
                    id: { in: existing?.map((x) => x.id) },
                  },
                });
              }

              await this.prisma.emp_attendance.create({
                data: {
                  emp_code: emp_code,
                  created_at: FullDay,
                  is_fullday: true,
                  is_late: true,
                  is_halfday: true,
                  location_type_id: 1,
                },
              });
            }
          } else {
            const checkIfExists = await this.prisma.emp_attendance.findMany({
              where: {
                created_at: {
                  gte: startOfDay,
                  lt: endOfDay,
                },
                emp_code: emp_code,
              },
            });

            let checkIfExists2 = checkIfExists?.filter((x) => {
              return (
                !x.leave_status ||
                (x.leave_status !== 'Work From Home' &&
                  x.leave_status !== 'On-Leave')
              );
            });

            let checkIfExists3 = checkIfExists?.filter((x) => {
              return (
                x.leave_status &&
                (x.leave_status === 'Work From Home' ||
                  x.leave_status === 'On-Leave')
              );
            });

            if (checkIfExists2?.length > 0) {
              await this.prisma.emp_attendance.deleteMany({
                where: {
                  id: { in: checkIfExists2?.map((x) => x.id) },
                },
              });
            }
            if (checkIfExists3?.length == 0) {
              const full = await this.prisma.emp_attendance.create({
                data: {
                  emp_code: emp_code,
                  created_at: FullDay,
                  is_fullday: true,
                  is_late: true,
                  is_halfday: true,
                  location_type_id: 1,
                },
              });
            }
          }
        }

        return handleSuccessResponse('', 200, attendance);
      }
    } catch (error) {
      handlePrismaError(error);
    }
  }

  @Cron('0 9 * * 6') // Every Saturday at 9:00 AM
  async updateAllEmployeeDeductions() {
    try {
      // Fetch the list of employees
      const employees = await this.prisma.user.findMany({
        where: {
          OR: [
            { employement_code: { not: null } },
            { employement_code: { not: '' } },
          ],
          status: true,
          super: false,
        },
      });

      const year = new Date().getFullYear();

      // Iterate through each employee
      for (const employee of employees) {
        // Call the yearlyRecord function for each employee
        const query = {
          emp_code: employee.employement_code,
          year: year.toString(),
        };
        const response = await this.attendanceService.yearlyRecord(query);

        // Process the response and update the records
        if (response?.data?.length > 0) {
          const monthlyData: MonthlyData[] = response.data;

          // Check if yearly leave record exists
          let yearlyRecord = await this.prisma.yearlyLeaveRecord.findFirst({
            where: { user_id: employee.id, year: year },
          });

          let availed_wfh = monthlyData.reduce(
            (sum, data) => sum + data.wfhData,
            0,
          );
          let availed_leaves = monthlyData.reduce(
            (sum, data) => sum + data.leaveData,
            0,
          );

          if (yearlyRecord) {
            // Update existing yearly leave record
            yearlyRecord = await this.prisma.yearlyLeaveRecord.update({
              where: { id: yearlyRecord.id },
              data: {
                availed_wfh: availed_wfh,
                availed_leaves: availed_leaves,
              },
            });
          } else {
            // Create new yearly leave record
            yearlyRecord = await this.prisma.yearlyLeaveRecord.create({
              data: {
                user_id: employee.id,
                year: year,
                total_leaves: 22,
                availed_leaves: 0,
                remaining_leaves: 22,
                availed_wfh: availed_wfh,
              },
            });
          }

          // Update monthly records
          for (const data of monthlyData) {
            const monthIndex =
              new Date(Date.parse(data.month + ' 1, ' + year)).getMonth() + 1;

            // Check if monthly record exists
            let monthlyRecord =
              await this.prisma.monthly_leave_record.findFirst({
                where: {
                  yearly_record_id: yearlyRecord.id,
                  month: monthIndex,
                },
              });
            const halfDay = data.halfdayData > 0 ? data.halfdayData * 0.5 : 0;
            const deduction_late = Math.floor(data.lateData / 3 / 2);
            if (monthlyRecord) {
              // Update existing monthly record
              await this.prisma.monthly_leave_record.update({
                where: { id: monthlyRecord.id },
                data: {
                  late_count: data.lateData,
                  deduction_leaves: halfDay + data.fulldayData,
                  deduction_late: deduction_late,
                },
              });
            } else {
              // Create new monthly record
              await this.prisma.monthly_leave_record.create({
                data: {
                  yearly_record_id: yearlyRecord.id,
                  month: monthIndex,
                  late_count: data.lateData,
                  deduction_leaves: halfDay + data.fulldayData,
                  deduction_late: deduction_late,
                },
              });
            }
          }

          // Calculate remaining leaves
          const monthlyRecords =
            await this.prisma.monthly_leave_record.findMany({
              where: { yearly_record_id: yearlyRecord.id },
            });

          const totalDeductionLeaves = monthlyRecords.reduce(
            (sum, record) => sum + (record.deduction_leaves || 0),
            0,
          );

          await this.prisma.yearlyLeaveRecord.update({
            where: { id: yearlyRecord.id },
            data: {
              remaining_leaves:
                yearlyRecord.total_leaves -
                yearlyRecord.availed_leaves -
                totalDeductionLeaves,
            },
          });
        }
      }

      console.log('Employee records updated successfully.');
    } catch (e) {
      console.error('Error updating employee records', e);
    }
  }

  async manageSingleEmployeeAttendanceTags(startDate: string, endDate: string) {
    try {
      function getDatesBetween(
        startDate: string | Date,
        endDate: string | Date,
      ): Date[] {
        const dates: Date[] = [];
        let currentDate = new Date(startDate); // Convert to Date object if needed
        const lastDate = new Date(endDate);

        while (currentDate <= lastDate) {
          dates.push(new Date(currentDate)); // Add the current date to the array
          currentDate.setDate(currentDate.getDate() + 1); // Increment by one day
        }

        return dates;
      }

      const dates = getDatesBetween(startDate, endDate);
      let array = [];

      for (const x of dates) {
        const parsedDate = new Date(x);

        const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
        const LateDay = new Date(parsedDate.setHours(11, 0, 0, 0));
        const HalfDay = new Date(parsedDate.setHours(12, 0, 0, 0));
        const FullDay = new Date(parsedDate.setHours(15, 0, 0, 0));
        const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

        // Fetch users
        const users = await this.prisma.user.findMany({
          where: {
            employement_code: '307',
            OR: [
              { employement_code: { not: null } },
              { employement_code: { not: '' } },
            ],
            status: true,
          },
        });

        if (users.length > 0) {
          const attendance = await runAggregationPipeline(
            users,
            startOfDay,
            endOfDay,
            false,
          );

          array.push(attendance);
          for (const user of users) {
            const emp_code = user.employement_code;
            const userAttendance = attendance?.data?.filter(
              (att) => att.emp_code === emp_code,
            );
            const earliestPunch = userAttendance?.reduce((earliest, record) => {
              return record.check_in;
            }, userAttendance[0]);

            if (earliestPunch) {
              const punchTime = new Date(earliestPunch);
              const hours = punchTime.getHours();

              if (hours < 11) {
                const existing = await this.prisma.emp_attendance.findMany({
                  where: {
                    emp_code: emp_code,
                    created_at: {
                      gte: startOfDay,
                      lt: endOfDay,
                    },
                    OR: [
                      {
                        punch_time: {
                          equals: null,
                        },
                      },
                      {
                        is_late: true,
                      },
                      {
                        is_halfday: true,
                      },
                      {
                        is_fullday: true,
                      },
                    ],
                  },
                });

                if (existing?.length > 0) {
                  await this.prisma.emp_attendance.deleteMany({
                    where: {
                      id: { in: existing?.map((x) => x.id) },
                    },
                  });
                }
              } else if (hours === 11) {
                const existing = await this.prisma.emp_attendance.findMany({
                  where: {
                    emp_code: emp_code,
                    created_at: {
                      gte: startOfDay,
                      lt: endOfDay,
                    },
                    OR: [
                      {
                        punch_time: {
                          equals: null,
                        },
                      },
                      {
                        is_late: true,
                      },
                      {
                        is_halfday: true,
                      },
                      {
                        is_fullday: true,
                      },
                    ],
                  },
                });

                if (existing?.length > 0) {
                  await this.prisma.emp_attendance.deleteMany({
                    where: {
                      id: { in: existing?.map((x) => x.id) },
                    },
                  });
                }

                await this.prisma.emp_attendance.create({
                  data: {
                    emp_code: emp_code,
                    created_at: LateDay,
                    is_fullday: false,
                    is_late: true,
                    is_halfday: false,
                    location_type_id: 1,
                  },
                });
              } else if (hours >= 12 && hours < 15) {
                const existing = await this.prisma.emp_attendance.findMany({
                  where: {
                    emp_code: emp_code,
                    created_at: {
                      gte: startOfDay,
                      lt: endOfDay,
                    },
                    OR: [
                      {
                        punch_time: {
                          equals: null,
                        },
                      },
                      {
                        is_late: true,
                      },
                      {
                        is_halfday: true,
                      },
                      {
                        is_fullday: true,
                      },
                    ],
                  },
                });

                if (existing?.length > 0) {
                  await this.prisma.emp_attendance.deleteMany({
                    where: {
                      id: { in: existing?.map((x) => x.id) },
                    },
                  });
                }

                await this.prisma.emp_attendance.create({
                  data: {
                    emp_code: emp_code,
                    created_at: HalfDay,
                    is_fullday: false,
                    is_late: true,
                    is_halfday: true,
                    location_type_id: 1,
                  },
                });
              } else if (hours >= 15) {
                const existing = await this.prisma.emp_attendance.findMany({
                  where: {
                    emp_code: emp_code,
                    created_at: {
                      gte: startOfDay,
                      lt: endOfDay,
                    },
                    OR: [
                      {
                        punch_time: {
                          equals: null,
                        },
                      },
                      {
                        is_late: true,
                      },
                      {
                        is_halfday: true,
                      },
                      {
                        is_fullday: true,
                      },
                    ],
                  },
                });

                if (existing?.length > 0) {
                  await this.prisma.emp_attendance.deleteMany({
                    where: {
                      id: { in: existing?.map((x) => x.id) },
                    },
                  });
                }

                await this.prisma.emp_attendance.create({
                  data: {
                    emp_code: emp_code,
                    created_at: FullDay,
                    is_fullday: true,
                    is_late: true,
                    is_halfday: true,
                    location_type_id: 1,
                  },
                });
              }
            } else {
              const checkIfExists = await this.prisma.emp_attendance.findMany({
                where: {
                  created_at: {
                    gte: startOfDay,
                    lt: endOfDay,
                  },
                  emp_code: emp_code,
                },
              });

              let checkIfExists2 = checkIfExists?.filter((x) => {
                return (
                  !x.leave_status ||
                  (x.leave_status !== 'Work From Home' &&
                    x.leave_status !== 'On-Leave')
                );
              });

              let checkIfExists3 = checkIfExists?.filter((x) => {
                return (
                  x.leave_status &&
                  (x.leave_status === 'Work From Home' ||
                    x.leave_status === 'On-Leave')
                );
              });

              if (checkIfExists2?.length > 0) {
                await this.prisma.emp_attendance.deleteMany({
                  where: {
                    id: { in: checkIfExists2?.map((x) => x.id) },
                  },
                });
              }
              if (checkIfExists3?.length == 0) {
                const full = await this.prisma.emp_attendance.create({
                  data: {
                    emp_code: emp_code,
                    created_at: FullDay,
                    is_fullday: true,
                    is_late: true,
                    is_halfday: true,
                    location_type_id: 1,
                  },
                });
              }
            }
          }
        }
      }

      return handleSuccessResponse('', 200, array);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

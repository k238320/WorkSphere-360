import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { CreateDxbAttendanceDto } from './dto/create-dxb-attendance.dto';
import { UpdateDxbAttendanceDto } from './dto/update-dxb-attendance.dto';
import { PrismaService } from 'src/prisma/prisma.service';

import * as fs from 'fs';
import * as path from 'path';
import { runAggregationLateAttendance } from 'src/utils/helper';
import { handlePrismaError } from 'src/utils';

const lockFilePath = path.resolve(__dirname, 'cron-lock.txt');
const CheckinCheckOutFile = path.resolve(
  __dirname,
  'Checkin-Check-Out-lock.txt',
);

@Injectable()
export class DxbAttendanceService implements OnModuleInit {
  private DXBDbConnection: DataSource;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Initialize third database connection manually
    this.DXBDbConnection = new DataSource({
      type: 'postgres',
      host: process.env['PGSQL_HOST_DXB'],
      port: +process.env['PGSQL_PORT_DXB'],
      username: process.env['PGSQL_USER_DXB'],
      password: process.env['PGSQL_PASS_DXB'],
      database: process.env['PGSQL_DB_DXB'],
      entities: [],
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    await this.DXBDbConnection.initialize();
  }
  create(createDxbAttendanceDto: CreateDxbAttendanceDto) {
    return 'This action adds a new dxbAttendance';
  }

  findAll() {
    return `This action returns all dxbAttendance`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dxbAttendance`;
  }

  update(id: number, updateDxbAttendanceDto: UpdateDxbAttendanceDto) {
    return `This action updates a #${id} dxbAttendance`;
  }

  remove(id: number) {
    return `This action removes a #${id} dxbAttendance`;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async fetchDataFromThirdDb() {
    if (fs.existsSync(CheckinCheckOutFile)) {
      console.log('Another instance is already running the job.');
      return;
    }

    if (!this.DXBDbConnection?.isInitialized) {
      console.error('DXBDbConnection is not initialized.');
      return;
    }

    const queryRunner = this.DXBDbConnection.createQueryRunner();

    try {
      // Create the lock file
      fs.writeFileSync(lockFilePath, '');
      await queryRunner.connect();

      // Fetch the latest punch time from Prisma for comparison
      const latestPunch = await this.prisma.emp_attendance.findFirst({
        orderBy: {
          punch_time: 'desc',
        },
        where: {
          location_type_id: 2, // Dubai location
        },
      });

      const lastPunchTime =
        latestPunch?.punch_time?.toISOString() || '1970-01-01T00:00:00.000Z';

      // Query the Dubai database for new attendance records
      const query = `
      SELECT
        date, time, authentication_result, device_name,
        device_serial_no, resource_name, card_reader_name,
        first_name, last_name, full_name, department, card_no,
        direction, date_and_time, id, attendance_status
      FROM curveattendance
      WHERE date_and_time > to_timestamp($1, 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')
      ORDER BY date_and_time ASC;
    `;

      const results = await queryRunner.query(query, [lastPunchTime]);

      if (results?.length > 0) {
        // Filter out duplicates using Prisma to check existing IDs
        const uniqueResults = [];

        for (const record of results) {
          const exists = await this.prisma.emp_attendance.findFirst({
            where: {
              emp_code: String(record.id + 2000),
              punch_time: new Date(record.date_and_time),
            },
          });

          if (!exists) {
            uniqueResults.push(record);
          }
        }

        if (uniqueResults.length > 0) {
          // Process the filtered data
          const adjustedResults = uniqueResults.map((record) => ({
            emp_code: String(record.id + 2000),
            name:
              record.full_name ||
              `${record.first_name} ${record.last_name}`.trim(),
            punch_state:
              record.attendance_status === '1-Checkin'
                ? 0
                : record.attendance_status == '2-Checkout'
                ? 1
                : record.attendance_status == '4-Breakin'
                ? 0
                : record.attendance_status == '3-Breakout'
                ? 1
                : record.attendance_status == '5-OTin'
                ? 0
                : 1,
            punch_time: new Date(record.date_and_time),
            created_at: new Date(record.date_and_time),
            location_type_id: 2, // Dubai
          }));

          // Store the processed data in the Prisma database
          await this.prisma.emp_attendance.createMany({
            data: adjustedResults,
          });

          console.log(
            `Inserted ${adjustedResults.length} records from Dubai DB.`,
          );
        } else {
          console.log('No new unique records from Dubai DB.');
        }
      } else {
        console.log('No new records from Dubai DB.');
      }
    } catch (error) {
      console.error('Error in Dubai attendance cron job:', error);
    } finally {
      await queryRunner.release();

      if (fs.existsSync(CheckinCheckOutFile)) {
        fs.unlinkSync(CheckinCheckOutFile);
      }
    }
  }

  /**
   * Marks users as late if they haven't recorded attendance for the day and updates monthly leave records.
   */
  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_9AM)
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
          name: 'dxb_late_crone_job',
        },
      });

      if (late_crone_job?.id) {
        return;
      } else {
        await this.prisma.cronJob.create({
          data: {
            name: 'dxb_late_crone_job',
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
        AND: [
          {
            OR: [
              { employement_code: { not: null } },
              { employement_code: { not: '' } },
            ],
          },
          { status: true },
          {
            OR: [
              { employement_code_dxb: { not: null } },
              { employement_code_dxb: { not: '' } },
            ],
          },
          {
            user_details: {
              every: {
                location_type_id: 2,
              },
            },
          },
        ],
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
        created_at: new Date(startOfDay.setHours(9, 0, 0, 0)),
        location_type_id: 2,
      })),
    });
  }

  /**
   * Marks users as late if they haven't recorded attendance for the day and updates monthly leave records.
   */

  /**
   * Marks users as Half day if they haven't recorded attendance for the day and updates monthly leave records and deduct 0.5 leaves.
   */

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_09_30AM)
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
          name: 'dxb_halfday_crone_job',
        },
      });

      if (existingJob) {
        return;
      }

      // Mark the half-day job as processed
      await this.prisma.cronJob.create({
        data: {
          name: 'dxb_halfday_crone_job',
          runDate: new Date(),
        },
      });

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
        AND: [
          {
            emp_code: { in: users?.map((x) => x.employement_code) },
          },
          {
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
                OR: [
                  {
                    is_late: true,
                  },
                  {
                    is_leave: true,
                  },
                ],
              },
            ],
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
          (ea) => ea.emp_code === u.employement_code && ea.is_leave === true,
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
  }

  /**
   * Marks users as Half day if they haven't recorded attendance for the day and updates monthly leave records and deduct 0.5 leaves.
   */

  /**
   * Marks users as FUll day day if they haven't recorded attendance for the day and updates monthly leave records and deduct 1 leaves.
   */

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_12PM)
  async markFulldayOffCroneJob() {
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
          name: 'dxb_fullday_crone_job',
        },
      });

      if (existingJob) {
        return;
      }

      // Mark the half-day job as processed
      await this.prisma.cronJob.create({
        data: {
          name: 'dxb_fullday_crone_job',
          runDate: new Date(),
        },
      });

      // Fetch employees without attendance records for today
      const usersWithoutAttendance =
        await this.getUsersWithoutAttendanceFullday(startOfDay, endOfDay);

      if (usersWithoutAttendance?.length > 0) {
        // Process employees without attendance records
        await this.processUsersWithoutAttendanceFullday(
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

  async getUsersWithoutAttendanceFullday(startOfDay: Date, endOfDay: Date) {
    const users = await this.getActiveUsers();
    const emp_attendance = await this.prisma.emp_attendance.findMany({
      where: {
        AND: [
          {
            emp_code: { in: users?.map((x) => x.employement_code) },
          },
          {
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
                OR: [
                  {
                    is_halfday: true,
                  },
                  {
                    is_leave: true,
                  },
                ],
              },
            ],
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
          (ea) => ea.emp_code === u.employement_code && ea.is_leave === true,
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

  async processUsersWithoutAttendanceFullday(
    usersWithoutAttendance: any[],
    startOfDay: Date,
    endOfDay: Date,
  ) {
    const userEmpCodes = usersWithoutAttendance.map(
      (user) => user.employement_code,
    );

    // Update the Half day status in attendance records
    await this.prisma.emp_attendance.updateMany({
      data: {
        is_fullday: true,
      },
      where: {
        created_at: {
          gte: startOfDay,
          lt: endOfDay,
        },
        is_leave: false,
        is_late: true,
        is_halfday: true,
        emp_code: {
          in: userEmpCodes,
        },
      },
    });
  }

  /**
   * Marks users as Half day
   */
}

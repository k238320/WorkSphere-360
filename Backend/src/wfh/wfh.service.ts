import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';
import { replacePlaceholders, sendEmail } from 'src/utils/helper';

@Injectable()
export class WFHService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private prisma: PrismaService,
  ) {}

  async employePunchingIn(
    request: any,
    punchState: string,
    hours: string,
    condition: boolean,
  ) {
    try {
      const dt = new Date();
      const date = new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString();
      if (punchState == '0') {
        await this.prisma.emp_attendance.create({
          data: {
            emp_code: request.user?.employement_code,
            name: request.user?.name,
            punch_state: +punchState,
            hours: '00:00',
            punch_time: dt.toISOString(),
            created_at: dt.toISOString(),
            location_type_id: 1,
          },
        });

        await this.prisma.emp_attendance_Wfh.create({
          data: {
            emp_code: request.user?.employement_code,
            name: request.user?.name,
            punch_state: +punchState,
            hours: '00:00',
            punch_time: dt.toISOString(),
            created_at: dt.toISOString(),
            date: date,
          },
        });
        return 'Check-In Successfull';
      } else if (punchState == '1') {
        const lastPunchIn = await this.prisma.emp_attendance_Wfh.findFirst({
          where: {
            emp_code: request.user?.employement_code,
            punch_state: 0,
            date: date,
          },
          orderBy: {
            punch_time: 'desc',
          },
        });

        if (!lastPunchIn) {
          throw new Error('No punch-in record found for the employee.');
        }
        const lastCheckout = await this.prisma.emp_attendance_Wfh.findFirst({
          where: {
            emp_code: request.user?.employement_code,
            punch_state: 1,
            date: date,
          },
          orderBy: {
            punch_time: 'desc',
          },
        });
        let punchedInTime = new Date();
        if (lastCheckout && condition == true) {
          punchedInTime = new Date(lastCheckout.punch_time);
        } else {
          punchedInTime = new Date(lastPunchIn.punch_time);
        }
        const currentTime = new Date();
        const timeDifferenceMs =
          currentTime.getTime() - punchedInTime.getTime();
        const hoursDiff = Math.floor(timeDifferenceMs / (1000 * 60 * 60));
        const minutesDiff = Math.ceil(
          (timeDifferenceMs % (1000 * 60 * 60)) / (1000 * 60),
        );
        const timeDifferenceFormatted = `${String(hoursDiff).padStart(
          2,
          '0',
        )}:${String(minutesDiff).padStart(2, '0')}`;
        let totalHours = timeDifferenceFormatted;

        if (lastCheckout) {
          const [prevHours, prevMinutes] = lastCheckout.hours
            .split(':')
            .map(Number);
          const [newHours, newMinutes] = timeDifferenceFormatted
            .split(':')
            .map(Number);

          const totalMinutes = prevMinutes + newMinutes;
          const carryOverHours = Math.floor(totalMinutes / 60);
          const finalMinutes = totalMinutes % 60;
          const finalHours = prevHours + newHours + carryOverHours;

          totalHours = `${String(finalHours).padStart(2, '0')}:${String(
            finalMinutes,
          ).padStart(2, '0')}`;
        }
        await this.prisma.emp_attendance_Wfh.create({
          data: {
            emp_code: request.user?.employement_code,
            name: request.user?.name,
            punch_state: +punchState,
            hours: totalHours,
            punch_time: dt.toISOString(),
            created_at: dt.toISOString(),
            date: date,
          },
        });
        await this.prisma.emp_attendance.create({
          data: {
            emp_code: request.user?.employement_code,
            name: request.user?.name,
            punch_state: +punchState,
            hours: totalHours,
            punch_time: dt.toISOString(),
            created_at: dt.toISOString(),
            location_type_id: 1,
          },
        });
        return 'Check-Out Successfull';
      }
    } catch (error) {
      console.log('error-->', error);
    }
  }

  //WeekData api
  async employeWeekData(request: any, start_date: string) {
    try {
      let start = new Date(new Date(start_date).setUTCHours(0, 0, 0, 0));
      let end_date = new Date(start);
      end_date.setDate(start.getDate() + 6);
      end_date = new Date(end_date.setUTCHours(23, 59, 59, 999));

      const findEntry = await this.prisma.emp_attendance_Wfh.findMany({
        where: {
          emp_code: request.user?.employement_code,
          punch_time: {
            gte: start.toISOString(),
            lte: end_date.toISOString(),
          },
          punch_state: 1,
        },
        orderBy: {
          punch_time: 'desc',
        },
      });

      const existingDates = findEntry.map(
        (entry) => new Date(entry.date).toISOString().split('T')[0],
      );

      let allDates = [];
      for (let d = new Date(start); d <= end_date; d.setDate(d.getDate() + 1)) {
        allDates.push(new Date(d).toISOString().split('T')[0]);
      }
      const latestEntriesByDate: { [key: string]: any } = {};
      findEntry.forEach((entry) => {
        const entryDate = new Date(entry.date).toISOString().split('T')[0];
        if (!latestEntriesByDate[entryDate]) {
          latestEntriesByDate[entryDate] = entry;
        }
      });

      let missingDates = allDates.filter(
        (date) => !existingDates.includes(date),
      );

      let dummyData = missingDates.map((date, ind) => ({
        id: ind,
        emp_code: request.user?.employement_code,
        name: request.user?.name,
        punch_state: 1,
        hours: '00:00',
        punch_time: new Date(date).toISOString(),
        created_at: new Date(date).toISOString(),
        date: new Date(date).toISOString(),
      }));

      const finalData = [...Object.values(latestEntriesByDate), ...dummyData];

      let sortedData = finalData.sort((a, b) => {
        return a.date.localeCompare(b.date);
      });

      return sortedData;
    } catch (error) {
      console.log('error-->', error);
    }
  }

  async employeDayData(request: any, start_date: string) {
    try {
      let start = new Date(new Date(start_date).setUTCHours(0, 0, 0, 0));
      let end = new Date(new Date(start_date).setUTCHours(23, 59, 59, 999));
      const wfh = await this.prisma.emp_leaves.findFirst({
        where: {
          start_date: {
            gte: start,
            lt: end,
          },
          employement_code: request.user?.employement_code,
        },
      });

      const findEntry = await this.prisma.emp_attendance_Wfh.findFirst({
        where: {
          emp_code: request.user?.employement_code,
          date: {
            gte: start.toISOString(),
            lte: end.toISOString(),
          },
          punch_state: 1,
        },
        orderBy: {
          punch_time: 'desc',
        },
        take: 1,
      });
      const findCheckIn = await this.prisma.emp_attendance_Wfh.findFirst({
        where: {
          emp_code: request.user?.employement_code,
          date: {
            gte: start.toISOString(),
            lte: end.toISOString(),
          },
          punch_state: 0,
        },
        orderBy: {
          punch_time: 'asc',
        },
        take: 1,
      });
      let resp: any = {};
      resp.isWfh = wfh == null ? false : true;
      if (findCheckIn == null) {
        resp = {
          ...resp,
          ...findEntry,
          checkedIn: undefined,
        };
      } else {
        resp = {
          ...resp,
          ...findEntry,
          checkedIn: findCheckIn.created_at,
        };
      }
      return handleSuccessResponse('', 200, resp);
    } catch (error) {
      throw error;
    }
  }

  async alterEmail(request: any) {
    try {
      const depart = await this.prisma.department.findFirst({
        where: {
          id: request.user.resource.department_id,
        },
      });
      const resource = await this.prisma.resource.findMany({
        where: {
          department_id: request.user.resource.department_id,
          is_team_lead: true,
        },
        select: {
          id: true,
        },
      });

      const teamLeads = await this.prisma.user.findMany({
        where: {
          resource_id: { in: resource.map((x) => x.id) },
        },
        select: {
          email: true,
        },
      });
      let tlEmails = teamLeads.map((x) => x.email);

      if (
        tlEmails.includes(request.user.email) ||
        depart.name == 'Project Management' ||
        depart.name == 'PM Lead'
      ) {
        tlEmails = ['superadmin@yopmail.com'];
      }
      const replacements = {
        replaceHeader: 'System generated mail',
        replaceUserName: 'TeamLead/Super Admin',
        message: `Tracker Alteration Alert!<br><br>
  
        ${request.user?.name} of your Department "${depart.name}" has tried to tamper the configuration/settings of the tracker.<br>
        Kindly look into this matter as soon as possible as it can lead to multiple mishaps.<br>
        Your prompt action in this matter would be highly appreciated.
        `,
      };

      const template = replacePlaceholders(replacements);

      const email = await sendEmail(
        tlEmails,
        `Tracker Tampering Alert `,
        template,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

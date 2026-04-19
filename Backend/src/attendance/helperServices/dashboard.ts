import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';
import {
  getMaxConsecutiveDaysInWords,
  getStatusFillColor,
  numberToWordsMap,
  replacePlaceholders,
  runAggregationPipeline,
  sendEmail,
} from 'src/utils/helper';
import * as ExcelJS from 'exceljs';
import { writeFileSync } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import * as moment from 'moment-timezone';

@Injectable()
export class DashboardOverview {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardOverview(query, startDate, endDate, request) {
    try {
      const userRole = request?.user?.role?.name;
      const isSuperAdminOrHR =
        userRole === 'Super Admin' ||
        userRole === 'Human Resource' ||
        userRole == 'Human Resource Operations';

      const teamLead = userRole === 'Team Lead';
      const resource_id = request?.user?.resource_id;

      const PMLead = userRole === 'PM Lead';
      const Sales = userRole === 'Sales';

      const { departmentid, isTeamLeads } = query;

      let users;
      if (isSuperAdminOrHR) {
        if (isTeamLeads == 'true') {
          users = await this.prisma.user.findMany({
            where: {
              resource: {
                OR: [{ is_team_lead: true }, { is_atl: true }],
              },
              OR: [
                { employement_code: { not: null } },
                { employement_code: { not: '' } },
              ],
              status: true,
              super: false,
            },
          });
        } else {
          users = await this.prisma.user.findMany({
            where: {
              resource: {
                department_id: departmentid,
              },
              OR: [
                { employement_code: { not: null } },
                { employement_code: { not: '' } },
              ],
              status: true,
              super: false,
            },
          });
        }
      } else if (teamLead) {
        let leadResources = await this.prisma.resource.findFirst({
          where: { id: resource_id },
        });
        users = await this.prisma.user.findMany({
          where: {
            resource: { department_id: leadResources?.department_id },
            OR: [
              { employement_code: { not: null } },
              { employement_code: { not: '' } },
            ],
            status: true,
            super: false,
          },
        });
      } else if (PMLead) {
        let departmentId = (
          await this.prisma.resource.findFirst({ where: { id: resource_id } })
        )?.department_id;

        users = await this.prisma.user.findMany({
          where: {
            resource: { department_id: departmentId },
            OR: [
              { employement_code: { not: null } },
              { employement_code: { not: '' } },
            ],
            status: true,
            super: false,
          },
        });
      } else if (Sales) {
        let leadResources = await this.prisma.resource.findFirst({
          where: { id: resource_id },
        });

        if (leadResources.is_team_lead) {
          users = await this.prisma.user.findMany({
            where: {
              resource: { department_id: leadResources?.department_id },
              OR: [
                { employement_code: { not: null } },
                { employement_code: { not: '' } },
              ],
              status: true,
              super: false,
            },
          });
        } else {
          users = await this.prisma.user.findMany({
            where: {
              resource: { id: resource_id },
              OR: [
                { employement_code: { not: null } },
                { employement_code: { not: '' } },
              ],
              status: true,
              super: false,
            },
          });
        }
      } else {
        users = await this.prisma.user.findMany({
          where: {
            resource: { id: resource_id },
            OR: [
              { employement_code: { not: null } },
              { employement_code: { not: '' } },
            ],
            status: true,
            super: false,
          },
        });
      }

      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      if (users?.length > 0) {
        const attendance = await runAggregationPipeline(
          users,
          startOfDay,
          endOfDay,
          false,
        );

        let formattedData = attendance?.data?.reduce((acc: any[], itt: any) => {
          let find = acc.find((x) => x.emp_code === itt.emp_code);

          if (!find) {
            // Calculate hours worked using the same logic as yearlyRecord
            let hoursWorked = 0;
            if (
              itt.check_in &&
              itt.check_out &&
              itt.status !== 'Work From Home'
            ) {
              hoursWorked =
                (+new Date(itt.check_out) - +new Date(itt.check_in)) /
                (1000 * 60 * 60);
            } else if (itt.status === 'Work From Home') {
              hoursWorked = 9; // Default WFH hours
            }

            acc.push({
              emp_code: itt.emp_code,
              name: itt.user?.name,
              Worked: hoursWorked.toFixed(2), // Changed to decimal format
              Break: itt.total_break_minutes / 60 || 0,
              OnTime: itt.status === 'On-Time' ? 1 : 0,
              Late: itt.status === 'Late' ? 1 : 0,
              Leaves: itt.status === 'On-Leave' ? 1 : 0,
              WFH: itt.status === 'Work From Home' ? 1 : 0,
              Holiday: itt.status === 'Holiday' ? 1 : 0,
              Given: 0,
              Total: 0,
            });
          } else {
            // Calculate hours worked for the current record
            let hoursWorked = 0;
            if (
              itt.check_in &&
              itt.check_out &&
              itt.status !== 'Work From Home'
            ) {
              hoursWorked =
                (+new Date(itt.check_out) - +new Date(itt.check_in)) /
                (1000 * 60 * 60);
            } else if (itt.status === 'Work From Home') {
              hoursWorked = 9; // Default WFH hours
            }

            find.Worked = (parseFloat(find.Worked) + hoursWorked).toFixed(2);
            find.Break = parseFloat(
              (find.Break + (itt.total_break_minutes / 60 || 0)).toFixed(2),
            );

            if (itt.status === 'On-Time') {
              find.OnTime += 1;
            } else if (itt.status === 'Late') {
              find.Late += 1;
            } else if (itt.status === 'On-Leave') {
              find.Leaves += 1;
            } else if (itt.status === 'Work From Home') {
              find.WFH += 1;
            } else if (itt.status === 'Holiday') {
              find.Holiday += 1;
            }
          }

          return acc;
        }, []);

        const existingEvents = await this.prisma.events.findMany({
          where: {
            AND: [
              { start_date: { lte: endOfDay } },
              { end_date: { gte: startOfDay } },
            ],
          },
        });

        formattedData = await Promise.all(
          formattedData.map(async (item) => {
            const workedHours =
              parseFloat(item.Worked) - parseFloat(item.Break);
            const hours = Math.floor(workedHours);
            const minutes = Math.round((workedHours - hours) * 60);
            return {
              ...item,
              Given: `${hours}:${minutes.toString().padStart(2, '0')}`,
            };
          }),
        );

        formattedData = await Promise.all(
          formattedData.map(async (item) => {
            let totalEventHours = 0;
            let normalWorkingDays = 0;

            let currentDate = new Date(startOfDay);
            currentDate.setHours(0, 0, 0, 0);
            endOfDay.setHours(0, 0, 0, 0);

            while (currentDate.getTime() <= endOfDay.getTime()) {
              const isWeekend =
                currentDate.getDay() === 6 || currentDate.getDay() === 0;

              if (!isWeekend) {
                const event = existingEvents.find((event) => {
                  const eventStartDate = new Date(event.start_date);
                  eventStartDate.setHours(0, 0, 0, 0);
                  const eventEndDate = new Date(event.end_date);
                  eventEndDate.setHours(0, 0, 0, 0);

                  return (
                    eventStartDate.getTime() <= currentDate.getTime() &&
                    eventEndDate.getTime() >= currentDate.getTime()
                  );
                });

                if (event) {
                  totalEventHours += event.working_hours;
                } else {
                  normalWorkingDays++;
                }
              }

              currentDate.setDate(currentDate.getDate() + 1);
            }

            const leaveAndHolidayAdjustment = (item.Leaves + item.Holiday) * 9;

            const totalHours =
              totalEventHours +
              normalWorkingDays * 9 -
              leaveAndHolidayAdjustment;

            return {
              ...item,
              Total: Math.max(0, totalHours),
            };
          }),
        );

        // Convert Worked back to HH:MM format to match original response
        formattedData = formattedData.map((item) => {
          const hours = Math.floor(parseFloat(item.Worked));
          const minutes = Math.round((parseFloat(item.Worked) - hours) * 60);
          return {
            ...item,
            Worked: `${hours}:${minutes.toString().padStart(2, '0')}`,
          };
        });

        return handleSuccessResponse('', 200, formattedData);
      } else {
        return handleSuccessResponse('No users found', 200, []);
      }
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      return handlePrismaError(error);
    }
  }

  async SendAttendanceToHREmail() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { employement_code: { not: null } },
              { employement_code: { not: '' } },
            ],
          },
          { status: true },
          { super: false },
        ],
      },
      include: { user_details: true },
    });

    const attendance = await runAggregationPipeline(
      users,
      startOfDay,
      endOfDay,
      false,
    );
    const allData = attendance?.data || [];

    const workbook = new ExcelJS.Workbook();

    const createSheet = (sheetName: string, data: any[]) => {
      const sheet = workbook.addWorksheet(sheetName);
      sheet.columns = [
        { header: 'Employee Code', key: 'code', width: 15 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'In Time', key: 'inTime', width: 15 },
        { header: 'Out Time', key: 'outTime', width: 15 },
        { header: 'Status', key: 'status', width: 20 },
      ];

      data.forEach((item) => {
        const row = sheet.addRow({
          code: item.emp_code,
          name: item?.user?.name,
          date: moment(item?.date).tz('Asia/Karachi').format('Do MMM, YYYY'),
          // inTime: item?.check_in ? moment(item?.check_in).format('LT') : '',
          inTime: item?.check_in
            ? moment(item?.check_in).tz('Asia/Karachi').format('LT')
            : '',
          // outTime: item?.check_out ? moment(item?.check_out).format('LT') : '',
          outTime: item?.check_out
            ? moment(item?.check_out).tz('Asia/Karachi').format('LT')
            : '',
          status: item?.status,
        });

        const fillColor = getStatusFillColor(item?.status);
        if (fillColor) {
          const statusCell = row.getCell('status');
          statusCell.fill = fillColor;
        }
      });
    };

    const onTime = allData.filter((x) => x.status === 'On-Time');
    const lates = allData.filter((x) => x.status === 'Late');
    const halfDay = allData.filter((x) => x.status === 'Half Day');
    const fullDayOff = allData.filter((x) => x.status === 'Full Day Off');
    const wfhAndLeave = allData.filter(
      (x) => x.status === 'Work From Home' || x.status === 'On-Leave',
    );

    createSheet('On Time', onTime);
    createSheet('Lates', lates);
    createSheet('Half Day', halfDay);
    createSheet('Full Day Off', fullDayOff);
    createSheet('WFH & On Leave', wfhAndLeave);

    const filePath = join(
      __dirname,
      `attendance-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
    await workbook.xlsx.writeFile(filePath);

    // const hr = await this.prisma.user.findMany({
    //   where: {
    //     role: {
    //       name: 'Human Resource',
    //     },
    //     status: true,
    //   },
    // });

    // const mails = hr?.map((x) => x.email);

    const replacements = {
      replaceHeader: 'Daily Attendance Report',
      replaceUserName: 'HR Team',
      message: `Please find attached the system-generated attendance report for <strong>${moment(
        startOfDay,
      ).format(
        'Do MMM, YYYY',
      )}</strong>.<br><br>The report is categorized as follows:<ul><li>On Time</li><li>Lates</li><li>Half Day</li><li>Full Day Off</li><li>Work From Home / Leave</li></ul>For any discrepancies or clarifications, please reach out to the concerned team.`,
    };

    const template = replacePlaceholders(replacements);

    const emailArray = ['superadmin@yopmail.com'];

    await sendEmail(
      emailArray,
      `Daily Attendance Report - ${moment(startOfDay).format('Do MMM, YYYY')}`,
      template,
      [
        {
          filename: `attendance-${new Date().toISOString().slice(0, 10)}.xlsx`,
          path: filePath,
        },
      ],
    );

    // Cleanup: Delete the file
    await unlink(filePath);

    return handleSuccessResponse('', 200, 'Attendance report sent to HR.');
  }

  async SendAttendanceWarningToEmployees() {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const users = await this.prisma.user.findMany({
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
                location_type_id: 1,
              },
            },
          },
          { status: true },
          { super: false },
        ],
      },
      include: { user_details: true },
    });

    const attendance = await runAggregationPipeline(
      users,
      startOfMonth,
      endOfDay,
      false,
    );
    let allData = attendance?.data || [];

    let lateMap = {};
    let halfDayMap = {};
    let fullDayMap = {};

    allData.forEach((record) => {
      const empCode = record.emp_code;
      if (!empCode) return;

      const date = moment(record.date).startOf('day');

      if (record.status === 'Late') {
        if (!lateMap[empCode]) lateMap[empCode] = [];
        lateMap[empCode].push(date);
      } else if (record.status === 'Half Day') {
        if (!halfDayMap[empCode]) halfDayMap[empCode] = [];
        halfDayMap[empCode].push(date);
      } else if (record.status === 'Full Day Off') {
        if (!fullDayMap[empCode]) fullDayMap[empCode] = [];
        fullDayMap[empCode].push(date);
      }
    });

    for (const user of users) {
      const userId = user.id;
      const emp_code = user.employement_code;
      const email = user.email;
      const cc = ['superadmin@yopmail.com'];
      if (!email) continue;

      const sentWarnings = await this.prisma.attendanceWarningsSent.findMany({
        where: {
          user_id: userId,
          sent_date: {
            gte: startOfMonth,
          },
        },
      });

      let subject = '';
      let message = '';
      let template = '';
      let warningSent = false;

      // LATE
      if (lateMap[emp_code]) {
        const numLate = lateMap[emp_code].length;
        const existingLate = sentWarnings.find((w) => w.type === 'Late');

        if (numLate >= 3 && (!existingLate || numLate > existingLate.count)) {
          subject = 'Late Attendance Warning';
          message = `We hope this message finds you well.<br>
            It has come to our attention through the attendance records on our Resource Portal that you have reported late to work for <strong>${numLate} consecutive day(s)</strong>.<br><br>
            This email serves as an official warning regarding your recent pattern of late arrivals. Continued disregard for timely attendance may lead to further disciplinary action, in line with company policies.<br><br>
            We encourage you to take immediate corrective measures and ensure timely reporting moving forward.<br><br>
            Thank you for your attention to this matter.`;
          template = replacePlaceholders({
            replaceHeader: 'Late Attendance Warning',
            replaceUserName: user.name,
            message,
          });
          warningSent = true;

          await sendEmail([email], subject, template, null, cc);

          await this.prisma.attendanceWarningsSent.create({
            data: {
              user_id: userId,
              type: 'Late',
              count: numLate,
              sent_date: new Date(),
            },
          });
        }
      }

      // HALF DAY
      if (halfDayMap[emp_code]) {
        const numHalf = halfDayMap[emp_code].length;
        const existingHalf = sentWarnings.find((w) => w.type === 'Half-Day');

        if (numHalf >= 2 && (!existingHalf || numHalf > existingHalf.count)) {
          subject = 'Half-Day Attendance Warning';
          message = `We hope you are doing well.<br>
            As per the attendance records on our Resource Portal, it has been observed that you have taken half-day leaves on <strong>${numHalf} consecutive working day(s)</strong>.<br><br>
            Please be reminded that frequent or consecutive half days without prior approval can disrupt team coordination and project timelines. This email serves as an official warning regarding this behavior.<br><br>
            We expect all team members to adhere to company attendance policies. Repetition of such patterns without valid reasons or approval may lead to further disciplinary action.<br><br>
            Looking forward to your cooperation.`;
          template = replacePlaceholders({
            replaceHeader: 'Half Day Attendance Warning',
            replaceUserName: user.name,
            message,
          });
          warningSent = true;

          await sendEmail([email], subject, template, null, cc);

          await this.prisma.attendanceWarningsSent.create({
            data: {
              user_id: userId,
              type: 'Half-Day',
              count: numHalf,
              sent_date: new Date(),
            },
          });
        }
      }

      // FULL DAY
      if (fullDayMap[emp_code]) {
        const numFull = fullDayMap[emp_code].length;
        const existingFull = sentWarnings.find((w) => w.type === 'Full-Day');

        if (numFull >= 1 && (!existingFull || numFull > existingFull.count)) {
          subject = 'Full-Day Absence Warning';
          message = `We hope you are doing well.<br>
            Our attendance system has recorded a <strong>${numFull} full-day</strong> absence without any prior notification or approval.<br><br>
            Please be reminded that unapproved absences are considered a violation of our attendance policy and can negatively impact team operations. This email serves as an official warning regarding the uninformed leave.<br><br>
            Continued disregard for proper leave protocols may lead to stricter disciplinary actions, including salary deductions or formal notices.<br><br>
            We urge you to ensure that all future leaves are communicated and approved in advance by your reporting lead, with HR in copy, and applied on the DG Resource Portal before 9:00 AM on the same day.<br><br>
            Your cooperation in maintaining professional discipline is appreciated.`;
          template = replacePlaceholders({
            replaceHeader: 'Full Day Absence Warning',
            replaceUserName: user.name,
            message,
          });
          warningSent = true;

          await sendEmail([email], subject, template, null, cc);

          await this.prisma.attendanceWarningsSent.create({
            data: {
              user_id: userId,
              type: 'Full-Day',
              count: numFull,
              sent_date: new Date(),
            },
          });
        }
      }
    }

    return handleSuccessResponse(
      '',
      200,
      'Attendance warning emails sent to employees.',
    );
  }
}

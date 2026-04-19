import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { template } from './emailTemplate';
import { leave_status, PrismaClient } from '@prisma/client';
import { CreateNotificationDto } from 'src/notification/dto/create-notificatio.dto';
import { handlePrismaError } from './error';
import { MongoClient } from 'mongodb';
import type { FillPattern } from 'exceljs';

const prisma = new PrismaClient();

export function generateResetToken(): string {
  // return crypto.randomBytes(32).toString('hex');
  const randomNumbers = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 10),
  );
  return randomNumbers.join('');
}

export const calculatePercentage = (consumedHours: any, totalHours: any) => {
  if (totalHours === 0) {
    return 0; // To avoid division by zero
  }
  const percentage: any = (consumedHours / totalHours) * 100;
  return Math.floor(percentage);
};

const transporter = nodemailer.createTransport({
  host: 'mail.futuristic.agency',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'noreply@mail.futuristic.agency',
    pass: 'Test1239878',
  },
  tls: {
    rejectUnauthorized: false,
  },
  logger: true,
});

// const transporter = nodemailer.createTransport({
//   host: 'mail.futuristic.agency',
//   port: 587,
//   requireTLS: true,

//   auth: {
//     user: 'noreply@mail.futuristic.agency',
//     pass: 'Test1239878',
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
//   logger: true,
// });

export async function sendResetEmail(
  email: string,
  resetToken: string,
): Promise<void> {
  const mailOptions = {
    from: '"DG Resource Portal" <noreply@futuristic.agency>',
    to: email,
    subject: 'Password Reset',
    html: `
        <p>Hello,</p>
        <p>You have requested a password reset for your account. Please click the link below to reset your password:</p>
        <a href="https://portal.demoz.agency/reset-password?token=${resetToken}">Click Here</a>
        <br>
        <p>Your OTP is ${resetToken} </p>
        <p>If you did not request this reset, please ignore this email.</p>
      `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendEmail(
  email: string | string[],
  subject: string,
  template: string,
  attachments?: any[],
  cc?: string | string[], // <-- added cc parameter
) {
  const mailOptions: any = {
    from: '"WorkSphere 360" <noreply@futuristic.agency>',
    to: email,
    subject: subject,
    html: template,
  };

  if (cc) {
    mailOptions.cc = cc; // <-- added cc to mailOptions
  }

  if (attachments && attachments.length > 0) {
    mailOptions.attachments = attachments;
  }

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    // throw new Error('Failed to send email');
  }
}

export async function sendNotification(data: CreateNotificationDto) {
  try {
    await prisma.notification.createMany({
      data: data.reciever_ids.map((receiver_id) => ({
        title: data.title,
        message: data.message,
        receiver_ids: receiver_id,
        created_by: data.created_by,
        link: data.link,
      })),
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

export function replacePlaceholders(replacements) {
  let modifiedTemplate: any = template;
  for (const [placeholder, value] of Object.entries(replacements)) {
    const placeholderRegex = new RegExp(`\\[${placeholder}\\]`, 'g');
    modifiedTemplate = modifiedTemplate.replace(placeholderRegex, value);
  }
  return modifiedTemplate;
}

const countWorkingDays = (startTime, endTime) => {
  const startOfDay = new Date(startTime);
  startOfDay.setHours(3, 0, 0, 0);

  const endOfDay = new Date(endTime);
  endOfDay.setHours(23, 59, 59, 999);

  let count = 0;
  let currentDate = new Date(startOfDay);

  while (currentDate <= endOfDay) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // 0 = Sunday, 6 = Saturday
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
};

export const calculateNetWorkingDays = async (
  startTime,
  endTime,
  employement_code,
) => {
  const startOfDay = new Date(startTime);
  startOfDay.setHours(3, 0, 0, 0);

  const endOfDay = new Date(endTime);
  endOfDay.setHours(23, 59, 59, 999);

  const totalWorkingDays = countWorkingDays(startTime, endTime);

  const empLeaves = await prisma.emp_leaves.findMany({
    where: {
      start_date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      employement_code: employement_code,
      leave_status: {
        in: ['PENDING', 'APPROVED'],
      },
    },
    select: {
      start_date: true,
      end_date: true,
    },
  });

  const holidays = await prisma.holidays.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: {
      date: true,
    },
  });

  let leaveDaysCount = 0;
  let leaveDaysSet = new Set();
  let holidayDates = new Set(
    holidays.map((holiday) => new Date(holiday.date).toDateString()),
  );

  if (empLeaves.length > 0) {
    empLeaves.forEach((leave) => {
      const leaveStart = new Date(leave.start_date);
      const leaveEnd = new Date(leave.end_date);
      leaveStart.setHours(3, 0, 0, 0);
      leaveEnd.setHours(23, 59, 59, 999);

      let currentLeaveDate = new Date(leaveStart);

      while (currentLeaveDate <= leaveEnd) {
        const dayOfWeek = currentLeaveDate.getDay();
        const dateString = currentLeaveDate.toDateString();
        if (
          dayOfWeek !== 0 &&
          dayOfWeek !== 6 &&
          !holidayDates.has(dateString)
        ) {
          leaveDaysSet.add(dateString);
        }
        currentLeaveDate.setDate(currentLeaveDate.getDate() + 1);
      }
    });

    leaveDaysCount = leaveDaysSet.size;
  }

  const netWorkingDays = totalWorkingDays - leaveDaysCount - holidayDates.size;

  return netWorkingDays;
};

export const calculateEventWorkingDays = async (
  startTime,
  endTime,
  employement_code,
) => {
  const startOfDay = new Date(startTime);
  startOfDay.setHours(3, 0, 0, 0);

  const endOfDay = new Date(endTime);
  endOfDay.setHours(23, 59, 59, 999);

  const totalWorkingDays = countWorkingDays(startTime, endTime);

  const res = await Promise.allSettled([
    prisma.emp_leaves.findMany({
      where: {
        start_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        employement_code: employement_code,
        leave_status: {
          in: ['PENDING', 'APPROVED'],
        },
        applicationTypeId: {
          not: '2',
        },
      },
      select: {
        start_date: true,
        end_date: true,
      },
    }),
    prisma.holidays.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        date: true,
      },
    }),
    prisma.events.findMany({
      where: {
        AND: [
          {
            start_date: {
              gte: startOfDay,
            },
          },
          {
            end_date: {
              lte: endOfDay,
            },
          },
        ],
      },
    }),
    prisma.emp_attendance.count({
      where: {
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
        emp_code: employement_code,
        is_fullday: true,
        is_halfday: true,
        is_late: true,
      },
    }),
  ]);

  const empLeaves = res[0].status === 'fulfilled' ? res[0].value : [];
  const holidays = res[1].status === 'fulfilled' ? res[1].value : [];
  const events = res[2].status === 'fulfilled' ? res[2].value : [];
  const fullDayOff = res[3].status === 'fulfilled' ? res[3].value : 0;

  let nonweekenddays = [];
  let eventworkingdayscount = 0;

  await Promise.all(
    events.map(async (event: any) => {
      const EventstartOfDay = new Date(event.start_date);
      EventstartOfDay.setHours(3, 0, 0, 0);

      const EventendOfDay = new Date(event.end_date);
      EventendOfDay.setHours(23, 59, 59, 999);

      const workingDayEvent = countWorkingDays(EventstartOfDay, EventendOfDay);

      const holidaysCount = await prisma.holidays.count({
        where: {
          date: {
            gte: EventstartOfDay,
            lte: EventendOfDay,
          },
        },
      });

      const leavesCount = await prisma.emp_leaves.count({
        where: {
          start_date: {
            gte: EventstartOfDay,
            lte: EventendOfDay,
          },
          employement_code: employement_code,
          leave_status: {
            in: ['PENDING', 'APPROVED'],
          },
          applicationTypeId: '1',
        },
      });

      const fulldayoffs = await prisma.emp_attendance.count({
        where: {
          created_at: {
            gte: EventstartOfDay,
            lte: EventendOfDay,
          },
          emp_code: employement_code,
          is_fullday: true,
        },
      });

      nonweekenddays.push({
        workingDays:
          workingDayEvent - (holidaysCount + leavesCount + fulldayoffs),
        hours: event.working_hours,
      });

      eventworkingdayscount +=
        workingDayEvent - (holidaysCount + leavesCount + fulldayoffs);
    }),
  );

  let leaveDaysCount = 0;
  let leaveDaysSet = new Set();
  let holidayDates = new Set(
    holidays.map((holiday) => new Date(holiday.date).toDateString()),
  );

  if (empLeaves.length > 0) {
    empLeaves.forEach((leave) => {
      const leaveStart = new Date(leave.start_date);
      const leaveEnd = new Date(leave.end_date);
      leaveStart.setHours(3, 0, 0, 0);
      leaveEnd.setHours(23, 59, 59, 999);

      let currentLeaveDate = new Date(leaveStart);

      while (currentLeaveDate <= leaveEnd) {
        const dayOfWeek = currentLeaveDate.getDay();
        const dateString = currentLeaveDate.toDateString();
        if (
          dayOfWeek !== 0 &&
          dayOfWeek !== 6 &&
          !holidayDates.has(dateString)
        ) {
          leaveDaysSet.add(dateString);
        }
        currentLeaveDate.setDate(currentLeaveDate.getDate() + 1);
      }
    });

    leaveDaysCount = leaveDaysSet.size;
  }

  const netWorkingDays =
    totalWorkingDays -
    leaveDaysCount -
    fullDayOff -
    holidayDates.size -
    eventworkingdayscount;

  const data = {
    netWorkingDays: netWorkingDays,
    eventWorkingDays: nonweekenddays,
  };

  return data;
};

export async function runAggregationPipeline(
  user,
  startTime,
  endTime,
  isDashboard,
) {
  const empCodes = user?.map((x) => x.employement_code);

  const startOfDay = new Date(startTime);
  startOfDay.setHours(3, 0, 0, 0);

  const endOfDay = new Date(endTime);
  endOfDay.setHours(23, 59, 59, 999);

  const agg = [
    {
      $match: {
        emp_code: { $in: empCodes },
        created_at: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      },
    },
    {
      $addFields: {
        punch_date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$created_at',
            onNull: null,
          },
        },
      },
    },
    {
      $sort: {
        emp_code: 1,
        created_at: 1,
      },
    },
    {
      $group: {
        _id: {
          emp_code: '$emp_code',
          punch_date: '$punch_date',
        },
        punches: {
          $push: {
            punch_state: '$punch_state',
            punch_time: '$punch_time',
            created_at: '$created_at',
            is_late: '$is_late',
            is_halfday: '$is_halfday',
            is_fullday: '$is_fullday',
          },
        },
        earliestPunch: {
          $min: {
            $cond: [{ $eq: ['$punch_state', 0] }, '$punch_time', null],
          },
        },
        latestPunch: {
          $max: {
            $cond: [{ $eq: ['$punch_state', 1] }, '$punch_time', null],
          },
        },
        data: {
          $first: '$$ROOT',
        },
      },
    },
    {
      $addFields: {
        is_late: {
          $max: '$punches.is_late',
        },
        is_halfday: {
          $max: '$punches.is_halfday',
        },
        is_fullday: {
          $max: '$punches.is_fullday',
        },
        breaks: {
          $reduce: {
            input: '$punches',
            initialValue: {
              previous: null,
              breakList: [],
            },
            in: {
              $mergeObjects: [
                '$$value',
                {
                  breakList: {
                    $concatArrays: [
                      '$$value.breakList',
                      [
                        {
                          $cond: [
                            {
                              $and: [
                                '$$value.previous',
                                { $eq: ['$$this.punch_state', 0] },
                                { $eq: ['$$value.previous.punch_state', 1] },
                              ],
                            },
                            {
                              checkout: '$$value.previous.created_at',
                              checkin: '$$this.created_at',
                              duration: {
                                $divide: [
                                  {
                                    $subtract: [
                                      '$$this.created_at',
                                      '$$value.previous.created_at',
                                    ],
                                  },
                                  1000 * 60,
                                ],
                              },
                            },
                            null,
                          ],
                        },
                      ],
                    ],
                  },
                  previous: '$$this',
                },
              ],
            },
          },
        },
        wfh_hours: '$data.hours',
      },
    },
    {
      $addFields: {
        breaks: {
          $filter: {
            input: '$breaks.breakList',
            as: 'break',
            cond: { $ne: ['$$break', null] },
          },
        },
      },
    },
    {
      $addFields: {
        total_break_minutes: {
          $sum: {
            $map: {
              input: '$breaks',
              as: 'break',
              in: { $ifNull: ['$$break.duration', 0] },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'user',
        localField: '_id.emp_code',
        foreignField: 'employement_code',
        as: 'user',
      },
    },
    {
      $addFields: {
        user: { $arrayElemAt: ['$user', 0] },
      },
    },
    {
      $lookup: {
        from: 'resource',
        localField: 'user.resource_id',
        foreignField: '_id',
        as: 'user.resource',
      },
    },
    {
      $addFields: {
        'user.resource': { $arrayElemAt: ['$user.resource', 0] },
      },
    },
    {
      $lookup: {
        from: 'department',
        localField: 'user.resource.department_id',
        foreignField: '_id',
        as: 'user.resource.department',
      },
    },
    {
      $addFields: {
        'user.resource.department': {
          $arrayElemAt: ['$user.resource.department', 0],
        },
      },
    },
    {
      $project: {
        _id: 0,
        emp_code: '$_id.emp_code',
        punch_date: '$_id.punch_date',
        earliestPunch: 1,
        latestPunch: 1,
        wfh_hours: 1,
        breaks: 1,
        total_break_minutes: 1,
        is_late: 1,
        is_halfday: 1,
        is_fullday: 1,
        'user.id': '$user._id',
        'user.name': '$user.name',
        'user.resource.id': '$user.resource._id',
        'user.resource.name': '$user.resource.name',
        'user.resource.department.id': '$user.resource.department._id',
        'user.resource.department.name': '$user.resource.department.name',
        created_at: '$data.created_at',
        name: '$data.name',
        punch_state: '$data.punch_state',
        is_leave: '$data.is_leave',
        leave_status: '$data.leave_status',
        user_comment: '$data.user_comment',
        approve_by: '$data.approve_by',
        is_approved: '$data.is_approved',
        hours: '$data.hours',
      },
    },
    {
      $sort: { created_at: -1 },
    },
  ];

  const uri = process.env.DATABASE_URL;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const coll = client
      .db(process.env.MONGO_DB_NAME)
      .collection('emp_attendance');
    const cursor = coll.aggregate(agg, { allowDiskUse: true });
    let result = await cursor.toArray();

    const extra_hours = await prisma.extra_hours.findMany({
      where: {
        emp_code: {
          in: empCodes,
        },
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
        is_approved: 'APPROVED',
      },
      include: {
        user: {
          include: {
            resource: {
              include: {
                department: true,
              },
            },
          },
        },
      },
    });

    result = calculateWorkedHours(result);

    extra_hours.map((x: any) => {
      x.totalHoursWorked = x.hours;
      x.check_in = x.start_time;
      x.check_out = x.end_time;
      x.status = 'Extra Hours';
      x.start_time.setHours(x.start_time.getHours() + 4);
      x.end_time.setHours(x.end_time.getHours() + 4);
      result.push(x);
    });
    const totalPresent = result?.filter((x) => x.status == 'On-Time')?.length;
    const totalLate = result?.filter((x) => x.status == 'Late')?.length;
    const totalOnLeaves = result?.filter((x) => x.status == 'On-Leave')?.length;
    const totalWorkFromHome = result?.filter(
      (x) => x.status == 'Work From Home',
    )?.length;
    const totalHalfDay = result?.filter((x) => x.status == 'Half Day')?.length;
    const totalFullDay = result?.filter(
      (x) => x.status == 'Full Day Off',
    )?.length;
    const holiday = result?.filter((x) => x.status == 'Holiday')?.length;

    let netWorkingHours = null;

    if (user?.length == 1) {
      const existingEvents = await prisma.events.findMany({
        where: {
          AND: [
            { start_date: { lte: endOfDay } },
            { end_date: { gte: startOfDay } },
          ],
        },
      });

      let totalEventHours = 0;
      let normalWorkingDays = 0;

      let currentDate = new Date(startOfDay);
      currentDate.setHours(0, 0, 0, 0);
      endOfDay.setHours(0, 0, 0, 0);

      // while (currentDate.getTime() <= endOfDay.getTime()) {
      //   const isWeekend =
      //     currentDate.getDay() === 6 || currentDate.getDay() === 0;

      //   if (!isWeekend) {
      //     const event = existingEvents.find((event) => {
      //       const eventStartDate = new Date(event.start_date);
      //       eventStartDate.setHours(0, 0, 0, 0);
      //       const eventEndDate = new Date(event.end_date);
      //       eventEndDate.setHours(0, 0, 0, 0);

      //       return (
      //         eventStartDate.getTime() <= currentDate.getTime() &&
      //         eventEndDate.getTime() >= currentDate.getTime()
      //       );
      //     });

      //     if (event) {
      //       totalEventHours += event.working_hours;
      //     } else {
      //       normalWorkingDays++;
      //     }
      //   }

      //   currentDate.setDate(currentDate.getDate() + 1);
      // }

      if (user?.length == 1) {
        const existingEvents = await prisma.events.findMany({
          where: {
            AND: [
              { start_date: { lte: endOfDay } },
              { end_date: { gte: startOfDay } },
            ],
          },
        });

        let totalEventHours = 0;
        let normalWorkingDays = 0;
        let leaveHolidayHours = 0;

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

            const dateString = currentDate.toLocaleDateString('en-US', {
              timeZone: 'Asia/Karachi',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            });

            const isLeaveOrHolidayEntry = result.find((r) => {
              return (
                r.date === dateString &&
                ['Holiday', 'On-Leave', 'Full Day Off'].includes(r.status)
              );
            });

            if (isLeaveOrHolidayEntry) {
              leaveHolidayHours += event ? event.working_hours : 9;
            } else {
              if (event) {
                totalEventHours += event.working_hours;
              } else {
                normalWorkingDays++;
              }
            }
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }

        netWorkingHours = totalEventHours + normalWorkingDays * 9;
      }
    }

    let data: any = {};

    if (isDashboard) {
      data = {
        totalPresent,
        totalLate,
        totalOnLeaves,
        totalWorkFromHome,
        netWorkingHours,
        totalHalfDay,
        totalFullDay,
        totalEmployee: empCodes?.length,
      };
    } else {
      data = {
        data: result,
        totalPresent,
        totalLate,
        totalOnLeaves,
        totalWorkFromHome,
        netWorkingHours,
        totalHalfDay,
        totalFullDay,
        totalEmployee: empCodes?.length,
      };
    }

    return data;
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

function calculateWorkedHours(data) {
  const results = data.reduce((acc, entry) => {
    const {
      earliestPunch,
      latestPunch,
      emp_code,
      user,
      punch_date,
      created_at,
      name,
      punch_state,
      is_late,
      is_halfday,
      is_fullday,
      is_leave,
      leave_status,
      user_comment,
      approve_by,
      is_approved,
      hours,
      wfh_hours,
      breaks,
      total_break_minutes,
    } = entry;

    const punchTime = entry?.earliestPunch
      ? new Date(entry?.earliestPunch)
      : new Date(entry?.created_at);

    const date = punchTime?.toLocaleDateString('en-US', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    let totalHoursWorked = null;
    if (wfh_hours) {
      totalHoursWorked = wfh_hours;
    }
    if (earliestPunch && latestPunch && !wfh_hours) {
      const checkinTime = new Date(earliestPunch);
      const checkoutTime = new Date(latestPunch);
      const timeDifference = checkoutTime.getTime() - checkinTime.getTime();
      const hoursWorked = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutesWorked = Math.floor(
        (timeDifference % (1000 * 60 * 60)) / (1000 * 60),
      );
      totalHoursWorked = `${hoursWorked}:${minutesWorked
        .toString()
        .padStart(2, '0')}`;
    }

    const existingEntry = acc?.find(
      (group) => group?.emp_code === emp_code && group?.date === date,
    );

    if (existingEntry) {
      existingEntry.is_late = existingEntry.is_late
        ? existingEntry.is_late
        : is_late;
      existingEntry.is_halfday = existingEntry.is_halfday
        ? existingEntry.is_halfday
        : is_halfday;
      existingEntry.is_fullday = existingEntry.is_fullday
        ? existingEntry.is_fullday
        : is_fullday;
      existingEntry.hours = hours;
      existingEntry.user_comment = user_comment;
      existingEntry.approve_by = approve_by;
      existingEntry.is_approved = is_approved;
      existingEntry.status = existingEntry.status
        ? existingEntry.status
        : is_leave
          ? leave_status
          : is_fullday
            ? 'Full Day Off'
            : is_halfday
              ? 'Half Day'
              : is_late
                ? 'Late'
                : 'On-Time';
    } else {
      acc.push({
        emp_code,
        punch_date,
        check_in: earliestPunch,
        check_out: latestPunch,
        created_at,
        name,
        punch_state,
        is_late,
        is_halfday,
        is_fullday,
        is_leave,
        leave_status,
        user_comment,
        approve_by,
        is_approved,
        hours,
        user: {
          id: user.id,
          name: user.name,
          resource: {
            id: user.resource.id,
            name: user.resource.name,
            department: {
              id: user.resource.department.id,
              name: user.resource.department.name,
            },
          },
        },
        totalHoursWorked,
        status: is_leave
          ? leave_status
          : is_fullday
            ? 'Full Day Off'
            : is_halfday
              ? 'Half Day'
              : is_late
                ? 'Late'
                : 'On-Time',
        date,
        breaks,
        total_break_minutes,
      });
    }

    return acc;
  }, []);

  return results;
}

export async function runAggregationLateAttendance(user, startTime, endTime) {
  const empCodes = user?.map((x) => x.employement_code);

  const startOfDay = new Date(startTime);
  startOfDay.setHours(3, 0, 0, 0);

  const endOfDay = new Date(endTime);
  endOfDay.setHours(23, 59, 59, 999);
  const agg = [
    {
      $match: {
        emp_code: { $in: empCodes },
        created_at: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      },
    },
    {
      $addFields: {
        punch_date: {
          $dateToString: { format: '%Y-%m-%d', date: '$created_at' },
        },
      },
    },
    {
      $group: {
        _id: {
          emp_code: '$emp_code',
          punch_date: '$punch_date',
        },
        data: { $first: '$$ROOT' },
      },
    },
    {
      $project: {
        _id: 0,
        data: '$data',
      },
    },
  ];

  const uri = process.env.DATABASE_URL;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const coll = client
      .db(process.env.MONGO_DB_NAME)
      .collection('emp_attendance');
    const cursor = coll.aggregate(agg);
    let result = await cursor.toArray();

    result = result?.map((x: any) => x.data);

    return result ?? [];
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

export async function runAggregationHalfDayAttendance(
  user,
  startTime,
  endTime,
) {
  const empCodes = user?.map((x) => x.employement_code);

  const startOfDay = new Date(startTime);
  startOfDay.setHours(3, 0, 0, 0);

  const endOfDay = new Date(endTime);
  endOfDay.setHours(23, 59, 59, 999);
  const agg = [
    {
      $match: {
        emp_code: { $in: empCodes },
        $or: [
          {
            created_at: {
              $gte: startOfDay,
              $lt: endOfDay,
            },
            is_late: true,
          },
          {
            punch_time: {
              $gte: startOfDay,
              $lt: endOfDay,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        punch_date: {
          $dateToString: { format: '%Y-%m-%d', date: '$created_at' },
        },
      },
    },
    {
      $group: {
        _id: {
          emp_code: '$emp_code',
          punch_date: '$punch_date',
        },
        data: { $first: '$$ROOT' },
      },
    },
    {
      $project: {
        _id: 0,
        data: '$data',
      },
    },
  ];

  const uri = process.env.DATABASE_URL;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const coll = client
      .db(process.env.MONGO_DB_NAME)
      .collection('emp_attendance');
    const cursor = coll.aggregate(agg);
    let result = await cursor.toArray();

    result = result?.map((x: any) => x.data);

    return result ?? [];
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

//======================================================================================

export async function runAggregationPipeline2(user, startTime, endTime) {
  // const empCodes = user?.map((x) => x.employement_code);

  const startOfDay = new Date(startTime);
  startOfDay.setHours(3, 0, 0, 0);

  const endOfDay = new Date(endTime);
  endOfDay.setHours(23, 59, 59, 999);
  const agg = [
    {
      $match: {
        emp_code: user,
        created_at: {
          $gte: startOfDay,
          $lt: endOfDay,
        },
        leave_status: {
          $ne: 'Holiday',
        },
      },
    },
    {
      $addFields: {
        punch_date: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$created_at',
            onNull: null,
          },
        },
      },
    },
    {
      $group: {
        _id: {
          emp_code: '$emp_code',
          punch_date: '$punch_date',
        },
        earliestPunch: {
          $min: {
            $cond: [
              {
                $eq: ['$punch_state', 0],
              },
              '$punch_time',
              null,
            ],
          },
        },
        latestPunch: {
          $max: {
            $cond: [
              {
                $eq: ['$punch_state', 1],
              },
              '$punch_time',
              null,
            ],
          },
        },
        data: {
          $first: '$$ROOT',
        },
      },
    },
    {
      $project: {
        _id: 0,
        emp_code: '$_id.emp_code',
        punch_date: '$_id.punch_date',
        earliestPunch: 1,
        latestPunch: 1,
      },
    },
    {
      $sort: {
        created_at: -1,
      },
    },
  ];

  const uri = process.env.DATABASE_URL;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const coll = client
      .db(process.env.MONGO_DB_NAME)
      .collection('emp_attendance');
    const cursor = coll.aggregate(agg);
    let result = await cursor.toArray();

    // result = calculateWorkedHours(result);

    // const totalPresent = result?.filter((x) => x.status == 'On-Time')?.length;
    // const totalLate = result?.filter((x) => x.status == 'Late')?.length;
    // const totalOnLeaves = result?.filter((x) => x.status == 'On-Leave')?.length;
    // const totalWorkFromHome = result?.filter(
    //   (x) => x.status == 'Work From Home',
    // )?.length;
    // const totalHalfDay = result?.filter((x) => x.status == 'Half Day')?.length;
    // const totalFullDay = result?.filter(
    //   (x) => x.status == 'Full Day Off',
    // )?.length;

    let netWorkingHours = null;
    if (user) {
      netWorkingHours = await calculateEventWorkingDays(
        startOfDay,
        endOfDay,
        user,
      );

      netWorkingHours = netWorkingHours * 9;
    }

    const data = {
      data: result,
      netWorkingHours,
    };

    return data;
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

export const getStatusFillColor = (status: string): FillPattern => {
  switch (status) {
    case 'On-Time':
      return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D4EDDA' } }; // light green
    case 'Late':
      return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8D7DA' } };
    case 'Half Day':
      return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8D7DA' } }; // light red
    case 'Full Day Off':
      return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F5C6CB' } }; // darker red
    case 'On-Leave':
      return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1ECF1' } }; // light blue
    case 'Work From Home':
      return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } }; // light yellow
    default:
      return { type: 'pattern', pattern: 'none' };
  }
};

export const numberToWordsMap = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
};

export function getMaxConsecutiveDaysInWords(dates: moment.Moment[]): string {
  const sorted = dates.sort((a, b) => a.diff(b));
  let max = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i].diff(sorted[i - 1], 'days');
    if (diff === 1) {
      current++;
      max = Math.max(max, current);
    } else {
      current = 1;
    }
  }

  return numberToWordsMap[max] || `${max}`;
}

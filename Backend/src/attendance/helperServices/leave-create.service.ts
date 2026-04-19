import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from 'src/notification/dto/create-notificatio.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  replacePlaceholders,
  sendEmail,
  sendNotification,
} from 'src/utils/helper';

@Injectable()
export class LeaveCreateService {
  constructor(private readonly prisma: PrismaService) {}

  validateDates(start_date: string, end_date: string) {
    if (
      [start_date, end_date].some(
        (date) =>
          new Date(date).getDay() === 0 || new Date(date).getDay() === 6,
      )
    ) {
      throw new HttpException(
        'Leave cannot be created on Saturdays or Sundays.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkExistingLeaveRecord(
    user: any,
    start_date: string,
    end_date: string,
    leaveTypeId: string,
  ) {
    const existingLeaveRecord = await this.prisma.emp_leaves.findFirst({
      where: {
        employement_code: user?.employement_code,
        start_date: {
          gte: new Date(new Date(start_date).setUTCHours(0, 0, 0, 0)),
        },
        end_date: {
          lte: new Date(new Date(end_date).setUTCHours(23, 59, 59, 999)),
        },
        leave_status: { in: ['PENDING', 'APPROVED'] },
      },
      orderBy: { end_date: 'desc' },
    });

    if (existingLeaveRecord) {
      throw new HttpException(
        'Leave record already exists for the same day',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (leaveTypeId === '5' || leaveTypeId === '6') {
      const existingPaternityLeave =
        await this.prisma.yearlyLeaveRecord.findFirst({
          where: { user_id: user.id, year: new Date(start_date).getFullYear() },
        });

      if (
        existingPaternityLeave?.paternity_leaves ||
        existingPaternityLeave?.maternity_leaves
      ) {
        throw new HttpException(
          `${
            leaveTypeId == '5' ? 'Paternity Leave' : 'Maternity Leave'
          } leave record already exists for the same year`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  async generateLeaveAndAttendanceRecords(
    user: any,
    dto: any,
    location_type_id: number,
  ) {
    const {
      start_date,
      end_date,
      is_halfday,
      applicationTypeId,
      leaveTypeId,
      status,
    } = dto;

    const leaveRecords: Array<any> = [];
    const attendanceRecords: Array<any> = [];
    let availed_leaves = 0;
    let availed_wfh = 0;

    const isWeekend = (date: Date) =>
      date.getDay() === 0 || date.getDay() === 6;

    const addLeaveAndAttendance = (
      date: Date,
      type: string,
      leave_count: number,
      work_from_home = false,
    ) => {
      const leaveData: any = {
        applicationTypeId,
        start_date: date.toISOString(),
        end_date: date.toISOString(),
        employement_code: user?.employement_code,
        resource_id: user?.resource_id,
        status,
        leaveTypeId,
        leave_count,
        is_halfday,
        work_from_home,
      };

      leaveRecords.push(leaveData);
      attendanceRecords.push(
        this.createAttendanceRecord(user, date, type, location_type_id),
      );

      if (work_from_home) {
        availed_wfh += leave_count;
      } else {
        availed_leaves += leave_count;
      }
    };

    const calculateEndDate = (startDate: Date, workingDays: number): Date => {
      let endDate = new Date(startDate);
      let leaveDays = 0;

      while (leaveDays < workingDays) {
        if (!isWeekend(endDate)) leaveDays++;
        if (leaveDays < workingDays) endDate.setDate(endDate.getDate() + 1);
      }

      return endDate;
    };

    let startDate = new Date(start_date);
    startDate.setUTCHours(0, 0, 0, 0);

    if (+leaveTypeId === 5) {
      const endDate = calculateEndDate(startDate, 3);

      while (startDate <= endDate) {
        if (!isWeekend(startDate)) {
          addLeaveAndAttendance(
            startDate,
            is_halfday ? 'Half Day Leave' : 'On-Leave',
            is_halfday ? 0.5 : 1,
          );
        }
        startDate.setDate(startDate.getDate() + 1);
      }
    } else if (+leaveTypeId === 6) {
      const leaveEndDate = calculateEndDate(startDate, 10);
      const workFromHomeEndDate = new Date(leaveEndDate);
      workFromHomeEndDate.setMonth(workFromHomeEndDate.getMonth() + 2);

      while (startDate <= leaveEndDate) {
        if (!isWeekend(startDate)) {
          addLeaveAndAttendance(
            startDate,
            is_halfday ? 'Half Day Leave' : 'On-Leave',
            is_halfday ? 0.5 : 1,
          );
        }
        startDate.setDate(startDate.getDate() + 1);
      }

      const workFromHomeRecords = [];
      startDate = new Date(leaveEndDate);
      startDate.setDate(startDate.getDate() + 1);

      while (startDate <= workFromHomeEndDate) {
        if (!isWeekend(startDate)) {
          const leaveData = {
            applicationTypeId: '2', // WFH application type
            start_date: startDate.toISOString(),
            end_date: workFromHomeEndDate.toISOString(),
            employement_code: user?.employement_code,
            resource_id: user?.resource_id,
            status,
            leaveTypeId,
            work_from_home: true,
          };
          workFromHomeRecords.push(leaveData);
          addLeaveAndAttendance(startDate, 'Work From Home', 1, true);
        }
        startDate.setDate(startDate.getDate() + 1);
      }

      await this.prisma.emp_leaves.createMany({ data: workFromHomeRecords });
    } else {
      const leaveEndDate = end_date ? new Date(end_date) : startDate;
      leaveEndDate.setUTCHours(0, 0, 0, 0);

      while (startDate <= leaveEndDate) {
        if (!isWeekend(startDate)) {
          const type =
            applicationTypeId == 2
              ? 'Work From Home'
              : is_halfday
                ? 'Half Day Leave'
                : 'On-Leave';
          const work_from_home = applicationTypeId == 2;
          addLeaveAndAttendance(
            startDate,
            type,
            is_halfday ? 0.5 : 1,
            work_from_home,
          );
        }
        startDate.setDate(startDate.getDate() + 1);
      }
    }

    return {
      leaveRecords,
      attendanceRecords,
      availed_leaves,
      availed_wfh,
      leaveTypeId,
    };
  }

  createAttendanceRecord(
    user: any,
    date: Date,
    status: string,
    location_type_id: number,
  ) {
    return {
      emp_code: user?.employement_code,
      created_at: date.toISOString(),
      updated_at: date.toISOString(),
      is_leave: true,
      leave_status: status,
      location_type_id,
    };
  }

  async updateYearlyLeaveRecord(
    userId: string,
    availed_leaves: number,
    availed_wfh: number,
    leaveTypeId: string,
  ) {
    const currentYear = new Date().getFullYear();
    let existingYearlyLeaveRecord =
      await this.prisma.yearlyLeaveRecord.findFirst({
        where: { user_id: userId, year: currentYear },
        include: { monthly_records: true },
      });

    if (!existingYearlyLeaveRecord) {
      existingYearlyLeaveRecord = await this.prisma.yearlyLeaveRecord.create({
        data: {
          user_id: userId,
          year: currentYear,
          total_leaves: 22,
          availed_leaves: 0,
          availed_wfh: 0,
          remaining_leaves: 22,
          paternity_leaves: 0,
          maternity_leaves: 0,
          maternity_wfh_availed: 0,
        },
        include: { monthly_records: true },
      });
    }

    if (existingYearlyLeaveRecord) {
      if (+leaveTypeId == 5) {
        await this.prisma.yearlyLeaveRecord.update({
          where: { id: existingYearlyLeaveRecord.id },
          data: { paternity_leaves: availed_leaves },
        });
      } else if (+leaveTypeId == 6) {
        await this.prisma.yearlyLeaveRecord.update({
          where: { id: existingYearlyLeaveRecord.id },
          data: {
            maternity_leaves: availed_leaves,
            maternity_wfh_availed: availed_wfh,
          },
        });
      } else {
        const total_deductions =
          existingYearlyLeaveRecord.monthly_records.reduce(
            (acc: number, entry: any) => acc + (entry.deduction_leaves || 0),
            0,
          );

        const remaining_leaves =
          existingYearlyLeaveRecord.total_leaves -
          total_deductions -
          availed_leaves -
          existingYearlyLeaveRecord.availed_leaves;

        await this.prisma.yearlyLeaveRecord.update({
          where: { id: existingYearlyLeaveRecord.id },
          data: {
            availed_leaves:
              availed_leaves + existingYearlyLeaveRecord.availed_leaves,
            availed_wfh,
            remaining_leaves,
          },
        });
      }
    }
  }

  async sendNotification(
    user: any,
    applicationTypeId: number,
    leaveRecords: any[],
  ) {
    const teamLead = await this.prisma.resource.findMany({
      where: {
        department_id:
          user.resource.department_id == '64eef8334a3912fea3a48ba8'
            ? '65828652a1ef3ccffffca1f8'
            : user.resource.department_id,
        is_team_lead: true,
      },
    });

    const superAdmin = await this.prisma.user.findMany({
      where: { role_id: '64b7c3a06edd7dbdbb554648' },
    });

    const reciever_ids = [
      ...superAdmin.map((x) => x.id),
      ...teamLead.map((y) => y.id),
    ].filter(Boolean);

    const message = `${user?.name} has applied for ${
      applicationTypeId == 1 ? 'Leave' : 'Work From Home'
    }. Kindly approve.`;
    const notification: CreateNotificationDto = {
      title: `Employee ${
        applicationTypeId == 1 ? 'Leave' : 'Work From Home'
      } Request`,
      message,
      reciever_ids,
      created_by: user?.id,
      link: `/leave/listing`,
    };

    try {
      await sendNotification(notification);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async sendEmailNotification(
    user: any,
    applicationTypeId: number,
    leaveRecords: any[],
    reason,
  ) {
    const leaveTypeData = [
      { id: 1, name: 'Sick Leave' },
      { id: 2, name: 'Casual Leave' },
      { id: 3, name: 'Planned Leave' },
      { id: 4, name: 'Annual Leave' },
    ];

    // --- 1. Get team leads only
    const teamLeads = await this.prisma.resource.findMany({
      where: {
        department_id:
          user.resource.department_id == '64eef8334a3912fea3a48ba8'
            ? '65828652a1ef3ccffffca1f8'
            : user.resource.department_id,
        OR: [{ is_team_lead: true }, { is_atl: true }],
        status: true,
      },
      include: { user: { where: { status: true } } },
    });

    if (!teamLeads.length) return;

    // --- 2. Dates and days ---
    const start = new Date(leaveRecords[0].start_date);
    const end = new Date(leaveRecords[leaveRecords.length - 1].end_date);
    const numDays = leaveRecords.reduce((a, b) => a + b.leave_count, 0);
    const isHalfDay = leaveRecords.some((x) => x.is_halfday);

    const leaveTypeId =
      leaveRecords[0]?.leaveTypeId || leaveRecords[0]?.leave_type_id;
    const leaveType = leaveTypeData.find((lt) => lt.id === Number(leaveTypeId));
    const leaveTypeName = leaveType ? leaveType.name : 'Leave';

    // --- 4. Application type ---
    const applicationType =
      applicationTypeId == 1
        ? 'Leave'
        : applicationTypeId == 2
          ? 'Work from Home'
          : 'Leave';

    // --- 5. Formatters ---
    const formatDate = (d: Date) =>
      d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

    // --- 6. Subject ---
    const subject =
      isHalfDay && applicationTypeId == 1
        ? `Half Day Leave Notification – ${user.name}`
        : `${applicationType} Application Notification – ${user.name}`;

    // --- 7. Build replacements based on type ---
    const buildReplacements = (receiverName: string) => {
      if (applicationTypeId == 1 && isHalfDay) {
        return {
          replaceHeader: 'System generated mail',
          replaceUserName: `${receiverName}`,
          message: `
          A new half-day leave request has been submitted by <b>${
            user.name
          }</b>. Please find the details below:
          <br><br>
          <b>Application Type:</b> Apply Leave <br/>
          <b>Leave Type:</b> ${leaveTypeName} <br/>
          <b>Date:</b> ${formatDate(start)} (Half Day – ${
            user?.half_day_session || 'Morning'
          }) <br/>
          <b>Reason:</b> ${reason || 'Not specified'} <br/><br/>
          <b>Action Required:</b> Please log in to the DG Resource portal to approve or reject this request.
          <br><br>
          This is an automated system email. Please do not reply directly.
          <br><br>
        `,
        };
      }

      if (applicationTypeId == 1) {
        return {
          replaceHeader: 'System generated mail',
          replaceUserName: `${receiverName}`,
          message: `
          A new leave request has been submitted by <b>${
            user.name
          }</b>. Please find the details below:
          <br><br>
          <b>Application Type:</b> Apply Leave <br/>
          <b>Leave Type:</b> ${leaveTypeName} <br/>
          <b>Dates:</b> ${formatDate(start)} to ${formatDate(end)} <br/>
          <b>Number of days:</b> ${numDays} <br/>
          <b>Reason:</b> ${reason || 'Not specified'} <br/><br/>
          <b>Action Required:</b> Please log in to the DG Resource portal to approve or reject this request.
          <br><br>
          This is an automated system email. Please do not reply directly.
          <br><br>
        `,
        };
      }

      if (applicationTypeId == 2) {
        return {
          replaceHeader: 'System generated mail',
          replaceUserName: `${receiverName}`,
          message: `
          A new work from home request has been submitted by <b>${
            user.name
          }</b>. Please find the details below:
          <br><br>
          <b>Application Type:</b> Apply WFH <br/>
          <b>Dates:</b> ${formatDate(start)} to ${formatDate(end)} <br/>
          <b>Number of days:</b> ${numDays} <br/>
          <b>Reason:</b> ${reason || 'Not specified'} <br/><br/>
          <b>Action Required:</b> Please log in to the DG Resource portal to approve or reject this request.
          <br><br>
          This is an automated system email. Please do not reply directly.
          <br><br>
        `,
        };
      }

      return {
        replaceHeader: 'System generated mail',
        replaceUserName: `Dear ${receiverName}`,
        message: 'Invalid application type',
      };
    };

    const leadEmails = teamLeads
      .map((lead) => lead.user?.[0]?.email)
      .filter(Boolean);

    if (leadEmails.length === 0) {
      console.log('No team lead emails found');
      return;
    }

    const firstLeadName = teamLeads[0]?.user?.[0]?.name || 'Team Lead';
    const replacements = buildReplacements(firstLeadName);
    const template = replacePlaceholders(replacements);

    await sendEmail(
      [...leadEmails, 'superadmin@yopmail.com'],
      subject,
      template,
      [],
      user.email,
    );
  }
}

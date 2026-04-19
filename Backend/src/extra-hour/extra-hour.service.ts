import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ExtraHourDto } from './interface/create-extraHour.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';

enum approved_status {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
}

@Injectable()
export class ExtraHourService {
  constructor(private prisma: PrismaService) {}

  async create(dto: ExtraHourDto, request: any) {
    try {
      if (!dto?.start_time) {
        throw new HttpException(
          'Kindly provide End time.',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!dto?.end_time) {
        throw new HttpException(
          'Kindly provide Start time.',
          HttpStatus.BAD_REQUEST,
        );
      }

      let data: any = {};

      data.start_time = new Date(dto.start_time);
      data.end_time = new Date(dto.end_time);

      if (
        data.end_time.getHours() < data.start_time.getHours() &&
        data.end_time.getHours() > 5
      ) {
        throw new HttpException(
          'The End Time must be less than 04:59, if you want to add the entry of time after 04:59 select the next day.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (data.start_time.getHours() < 5) {
        data.start_time.setDate(data.start_time.getDate() + 1);
      }

      if (data.end_time.getHours() < 5) {
        data.end_time.setDate(data.end_time.getDate() + 1);
      }

      data.start_time = new Date(
        data.start_time.setHours(data.start_time.getHours() - 5),
      );
      data.end_time = new Date(
        data.end_time.setHours(data.end_time.getHours() - 5),
      );

      if (data.start_time >= data.end_time) {
        throw new HttpException(
          'Start time must be earlier than end time.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const previousExtraHour = await this.prisma.extra_hours.findMany({
        where: {
          OR: [
            {
              end_time: {
                lte: new Date(data.end_time),
              },
              start_time: {
                gte: new Date(data.start_time),
              },
            },
            {
              start_time: {
                lte: new Date(data.start_time),
              },
              end_time: {
                gte: new Date(data.start_time),
              },
            },
            {
              start_time: {
                lte: new Date(data.end_time),
              },
              end_time: {
                gte: new Date(data.end_time),
              },
            },
          ],
          emp_code: request?.user?.employement_code,
        },
      });

      const attendanceConflict = await this.prisma.emp_attendance.findMany({
        where: {
          emp_code: request?.user?.employement_code,
          punch_time: {
            gte: data.start_time,
            lte: data.end_time,
          },
          punch_state: 0,
        },
      });

      const attendanceConflict2 = await this.prisma.emp_attendance.findMany({
        where: {
          emp_code: request?.user?.employement_code,
          punch_time: {
            gte: data.start_time,
            lte: data.end_time,
          },
          punch_state: 1,
        },
      });

      if (attendanceConflict.length > 0 || attendanceConflict2.length > 0) {
        throw new HttpException(
          'Cannot create entry during time-in and time-out hours.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (previousExtraHour.length > 0) {
        throw new HttpException(
          'There is already a Entry created in this time range.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // data.hours = `${
      //   data?.end_time?.getHours() - data?.start_time?.getHours()
      // }`;
      if (data?.end_time && data?.start_time) {
        const checkinTime = new Date(data?.start_time);
        const checkoutTime = new Date(data?.end_time);
        const timeDifference = checkoutTime.getTime() - checkinTime.getTime();
        const hoursWorked = Math.floor(timeDifference / (1000 * 60 * 60));
        const minutesWorked = Math.floor(
          (timeDifference % (1000 * 60 * 60)) / (1000 * 60),
        );
        data.hours = `${hoursWorked}:${minutesWorked
          .toString()
          .padStart(2, '0')}`;
      }

      const extraHour = await this.prisma.extra_hours.create({
        data: {
          ...data,
          reason: dto.reason,
          date: new Date(dto.date),
          emp_code: request?.user?.employement_code,
        },
      });

      return handleSuccessResponse(
        'Extra Hours request Submitted Successfully',
        HttpStatus.CREATED,
        extraHour,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll(query: any, request: any) {
    try {
      const user = request?.user;
      let where;
      if (query?.start_date && query?.end_date) {
        const startOfDay = new Date(query?.start_date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(query?.end_date);
        endOfDay.setHours(23, 59, 59, 999);
        where = {
          date: { gte: new Date(startOfDay), lte: new Date(endOfDay) },
        };
      } else {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        where = {
          date: { gte: new Date(startOfDay), lte: new Date(endOfDay) },
        };
      }

      if (query?.emp_code) {
        where.emp_code = query?.emp_code;
      }
      if (query?.leave_status) {
        where.is_approved = query?.leave_status;
      }
      const extraHours: any = await this.prisma.extra_hours.findMany({
        where: where,
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

      extraHours.map((x: any) => {
        x.start_time.setHours(x.start_time.getHours() + 4);
        x.end_time.setHours(x.end_time.getHours() + 4);
      });

      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        extraHours,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(query) {
    try {
      if (!query?.id) {
        throw new HttpException('Kindly provide id', HttpStatus.BAD_REQUEST);
      }
      if (!query?.is_approved) {
        throw new HttpException(
          'Kindly provide Status',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!Object.values(approved_status).includes(query.is_approved)) {
        throw new HttpException(
          `Invalid status. Accepted values are ${Object.values(
            approved_status,
          ).join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const extraHour = await this.prisma.extra_hours.update({
        where: {
          id: query?.id,
        },
        data: {
          is_approved: query?.is_approved,
        },
      });
      return handleSuccessResponse(
        'Status Updated successfully',
        HttpStatus.OK,
        extraHour,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async allApprove() {
    try {
      const extra_hours = await this.prisma.extra_hours.findMany({
        where: {
          is_approved: 'PENDING',
        },
      });
      const updatedExtraHours = await this.prisma.extra_hours.updateMany({
        where: {
          id: { in: extra_hours.map((x) => x.id) },
        },
        data: {
          is_approved: 'APPROVED',
        },
      });
      return handleSuccessResponse(
        'Status Updated successfully',
        HttpStatus.OK,
        updatedExtraHours,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

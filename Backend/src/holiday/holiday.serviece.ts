import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';
import { CreateHolidayDto } from './dto/create-holiday.interface';
import * as moment from 'moment';

@Injectable()
export class HolidayService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHolidayDto) {
    try {
      const checkHoliday = await this.prisma.holidays.findFirst({
        where: {
          date: {
            gte: new Date(new Date(dto?.date).setUTCHours(0, 0, 0, 0)),
            lte: new Date(new Date(dto?.date).setUTCHours(23, 59, 59, 999)),
          },
        },
      });
      if (checkHoliday && checkHoliday.id) {
        return handleSuccessResponse(
          'Holiday already exists on this date',
          HttpStatus.OK,
          {},
        );
      }
      const holiday = await this.prisma.holidays.create({
        data: {
          title: dto.title,
          date: new Date(dto.date),
        },
      });

      const users = await this.prisma.user.findMany({
        where: {
          employement_code: {
            not: null,
          },
          status: true,
        },
        select: {
          id: true,
          resource_id: true,
          name: true,
          employement_code: true,
        },
      });

      const userIds = users
        .map((user) => user.resource_id)
        .filter((resourceId) => resourceId !== null);

      const PerDateallocations = await this.prisma.per_date_allocation.findMany(
        {
          where: {
            resource_id: { in: userIds },
            date: {
              gte: new Date(new Date(dto?.date).setUTCHours(0, 0, 0, 0)),
              lte: new Date(new Date(dto?.date).setUTCHours(23, 59, 59, 999)),
            },
            allocation: {
              is_overtime: false,
            },
          },
        },
      );

      const allocationIds = PerDateallocations.map(
        (x) => x.allocation_id,
      ).filter((allocation_id) => allocation_id !== null);

      const allocationResourceIds = PerDateallocations.map((x) => {
        if (x.allocation_id != null) {
          return x.resource_id;
        }
      });

      const unAllocatedResourceIds = userIds.filter(
        (userId) => !allocationResourceIds.includes(userId),
      );

      // ).filter((allocation_id) => allocation_id !== null);

      // const DeleteperDateallocations =
      //   await this.prisma.per_date_allocation.deleteMany({
      //     where: {
      //       resource_id: { in: userIds },
      //       date: {
      //         gte: new Date(new Date(dto?.date).setUTCHours(0, 0, 0, 0)),
      //         lte: new Date(new Date(dto?.date).setUTCHours(23, 59, 59, 999)),
      //       },
      //     },
      //   });

      const updatePerDateAllocations =
        await this.prisma.per_date_allocation.updateMany({
          where: {
            resource_id: { in: userIds },
            date: {
              gte: new Date(new Date(dto?.date).setUTCHours(0, 0, 0, 0)),
              lte: new Date(new Date(dto?.date).setUTCHours(23, 59, 59, 999)),
            },
            allocation: {
              is_overtime: false,
            },
          },
          data: {
            allocation_id: null,
            task_hours: 0,
            is_holiday: true,
          },
        });

      const createPerDateAllocations =
        await this.prisma.per_date_allocation.createMany({
          data: unAllocatedResourceIds.map((x: any) => ({
            resource_id: x,
            allocation_id: null,
            task_hours: 0,
            is_holiday: true,
            date: new Date(dto.date),
          })),
        });

      const allocation = await this.prisma.allocation.findMany({
        where: {
          id: {
            in: allocationIds,
          },
        },
        include: {
          task: {
            include: {
              project: true,
            },
          },
        },
      });

      if (allocation.length > 0 && allocation != undefined) {
        for (let i = 0; i < allocation.length; i++) {
          const newNumberOfDays = !allocation[i]?.is_overtime
            ? calcBusinessDays(
                moment(allocation[i]?.start_date),
                moment(allocation[i]?.end_date),
              )
            : calcAllDays(
                moment(allocation[i]?.start_date),
                moment(allocation[i]?.end_date),
              );

          const perDayHours = Math.round(
            allocation[i]?.task_hours / newNumberOfDays,
          );

          const updateAllocation = await this.prisma.allocation.update({
            where: {
              id: allocation[i]?.id,
            },
            data: {
              task_hours: allocation[i]?.task_hours - perDayHours,
            },
          });

          const consumedHours =
            await this.prisma.project_consumed_hours.findFirst({
              where: {
                department_id: allocation[i]?.department_id,
                project_id: allocation[i]?.task?.project_id,
              },
            });

          if (consumedHours && consumedHours.id) {
            const updateConsumedHours =
              await this.prisma.project_consumed_hours.update({
                where: {
                  id: consumedHours.id,
                  department_id: allocation[i]?.department_id,
                  project_id: allocation[i]?.task?.project_id,
                },
                data: {
                  consumed_hours: consumedHours.consumed_hours - perDayHours,
                },
              });
          }
        }
      }

      const attendance = await this.prisma.emp_attendance.createMany({
        data: users?.map((x) => ({
          name: x?.name,
          emp_code: x?.employement_code,
          created_at: new Date(dto.date),
          updated_at: new Date(dto.date),
          is_leave: true,
          leave_status: 'Holiday',
          location_type_id: 1,
        })),
      });

      return handleSuccessResponse(
        'Holiday added successfully',
        HttpStatus.OK,
        holiday,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const holidays = await this.prisma.holidays.findMany();
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        holidays,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const holiday = await this.prisma.holidays.findFirst({
        where: {
          id: id,
        },
      });
      const perDayAllocations =
        await this.prisma.per_date_allocation.updateMany({
          where: {
            date: {
              gte: new Date(new Date(holiday?.date).setUTCHours(0, 0, 0, 0)),
              lte: new Date(
                new Date(holiday?.date).setUTCHours(23, 59, 59, 999),
              ),
            },
          },
          data: {
            is_holiday: false,
          },
        });
      const removeHoliday = await this.prisma.holidays.delete({
        where: { id: id },
      });
      // const attendance = await this.prisma.emp_attendance.deleteMany({
      //   where: {
      //     created_at: {
      //       gte: new Date(new Date(holiday?.date).setUTCHours(0, 0, 0, 0)),
      //       lte: new Date(new Date(holiday?.date).setUTCHours(23, 59, 59, 999)),
      //     },
      //   },
      // });
      return handleSuccessResponse(
        'Removed successfully',
        HttpStatus.OK,
        removeHoliday,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getForListing(query: any) {
    try {
      const regex = /^\s*(id|created_at|updated_at|title)\s+(asc|desc)\s*$/i;
      const match = query?.$orderby?.match(regex);

      let column: any;
      let value;

      if (match) {
        column = match[1]; // "created_at"
        value = match[2]; // "desc"
      } else {
        column = 'id';
        value = 'desc';
      }

      let where = {};
      const obj = [];
      const filter = parseData(query?.$filter, obj);

      if (filter && typeof filter !== 'undefined' && filter.length > 0) {
        filter.forEach((filter) => {
          if (filter) {
            where = {
              [filter.columnName]: {
                [filter.filter]: filter?.value?.contains,
              },
            };
          }
        });
      }

      const holidays = await this.prisma.holidays.findMany({
        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where,
      });

      const count = await this.prisma.holidays.count();

      const res = {
        rows: holidays,
        count: count,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

function calcBusinessDays(startDate: any, endDate: any) {
  const currentMoment = startDate.clone();
  let businessDays = 0;

  while (currentMoment.isBefore(endDate) || currentMoment.isSame(endDate)) {
    if (currentMoment.day() !== 0 && currentMoment.day() !== 6) {
      businessDays++;
    }
    currentMoment.add(1, 'day');
  }

  return businessDays == 0 ? 1 : businessDays;
}
function calcAllDays(startDate: any, endDate: any) {
  const currentMoment = startDate.clone();
  let businessDays = 0;

  while (currentMoment.isBefore(endDate) || currentMoment.isSame(endDate)) {
    businessDays++;
    currentMoment.add(1, 'day');
  }

  return businessDays;
}

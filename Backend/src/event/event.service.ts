import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// import { VenderDto } from './interface/create-vender.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}
  async create(dto: any) {
    try {
      if (!dto?.start_date) {
        throw new HttpException(
          'Kindly provide End date.',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!dto?.end_date) {
        throw new HttpException(
          'Kindly provide Start date.',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!dto?.working_hours) {
        throw new HttpException(
          'Kindly provide working hours.',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!dto?.title) {
        throw new HttpException(
          'Kindly provide title.',
          HttpStatus.BAD_REQUEST,
        );
      }
      const previousEvent = await this.prisma.events.findMany({
        where: {
          OR: [
            {
              start_date: {
                lte: new Date(dto.end_date),
              },
              end_date: {
                gte: new Date(dto.start_date),
              },
            },
            {
              start_date: {
                lte: new Date(dto.start_date),
              },
              end_date: {
                gte: new Date(dto.start_date),
              },
            },
            {
              start_date: {
                lte: new Date(dto.end_date),
              },
              end_date: {
                gte: new Date(dto.end_date),
              },
            },
          ],
        },
      });

      if (previousEvent.length > 0) {
        throw new HttpException(
          'There is already a event created in this date range.',
          HttpStatus.BAD_REQUEST,
        );
      }

      dto.start_date = new Date(dto.start_date);
      dto.end_date = new Date(dto.end_date);

      dto.start_date.setHours(8, 0, 0, 0);
      dto.end_date.setHours(21, 59, 59, 999);

      if (dto.start_date >= dto.end_date) {
        throw new HttpException(
          'Start date must be earlier than end date.',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        dto.start_date.getMonth() !== dto.end_date.getMonth() ||
        dto.start_date.getFullYear() !== dto.end_date.getFullYear()
      ) {
        throw new HttpException(
          'Start date and end date must be within the same month and year.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const event = await this.prisma.events.create({
        data: dto,
      });
      return handleSuccessResponse(
        'Event Created Successfull',
        HttpStatus.CREATED,
        event,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const events = await this.prisma.events.findMany();
      return handleSuccessResponse('Fetch successfully', HttpStatus.OK, events);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const event = await this.prisma.events.findFirst({
        where: { id: id },
      });
      return handleSuccessResponse('Fetch successfully', HttpStatus.OK, event);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: any) {
    try {
      const event = await this.prisma.events.update({
        data: dto,
        where: { id: id },
      });
      return handleSuccessResponse(
        'Event Updated Successfully',
        HttpStatus.OK,
        event,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getForListing(query: any) {
    try {
      const regex = /^\s*(id|created_at|updated_at|name)\s+(asc|desc)\s*$/i;
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
              ...where,
              [filter.columnName]: {
                [filter.filter]: filter.value.contains,
                mode: 'insensitive',
              },
            };
          }
        });
      }

      const events = await this.prisma.events.findMany({
        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where,
      });

      const count = await this.prisma.events.count();

      const res = {
        rows: events,
        count: count,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const event = await this.prisma.events.findFirst({
        where: {
          id: id,
        },
      });
      if (event?.id) {
        const removeEvent = await this.prisma.events.delete({
          where: { id: id },
        });
      }
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

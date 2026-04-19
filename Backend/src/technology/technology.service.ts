import { HttpStatus, Injectable } from '@nestjs/common';
import { TechnologyInterface } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';

@Injectable()
export class TechnologyService {
  constructor(private prisma: PrismaService) {}

  async create(dto: TechnologyInterface) {
    try {
      const technology = await this.prisma.technology.create({ data: dto });
      return handleSuccessResponse(
        'Technology Created Successfull',
        HttpStatus.CREATED,
        technology,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const technology = await this.prisma.technology.findMany({
        where: { status: true },
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        technology,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const technology = await this.prisma.technology.findFirst({
        where: { id: id },
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        technology,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: TechnologyInterface) {
    try {
      const technology = await this.prisma.technology.update({
        data: dto,
        where: { id: id },
      });
      return handleSuccessResponse(
        'Technology Updated Successfull',
        HttpStatus.OK,
        technology,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const technology = await this.prisma.technology.delete({
        where: { id: id },
      });

      return handleSuccessResponse(
        'Success',
        HttpStatus.OK,
        'Technology Deleted Succssfully',
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

      const technology = await this.prisma.technology.findMany({
        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where,
      });

      const count = await this.prisma.technology.count();

      const res = {
        rows: technology,
        count: count,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

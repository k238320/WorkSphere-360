import { HttpStatus, Injectable } from '@nestjs/common';
import { IndustryInterface } from './dto';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseData } from 'src/utils/parseFilters';

@Injectable()
export class IndustryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: IndustryInterface) {
    try {
      const industry = await this.prisma.industry.create({ data: dto });
      return handleSuccessResponse(
        'Industry Created Successfull',
        HttpStatus.CREATED,
        industry,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const industry = await this.prisma.industry.findMany({
        where: { status: true },
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        industry,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const industry = await this.prisma.industry.findFirst({
        where: { id: id },
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        industry,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: IndustryInterface) {
    try {
      const industry = await this.prisma.industry.update({
        data: dto,
        where: { id: id },
      });
      return handleSuccessResponse(
        'Industry Updated Successfull',
        HttpStatus.CREATED,
        industry,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const industry = await this.prisma.industry.delete({
        where: { id: id },
      });

      return handleSuccessResponse(
        'Success',
        HttpStatus.OK,
        'Industry Deleted Succssfully',
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
                [filter.filter]: filter?.value?.contains,
                mode: 'insensitive',
              },
            };
          }
        });
      }

      const industry = await this.prisma.industry.findMany({
        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where,
      });

      const count = await this.prisma.industry.count();

      const res = {
        rows: industry,
        count: count,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

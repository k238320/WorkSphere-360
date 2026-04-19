import { HttpStatus, Injectable } from '@nestjs/common';
import { CategoryInterface } from './interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CategoryInterface) {
    try {
      const category = await this.prisma.category.create({ data: dto });
      return handleSuccessResponse(
        'Category Created Successfull',
        HttpStatus.CREATED,
        category,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const category = await this.prisma.category.findMany({
        where: { status: true },
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        category,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.prisma.category.findFirst({
        where: { id: id },
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        category,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: CategoryInterface) {
    try {
      const category = await this.prisma.category.update({
        data: dto,
        where: { id: id },
      });
      return handleSuccessResponse(
        'Category Updated Successfully',
        HttpStatus.OK,
        category,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const category = await this.prisma.category.delete({
        where: { id: id },
      });

      return handleSuccessResponse(
        'Success',
        HttpStatus.OK,
        'Category Deleted Succssfully',
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
              [filter.columnName]: {
                [filter.filter]: filter?.value?.contains,
                mode: 'insensitive',
              },
            };
          }
        });
      }

      const category = await this.prisma.category.findMany({
        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where,
      });

      const count = await this.prisma.category.count();

      const res = {
        rows: category,
        count: count,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

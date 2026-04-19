import { HttpStatus, Injectable } from '@nestjs/common';
import { DepartmentDto } from './interface/create-department.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: DepartmentDto) {
    try {
      const department = await this.prisma.department.create({
        data: dto,
      });

      if (department) {
        await this.prisma.cost.create({
          data: {
            department_wise_cost: 40,
            start_date: new Date(),
            department_id: department.id,
          },
        });
      }
      return handleSuccessResponse(
        'Department Created Successfull',
        HttpStatus.CREATED,
        department,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const department = await this.prisma.department.findMany({
        where: { status: true },
        include: {
          resource: { where: { status: true, show_in_calendar: true } },
        },
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        department,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const department = await this.prisma.department.findFirst({
        where: { id: id },
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        department,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: DepartmentDto) {
    try {
      const department = await this.prisma.department.update({
        data: dto,
        where: { id: id },
      });
      return handleSuccessResponse(
        'Department Updated Successfully',
        HttpStatus.OK,
        department,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const department = await this.prisma.department.delete({
        where: { id: id },
      });

      return handleSuccessResponse(
        'Success',
        HttpStatus.OK,
        'Department Deleted Succssfully',
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

      const department = await this.prisma.department.findMany({
        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where,
      });

      const count = await this.prisma.department.count();

      const res = {
        rows: department,
        count: count,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async dgKitFindAll(query: any) {
    try {
      let where: any = {
        status: true,
      };
      if (query?.name) {
        where.name = {
          contains: query?.name,
          mode: 'insensitive',
        };
      }
      if (query?.id) {
        where.id = query?.id;
      }
      const department = await this.prisma.department.findMany({
        where: where,
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        department,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

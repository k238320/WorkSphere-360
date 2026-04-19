import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskCategoryDto } from './dto/create-task_category.dto';
import { UpdateTaskCategoryDto } from './dto/update-task_category.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';

@Injectable()
export class TaskCategoryService {
  constructor(private prisma: PrismaService) {}
  async create(createTaskCategoryDto: CreateTaskCategoryDto) {
    try {
      const category = await this.prisma.task_category.create({
        data: createTaskCategoryDto,
      });
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
      const category = await this.prisma.task_category.findMany({
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
      const task_category = await this.prisma.task_category.findFirst({
        where: { id: id },
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        task_category,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, updateTaskCategoryDto: UpdateTaskCategoryDto) {
    try {
      const task_category = await this.prisma.task_category.update({
        where: { id: id },
        data: updateTaskCategoryDto,
      });

      return handleSuccessResponse('', HttpStatus.OK, task_category);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} taskCategory`;
  }

  async listing(query: any) {
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

      const task_category = await this.prisma.task_category.findMany({
        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where,
      });

      const count = await this.prisma.task_category.count();

      const res = {
        rows: task_category,
        count: count,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProjectStatusCategoryDto } from './dto/create-project-status-category.dto';
import { UpdateProjectStatusCategoryDto } from './dto/update-project-status-category.dto';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseData } from 'src/utils/parseFilters';

@Injectable()
export class ProjectStatusCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectStatusCategoryDto) {
    try {
      const result = await this.prisma.project_status_category.create({
        data: dto,
      });
      return handleSuccessResponse(
        'Created Successfully',
        HttpStatus.CREATED,
        result,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const category = await this.prisma.project_status_category.findMany({
        where: { status: true },
      });
      return handleSuccessResponse('', HttpStatus.OK, category);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.prisma.project_status_category.findFirst({
        where: { id: id },
      });
      return handleSuccessResponse('', HttpStatus.OK, category);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdateProjectStatusCategoryDto) {
    try {
      const result = await this.prisma.project_status_category.update({
        where: { id: id },
        data: dto,
      });
      return handleSuccessResponse(
        'Updated Successfully',
        HttpStatus.OK,
        result,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const result = await this.prisma.project_status_category.delete({
        where: { id: id },
      });
      return handleSuccessResponse('', 200, 'Deleted Successfully');
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

      const project_status_category =
        await this.prisma.project_status_category.findMany({
          take: +query?.$top,
          skip: +query?.$skip,
          orderBy: {
            [column]: value,
          },
          where,
        });

      const count = await this.prisma.project_status_category.count();

      const res = {
        rows: project_status_category,
        count: count,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

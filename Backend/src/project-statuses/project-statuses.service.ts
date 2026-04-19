import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProjectStatusDto } from './dto/create-project-status.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';

@Injectable()
export class ProjectStatusesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectStatusDto) {
    try {
      const result = await this.prisma.project_statuses.create({ data: dto });
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
      const project_statuses = await this.prisma.project_statuses.findMany({
        where: { status: true },
      });
      return handleSuccessResponse('', HttpStatus.OK, project_statuses);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const project_statuses = await this.prisma.project_statuses.findFirst({
        where: { id: id },
      });
      return handleSuccessResponse('', HttpStatus.OK, project_statuses);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdateProjectStatusDto) {
    try {
      const project_statuses = await this.prisma.project_statuses.update({
        where: { id: id },
        data: { name: dto.name, status: dto.status },
      });
      return handleSuccessResponse(
        'updated successfully',
        HttpStatus.OK,
        project_statuses,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const project_statuses = await this.prisma.project_statuses.delete({
        where: { id: id },
      });

      return handleSuccessResponse('', HttpStatus.OK, 'Deleted Successfully');
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

      const project_statuses = await this.prisma.project_statuses.findMany({
        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where,
      });

      const count = await this.prisma.project_statuses.count();

      const res = {
        rows: project_statuses,
        count: count,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

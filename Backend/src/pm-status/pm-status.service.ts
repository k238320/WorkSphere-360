import { HttpStatus, Injectable } from '@nestjs/common';
// import { MilestonePhaseDto } from './dto/create-milestone-phase.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';

@Injectable()
export class PmStatusService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    try {
      let column: any;
      let value;

      column = 'id';
      value = 'desc';
      let where = {};
      const obj = [];
      const filter = parseData(query?.$filter, obj);

      if (filter && typeof filter !== 'undefined' && filter.length > 0) {
        filter.forEach((filter) => {
          if (filter) {
            if (filter.columnName == 'project_name') {
              where = {
                [filter.columnName]: {
                  name: {
                    [filter.filter]: filter.value.contains,
                    mode: 'insensitive',
                  },
                },
              };
            } else {
              where = {
                [filter.columnName]: {
                  [filter.filter]: filter.value.contains,
                  mode: 'insensitive',
                },
              };
            }
          }
        });
      }

      const projectsWithStatus = await this.prisma.project.findMany({
        select: {
          id: true,
          name: true,
          project_manager_details: true,
          pm_status: true,
          project_status: {
            select: {
              id: true,
              comment: true,
              created_at: true,
              project_statuses: {
                select: {
                  id: true,
                  name: true,
                  created_at: true,
                },
              },
            },
          },
        },
        orderBy: {
          [column]: value,
        },
        take: +query?.$top,
        skip: +query?.$skip,
        where,
      });

      const count = await this.prisma.project.count();
      const res = {
        rows: projectsWithStatus,
        count: count,
      };

      return handleSuccessResponse('Fetch successfully', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const pmstatus = await this.prisma.pm_status.findFirst({
        where: { project_id: id },
      });

      return handleSuccessResponse('Fetch successful', HttpStatus.OK, pmstatus);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async create(dto: any) {
    try {
      const exist = await this.prisma.pm_status.findFirst({
        where: { project_id: dto.project_id },
      });
      if (exist == null) {
        const pmstatus = await this.prisma.pm_status.create({
          data: dto,
        });

        return handleSuccessResponse(
          'pmo-status created successfully',
          HttpStatus.OK,
          pmstatus,
        );
      } else {
        const pmstatus = await this.prisma.pm_status.update({
          where: { project_id: dto.project_id },
          data: dto,
        });

        return handleSuccessResponse(
          'pmo-status created successfully',
          HttpStatus.OK,
          pmstatus,
        );
      }
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: any) {
    try {
      const pmstatus = await this.prisma.pm_status.update({
        where: { project_id: id },
        data: dto,
      });

      return handleSuccessResponse(
        'pmo-status created successfully',
        HttpStatus.OK,
        pmstatus,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

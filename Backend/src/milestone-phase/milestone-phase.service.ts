import { HttpStatus, Injectable } from '@nestjs/common';
import { MilestonePhaseDto } from './dto/create-milestone-phase.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';

@Injectable()
export class MilestonePhaseService {
  constructor(private prisma: PrismaService) {}
  async create(dto: MilestonePhaseDto) {
    try {
      const milestone = await this.prisma.milestone_phase.create({
        data: dto,
      });
      return handleSuccessResponse(
        'milestopne phase created successfully',
        HttpStatus.OK,
        milestone,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const milestone_phase = await this.prisma.milestone_phase.findMany({
        where: { status: true },
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        milestone_phase,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const milestone_phase = await this.prisma.milestone_phase.findFirst({
        where: { id: id },
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        milestone_phase,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: MilestonePhaseDto) {
    try {
      const milestone = await this.prisma.milestone_phase.update({
        data: dto,

        where: { id: id },
      });
      return handleSuccessResponse(
        'milestopne phase created successfully',
        HttpStatus.OK,
        milestone,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const milestone_phase = await this.prisma.milestone_phase.delete({
        where: { id: id },
      });

      return handleSuccessResponse(
        'Success',
        HttpStatus.OK,
        'Milestone Phase Deleted Succssfully',
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

      const milestone_phase = await this.prisma.milestone_phase.findMany({
        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where,
      });

      const count = await this.prisma.milestone_phase.count();

      const res = {
        rows: milestone_phase,
        count: count,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

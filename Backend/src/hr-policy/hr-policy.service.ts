import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
// import { MilestonePhaseDto } from './dto/create-milestone-phase.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';
import { CreateHrPolicyDto } from './dto/create-hr-policy.dto';

@Injectable()
export class HrPolicyService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHrPolicyDto) {
    try {
      const hrPolicy = await this.prisma.hr_policy.create({
        data: dto,
      });

      return handleSuccessResponse(
        'Hr Policy created successfully',
        HttpStatus.OK,
        hrPolicy,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll(userRole: string) {
    try {
      const where: any = {};

      // Restrict listing for non-privileged roles
      if (
        ![
          'Super Admin',
          'Human Resource',
          'Human Resource Operations',
        ].includes(userRole)
      ) {
        where.is_active = true;
      }

      const hrPolicy = await this.prisma.hr_policy.findMany({ where });

      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        hrPolicy,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getForListing(query: any, userRole: string) {
    try {
      const regex = /^\s*(id|created_at|updated_at|title)\s+(asc|desc)\s*$/i;
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

      let where: any = {};

      // Restrict listing for non-privileged roles
      if (
        ![
          'Super Admin',
          'Human Resource',
          'Human Resource Operations',
        ].includes(userRole)
      ) {
        where.is_active = true;
      }

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

      const hrPolicy = await this.prisma.hr_policy.findMany({
        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where,
      });

      const count = await this.prisma.hr_policy.count();

      const res = {
        rows: hrPolicy,
        count: count,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async toggleStatus(id: string, is_active: boolean, userRole: string) {
    if (
      !['Super Admin', 'Human Resource', 'Human Resource Operations'].includes(
        userRole,
      )
    ) {
      throw new ForbiddenException('You are not allowed to update policies');
    }

    try {
      const policy = await this.prisma.hr_policy.update({
        where: { id },
        data: { is_active },
      });

      return handleSuccessResponse(
        `Policy ${is_active ? 'activated' : 'deactivated'} successfully`,
        HttpStatus.OK,
        policy,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

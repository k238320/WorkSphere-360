import { Injectable } from '@nestjs/common';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';

@Injectable()
export class CostService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    try {
      const cost = await this.prisma.cost.create({ data: dto });
      return handleSuccessResponse('Cost Created Succesffuly', 200, cost);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      // const currentYear = new Date().getFullYear();

      // return this.prisma.cost.findMany({
      //   where: {
      //     start_date: {
      //       gte: new Date(currentYear, 0, 1),
      //       lt: new Date(currentYear + 1, 0, 1),
      //     },
      //   },
      // });

      const currentYear = new Date().getFullYear();

      let distinctUUIDs = await this.prisma.cost.findMany({
        where: {
          start_date: {
            gte: new Date(currentYear, 0, 1),
            lt: new Date(currentYear + 1, 0, 1),
          },
        },
        distinct: ['department_id'],
        include: { department: true },
      });

      if (distinctUUIDs.length === 0) {
        const lastYear = currentYear - 1;
        distinctUUIDs = await this.prisma.cost.findMany({
          where: {
            start_date: {
              gte: new Date(lastYear, 0, 1),
              lt: new Date(lastYear + 1, 0, 1),
            },
          },
          distinct: ['department_id'],
          include: { department: true },
        });
      }

      return handleSuccessResponse('', 200, distinctUUIDs);
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async findOne(departmentId: string) {
    try {
      const cost = await this.prisma.cost.findFirst({
        where: { department_id: departmentId },
      });

      return handleSuccessResponse('', 200, cost);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  update(id: number, updateCostDto: UpdateCostDto) {
    return `This action updates a #${id} cost`;
  }

  remove(id: number) {
    return `This action removes a #${id} cost`;
  }
}

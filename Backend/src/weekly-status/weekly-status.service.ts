import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateWeeklyStatusDto } from './dto/create-weekly-status.dto';
import { UpdateWeeklyStatusDto } from './dto/update-weekly-status.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';

@Injectable()
export class WeeklyStatusService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWeeklyStatusDto) {
    try {
      const weeklyStatusCreate = await this.prisma.weekly_status.create({
        data: {
          commet: dto.commet,
          project_id: dto.project_id,
          user_id: dto.user_id,
        },
      });
      return handleSuccessResponse(
        'weekly Status Created successfully',
        HttpStatus.CREATED,
        weeklyStatusCreate,
      );
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const weeklyStatusGet = await this.prisma.weekly_status.findMany();
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        weeklyStatusGet,
      );
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async findOne(projectId: string) {
    try {
      const weeklyStatusGet = await this.prisma.weekly_status.findMany({
        where: { project_id: projectId },
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        weeklyStatusGet,
      );
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  update(id: number, updateWeeklyStatusDto: UpdateWeeklyStatusDto) {
    return `This action updates a #${id} weeklyStatus`;
  }

  async remove(id: string) {
    try {
      const weeklyStatusRemove = await this.prisma.weekly_status.delete({
        where: { id: id },
      });
      if (!weeklyStatusRemove) {
        return handleSuccessResponse(
          'Failed',
          HttpStatus.BAD_REQUEST,
          'Data Does not found',
        );
      }

      return handleSuccessResponse(
        'success',
        HttpStatus.OK,
        'Data Deleted Successfully',
      );
    } catch (error) {
      return handlePrismaError(error);
    }
  }
}

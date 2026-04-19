import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskStatusDto } from './dto/create-task_status.dto';
import { UpdateTaskStatusDto } from './dto/update-task_status.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';

@Injectable()
export class TaskStatusService {
  constructor(private prisma: PrismaService) {}
  async create(createTaskStatusDto: CreateTaskStatusDto) {
    try {
      const task_status = await this.prisma.task_status.create({
        data: createTaskStatusDto,
      });
      return handleSuccessResponse(
        'Task Status Created Successfull',
        HttpStatus.CREATED,
        task_status,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const status = await this.prisma.task_status.findMany();
      return handleSuccessResponse('Fetch successfully', HttpStatus.OK, status);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} taskStatus`;
  }

  async update(id: string, updateTaskStatusDto: UpdateTaskStatusDto) {
    try {
      const task_status = await this.prisma.task_status.update({
        where: { id: id },
        data: updateTaskStatusDto,
      });

      return handleSuccessResponse('', HttpStatus.OK, task_status);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} taskStatus`;
  }
}

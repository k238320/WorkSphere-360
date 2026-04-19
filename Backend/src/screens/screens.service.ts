import { Injectable } from '@nestjs/common';
import { CreateScreenDto } from './dto/create-screen.dto';
import { UpdateScreenDto } from './dto/update-screen.dto';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ScreensService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateScreenDto) {
    try {
      const screens = await this.prisma.screens.create({
        data: dto,
      });

      return handleSuccessResponse('', 200, screens);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const screens = await this.prisma.screens.findMany({
        where: { status: true },
      });

      return handleSuccessResponse('', 200, screens);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const screens = await this.prisma.screens.findFirst({
        where: { id: id },
      });

      return handleSuccessResponse('', 200, screens);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdateScreenDto) {
    try {
      const screens = await this.prisma.screens.update({
        where: { id: id },
        data: dto,
      });

      return handleSuccessResponse('', 200, screens);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  remove(id: string) {
    return `This action removes a #${id} screen`;
  }
}

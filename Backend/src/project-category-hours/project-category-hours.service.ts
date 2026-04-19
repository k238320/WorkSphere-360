import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProjectCategoryHourDto } from './interface/create-project-category-hour.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';

@Injectable()
export class ProjectCategoryHoursService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectCategoryHourDto) {
    try {
      const result = await this.prisma.project_category_hours.create({
        data: dto,
      });
      return handleSuccessResponse(
        'ProjectCategoryHour Created Successfull',
        HttpStatus.CREATED,
        result,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const result = await this.prisma.project_category_hours.findMany();
      return handleSuccessResponse('Fetch successfully', HttpStatus.OK, result);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} projectCategoryHour`;
  }

  update(id: number, updateProjectCategoryHourDto) {
    return `This action updates a #${id} projectCategoryHour`;
  }

  remove(id: number) {
    return `This action removes a #${id} projectCategoryHour`;
  }
}

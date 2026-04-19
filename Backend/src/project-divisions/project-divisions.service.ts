import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProjectDivisionDto } from './dto/create-project-division.dto';
import { UpdateProjectDivisionDto } from './dto/update-project-division.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';

@Injectable()
export class ProjectDivisionsService {
  constructor(private prisma: PrismaService) {}
  create(createProjectDivisionDto: CreateProjectDivisionDto) {
    return 'This action adds a new projectDivision';
  }

  async findAll() {
    try {
      const projectDivision = await this.prisma.projectDivision.findMany();

      return handleSuccessResponse('', HttpStatus.OK, projectDivision);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} projectDivision`;
  }

  update(id: number, updateProjectDivisionDto: UpdateProjectDivisionDto) {
    return `This action updates a #${id} projectDivision`;
  }

  remove(id: number) {
    return `This action removes a #${id} projectDivision`;
  }
}

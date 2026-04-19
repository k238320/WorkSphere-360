import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProjectContractTypeDto } from './dto/create-project_contract_type.dto';
import { UpdateProjectContractTypeDto } from './dto/update-project_contract_type.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';

@Injectable()
export class ProjectContractTypeService {
  constructor(private prisma: PrismaService) {}
  create(createProjectContractTypeDto: CreateProjectContractTypeDto) {
    return 'This action adds a new projectContractType';
  }

  async findAll() {
      try {
        const project_contract_type = await this.prisma.project_contract_type.findMany();
  
        return handleSuccessResponse('', HttpStatus.OK, project_contract_type);
      } catch (error) {
        handlePrismaError(error);
      }
    }

  findOne(id: number) {
    return `This action returns a #${id} projectContractType`;
  }

  update(id: number, updateProjectContractTypeDto: UpdateProjectContractTypeDto) {
    return `This action updates a #${id} projectContractType`;
  }

  remove(id: number) {
    return `This action removes a #${id} projectContractType`;
  }
}

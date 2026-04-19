import { Injectable } from '@nestjs/common';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createModuleDto: CreateModuleDto) {
    return 'This action adds a new module';
  }

  async findAll() {
    try {
      const modules = await this.prisma.modules.findMany();

      return handleSuccessResponse('', 200, modules);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} module`;
  }

  update(id: number, updateModuleDto: UpdateModuleDto) {
    return `This action updates a #${id} module`;
  }

  remove(id: number) {
    return `This action removes a #${id} module`;
  }
}

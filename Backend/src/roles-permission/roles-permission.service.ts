import { Injectable } from '@nestjs/common';
import { CreateRolesPermissionDto } from './dto/create-roles-permission.dto';
import { UpdateRolesPermissionDto } from './dto/update-roles-permission.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';

@Injectable()
export class RolesPermissionService {
  constructor(private readonly prisma: PrismaService) {}

  create(createRolesPermissionDto: CreateRolesPermissionDto) {
    return 'This action adds a new rolesPermission';
  }

  async findAll() {
    try {
      const permission = await this.prisma.permission.findMany();

      return handleSuccessResponse('', 200, permission);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} rolesPermission`;
  }

  update(id: number, updateRolesPermissionDto: UpdateRolesPermissionDto) {
    return `This action updates a #${id} rolesPermission`;
  }

  remove(id: number) {
    return `This action removes a #${id} rolesPermission`;
  }
}

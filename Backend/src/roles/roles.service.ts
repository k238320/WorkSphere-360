import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    try {
      if (dto.module?.length > 0) {
        const roles = await this.prisma.roles.create({
          data: {
            name: dto.name,
            screens: dto.screens,
            status: dto.status,
            role_mapping: {
              create: dto.module.map((x) => ({
                module_id: x.module_id,
                permission_id: x.permission_id,
              })),
            },
          },
        });
      } else {
        const roles = await this.prisma.roles.create({
          data: {
            name: dto.name,
            screens: dto.screens,
            status: dto.status,
          },
        });
      }

      return handleSuccessResponse('', 200, 'Role Created Sucssfully!');
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const roles = await this.prisma.roles.findMany({
        where: { status: true },
        include: {
          role_mapping: {
            select: { modules: true, permission: true, role: true },
          },
        },
      });

      return handleSuccessResponse('', 200, roles);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const roles = await this.prisma.roles.findFirst({
        where: { id: id },
        include: {
          role_mapping: { include: { modules: true, permission: true } },
        },
      });

      return handleSuccessResponse('', 200, roles);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdateRoleDto) {
    try {
      const roles = await this.prisma.roles.update({
        where: { id: id },
        data: dto,
      });

      return handleSuccessResponse('', 200, roles);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }

  async listing(query: any) {
    try {
      const regex = /^\s*(id|created_at|updated_at|name)\s+(asc|desc)\s*$/i;
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

      let where = {};
      const obj = [];
      const filter = parseData(query?.$filter, obj);

      if (filter && typeof filter !== 'undefined' && filter.length > 0) {
        filter.forEach((filter) => {
          if (filter) {
            where = {
              [filter.columnName]: {
                [filter.filter]: filter?.value?.contains,
                mode: 'insensitive',
              },
            };
          }
        });
      }

      const roles = await this.prisma.roles.findMany({
        include: {
          role_mapping: { include: { permission: true, modules: true } },
        },
        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where,
      });

      const count = await this.prisma.roles.count();

      const res = {
        rows: roles,
        count: count,
      };

      return handleSuccessResponse('', 200, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async roleMapping(dto) {
    try {
      const role_mapping = await this.prisma.role_mapping.create({
        data: {
          role_id: dto.role_id,
          module_id: dto.module_id,
          permission_id: dto.permission_id,
        },
      });

      return handleSuccessResponse('', 200, role_mapping);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

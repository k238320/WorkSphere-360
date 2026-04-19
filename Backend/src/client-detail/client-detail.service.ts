import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateClientDetailDto } from './dto/create-client-detail.dto';
import { UpdateClientDetailDto } from './dto/update-client-detail.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';

@Injectable()
export class ClientDetailService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClientDetailDto) {
    try {
      const ClientDetaisCreate = await this.prisma.client_details.create({
        data: {
          project_id: dto.project_id,
          role_id: dto.role_id,
          name: dto.name,
          number: dto.number,
          email: dto.email,
          designation: dto.designation,
        },
      });
      return handleSuccessResponse(
        'Client detail Created successfully',
        HttpStatus.CREATED,
        ClientDetaisCreate,
      );
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const ClientDetailsGet = await this.prisma.client_details.findMany();
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        ClientDetailsGet,
      );
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async findOne(projectId: string) {
    try {
      const clientDetails = await this.prisma.client_details.findMany({
        where: { project_id: projectId },
      });
      return handleSuccessResponse('', HttpStatus.OK, clientDetails);
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  update(id: number, updateClientDetailDto: UpdateClientDetailDto) {
    return `This action updates a #${id} clientDetail`;
  }

  async remove(id: string) {
    try {
      const ClientDetailsRemove = await this.prisma.client_details.delete({
        where: { id: id },
      });
      if (!ClientDetailsRemove) {
        return handleSuccessResponse(
          'Failed',
          HttpStatus.BAD_REQUEST,
          'Data Does not found',
        );
      }
    } catch (error) {
      return handlePrismaError(error);
    }
  }
}

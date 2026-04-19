import { HttpStatus, Injectable } from '@nestjs/common';
// import { MilestonePhaseDto } from './dto/create-milestone-phase.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';
import { CreatePmoDocumentDto } from './dto/create-pmo-document.dto';

@Injectable()
export class PmoDocumentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePmoDocumentDto) {
    try {
      const pmodocumnet = await this.prisma.pmo_document.create({
        data: dto,
      });

      return handleSuccessResponse(
        'pmo-document created successfully',
        HttpStatus.OK,
        pmodocumnet,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const pmo_documnets = await this.prisma.pmo_document.findMany();
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        pmo_documnets,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getForListing(query: any) {
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
              ...where,
              [filter.columnName]: {
                [filter.filter]: filter.value.contains,
                mode: 'insensitive',
              },
            };
          }
        });
      }

      const pmo_document = await this.prisma.pmo_document.findMany({
        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where,
      });

      const count = await this.prisma.pmo_document.count();

      const res = {
        rows: pmo_document,
        count: count,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

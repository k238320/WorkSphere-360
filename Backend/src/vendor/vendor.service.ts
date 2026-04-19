import { HttpStatus, Injectable } from '@nestjs/common';
import { VenderDto } from './interface/create-vender.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}
  async create(dto: any) {
    try {
      const vendor = await this.prisma.vendor.create({
        data: dto,
      });
      return handleSuccessResponse(
        'Vendor Created Successfull',
        HttpStatus.CREATED,
        vendor,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const vendor = await this.prisma.vendor.findMany();
      return handleSuccessResponse('Fetch successfully', HttpStatus.OK, vendor);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const vendor = await this.prisma.vendor.findFirst({
        where: { id: id },
      });
      return handleSuccessResponse('Fetch successfully', HttpStatus.OK, vendor);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: any) {
    try {
      const vendor = await this.prisma.vendor.update({
        data: dto,
        where: { id: id },
      });
      return handleSuccessResponse(
        'Vendor Updated Successfully',
        HttpStatus.OK,
        vendor,
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

      const vendor = await this.prisma.vendor.findMany({
        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where,
      });

      const count = await this.prisma.vendor.count();

      const res = {
        rows: vendor,
        count: count,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

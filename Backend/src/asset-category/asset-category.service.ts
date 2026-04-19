import { HttpStatus, Injectable } from '@nestjs/common';
import { AssetCategoryDto } from './interface/create-asset-category.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';

@Injectable()
export class AssetCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: AssetCategoryDto) {
    try {
      const assetCategory = await this.prisma.asset_category.create({
        data: dto,
      });
      return handleSuccessResponse(
        'Asset Category Created Successfull',
        HttpStatus.CREATED,
        assetCategory,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const assetCategory = await this.prisma.asset_category.findMany({
        where: { status: true },
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        assetCategory,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const assetCategory = await this.prisma.asset_category.findFirst({
        where: { id: id },
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        assetCategory,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: AssetCategoryDto) {
    try {
      const assetCategory = await this.prisma.asset_category.update({
        data: dto,
        where: { id: id },
      });
      return handleSuccessResponse(
        'Asset Category Updated Successfully',
        HttpStatus.OK,
        assetCategory,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const assetCategory = await this.prisma.asset_category.delete({
        where: { id: id },
      });

      return handleSuccessResponse(
        'Success',
        HttpStatus.OK,
        'Asset Category Deleted Succssfully',
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
                [filter.filter]: filter?.value?.contains,
                mode: 'insensitive',
              },
            };
          }
        });
      }

      const assetCategory = await this.prisma.asset_category.findMany({
        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where,
      });

      const count = await this.prisma.asset_category.count();

      const res = {
        rows: assetCategory,
        count: count,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

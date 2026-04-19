import { HttpStatus, Injectable } from '@nestjs/common';
import { AssetDto } from './interface/create-asset.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';
import { AssignAssetDto } from './interface/assign-asset.interface';
import { AssetCompliantDto } from './interface/asset-complaint.interface';
import { CreateNotificationDto } from 'src/notification/dto/create-notificatio.dto';
import { sendNotification } from 'src/utils/helper';

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) {}

  async create(dto: AssetDto) {
    try {
      const assetcount = await this.prisma.asset.findFirst({
        where: {
          asset_category_id: dto.asset_category_id,
        },
        orderBy: {
          asset_number: 'desc',
        },
      });

      if (!assetcount || assetcount == null || assetcount == undefined) {
        const apiData: any = {
          ...dto,
          asset_number: 1,
        };
        const asset = await this.prisma.asset.create({
          data: apiData,
        });
        return handleSuccessResponse(
          'Asset Created Successfull',
          HttpStatus.CREATED,
          asset,
        );
      } else {
        const asset_number = assetcount?.asset_number + 1;
        const apiData: any = {
          ...dto,
          asset_number: asset_number,
        };

        const asset = await this.prisma.asset.create({
          data: apiData,
        });
        return handleSuccessResponse(
          'Asset Created Successfull',
          HttpStatus.CREATED,
          asset,
        );
      }
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll() {
    try {
      const asset = await this.prisma.asset.findMany({
        select: {
          id: true,
          asset_number: true,
          location: true,
          asset_category_id: true,
          vendor_id: true,
          cost: true,
          brand: true,
          model_number: true,
          approved_by: true,
          purchased_date: true,
          warranty_expiration: true,
          invoice: true,
          invoice2: true,
          specification: true,
          asset_category: true,
          vendor: true,
          created_at: true,
          updated_at: true,
        },
      });
      return handleSuccessResponse('Fetch successfully', HttpStatus.OK, asset);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const asset = await this.prisma.asset.findFirst({
        where: { id: id },
        select: {
          id: true,
          asset_number: true,
          location: true,
          asset_category_id: true,
          vendor_id: true,
          cost: true,
          brand: true,
          model_number: true,
          approved_by: true,
          purchased_date: true,
          warranty_expiration: true,
          invoice: true,
          invoice2: true,
          specification: true,
          asset_category: true,
          vendor: true,
          created_at: true,
          updated_at: true,
        },
      });

      //   const apiData = {...asset, asset.asset_number}
      // let asset_number = '';

      const asset_number = `${asset?.location}-DG-${asset?.asset_category?.code}-${asset?.asset_number}`;
      const apiData = { ...asset, asset_id: asset_number };

      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        apiData,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: AssetDto) {
    try {
      const asset = await this.prisma.asset.update({
        data: dto,
        where: { id: id },
      });
      return handleSuccessResponse(
        'Asset Updated Successfully',
        HttpStatus.OK,
        asset,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const asset = await this.prisma.asset.delete({
        where: { id: id },
      });

      return handleSuccessResponse(
        'Success',
        HttpStatus.OK,
        'Asset Deleted Succssfully',
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getForListing(query: any) {
    try {
      let where = { ...query };
      delete where.from_date;
      delete where.to_date;

      if (query.from_date && query.to_date) {
        const fromDate = new Date(query.from_date);
        const toDate = new Date(query.to_date);

        if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
          where.AND = [
            where.AND || {},
            {
              purchased_date: {
                gte: fromDate,
                lte: toDate,
              },
            },
          ];
        } else {
          throw new Error('Invalid date format');
        }
      } else if (query.from_date && !query.to_date) {
        // If only from_date is provided, filter assets after from_date
        const fromDate = new Date(query.from_date);

        if (!isNaN(fromDate.getTime())) {
          where.AND = [
            where.AND || {},
            {
              purchased_date: {
                gte: fromDate,
              },
            },
          ];
        } else {
          throw new Error('Invalid from_date format');
        }
      } else if (query.to_date && !query.from_date) {
        // If only to_date is provided, filter assets before to_date
        const toDate = new Date(query.to_date);

        if (!isNaN(toDate.getTime())) {
          where.AND = [
            where.AND || {},
            {
              purchased_date: {
                lte: toDate,
              },
            },
          ];
        } else {
          throw new Error('Invalid to_date format');
        }
      }

      if (query.brand) {
        where.brand = {
          contains: query.brand.trim(),
          mode: 'insensitive',
        };
      }

      const asset: any = await this.prisma.asset.findMany({
        where,
        select: {
          id: true,
          asset_number: true,
          location: true,
          asset_category_id: true,
          vendor_id: true,
          cost: true,
          approved_by: true,
          purchased_date: true,
          warranty_expiration: true,
          brand: true,
          model_number: true,
          invoice: true,
          invoice2: true,
          specification: true,
          asset_category: true,
          vendor: true,
          assigned: true,
          assigned_confirmed: true,
          created_at: true,
          updated_at: true,
          assigned_asset: {
            select: {
              user: {
                select: {
                  name: true,
                  id: true,
                },
              },
            },
          },
        },
      });

      // const count = await this.prisma.asset.count();

      asset.forEach((x: any) => {
        x.asset_id = `${x?.location}-DG-${x?.asset_category?.code}-${x?.asset_number}`;
      });
      const res = {
        rows: asset,
        count: asset.length,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async assignAsset(dto: AssignAssetDto, request: any) {
    try {
      const asset = await this.prisma.assigned_asset.createMany({
        data: dto.asset_id.map((x: any) => ({
          user_id: dto.user_id,
          asset_id: x,
        })),
      });

      const assignAsset = await this.prisma.asset.updateMany({
        where: {
          id: {
            in: dto.asset_id.map((x) => x),
          },
        },
        data: {
          assigned: true,
        },
      });

      const notification: CreateNotificationDto = {
        title: 'Asset Assigned',
        message: `You have been assigned Assets by the company. Kindly confirm.`,
        reciever_ids: [dto.user_id],
        created_by: request?.user?.id,
        // created_by: '6583ebe97e129465b199a8d6',
        link: `/hr/${dto.user_id}?tab=3`,
      };
      try {
        const sendNotification1 = await sendNotification(notification);
      } catch (error) {
        return error?.message;
      }
      return handleSuccessResponse(
        'Asset Assigned Successfull',
        HttpStatus.CREATED,
        asset,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getassignAssetById(user_id: string) {
    try {
      const asset: any = await this.prisma.assigned_asset.findMany({
        where: {
          user_id: user_id,
        },
        select: {
          asset_id: true,
          user_id: true,
          user: {
            select: {
              id: true,
              name: true,
              resource_id: true,
              designation: true,
              resource: {
                select: {
                  department: true,
                },
              },
            },
          },
          asset: {
            include: {
              asset_category: true,
            },
          },
        },
      });
      asset.forEach((x: any) => {
        x.custom_asset_id = `${x?.asset?.location}-DG-${x?.asset?.asset_category?.code}-${x?.asset?.asset_number}`;
        x.asset.asset_category.custom_asset_id = `${x?.asset?.location}-DG-${x?.asset?.asset_category?.code}-${x?.asset?.asset_number}`;
      });
      return handleSuccessResponse(
        'Fetch Successfull',
        HttpStatus.CREATED,
        asset,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }
  async unassignedAssets(id: string) {
    try {
      const assets = await this.prisma.asset.findMany({
        where: {
          assigned: false,
          asset_category_id: id,
        },
        include: {
          asset_category: true,
        },
      });
      assets.forEach((x: any) => {
        x.custom_asset_id = `${x?.location}-DG-${x?.asset_category?.code}-${x?.asset_number}`;
      });

      return handleSuccessResponse(
        'Fetched Successfully',
        HttpStatus.CREATED,
        assets,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }
  async removeAssignAsset(dto: any) {
    try {
      const [asset] = await this.prisma.$transaction([
        this.prisma.asset.update({
          where: {
            id: dto.id,
          },
          data: {
            assigned: false,
            assigned_confirmed: false,
          },
        }),
        this.prisma.assigned_asset.delete({
          where: {
            asset_id: dto.id,
          },
        }),
      ]);
      return handleSuccessResponse(
        'Unassigned Successfully',
        HttpStatus.CREATED,
        asset,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async confirmAsset(dto: any) {
    try {
      const assignAsset = await this.prisma.asset.updateMany({
        where: {
          id: {
            in: dto.asset_id.map((x) => x),
          },
        },
        data: {
          assigned_confirmed: true,
        },
      });
      return handleSuccessResponse(
        'Asset Confirmation Successfull',
        HttpStatus.CREATED,
        assignAsset,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async createAssetComplaint(dto: AssetCompliantDto, request: any) {
    try {
      let reciever_ids: string[] = [];
      const assetComplaint = await this.prisma.asset_complaint.create({
        data: dto,
      });

      try {
        const role = await this.prisma.roles.findFirst({
          where: {
            name: 'IT',
          },
        });
        if (role && role != undefined) {
          const notificationUserIDs = await this.prisma.user.findMany({
            where: {
              role_id: role.id,
            },
          });

          if (notificationUserIDs && notificationUserIDs.length > 0) {
            notificationUserIDs.forEach((x) => {
              reciever_ids.push(x.id);
            });
          }
        }
      } catch (error) {
        handlePrismaError(error);
      }

      const notification: CreateNotificationDto = {
        title: 'Complaint',
        message: `${request?.user?.name} has filed a Complaint. Please look into it.`,
        reciever_ids: reciever_ids,
        created_by: request?.user?.id,
        // created_by: '6583ebe97e129465b199a8d6',
        link: `/asset/list-of-complain`,
      };
      try {
        const sendNotification1 = await sendNotification(notification);
      } catch (error) {
        return error?.message;
      }
      return handleSuccessResponse(
        'Asset Complaint Recieved',
        HttpStatus.CREATED,
        assetComplaint,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getAssetComplaintById(id: string) {
    try {
      const assetComplaints = await this.prisma.asset_complaint.findMany({
        where: {
          user_id: id,
        },
        include: {
          asset: {
            include: {
              asset_category: true,
            },
          },
        },
      });
      assetComplaints.forEach((x: any) => {
        x.custom_asset_id = `${x?.asset.location}-DG-${x?.asset.asset_category?.code}-${x?.asset.asset_number}`;
      });

      return handleSuccessResponse(
        'Fetched Successfully',
        HttpStatus.CREATED,
        assetComplaints,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getAssetComplaint(query: any) {
    try {
      // const pageNumber = parseInt(query?.pageNumber);
      // const pageSize = parseInt(query?.pageSize);

      const regex =
        /^\s*(id|created_at|updated_at|description|user|asset_category)\s+(asc|desc)\s*$/i;
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
            if (filter.columnName == 'name') {
              where = {
                ...where,
                user: {
                  [filter.columnName]: {
                    [filter.filter]: filter?.value?.contains,
                  },
                },
              };
            }
            if (filter.columnName == 'asset_category') {
              where = {
                ...where,
                asset: {
                  asset_category: {
                    ['name']: {
                      [filter.filter]: filter?.value?.contains,
                    },
                  },
                },
              };
            }
            if (filter.columnName == 'description') {
              where = {
                ...where,
                [filter.columnName]: {
                  [filter.filter]: filter?.value?.contains,
                },
              };
            }
          }
        });
      }
      const assetComplaints = await this.prisma.asset_complaint.findMany({
        include: {
          asset: {
            include: {
              asset_category: true,
            },
          },
          user: true,
        },

        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where,
      });

      assetComplaints.forEach((x: any) => {
        x.custom_asset_id = `${x?.asset?.location}-DG-${x?.asset?.asset_category?.code}-${x?.asset?.asset_number}`;
        // x.asset.asset_category.custom_asset_id = `${x?.asset?.location}-DG-${x?.asset?.asset_category?.code}-${x?.asset?.asset_number}`;
      });

      const count = await this.prisma.asset_complaint.count();

      const res = {
        rows: assetComplaints,
        count: count,
      };
      return handleSuccessResponse(
        'Fetched Successfully',
        HttpStatus.CREATED,
        res,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async adminComplaintResolve(id: string, body: any, request: any) {
    try {
      const resolveComplaint = await this.prisma.asset_complaint.update({
        where: {
          id: id,
        },
        data: {
          admin_resolved: body.admin_resolved,
        },
      });

      const notification: CreateNotificationDto = {
        title: 'Complaint Resolved',
        message: `Your Complaint has been marked resolved by the IT Manager. Kindly confirm it ASAP.`,
        reciever_ids: [resolveComplaint.user_id],
        created_by: request?.user?.id,
        // created_by: '6583ebe97e129465b199a8d6',
        link: `/hr/${resolveComplaint.user_id}?tab=3`,
      };
      try {
        const sendNotification1 = await sendNotification(notification);
      } catch (error) {
        return error?.message;
      }
      return handleSuccessResponse(
        'Resolved Successfully',
        HttpStatus.CREATED,
        resolveComplaint,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async employeeComplaintResolve(id: string, body: any) {
    try {
      const date = new Date();
      const resolveComplaint = await this.prisma.asset_complaint.update({
        where: {
          id: id,
        },
        data: {
          employee_resolved: body.employee_resolved,
          resolved_date: date,
        },
      });
      return handleSuccessResponse(
        'Resolved Successfully',
        HttpStatus.CREATED,
        resolveComplaint,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

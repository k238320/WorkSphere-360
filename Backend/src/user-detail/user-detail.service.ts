import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { AddUpdateService } from './HelperServices/add-update.service';
import { EmploymentCodeService } from './HelperServices/employment-code.service';
import * as ExcelJS from 'exceljs';
import * as path from 'path';

@Injectable()
export class UserDetailService {
  constructor(
    private prisma: PrismaService,
    private employementCodeService: EmploymentCodeService,
    private addUpdateService: AddUpdateService,
  ) {}

  async create(dto: any, request: any) {
    try {
      const user = await this.prisma.user_details.findFirst({
        where: { user_id: dto.user_id },
        include: { user: true },
      });

      if (dto.location_type_id === 2 && user?.id) {
        await this.employementCodeService.updateEmploymentCode(dto, user);
      }

      const emp_code = dto.employmentcode;
      delete dto.employmentcode;
      const userRole = request?.user?.role?.name;
      const isSuperAdminOrHR =
        userRole === 'Super Admin' ||
        userRole === 'Human Resource' ||
        userRole === 'Human Resource Operations';

      if (!user) {
        return await this.addUpdateService.createNewUserDetails(
          dto,
          emp_code,
          isSuperAdminOrHR,
        );
      } else {
        return await this.addUpdateService.updateExistingUserDetails(
          dto,
          isSuperAdminOrHR,
        );
      }
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(user_id: any, dto: any) {
    try {
      const userDetail = await this.prisma.user_details.update({
        where: {
          user_id: user_id,
        },
        data: dto,
      });

      return handleSuccessResponse(
        'user details updated successfully',
        HttpStatus.OK,
        userDetail,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateDocs(user_id: any, dto: any) {
    try {
      const userDocuments = await this.prisma.user_docs.update({
        where: {
          user_id: user_id,
        },
        data: dto,
      });

      return handleSuccessResponse(
        'user documents updated successfully',
        HttpStatus.OK,
        userDocuments,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async listing(query: any) {
    try {
      let where = {};
      if (query?.department_id && query?.name) {
        where = {
          resource: {
            department_id: query?.department_id,
          },
          name: {
            contains: query?.name?.trim(),
            mode: 'insensitive',
          },
        };
      } else if (query?.department_id) {
        where = {
          resource: {
            department_id: query?.department_id,
          },
        };
      } else if (query?.name) {
        where = {
          name: {
            contains: query?.name.trim(),
            mode: 'insensitive',
          },
        };
      }

      const user = await this.prisma.user.findMany({
        select: {
          name: true,
          id: true,
          designation: true,
          employement_code: true,
          email: true,
          resource: {
            select: {
              department: {
                select: {
                  name: true,
                },
              },
            },
          },
          user_details: {
            select: {
              date_of_joining: true,
              date_of_birth: true,
              resignation_status: true,
            },
          },
          user_docs: {
            select: {
              power_picture: true,
            },
          },
        },
        where: {
          ...where,
        },
        orderBy: {
          name: 'asc',
        },
      });

      // const count = await this.prisma.user.count();

      const res = {
        rows: user,
        count: user.length,
      };

      return handleSuccessResponse('', 200, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async addDocumnets(dto: any) {
    try {
      const user = await this.prisma.user_docs.findFirst({
        where: { user_id: dto.user_id },
      });
      if (!user) {
        try {
          const docs = await this.prisma.user_docs.create({
            data: dto,
          });
          return handleSuccessResponse(
            'Documents added successfully',
            HttpStatus.OK,
            docs,
          );
        } catch (error) {
          handlePrismaError(error);
        }
      } else {
        try {
          const userDocuments = await this.prisma.user_docs.update({
            where: {
              user_id: dto.user_id,
            },
            data: dto,
          });

          return handleSuccessResponse(
            'user documents updated successfully',
            HttpStatus.OK,
            userDocuments,
          );
        } catch (error) {
          handlePrismaError(error);
        }
      }
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const user: any = await this.prisma.user.findFirst({
        where: { id: id },
        select: {
          resource_id: true,
          designation: true,
          email: true,
          name: true,
          employement_code: true,
        },
      });
      if (!user?.resource_id) {
        return handleSuccessResponse('This user is not an employee', 400, '');
      }
      const department = await this.prisma.resource.findFirst({
        where: { id: user?.resource_id },
        select: {
          department: {
            select: {
              name: true,
            },
          },
        },
      });
      const userDetail: any = await this.prisma.user_details.findFirst({
        where: { user_id: id },
        // include: {
        //   user: {
        //     select: {
        //       designation: true,
        //       email: true,
        //       name: true,
        //       employement_code: true,
        //     },
        //   },
        // },
      });

      user.department = department?.department?.name || null;
      const docs = await this.prisma.user_docs.findFirst({
        where: { user_id: id },
      });

      const res = {
        userDeatils: userDetail,
        userDocuments: docs,
        user: user,
      };
      return handleSuccessResponse('', 200, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async generateMissingDetailsReport(): Promise<string> {
    const users = await this.prisma.user.findMany({
      include: {
        user_details: true,
        user_docs: true,
        resource: {
          include: {
            department: true,
          },
        },
      },
      where: {
        status: true,
        super: false,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Missing Details');

    worksheet.columns = [
      { header: 'Employee Code', key: 'empCode', width: 20 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Missing from Details', key: 'details', width: 50 },
      { header: 'Missing from Docs', key: 'docs', width: 50 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.autoFilter = { from: 'A1', to: 'E1' };

    for (const user of users) {
      const details = user.user_details?.[0] ?? {};
      const docs = user.user_docs?.[0] ?? {};

      const detailFields = [
        'employment_status',
        'gender',
        'date_of_birth',
        'date_of_joining',
        'CNIC',
        'phone_number',
        'personal_email_address',
        'emergency_relation_name',
        'emergency_contact',
        'address',
        'account_title',
        'bank_name',
        'account_number',
        'ibn_number',
        'resign_comment',
        'location_type_id',
        'marital_status',
        'maternity_provision',
        'family_details',
        'job_status',
      ];

      const docFields = [
        'experience_letter',
        'resignation_letter',
        'educational_documents',
        'pay_slip',
        'cnic',
        'updated_resume',
        'power_picture',
      ];

      let missingDetails = detailFields.filter((f) => details?.[f] == null);

      const missingDocs = docFields.filter(
        (f) =>
          docs?.[f] == null || (Array.isArray(docs[f]) && docs[f].length === 0),
      );

      if (missingDetails.length > 0 || missingDocs.length > 0) {
        worksheet.addRow({
          empCode: user.employement_code || user.employement_code_dxb || '-',
          name: user.name,
          department: user.resource?.department?.name || 'N/A',
          details: missingDetails.join(', '),
          docs: missingDocs.join(', '),
        });
      }
    }

    worksheet.eachRow((row, rowNumber) => {
      row.alignment = { vertical: 'middle', wrapText: true };
      if (rowNumber > 1 && rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF7F7F7' },
        };
      }
    });

    const filePath = path.join(process.cwd(), 'missing_details.xlsx');
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }
}

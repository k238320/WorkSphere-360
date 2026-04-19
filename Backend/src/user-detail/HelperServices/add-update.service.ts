import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { replacePlaceholders } from 'src/utils/helper';
import { EmploymentCodeService } from './employment-code.service';

@Injectable()
export class AddUpdateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly employmentCodeService: EmploymentCodeService,
  ) {}

  async createNewUserDetails(
    dto: any,
    emp_code: string,
    isSuperAdminOrHR: boolean,
  ) {
    try {
      const userDetail = await this.prisma.user_details.create({ data: dto });

      if (dto?.location_type_id === 2 && userDetail?.id) {
        await this.employmentCodeService.updateEmploymentCode(
          { ...dto, employmentcode: emp_code },
          userDetail,
        );
      }

      if (
        userDetail?.job_status === 2 &&
        dto?.location_type_id === 1 &&
        userDetail.user_id &&
        isSuperAdminOrHR
      ) {
        await this.hanleKarachiLeaveAllocation(userDetail.user_id);
      }

      return handleSuccessResponse(
        'user details added successfully',
        HttpStatus.OK,
        userDetail,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateExistingUserDetails(dto: any, isSuperAdminOrHR: boolean) {
    try {
      if (dto.marital_status === 'single') {
        dto.family_details = [];
      }

      const userDetail = await this.prisma.user_details.update({
        where: { user_id: dto.user_id },
        data: dto,
        include: { user: true },
      });

      if (userDetail?.job_status === 3) {
        await this.handleResignation(dto, userDetail);
      }

      if (userDetail?.job_status !== 3 && !userDetail?.user?.status) {
        await this.prisma.user.update({
          data: {
            status: true,
          },
          where: {
            id: userDetail?.user?.id,
          },
        });
      }

      if (
        userDetail?.job_status === 2 &&
        dto?.location_type_id === 1 &&
        userDetail.user_id &&
        isSuperAdminOrHR
      ) {
        await this.hanleKarachiLeaveAllocation(userDetail.user);
      }

      return handleSuccessResponse(
        'user details updated successfully',
        HttpStatus.OK,
        userDetail,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  private async handleResignation(dto: any, userDetail: any) {
    const userTable = await this.prisma.user.findFirst({
      where: { id: dto.user_id },
      include: { resource: { include: { department: true } } },
    });

    const assignedAssets = await this.prisma.assigned_asset.findMany({
      where: { user_id: dto.user_id },
    });

    if (assignedAssets.length > 0) {
      const assetIds = assignedAssets.map((x) => x.asset_id).filter(Boolean);
      const assignedAssetIds = assignedAssets.map((x) => x.id).filter(Boolean);

      await this.prisma.asset.updateMany({
        where: { id: { in: assetIds } },
        data: { assigned: false, assigned_confirmed: false },
      });

      await this.prisma.assigned_asset.deleteMany({
        where: { id: { in: assignedAssetIds } },
      });
    }

    if (userTable) {
      await this.prisma.resource.update({
        where: { id: userTable.resource_id },
        data: { status: false },
      });

      const resignUser = await this.prisma.user.update({
        where: { id: dto.user_id },
        data: { status: false },
      });

      const replacements = {
        replaceHeader: 'System generated mail',
        replaceUserName: 'Umair Khan',
        message: `I hope this email finds you well. I regret to inform you that ${
          resignUser?.name
        }, a valuable member of our team responsible for ${
          resignUser?.designation
        }/${
          userTable?.resource?.department?.name
        }, has submitted their resignation.<br><br>In light of this transition, I kindly request your assistance in the following matters:<br>${
          userDetail?.resign_comment || `HR didn't add any details.`
        }<br><br>I understand that this is an unexpected change, and I appreciate your cooperation in helping us navigate this transition period. Your support is crucial in maintaining the continuity of our operations.`,
      };

      const template = replacePlaceholders(replacements);
      const emailArray = ['superadmin@yopmail.com'];

      // Uncomment to send email
      // await sendEmail(emailArray, `Employee Resignation`, template);
    }
  }

  private async hanleKarachiLeaveAllocation(user) {
    const currentYear = new Date().getFullYear();

    // const user = await this.prisma.user.findFirst({ where: { id: user_id } });

    if (user && user?.id) {
      const existingLeaves = await this.prisma.yearlyLeaveRecord.findFirst({
        where: {
          user_id: user.id,
          year: currentYear,
        },
      });

      if (!existingLeaves?.id) {
        const yearlyLeave = await this.prisma.yearlyLeaveRecord.create({
          data: {
            user_id: user.id,
            year: currentYear,
            total_leaves: 22,
            availed_leaves: 0,
            remaining_leaves: 22,
          },
        });
      }
    }
  }
}

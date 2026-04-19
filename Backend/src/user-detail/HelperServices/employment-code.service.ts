import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EmploymentCodeService {
  constructor(private readonly prisma: PrismaService) {}

  async updateEmploymentCode(dto: any, user: any) {
    const employee = await this.prisma.user.findFirst({
      where: { id: user.user.id },
    });

    if (employee && !employee.employement_code_dxb) {
      const employement_code_dxb = `${20 + dto.employmentcode}`;
      await this.prisma.user.update({
        where: { id: employee.id },
        data: {
          employement_code_dxb: dto.employmentcode,
          employement_code: employement_code_dxb,
        },
      });
    }
  }
}
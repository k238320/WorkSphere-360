import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResignationService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a resignation
  async createResignation(data: { user_id: string; reason: string; resignationDate: Date }) {
    const userExists = await this.prisma.user_details.findFirst({
      where: { user_id: data.user_id },
    });
  
    if (!userExists) {
      throw new Error('User does not exist');
    }

    const resignation = await this.prisma.resignation.create({
      data :{
        user_id: data.user_id,
        reason: data.reason,
        resignationDate: data.resignationDate,
      }
    })

    return resignation;
  }

  // Get all resignations (Admin view)
  async getAllResignations() {
    return this.prisma.resignation.findMany({
      include: {
        user: true, 
      },
    });
  }

  async getResignationById(id: string) {
    return this.prisma.resignation.findUnique({
      where: { id },
      include: {
        user: true, 
      },
    });
  }
  async updateResignationStatus(id: string, status: any) {
    const updatedResignation = await this.prisma.resignation.update({
      where: { id },
      data: { status },
      include: {
        user: true,
      },
    });

    // If the resignation is approved, keep the status as true; otherwise, revert it
    // await this.prisma.user_details.update({
    //   where: { user_id: updatedResignation.user_id },
    //   data: { resignation_status: status === "Approved" },
    // });

    return updatedResignation;
  }
}

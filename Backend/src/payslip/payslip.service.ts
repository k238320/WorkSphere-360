import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { CreatePayslipDto } from './dto/create-payslip.dto';
import { UpdatePayslipDto } from './dto/update-payslip.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';

@Injectable()
export class PayslipService {
  constructor(private prisma: PrismaService) {}

  // Create Payslip
  async create(createPayslipDto: any) {
    try {
      const { user_id, month, year } = createPayslipDto;

      const existingPayslip = await this.prisma.payslip.findFirst({
        where: {
          user_id,
          month,
          year,
        },
      });

      if (existingPayslip) {
        throw new HttpException(
          'Payslip already exists for this month and year',
          HttpStatus.BAD_REQUEST,
        );
      }

      const payslip = await this.prisma.payslip.create({
        data: createPayslipDto,
      });

      return handleSuccessResponse(
        'Created successfully',
        HttpStatus.OK,
        payslip,
      );
    } catch (error) {
      console.error('Error creating payslip:', error);
      handlePrismaError(error);
    }
  }

  // Find All Payslips
  async findAll(filters: {
    userId?: string;
    fromMonth?: number;
    toMonth?: number;
    year?: string;
  }) {
    const { userId, fromMonth, toMonth, year } = filters;

    try {
      const payslips = await this.prisma.payslip.findMany({
        where: {
          AND: [
            userId ? { user_id: userId } : {}, // Use empty objects instead of `undefined`
            fromMonth ? { month: { gte: fromMonth } } : {},
            toMonth ? { month: { lte: toMonth } } : {},
            year ? { year } : {},
          ],
        },
        orderBy: { created_at: 'desc' },
        include: { user: true },
      });

      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        payslips,
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch payslips');
    }
  }

  // Find One Payslip by ID
  async findOne(id: string) {
    try {
      const payslip = await this.prisma.payslip.findUnique({
        where: { id },
      });
      if (!payslip) {
        throw new NotFoundException(`Payslip with ID ${id} not found`);
      }
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        payslip,
      );
    } catch (error) {
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch payslip');
    }
  }

  // Update Payslip
  async update(id: string, updatePayslipDto: any) {
    try {
      const updatedPayslip = await this.prisma.payslip.update({
        where: { id },
        data: updatePayslipDto,
      });
      return handleSuccessResponse(
        'Updated successfully',
        HttpStatus.OK,
        updatedPayslip,
      );
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Payslip with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to update payslip');
    }
  }

  // Remove Payslip
  async remove(id: string) {
    try {
      await this.prisma.payslip.delete({
        where: { id },
      });
      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        ' message: `Payslip with ID ${id} successfully removed',
      );
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Payslip with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to delete payslip');
    }
  }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AttendanceService } from 'src/attendance/attendance.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse } from 'src/utils';

@Injectable()
export class PortalWfhService {
  constructor(
    private prisma: PrismaService,
    private attendance: AttendanceService,
  ) {}

  // Check-in functionality
  async checkIn(empCode: string, location_type_id: number): Promise<any> {
    try {
      const currentTime = new Date();

      // Insert the check-in record
      const checkInRecord = await this.prisma.emp_attendance.create({
        data: {
          emp_code: empCode,
          punch_time: currentTime,
          punch_state: 0,
          is_leave: false,
          created_at: currentTime,
          updated_at: currentTime,
          location_type_id: location_type_id,
        },
      });

      return handleSuccessResponse('Check-in successful', 200, checkInRecord);
    } catch (error) {
      console.error('Error during check-in:', error);
      throw new InternalServerErrorException('Failed to perform check-in');
    }
  }

  // Check-out functionality
  async checkOut(empCode: string, location_type_id: number): Promise<any> {
    try {
      const currentTime = new Date();

      // Insert the check-out record
      const checkOutRecord = await this.prisma.emp_attendance.create({
        data: {
          emp_code: empCode,
          punch_time: currentTime,
          punch_state: 1,
          is_leave: false,
          created_at: currentTime,
          updated_at: currentTime,
          location_type_id: location_type_id,
        },
      });

      return handleSuccessResponse('Check-out successful', 200, checkOutRecord);
    } catch (error) {
      console.error('Error during check-out:', error);
      throw new InternalServerErrorException('Failed to perform check-out');
    }
  }

  // Fetch the latest attendance record
  async getLastAttendance(query: any, request: any): Promise<any> {
    try {
      if (!query.emp_code) {
        throw new Error('Kindly provide employee code');
      }

      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      // Set endDate to the last millisecond of the day (23:59:59.999)
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      // Fetch attendance records for the current day
      const lastAttendance = await this.prisma.emp_attendance.findMany({
        where: {
          emp_code: query.emp_code,
          punch_time: {
            gte: startDate, // greater than or equal to the start of the day
            lte: endDate, // less than or equal to the end of the day
          },
        },
        orderBy: { punch_time: 'desc' },
      });

      const checkInRecords  = lastAttendance?.filter(
        (record) => record.punch_state === 0,
      );
      const checkOutRecords = lastAttendance?.filter(
        (record) => record.punch_state === 1,
      );

      const lastCheckIn =
        checkInRecords?.length > 0
          ? checkInRecords[checkInRecords?.length - 1]?.punch_time
          : null;
      const lastCheckOut =
        checkOutRecords?.length > 0 ? checkOutRecords[0]?.punch_time : null;

      return handleSuccessResponse(
        'Attendance data fetched successfully',
        200,
        {
          lastCheckInTime: lastCheckIn,
          lastCheckOutTime: lastCheckOut,
        },
      );
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      throw new InternalServerErrorException('Failed to fetch attendance data');
    }
  }
}

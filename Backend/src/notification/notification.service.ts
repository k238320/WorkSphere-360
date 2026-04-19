import { HttpStatus, Injectable } from '@nestjs/common';
// import { MilestonePhaseDto } from './dto/create-milestone-phase.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';
import { CreateNotificationDto } from './dto/create-notificatio.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  //   async create(title: string, message: string, receiverIds: string[]) {
  async create(dto: CreateNotificationDto, request: any) {
    try {
      const newNotification = await this.prisma.notification.createMany({
        data: dto.reciever_ids.map((receiver_id) => ({
          title: dto.title,
          message: dto.message,
          receiver_ids: receiver_id,
          created_by: request.user.id,
        })),
      });

      return handleSuccessResponse(
        'Notification created successfully',
        HttpStatus.CREATED,
        newNotification,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateRead(notification_id: string) {
    try {
      const newNotification = await this.prisma.notification.update({
        where: {
          id: notification_id,
        },

        data: {
          read: true,
        },
      });

      return handleSuccessResponse(
        'Mark as read successfully',
        HttpStatus.OK,
        newNotification,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll(request: any) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: {
          receiver_ids: request?.user?.id,

          NOT: {
            created_by: request?.user?.id,
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return handleSuccessResponse(
        'Fetch successfully',
        HttpStatus.OK,
        notifications,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

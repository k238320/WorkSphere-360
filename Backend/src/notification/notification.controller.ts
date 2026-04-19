import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateNotificationDto } from './dto/create-notificatio.dto';

@UseGuards(AuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(@Req() request: any) {
    return this.notificationService.findAll(request);
  }

  @Post()
  create(
    @Body() CreateNotification: CreateNotificationDto,
    @Req() request: any,
  ) {
    return this.notificationService.create(CreateNotification, request);
  }

  @Put(':id')
  update(@Param('id') id: string) {
    return this.notificationService.updateRead(id);
  }

  // @Get('listing')
  // getForListing(@Query() query: any) {
  //   return this.pmoDocumentService.getForListing(query);
  // }
}

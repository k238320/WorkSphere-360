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
} from '@nestjs/common';
//   import { HolidayService } from './holiday.serviece';
import { AuthGuard } from 'src/auth/auth.guard';
import { EventService } from './event.service';
//   import { CreateHolidayDto } from './dto/create-holiday.interface';

// @UseGuards(AuthGuard)
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Post()
  create(@Body() dto: any) {
    return this.eventService.create(dto);
  }

  @Get('listing')
  getForListing(@Query() query: any) {
    return this.eventService.getForListing(query);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.eventService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }
}

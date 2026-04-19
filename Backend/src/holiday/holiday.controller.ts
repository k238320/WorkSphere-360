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
import { HolidayService } from './holiday.serviece';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateHolidayDto } from './dto/create-holiday.interface';

@UseGuards(AuthGuard)
@Controller('holiday')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Get()
  findAll() {
    return this.holidayService.findAll();
  }

  @Post()
  create(@Body() HolidayDto: CreateHolidayDto) {
    return this.holidayService.create(HolidayDto);
  }

  @Get('listing')
  getForListing(@Query() query: any) {
    return this.holidayService.getForListing(query);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.holidayService.remove(id);
  }
}

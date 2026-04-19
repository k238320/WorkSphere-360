import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  Put,
} from '@nestjs/common';
import { ExtraHourService } from './extra-hour.service';
import { ExtraHourDto } from './interface/create-extraHour.interface';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('extra-hour')
export class ExtraHourController {
  constructor(private readonly extraHourService: ExtraHourService) {}

  @Post()
  create(@Body() extraHourDto: ExtraHourDto, @Req() request: any) {
    return this.extraHourService.create(extraHourDto, request);
  }

  @Get()
  findAll(@Query() query: any, @Req() request: any) {
    return this.extraHourService.findAll(query, request);
  }

  @Put('status')
  // update(@Query() query: any,) {
  update(@Body() body: any) {
    return this.extraHourService.update(body);
  }

  @Post('allApprove')
  allApprove() {
    return this.extraHourService.allApprove();
  }
}

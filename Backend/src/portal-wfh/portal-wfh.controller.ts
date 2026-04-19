import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { PortalWfhService } from './portal-wfh.service';
import { CreatePortalWfhDto } from './dto/create-portal-wfh.dto';
import { UpdatePortalWfhDto } from './dto/update-portal-wfh.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('portal-wfh')
export class PortalWfhController {
  constructor(private readonly portalWfhService: PortalWfhService) {}

  // Check-in Endpoint
  @Post('checkin')
  async checkIn(
    @Body('empCode') empCode: string,
    @Body('location_type_id') locationTypeId: number,
  ) {
    return await this.portalWfhService.checkIn(empCode, locationTypeId);
  }

  // Check-out Endpoint
  @Post('checkout')
  async checkOut(
    @Body('empCode') empCode: string,
    @Body('location_type_id') locationTypeId: number,
  ) {
    return await this.portalWfhService.checkOut(empCode, locationTypeId);
  }

  @Get('checkin-checkout')
  findOne(@Query() query: any, @Req() request: any) {
    return this.portalWfhService.getLastAttendance(query, request);
  }
}

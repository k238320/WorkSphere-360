import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WFHService } from './wfh.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { handleSuccessResponse } from 'src/utils';

@Controller('wfh')
export class WFHController {
  constructor(private readonly wfhService: WFHService) {}

  @UseGuards(AuthGuard)
  @Post('checkin-out')
  async checkInOut(
    @Req() request: any,
    @Body('punch_state') punch_state: string,
    @Body('hours') hours: string,
  ) {
    try {
      const res = await this.wfhService.employePunchingIn(
        request,
        punch_state,
        hours,
        false,
      );
      return handleSuccessResponse(res, 200, '');
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Error fetching images',
      };
    }
  }
  @UseGuards(AuthGuard)
  @Get('weekdata')
  async weekData(@Req() request: any, @Query('start_date') start_date: string) {
    try {
      const res = await this.wfhService.employeWeekData(request, start_date);
      return handleSuccessResponse('', 200, res);
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Error fetching images',
      };
    }
  }
  @UseGuards(AuthGuard)
  @Get('dayData')
  async dayData(@Req() request: any, @Query('start_date') start_date: string) {
    return await this.wfhService.employeDayData(request, start_date);
  }

  @UseGuards(AuthGuard)
  @Get('alterEmail')
  async alterEmail(@Req() request: any) {
    return await this.wfhService.alterEmail(request);
  }
}

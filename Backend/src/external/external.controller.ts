import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ExternalService } from './external.service';
import { ExternalAuthGuard } from './external-auth.guard';

@Controller('external')
export class ExternalController {
  constructor(private readonly externalService: ExternalService) {}

  @UseGuards(ExternalAuthGuard)
  @Get('getTeams')
  async getTeams(
    @Query('teamName') teamName?: string,
    @Query('email') email?: string,
  ) {
    return this.externalService.getTeams(teamName, email);
  }

  @UseGuards(ExternalAuthGuard)
  @Get('getHolidays')
  async getDashboard(
    @Query('teamName') teamName?: string,
    @Query('email') email?: string,
    @Query('includeDates') includeDates?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const include = includeDates === 'true';
    return this.externalService.getDashboard(
      teamName,
      email,
      include,
      startDate,
      endDate,
    );
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  HttpStatus,
  Query,
  Request,
} from '@nestjs/common';
import { ProductionCapacityService } from './production-capacity.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateProjectHoursDto } from './dto/update-project-hour.dto';
import { handleSuccessResponse } from 'src/utils';

@UseGuards(AuthGuard)
@Controller('production-capacity')
export class ProductionCapacityController {
  constructor(
    private readonly productionCapacityService: ProductionCapacityService,
  ) {}

  @Get()
  findAll(@Req() request: any) {
    return this.productionCapacityService.findAll(request);
  }

  @Patch('/update-hours')
  async updateHours(@Body() updateDto: UpdateProjectHoursDto) {
    // This endpoint will handle updating or creating production capacity hours
    await this.productionCapacityService.updateProjectHours(updateDto);
    return handleSuccessResponse(
      'Capacity updated successfully',
      HttpStatus.OK,
      {},
    );
  }

  @Get('/monthly')
  async getMonthlyCapacity(
    @Query('month') month: string,
    @Request() request: any,
  ) {
    return this.productionCapacityService.findMonthlyCapacity(month, request);
  }

  @Get('/range')
  async getCapacityByRange(
    @Query('start') startMonth: string,
    @Query('end') endMonth: string,
    @Request() request: any,
  ) {
    return this.productionCapacityService.findCapacityByRange(
      startMonth,
      endMonth,
      request,
    );
  }

  @Get('/profit-by-resource')
  async getProfitByResource(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('departmentId') departmentId: string,
    @Query('resourceId') resourceId: string,
    @Req() request: any,
  ) {
    const dto = {
      startDate,
      endDate,
      departmentId: departmentId || null,
      resourceId: resourceId,
      user: request.user,
    };

    const result = await this.productionCapacityService.ProfitByResource(dto);

    return handleSuccessResponse(
      'Resource productivity & profitability report fetched successfully',
      HttpStatus.OK,
      result,
    );
  }
}

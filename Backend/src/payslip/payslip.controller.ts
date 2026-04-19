import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PayslipService } from './payslip.service';

@Controller('payslip')
export class PayslipController {
  constructor(private readonly payslipService: PayslipService) {}

  @Post()
  create(@Body() createPayslipDto: any) {
    return this.payslipService.create(createPayslipDto);
  }

  @Get()
  async findAll(
    @Query('userId') userId: string,
    @Query('fromMonth') fromMonth: string,
    @Query('toMonth') toMonth: string,
    @Query('year') year: string,
  ) {
    const filters = {
      userId: userId || undefined,
      fromMonth: fromMonth ? parseInt(fromMonth) : undefined,
      toMonth: toMonth ? parseInt(toMonth) : undefined,
      year: year ? year : undefined,
    };
    return this.payslipService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payslipService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePayslipDto: any) {
    return this.payslipService.update(id, updatePayslipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payslipService.remove(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CostService } from './cost.service';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('cost')
export class CostController {
  constructor(private readonly costService: CostService) {}

  @Post()
  create(@Body() createCostDto: any) {
    return this.costService.create(createCostDto);
  }

  @Get()
  findAll() {
    return this.costService.findAll();
  }

  @Get(':departmentId')
  findOne(@Param('departmentId') departmentId: string) {
    return this.costService.findOne(departmentId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCostDto: UpdateCostDto) {
    return this.costService.update(+id, updateCostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.costService.remove(+id);
  }
}

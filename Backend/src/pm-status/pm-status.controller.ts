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
import { PmStatusService } from './pm-status.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('pm-status')
export class PmStatusController {
  constructor(private readonly pmStatusService: PmStatusService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.pmStatusService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pmStatusService.findOne(id);
  }

  @Post()
  create(@Body() dto: any) {
    console.log(dto);

    return this.pmStatusService.create(dto);
  }
  @Put(':id')
  update(@Body() dto: any, @Param('id') id: string) {
    return this.pmStatusService.update(id, dto);
  }
}

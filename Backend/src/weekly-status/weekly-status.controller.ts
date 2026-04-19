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
import { WeeklyStatusService } from './weekly-status.service';
import { CreateWeeklyStatusDto } from './dto/create-weekly-status.dto';
import { UpdateWeeklyStatusDto } from './dto/update-weekly-status.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('weekly-status')
export class WeeklyStatusController {
  constructor(private readonly weeklyStatusService: WeeklyStatusService) {}

  @Post()
  create(@Body() createWeeklyStatusDto: CreateWeeklyStatusDto) {
    return this.weeklyStatusService.create(createWeeklyStatusDto);
  }

  @Get()
  findAll() {
    return this.weeklyStatusService.findAll();
  }

  @Get(':projectId')
  findOne(@Param('projectId') projectId: string) {
    return this.weeklyStatusService.findOne(projectId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWeeklyStatusDto: UpdateWeeklyStatusDto,
  ) {
    return this.weeklyStatusService.update(+id, updateWeeklyStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weeklyStatusService.remove(id);
  }
}

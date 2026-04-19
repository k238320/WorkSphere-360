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
import { MilestonePhaseService } from './milestone-phase.service';
import { MilestonePhaseDto } from './dto/create-milestone-phase.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('milestone-phase')
export class MilestonePhaseController {
  constructor(private readonly milestonePhaseService: MilestonePhaseService) {}

  @Post()
  create(@Body() createMilestonePhaseDto: MilestonePhaseDto) {
    return this.milestonePhaseService.create(createMilestonePhaseDto);
  }

  @Get()
  findAll() {
    return this.milestonePhaseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.milestonePhaseService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: MilestonePhaseDto) {
    return this.milestonePhaseService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.milestonePhaseService.remove(id);
  }

  @Get('listing')
  getForListing(@Query() query: any) {
    return this.milestonePhaseService.getForListing(query);
  }
}

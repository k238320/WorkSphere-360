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
} from '@nestjs/common';
import { IndustryService } from './industry.service';
import { IndustryInterface } from './dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('industry')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  @Post()
  create(@Body() dto: IndustryInterface) {
    return this.industryService.create(dto);
  }

  @Get()
  findAll() {
    return this.industryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.industryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: IndustryInterface) {
    return this.industryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.industryService.remove(id);
  }

  @Get('listing')
  getForListing(@Query() query: any) {
    return this.industryService.getForListing(query);
  }
}

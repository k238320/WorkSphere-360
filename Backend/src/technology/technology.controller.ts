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
import { TechnologyService } from './technology.service';
import { TechnologyInterface } from './dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('technology')
export class TechnologyController {
  constructor(private readonly technologyService: TechnologyService) {}

  @Post()
  create(@Body() dto: TechnologyInterface) {
    return this.technologyService.create(dto);
  }

  @Get()
  findAll() {
    return this.technologyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.technologyService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: TechnologyInterface) {
    return this.technologyService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.technologyService.remove(id);
  }

  @Get('listing')
  getForListing(@Query() query: any) {
    return this.technologyService.getForListing(query);
  }
}

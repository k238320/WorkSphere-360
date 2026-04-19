import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LeavesSystemService } from './leaves-system.service';
import { CreateLeavesSystemDto } from './dto/create-leaves-system.dto';
import { UpdateLeavesSystemDto } from './dto/update-leaves-system.dto';

@Controller('leaves-system')
export class LeavesSystemController {
  constructor(private readonly leavesSystemService: LeavesSystemService) {}

  @Post()
  create(@Body() createLeavesSystemDto: CreateLeavesSystemDto) {
    return this.leavesSystemService.create(createLeavesSystemDto);
  }

  @Get()
  findAll() {
    return this.leavesSystemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leavesSystemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeavesSystemDto: UpdateLeavesSystemDto) {
    return this.leavesSystemService.update(+id, updateLeavesSystemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leavesSystemService.remove(+id);
  }
}

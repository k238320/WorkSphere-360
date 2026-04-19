import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ResignationService } from './resignation.service';

@Controller('resignations')
export class ResignationController {
  constructor(private readonly resignationService: ResignationService) {}

  @Post()
  create(@Body() body: { user_id: string; reason: string; resignationDate: Date }) {
    return this.resignationService.createResignation(body);
  }

  @Get()
  getAll() {
    return this.resignationService.getAllResignations();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.resignationService.getResignationById(id);
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.resignationService.updateResignationStatus(id, body.status);
  }
}

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
import { ClientDetailService } from './client-detail.service';
import { CreateClientDetailDto } from './dto/create-client-detail.dto';
import { UpdateClientDetailDto } from './dto/update-client-detail.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('client-detail')
export class ClientDetailController {
  constructor(private readonly clientDetailService: ClientDetailService) {}

  @Post()
  create(@Body() createClientDetailDto: CreateClientDetailDto) {
    return this.clientDetailService.create(createClientDetailDto);
  }

  @Get()
  findAll() {
    return this.clientDetailService.findAll();
  }

  @Get(':projectId')
  findOne(@Param('projectId') projectId: string) {
    return this.clientDetailService.findOne(projectId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDetailDto) {
    return this.clientDetailService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientDetailService.remove(id);
  }
}

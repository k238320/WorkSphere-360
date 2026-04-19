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
import { DepartmentService } from './department.service';
import { DepartmentDto } from './interface/create-department.interface';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createDepartmentDto: DepartmentDto) {
    return this.departmentService.create(createDepartmentDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.departmentService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: DepartmentDto) {
    return this.departmentService.update(id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Get('listing')
  getForListing(@Query() query: any) {
    return this.departmentService.getForListing(query);
  }

  @Get('departmentList')
  dgKitFindAll(@Query() query: any) {
    return this.departmentService.dgKitFindAll(query);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RolesPermissionService } from './roles-permission.service';
import { CreateRolesPermissionDto } from './dto/create-roles-permission.dto';
import { UpdateRolesPermissionDto } from './dto/update-roles-permission.dto';

@Controller('roles-permission')
export class RolesPermissionController {
  constructor(private readonly rolesPermissionService: RolesPermissionService) {}

  @Post()
  create(@Body() createRolesPermissionDto: CreateRolesPermissionDto) {
    return this.rolesPermissionService.create(createRolesPermissionDto);
  }

  @Get()
  findAll() {
    return this.rolesPermissionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesPermissionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRolesPermissionDto: UpdateRolesPermissionDto) {
    return this.rolesPermissionService.update(+id, updateRolesPermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesPermissionService.remove(+id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectContractTypeService } from './project_contract_type.service';
import { CreateProjectContractTypeDto } from './dto/create-project_contract_type.dto';
import { UpdateProjectContractTypeDto } from './dto/update-project_contract_type.dto';

@Controller('project-contract-type')
export class ProjectContractTypeController {
  constructor(private readonly projectContractTypeService: ProjectContractTypeService) {}

  @Post()
  create(@Body() createProjectContractTypeDto: CreateProjectContractTypeDto) {
    return this.projectContractTypeService.create(createProjectContractTypeDto);
  }

  @Get()
  findAll() {
    return this.projectContractTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectContractTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectContractTypeDto: UpdateProjectContractTypeDto) {
    return this.projectContractTypeService.update(+id, updateProjectContractTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectContractTypeService.remove(+id);
  }
}

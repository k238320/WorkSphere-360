import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  create(@Body() createResourceDto: CreateResourceDto) {
    return this.resourceService.create(createResourceDto);
  }

  @Get()
  findAll(@Req() request: any, @Query() query: any) {
    return this.resourceService.findAll(query, request);
  }

  @Get('resourceAll')
  resourceAll() {
    return this.resourceService.resourceAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourceService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
    return this.resourceService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resourceService.remove(id);
  }

  @Get('listing')
  getForListing(@Query() query: any) {
    return this.resourceService.getForListing(query);
  }

  @Get('department-wise')
  getDepartmentWise(@Req() request: any, @Query() param: any) {
    return this.resourceService.getDepartmentWise(request, param);
  }

  @Get('count')
  count() {
    return this.resourceService.count();
  }

  @Get('resource-utilization')
  resourceUtilization(@Query() query: any) {
    return this.resourceService.resourceUtilization(query);
  }

  @Get('get-resources')
  getResources(@Query() query: any, @Req() request: any) {
    return this.resourceService.getResources(query, request);
  }

  @Put('multiple-update')
  multipleUpdate(@Body() body: any, @Req() request: any) {
    return this.resourceService.multipleUpdate(body);
  }
  @Get('department-resource')
  departmentResource(@Query() query: any, @Req() request: any) {
    return this.resourceService.departmentResource(query, request);
  }

  @Get('getFilteredResources')
  getFilteredResources(@Query() query: any, @Req() request: any) {
    return this.resourceService.getFilteredResources(request);
  }

  @Get('getAllDesignations')
  async getAllDesignations() {
    return this.resourceService.getAllDesignations();
  }

  @Get('getAllCapacities')
  async getAllCapacities() {
    return this.resourceService.getAllCapacities();
  }

  @Get('getAllRates')
  async getAllRates() {
    return this.resourceService.getAllRates();
  }

  @Put('updateResourceCapacityRecord/:id')
  updateResourceCapacityRecord(@Param('id') id: string, @Body() dto: any) {
    return this.resourceService.updateResource(id, dto);
  }
}

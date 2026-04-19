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
  Req,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetDto } from './interface/create-asset.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { AssignAssetDto } from './interface/assign-asset.interface';
import { AssetCompliantDto } from './interface/asset-complaint.interface';

@UseGuards(AuthGuard)
@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  create(@Body() assetDto: AssetDto) {
    return this.assetService.create(assetDto);
  }

  @Get()
  findAll() {
    return this.assetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: AssetDto) {
    return this.assetService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetService.remove(id);
  }

  @Get('listing')
  getForListing(@Query() query: any) {
    return this.assetService.getForListing(query);
  }

  @Post('assign-asset')
  assignAsset(@Body() dto: AssignAssetDto, @Req() request: any) {
    return this.assetService.assignAsset(dto, request);
  }

  @Get('assign-asset/:id')
  getassignAssetById(@Param('id') id: string) {
    return this.assetService.getassignAssetById(id);
  }

  @Get('unassign-asset/:id')
  unassignedAssets(@Param('id') id: string) {
    return this.assetService.unassignedAssets(id);
  }

  @Post('unassign-asset')
  removeAssignAsset(@Body() dto: any) {
    return this.assetService.removeAssignAsset(dto);
  }

  @Post('confirm-asset')
  confirmAsset(@Body() dto: any) {
    return this.assetService.confirmAsset(dto);
  }

  @Post('asset-complaint')
  createAssetComplaint(@Body() dto: AssetCompliantDto, @Req() request: any) {
    return this.assetService.createAssetComplaint(dto, request);
  }

  @Get('asset-complaint/:id')
  getAssetComplaintById(@Param('id') id: string) {
    return this.assetService.getAssetComplaintById(id);
  }

  @Get('asset-complaint')
  getAssetComplaint(@Query() query: any) {
    return this.assetService.getAssetComplaint(query);
  }

  @Post('admin/resolve-complaint/:id')
  adminComplaintResolve(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() request: any,
  ) {
    return this.assetService.adminComplaintResolve(id, dto, request);
  }

  @Post('resolve-complaint/:id')
  employeeComplaintResolve(@Param('id') id: string, @Body() dto: any) {
    return this.assetService.employeeComplaintResolve(id, dto);
  }
}

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
import { AssetCategoryService } from './asset-category.service';
import { AssetCategoryDto } from './interface/create-asset-category.interface';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('asset-category')
export class AssetCategoryController {
  constructor(private readonly assetCategoryService: AssetCategoryService) {}

  @Post()
  create(@Body() assetCategoryDto: AssetCategoryDto) {
    return this.assetCategoryService.create(assetCategoryDto);
  }

  @Get()
  findAll() {
    return this.assetCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetCategoryService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: AssetCategoryDto) {
    return this.assetCategoryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetCategoryService.remove(id);
  }

  @Get('listing')
  getForListing(@Query() query: any) {
    return this.assetCategoryService.getForListing(query);
  }
}

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
  Patch,
} from '@nestjs/common';
import { HrPolicyService } from './hr-policy.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateHrPolicyDto } from './dto/create-hr-policy.dto';

@UseGuards(AuthGuard)
@Controller('hr-policy')
export class HrPolicyController {
  constructor(private readonly hrPolicyService: HrPolicyService) {}

  @Get()
  findAll(@Req() req: any) {
    const userRole = req.user?.role?.name;
    return this.hrPolicyService.findAll(userRole);
  }

  @Post()
  create(@Body() createhrPolicyDto: CreateHrPolicyDto) {
    return this.hrPolicyService.create(createhrPolicyDto);
  }
  @Get('listing')
  getForListing(@Query() query: any, @Req() req: any) {
    const userRole = req.user?.role?.name;
    return this.hrPolicyService.getForListing(query, userRole);
  }

  @Patch(':id/toggle')
  async toggleStatus(
    @Param('id') id: string,
    @Body('is_active') is_active: boolean,
    @Req() req: any,
  ) {
    const userRole = req.user?.role?.name; // extract from JWT
    return this.hrPolicyService.toggleStatus(id, is_active, userRole);
  }
}

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
import { UserDetailService } from './user-detail.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('user-detail')
export class UserDetailController {
  constructor(private readonly userDetailService: UserDetailService) {}
  @Get()
  findAll(@Query() query: any) {
    return this.userDetailService.listing(query);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userDetailService.findOne(id);
  }
  @Post()
  create(@Body() createUserDetailInterface: any, @Req() request: any) {
    return this.userDetailService.create(createUserDetailInterface, request);
  }

  @Post('document')
  addDocs(@Body() CreateUserDocsdto: any) {
    return this.userDetailService.addDocumnets(CreateUserDocsdto);
  }
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDetailInterface: any) {
    return this.userDetailService.update(id, updateUserDetailInterface);
  }

  @Put('document/:id')
  updateDocs(@Param('id') id: string, @Body() dto: any) {
    return this.userDetailService.updateDocs(id, dto);
  }

  @Get('missing-details')
  async generateReport() {
    const filePath =
      await this.userDetailService.generateMissingDetailsReport();
    return { message: `Report created at ${filePath}` };
  }
}

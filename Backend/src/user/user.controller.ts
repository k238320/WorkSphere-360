import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginUserInterface, changePassowrdUserDto } from './interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { JobfairUserInterface } from './interface/jobfair-user.interface';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getUser(@Query() query: any) {
    return await this.userService.getUser(query);
  }

  @UseGuards(AuthGuard)
  @Post()
  async createUser(@Body() dto: any) {
    return await this.userService.createUser(dto);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() dto: any) {
    return await this.userService.updateUser(id, dto);
  }

  @Post('/login')
  async login(@Body() dto: LoginUserInterface) {
    return await this.userService.login(dto);
  }

  @Post('/jobfair')
  async jobfair(@Body() dto: JobfairUserInterface) {
    return await this.userService.jobfairUser(dto);
  }

  @Post('/verifyOtp')
  async verifyToken(@Body() dto: any) {
    return await this.userService.verifyToken(dto);
  }

  @UseGuards(AuthGuard)
  @Post('/change-password')
  async changePassowrd(
    @Body() dto: changePassowrdUserDto,
    @Req() request: any,
  ) {
    return await this.userService.changePassowrd(dto, request);
  }

  @UseGuards(AuthGuard)
  @Get('/project-managers')
  async getPM() {
    return await this.userService.getPM();
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return await this.userService.forgotPassword(body);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { reset_token: string; new_password: string },
  ) {
    return await this.userService.resetPassword(body);
  }

  @UseGuards(AuthGuard)
  @Get('listing')
  getForListing(@Query() query: any) {
    return this.userService.listing(query);
  }

  @UseGuards(AuthGuard)
  @Get('userDropdown')
  userDropdown() {
    return this.userService.userDropDown1();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Get('/userConstants')
  async userConstants(@Req() request: any) {
    return await this.userService.userConstants(request);
  }

  @UseGuards(AuthGuard)
  @Post('/updateUserConstants')
  async updateUserConstants(@Req() request: any, @Body() body: any) {
    return await this.userService.updateUserConstants(request, body);
  }

  @UseGuards(AuthGuard)
  @Post('/apps')
  async addApps(@Req() request: any, @Body() body: any) {
    return await this.userService.addApps(request, body);
  }
}

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
import { PmoDocumentService } from './pmo-document.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreatePmoDocumentDto } from './dto/create-pmo-document.dto';

@UseGuards(AuthGuard)
@Controller('pmo-document')
export class PmoDocumentController {
  constructor(private readonly pmoDocumentService: PmoDocumentService) {}

  @Get()
  findAll() {
    return this.pmoDocumentService.findAll();
  }

  @Post()
  create(@Body() createPmoDocumentDto: CreatePmoDocumentDto) {
    return this.pmoDocumentService.create(createPmoDocumentDto);
  }
  @Get('listing')
  getForListing(@Query() query: any) {
    return this.pmoDocumentService.getForListing(query);
  }
}

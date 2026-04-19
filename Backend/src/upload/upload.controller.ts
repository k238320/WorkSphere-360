import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
  Res,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import { CreateUploadDto } from './dto/create-upload.dto';
import { FastifyFileInterceptor } from 'src/fastify-file-upload/fastify-file-interceptor';
import { editFileName, imageFileFilter } from 'src/utils/file-upload-utils';
// import { FileInterceptor } from '@nestjs/platform-express';
import { query, Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { handleSuccessResponse } from 'src/utils';
import { WFHService } from 'src/wfh/wfh.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly wfhService: WFHService,
  ) {}

  @Post()
  @UseInterceptors(
    FastifyFileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async single(@UploadedFile() file: Express.Multer.File) {
    return await this.uploadService.uploadFile(file);
  }

  @Post('/image')
  @UseInterceptors(
    FastifyFileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async singleImage(@UploadedFile() file: Express.Multer.File) {
    return await this.uploadService.uploadImage(file);
  }

  @UseGuards(AuthGuard)
  @Post('/screenshots')
  @UseInterceptors(
    FastifyFileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async screenshotsImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: any,
  ) {
    const uploadRes = await this.uploadService.uploadScreenshotsImage(
      file,
      request,
      request.body.keyboardPercentage,
      request.body.mousePercentage,
      request.body.screenShot,
    );
    const res = await this.wfhService.employePunchingIn(
      request,
      '1',
      '00:00',
      true,
    );
    return handleSuccessResponse('', 200, uploadRes);
  }

  @Get()
  async getFileFromS3(@Query() query, @Res() res: Response) {
    try {
      const fileBuffer = await this.uploadService.getFileFromS3(query?.path);
      return fileBuffer;
    } catch (err) {
      return {
        statusCode: 500,
        message: err?.message ?? err,
      };
    }
  }

  @Get('/signed-url')
  async getSignedUrl(@Query() query) {
    try {
      const signedUrl = await this.uploadService.getSignedUrl(query?.path);

      return handleSuccessResponse('', 200, signedUrl);
    } catch (err) {
      return {
        statusCode: 500,
        message: err?.message ?? err,
      };
    }
  }
  @Post('clearall')
  async deleteAll(@Query('employement_code') employement_code: string) {
    try {
      const clear = await this.uploadService.deleteAllData(employement_code);
      return handleSuccessResponse('', 200, '');
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Error fetching images',
      };
    }
  }

  // @UseGuards(AuthGuard)
  @Get('getall')
  async getAllImages(
    @Query('dateFilter') dateFilter: string,
    @Query('employement_code') employement_code: string,
  ) {
    let urlArray = [];
    try {
      const images = await this.uploadService.listImagesFromFolder(
        dateFilter,
        employement_code,
      );
      for (let i = 0; i < images.length; i++) {
        if (images[i].Key != '') {
          urlArray.push(images[i]);
        } else {
          urlArray.push({ ...images[i], Key: null });
        }
      }
      return handleSuccessResponse('', 200, urlArray);
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Error fetching images',
      };
    }
  }

  @Get('/getImageUrl')
  async getAllImagesUrl(@Query('key') key: string, @Res() res: Response) {
    try {
      const url = await this.uploadService.getImageBuffer(key);
      res.header('content-type', url.content);
      res.send(url.Body);
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Error fetching images',
      };
    }
  }
}

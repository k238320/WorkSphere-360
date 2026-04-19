import { Injectable, Query } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import stream = require('stream');
import * as util from 'util';
import { CreateUploadDto } from './dto/create-upload.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import moment = require('moment');

@Injectable()
export class UploadService {
  public s3: AWS.S3;

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private prisma: PrismaService,
  ) {
    // Initialize the AWS SDK with your credentials

    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    // Create an S3 instance
    this.s3 = new AWS.S3();
  }

  async getFileFromLocal(filename: string): Promise<Buffer> {
    const readFile = util.promisify(fs.readFile);
    const fileBuffer = await readFile(`uploads/${filename}`);
    return fileBuffer;
  }

  async uploadFile(file: Express.Multer.File) {
    const filebuffer = await this.getFileFromLocal(file.filename);

    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: file.filename,
      Body: filebuffer,
    };

    const uploadResult = await this.s3.upload(params).promise();
    if (uploadResult.Location) {
      // const signedUrl = await this.getSignedUrl(file.filename);

      fs.unlinkSync(file.path);
      return { data: uploadResult.Key };
    }
  }

  async uploadImage(file: Express.Multer.File) {
    const filebuffer = await this.getFileFromLocal(file.filename);

    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: file.filename,
      Body: filebuffer,
    };

    const uploadResult = await this.s3.upload(params).promise();

    if (uploadResult.Location) {
      fs.unlinkSync(file.path);
      return { data: { name: uploadResult.Key, url: uploadResult.Location } }; // Include the URL in the response
    }
  }

  //Screenshots uploading
  async uploadScreenshotsImage(
    file: Express.Multer.File,
    request: any,
    keyboardPercentage: string,
    mousePercentage: string,
    screenShot: any,
  ) {
    console.log('screenShotscreenShot', typeof screenShot);
    if (screenShot == 'True') {
      console.log('if');
      const filebuffer = await this.getFileFromLocal(file.filename);
      const params: AWS.S3.PutObjectRequest = {
        Bucket: process.env.AWS_WFH_S3_BUCKET_NAME,
        Key: `screenshots/${request.user.id}/${moment().format('DD-MM-YYYY')}/${
          file.filename
        }`,
        Body: filebuffer,
      };

      const uploadResult = await this.s3.upload(params).promise();
      console.log(uploadResult);
      if (uploadResult.Location) {
        await this.prisma.emp_activities.create({
          data: {
            emp_code: request.user?.employement_code,
            keyboard_activity: keyboardPercentage,
            mouse_activity: mousePercentage,
            Key: uploadResult.Key,
          },
        });
        fs.unlinkSync(file.path);

        return {
          data: {
            name: uploadResult.Key,
            url: uploadResult.Location,
            keyboard_activity: keyboardPercentage,
            mouse_activity: mousePercentage,
            screenshot: uploadResult.Key,
          },
        }; // Include the URL in the response
      }
    } else {
      console.log('else');
      await this.prisma.emp_activities.create({
        data: {
          emp_code: request.user.employement_code,
          keyboard_activity: keyboardPercentage,
          mouse_activity: mousePercentage,
          Key: '',
        },
      });
      fs.unlinkSync(file.path);
      return {
        data: {
          keyboard_activity: keyboardPercentage,
          mouse_activity: mousePercentage,
        },
      };
    }
  }

  async getSignedUrl(key: string) {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    };

    const signedUrl = await this.s3.getSignedUrlPromise('getObject', params);
    return signedUrl;
  }
  async getSignedUrlWFH(key: string) {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: process.env.AWS_WFH_S3_BUCKET_NAME,
      Key: key,
    };

    const signedUrl = await this.s3.getSignedUrlPromise('getObject', params);
    return signedUrl;
  }
  async getFileFromS3(filePath: string): Promise<Buffer> {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filePath,
    };

    try {
      const s3Object = await this.s3.getObject(params).promise();
      return s3Object.Body as Buffer;
    } catch (error) {
      // Handle errors, e.g., file not found, permissions issues, etc.
      throw new Error('Error retrieving the file from S3');
    }
  }

  async getFileFromS3WFH(filePath: string): Promise<Buffer> {
    const params = {
      Bucket: process.env.AWS_WFH_S3_BUCKET_NAME,
      Key: filePath,
    };

    try {
      const s3Object = await this.s3.getObject(params).promise();
      // console.log(s3Object);
      return s3Object.Body as Buffer;
    } catch (error) {
      // Handle errors, e.g., file not found, permissions issues, etc.
      console.log('error', error);
      throw new Error(error);
    }
  }

  async listImagesFromFolder(
    dateFilter: string,
    employement_code: any,
  ): Promise<AWS.S3.ObjectList> {
    let filterWhere = {};

    if (dateFilter) {
      const start_date = new Date(
        new Date(dateFilter).setUTCHours(0, 0, 0, 0),
      ).toISOString();
      const end_date = new Date(
        new Date(dateFilter).setUTCHours(23, 59, 59, 999),
      ).toISOString();
      console.log(start_date);
      console.log(end_date);
      filterWhere = {
        emp_code: employement_code,
        created_at: {
          gte: start_date,
          lte: end_date,
        },
      };
    } else if (!dateFilter) {
      filterWhere = {
        emp_code: employement_code,
      };
    }
    const existing_data = await this.prisma.emp_activities.findMany({
      where: filterWhere,
    });
    return existing_data || [];
  }

  async deleteAllData(employement_code: string): Promise<Boolean> {
    const DbData = await this.prisma.emp_activities.findMany({
      where: {
        emp_code: employement_code,
      },
    });

    let arr = [];
    if (DbData?.length > 0) {
      DbData?.map((item) => {
        if (item?.Key != '') {
          arr.push({ Key: item?.Key });
        }
      });
      const params: AWS.S3.DeleteObjectsRequest = {
        Bucket: process.env.AWS_WFH_S3_BUCKET_NAME,
        Delete: {
          Objects: arr,
          Quiet: false,
        },
      };

      try {
        const deleteResult = await this.s3.deleteObjects(params).promise();
        const DbDataMain = await this.prisma.emp_activities.deleteMany({
          where: {
            emp_code: employement_code,
          },
        });
        const DbDataWfh = await this.prisma.emp_attendance_Wfh.deleteMany({
          where: {
            emp_code: employement_code,
          },
        });
        console.log(
          'File deleted successfully:',
          deleteResult,
          DbDataMain,
          DbDataWfh,
        );
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    return true;
  }

  async getImageBuffer(filePath: string): Promise<any> {
    const params = {
      Bucket: process.env.AWS_WFH_S3_BUCKET_NAME,
      Key: filePath,
    };
    try {
      const s3Object = await this.s3.getObject(params).promise();
      return {
        Body: s3Object.Body,
        content: s3Object.ContentType,
      };
    } catch (error) {
      console.log('error', error);
      throw new Error(error);
    }
  }
}

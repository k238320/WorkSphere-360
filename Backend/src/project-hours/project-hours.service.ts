import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProjectHourDto } from './interface/create-project-hour.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';

@Injectable()
export class ProjectHoursService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectHourDto) {
    try {
      const projectHours = await this.prisma.project_hours.create({
        data: {
          modified_date: dto.modified_date,
          department_id: dto.department_id,
          project_catgory_hours_id: dto.project_catgory_hours_id,
          hours: dto.hours,
          no_of_resources: dto.no_of_resources,
          role_id: dto.role_id,
          project_id: dto.project_id,
        },
      });

      // const resource = await this.prisma.resource.findFirst({
      //   where: {
      //     department_id: dto.department_id,
      //     is_team_lead: true,
      //   },
      // });
      // if (resource) {
      //   const user = await this.prisma.user.findFirst({
      //     where: {
      //       resource_id: resource.id,
      //     },
      //   });
      //   if (user) {
      //     const projectPermissions =
      //       await this.prisma.project_permissions.findFirst({
      //         where: {
      //           project_id: dto.project_id,
      //           user_id: user.id,
      //         },
      //       });

      //     if (!projectPermissions) {
      //       await this.prisma.project_permissions.create({
      //         data: {
      //           user_id: user.id,
      //           super: user.super ? true : false,
      //           project_id: dto.project_id,
      //         },
      //       });
      //     }
      //   }
      // }

      return handleSuccessResponse(
        'Project Hours Added Successfull',
        HttpStatus.CREATED,
        projectHours,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll(projectId: string) {
    try {
      const projectHours = await this.prisma.project_hours.findMany({
        where: { project_id: projectId },
        select: {
          id: true,
          department: { select: { id: true, name: true } },
          project_category_hours: { select: { id: true, name: true } },
          no_of_resources: true,
          hours: true,
          role_id: true,
          project_id: true,
          modified_date: true,
        },
      });

      return handleSuccessResponse('Successfully', HttpStatus.OK, projectHours);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, updateProjectHourDto) {
    try {
      const projectHours = await this.prisma.project_hours.update({
        where: {
          id: id,
        },
        data: {
          no_of_resources: +updateProjectHourDto.no_of_resources,
          hours: +updateProjectHourDto.hours,
        },
      });

      return handleSuccessResponse('Successfully', HttpStatus.OK, projectHours);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const projectHours = await this.prisma.project_hours.delete({
        where: { id: id },
      });

      // const department = await this.prisma.project_hours.findFirst({
      //   where: {
      //     department_id: projectHours.department_id,
      //     project_id: projectHours.project_id,
      //   },
      // });

      // if (!department) {
      //   const resource = await this.prisma.resource.findFirst({
      //     where: {
      //       department_id: projectHours.department_id,
      //       is_team_lead: true,
      //     },
      //   });
      //   if (resource) {
      //     const user = await this.prisma.user.findFirst({
      //       where: {
      //         resource_id: resource.id,
      //       },
      //     });

      //     if (user) {
      //       await this.prisma.project_permissions.delete({
      //         where: {
      //           project_id: projectHours.id,
      //           user_id: user.id,
      //         },
      //       });
      //     }
      //   }
      // }

      if (!projectHours) {
        return handleSuccessResponse(
          'Failed',
          HttpStatus.BAD_REQUEST,
          'Project Does not found',
        );
      }

      return handleSuccessResponse(
        'Success',
        HttpStatus.OK,
        'Project Hours Deleted Successfully',
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }
}

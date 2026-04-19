import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { updateForSaleProjectDto } from './dto/update-forSale-project.dto';
import { parseData } from 'src/utils/parseFilters';
import {
  replacePlaceholders,
  sendEmail,
  sendNotification,
} from 'src/utils/helper';
import { CreateNotificationDto } from 'src/notification/dto/create-notificatio.dto';
import * as moment from 'moment';
import { profitLoss } from './function';
import * as ExcelJS from 'exceljs';
import { writeFile } from 'fs/promises';
import { getFilteredProjectsNativeMongo } from 'src/utils/quries';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, request: any) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: dto.user_id },
      });

      if (dto.projectDivisionId == '') {
        dto.projectDivisionId = null;
      }
      let formattedDate;

      if (dto.project_win_date) {
        formattedDate = new Date(dto.project_win_date);
      }

      const project = await this.prisma.project.create({
        data: {
          name: dto.name,
          project_categories: dto.project_categories,
          project_technology: dto.project_technology,
          project_industry: dto.project_industry,
          signed_document: dto.signed_document,
          commercial_proposal: dto.commercial_proposal,
          technical_proposal: dto.technical_proposal,
          status_report: dto.status_report,
          no_of_weeks: dto.no_of_weeks,
          specific_timeline: dto.specific_timeline,
          additional_documents: dto.additional_documents,
          brief_commitments: dto.brief_commitments,
          client_details: {
            create: dto?.client_details?.map((item) => ({
              email: item.email,
              name: item.name,
              role_id: item.role_id,
              number: item.number,
              designation: item.designation,
            })),
          },
          project_hours: {
            create: dto?.project_hours?.map((item) => ({
              modified_date: item.modified_date,
              department_id: item.department_id,
              project_catgory_hours_id: item.project_catgory_hours_id,
              no_of_resources: item.no_of_resources,
              hours: item.hours,
              role_id: item.role_id,
            })),
          },
          dicsounted_cost: dto?.dicsounted_cost,
          reason: dto?.reason,
          go_live_date: dto?.go_live_date,
          project_win_date: formattedDate,
          projectDivisionId: dto?.projectDivisionId,
          mou_document: dto?.mou_document,
          project_contract_type_id: dto?.project_contract_type_id,
        },
      });

      if (project?.id) {
        const project_status = await this.prisma.project_status.create({
          data: {
            project_id: project.id,
            project_status_category_id: '64bf9678f3e4fc1400502104',
            porject_statuses_id: '6780d20a919f949fe14ab737',
            user_id: '64c763015a488350a2c2ec52',
            comment: 'N/A',
          },
        });

        const project_permissions =
          await this.prisma.project_permissions.create({
            data: {
              super: user?.super ? true : false,
              user_id: dto?.user_id,
              project_id: project?.id,
              is_sale: user?.super ? false : true,
            },
          });
      }

      const department = await this.prisma.department.findFirst({
        where: {
          name: 'PM Lead',
        },
      });

      const resource = await this.prisma.resource.findFirst({
        where: {
          department_id: department?.id,
          is_team_lead: true,
          status: true,
        },
      });

      if (resource?.id) {
        const emailuser = await this.prisma.user.findFirst({
          where: {
            resource_id: resource?.id,
          },
        });

        const replacements = {
          replaceHeader: 'System generated mail',
          replaceUserName: 'Dear Leads',
          message: `Congratulations!!<br><br>
  
          A new project <a href = ${`https://portal.demoz.agency/project/create?uuid=${project.id}`}>${
            project.name
          }</a> has been initiated in our system. The details of the project are added in the system. Now, the Project Management Lead, Pirzada Shahzar/ Muhammad Umair, can assign a suitable Project Manager to oversee the project and ensure its smooth execution. Once the Project Manager has been assigned, we can proceed with the next steps outlined in the project plan.
          <br><br>
          Your prompt action in this matter would be highly appreciated. 
          `,
        };

        const template = replacePlaceholders(replacements);
        const emailArray = [emailuser.email, 'superadmin@yopmail.com'];
        const notificationArray = [emailuser.id, '6548c8ec1a21e5fecc0d40bb'];

        const email = await sendEmail(
          emailArray,
          `New Project Initiated - ${project.name}`,
          template,
        );

        const notification: CreateNotificationDto = {
          title: 'Congratulations, New Project Initiated',
          message: `A new project ${project.name} has been initiated in our system. The details of the project are added in the system. Your prompt action in this matter would be highly appreciated.`,
          reciever_ids: notificationArray,
          created_by: request?.user?.id,
          link: `/project/create?uuid=${project.id}`,
        };
        const sendNotification1 = await sendNotification(notification);
      }

      return handleSuccessResponse(
        'Product created successfully',
        HttpStatus.CREATED,
        project,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll(query: any) {
    try {
      // Find the permissions for the user
      const permissions = await this.prisma.project_permissions.findMany({
        where: {
          user_id: query?.user_id,
        },
      });

      // If no permissions found, return an empty array
      if (!permissions || permissions.length === 0) {
        return handleSuccessResponse('', HttpStatus.OK, []);
      }

      // Check if the user has the super permission
      const hasSuperPermission = permissions.some(
        (permission) => permission.super,
      );

      if (hasSuperPermission) {
        const project = await this.prisma.project.findMany();

        return handleSuccessResponse('', HttpStatus.OK, project);
      }

      // Otherwise, filter projects based on user's permissions
      const projectIds = permissions.map((permission) => permission.project_id);

      const project = await this.prisma.project.findMany({
        where: { id: { in: projectIds } },
      });

      return handleSuccessResponse('', HttpStatus.OK, project);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string, request: any) {
    try {
      const permission = await this.prisma.project_permissions.findFirst({
        where: {
          OR: [
            { user_id: request?.user?.id, super: true },
            { user_id: request?.user?.id, project_id: id },
          ],
        },
      });
      if (!permission && request?.user?.role?.name != 'Super Admin') {
        throw new UnauthorizedException();
      }
      const project = await this.prisma.project.findFirst({
        where: { id: id },
        include: { project_consumed_hours: { include: { department: true } } },
      });

      return handleSuccessResponse('', HttpStatus.OK, project);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdateProjectDto, request: any) {
    try {
      const existingProjectManagers =
        await this.prisma.project_permissions.findMany({
          where: { project_id: id, is_sale: false },
        });

      const deleteProjectManagers = [];

      for (const pm of existingProjectManagers) {
        const isExisting = dto.project_manager.find(
          (x) => x.id === pm?.user_id,
        );

        if (!isExisting?.id) {
          deleteProjectManagers.push(pm);
        }
      }

      if (deleteProjectManagers?.length > 0) {
        await this.prisma.project_permissions.deleteMany({
          where: { id: { in: deleteProjectManagers.map((pm) => pm.id) } },
        });
      }

      if (request?.user?.role?.name == 'Super Admin') {
        const user = await this.prisma.user.findMany({
          where: { id: { in: dto.project_manager?.map((x: any) => x.id) } },
        });

        const project = await this.prisma.project.findFirst({ where: { id } });
        const notification_ids = [];
        for (const pm of user) {
          const replacements = {
            replaceHeader: 'System generated mail',
            replaceUserName: pm.name,
            message: `I am pleased to inform you that you have been assigned as the Project Manager for the upcoming project, <a href = ${`https://portal.demoz.agency/project/create?uuid=${project.id}`}>${
              project.name
            }</a>. Your expertise and guidance will be instrumental in steering this project to success.
            <br>
            <br>
            You can now commence adding the necessary project details in the portal to kickstart the process. Please ensure that all pertinent information is accurately documented for a streamlined workflow.
            <br>
            <br>
            Thank you for your dedication and commitment to this project.
            <br>
            <br>
            `,
          };

          const template = replacePlaceholders(replacements);
          try {
            const email = await sendEmail(
              pm.email,
              `New Project Assignment - ${project.name}`,
              template,
            );
            notification_ids.push(pm.id);
          } catch (error) {
            return error?.message;
          }
        }
        const notification = {
          title: 'New Project Assignment',
          message: `You have been assigned as the Project Manager for the upcoming project, ${project.name}.  You can now commence adding the necessary project details in the portal to kickstart the process.`,
          reciever_ids: notification_ids,
          created_by: request?.user?.id,
          link: `/project/create?uuid=${project.id}`,
        };
        try {
          const sendnotification1 = sendNotification(notification);
        } catch (error) {
          return error?.message;
        }
      }

      const project = await this.prisma.project.update({
        where: { id: id },
        data: {
          kickoff_date: dto.kickoff_date,
          project_plan: dto.project_plan,
          project_srs: dto.project_srs,
          project_manager_details: dto.project_manager,
          project_website: dto.project_website,
          go_live_date: dto.go_live_date,
          status_report: dto.status_report,
        },
      });

      for (let i = 0; i < dto?.project_manager?.length; i++) {
        const getProjectPermissionUser =
          await this.prisma.project_permissions.findFirst({
            where: {
              user_id: dto?.project_manager[i].id,
              project_id: id,
              is_sale: false,
            },
          });

        if (!getProjectPermissionUser?.id) {
          const projectPermissions =
            await this.prisma.project_permissions.create({
              data: {
                project_id: id,
                user_id: dto?.project_manager[i].id,
                super: false,
                is_pm: true,
              },
            });
        }
      }

      return handleSuccessResponse('', HttpStatus.OK, project);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateForSale(dto: updateForSaleProjectDto) {
    try {
      // Fetch existing project hours from the database
      const existingProjectHours = await this.prisma.project_hours.findMany({
        where: { project_id: dto.project_id },
      });

      const deletePorjectHoursArray = [];

      for (const hour of existingProjectHours) {
        const isExisting = dto.project_hours.find((x) => x.id === hour?.id);

        if (!isExisting?.id) {
          deletePorjectHoursArray.push(hour);
        }
      }

      if (deletePorjectHoursArray?.length > 0) {
        await this.prisma.project_hours.deleteMany({
          where: { id: { in: deletePorjectHoursArray.map((hour) => hour.id) } },
        });
      }

      const addPorjectHoursArray = dto.project_hours.filter(
        (x) => x.is_add === true,
      );

      if (addPorjectHoursArray?.length > 0) {
        const createProjectHours = await this.prisma.project_hours.createMany({
          data: addPorjectHoursArray.map((item) => ({
            modified_date: item.modified_date,
            department_id: item.department_id,
            project_catgory_hours_id: item.project_catgory_hours_id,
            no_of_resources: item.no_of_resources,
            hours: item.hours,
            role_id: item.role_id,
            project_id: dto.project_id,
          })),
        });
      }

      const newClientDetails = dto.client_details?.filter(
        (x: any) => x.is_add === true,
      );

      if (newClientDetails?.length > 0) {
        const creatClientDetials = await this.prisma.client_details.createMany({
          data: newClientDetails?.map((x: any) => ({
            name: x.name,
            designation: x.designation,
            email: x.email,
            number: x.number,
            project_id: dto.project_id,
            role_id: x.role_id,
          })),
        });
      }

      const deleteClientDetails = dto.client_details?.filter(
        (x: any) => x.is_delete === true,
      );

      if (deleteClientDetails?.length > 0) {
        await this.prisma.client_details.deleteMany({
          where: { id: { in: deleteClientDetails.map((x) => x.id) } },
        });
      }

      if (dto.projectDivisionId == '') {
        dto.projectDivisionId = null;
      }
      let formattedDate;

      if (dto.project_win_date) {
        formattedDate = new Date(dto.project_win_date);
      }

      await this.prisma.project.update({
        where: { id: dto.project_id },
        data: {
          name: dto.name,
          project_categories: dto.project_categories,
          project_technology: dto.project_technology,
          project_industry: dto.project_industry,
          signed_document: dto.signed_document,
          commercial_proposal: dto.commercial_proposal,
          technical_proposal: dto.technical_proposal,
          no_of_weeks: dto.no_of_weeks,
          specific_timeline: dto.specific_timeline,
          additional_documents: dto.additional_documents,
          brief_commitments: dto.brief_commitments,
          dicsounted_cost: dto.dicsounted_cost,
          reason: dto.reason,
          project_win_date: formattedDate,
          status_report: dto.status_report,
          projectDivisionId: dto.projectDivisionId,
          mou_document: dto?.mou_document,
          project_contract_type_id: dto?.project_contract_type_id,
        },
      });

      return handleSuccessResponse('', HttpStatus.OK, deletePorjectHoursArray);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getForSale(id: string, request: any) {
    try {
      const permission = await this.prisma.project_permissions.findFirst({
        where: {
          OR: [
            { user_id: request?.user?.id, super: true },
            { user_id: request?.user?.id, project_id: id },
          ],
        },
      });
      if (!permission && request?.user?.role?.name != 'Super Admin') {
        throw new UnauthorizedException();
      }
      const project = await this.prisma.project.findUnique({
        select: {
          id: true,
          name: true,
          project_categories: true,
          project_technology: true,
          project_industry: true,
          signed_document: true,
          commercial_proposal: true,
          technical_proposal: true,
          no_of_weeks: true,
          specific_timeline: true,
          additional_documents: true,
          brief_commitments: true,
          project_hours: {
            select: {
              id: true,
              modified_date: true,
              department: { select: { id: true, name: true } },
              project_category_hours: { select: { id: true, name: true } },
              no_of_resources: true,
              hours: true,
              role_id: true,
            },
          },
          project_consumed_hours: {
            select: {
              consumed_hours: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          client_details: true,
          dicsounted_cost: true,
          reason: true,
          project_win_date: true,
          status_report: true,
          projectDivisionId: true,
          projectDivision: true,
          mou_document: true,
          project_contract_type_id: true,
        },
        where: { id: id },
      });

      return handleSuccessResponse('', HttpStatus.OK, project);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getForPM(id: string, request: any) {
    try {
      const permission = await this.prisma.project_permissions.findFirst({
        where: {
          OR: [
            { user_id: request?.user?.id, super: true },
            { user_id: request?.user?.id, project_id: id },
          ],
        },
      });

      if (!permission && request?.user?.role?.name != 'Super Admin') {
        throw new UnauthorizedException();
      }
      const project = await this.prisma.project.findUnique({
        select: {
          id: true,
          project_manager_details: true,
          kickoff_date: true,
          project_plan: true,
          project_srs: true,
          project_website: true,
          go_live_date: true,
          status_report: true,
        },
        where: { id: id },
      });

      return handleSuccessResponse('', HttpStatus.OK, project);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getProjectName(id: string) {
    try {
      const project = await this.prisma.project.findFirst({
        where: { id: id },
        select: {
          id: true,
          name: true,
        },
      });

      return handleSuccessResponse('', HttpStatus.OK, project);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getForListing(query: any) {
    try {
      const permissions = await this.prisma.project_permissions.findMany({
        where: {
          user_id: query?.user_id,
        },
      });

      let project;

      if (!permissions || permissions.length === 0) {
        project = [];
        const res = {
          rows: project,
          count: 0,
        };
        return handleSuccessResponse('', HttpStatus.OK, res);
      }

      const hasSuperPermission = permissions.some(
        (permission) => permission.super,
      );

      let where = {};
      const data1 = [];
      const filter: any = parseData(query?.$filter, data1);

      if (filter && typeof filter !== 'undefined' && filter.length > 0) {
        for (const currentFilter of filter) {
          if (currentFilter && currentFilter.columnName == 'name') {
            where = {
              ...where,
              [currentFilter.columnName]: {
                [currentFilter.filter]: currentFilter?.value?.contains,
                mode: 'insensitive',
              },
            };
          } else if (currentFilter.columnName == 'project_manager_details') {
            query.project_manager_details = {
              [currentFilter.filter]: currentFilter.value.contains,
              mode: currentFilter.value.mode,
            };
          } else if (currentFilter.columnName === 'status') {
            const latestStatus = await this.prisma.project_status.findMany({
              orderBy: {
                created_at: 'desc',
              },
              select: {
                project_id: true,
                created_at: true,
                porject_statuses_id: true,
              },
            });

            const latestStatusMap = latestStatus.reduce((acc, status) => {
              if (!acc[status.project_id]) {
                acc[status.project_id] = status;
              }
              return acc;
            }, {});

            const filteredStatuses = Object.values(latestStatusMap).filter(
              (status: any) =>
                status.porject_statuses_id === currentFilter.value.contains,
            );

            if (filteredStatuses.length > 0) {
              where = {
                ...where,
                id: {
                  in: filteredStatuses.map((status: any) => status.project_id),
                },
              };
            }
          } else if (currentFilter.columnName === 'projectDivision') {
            where = {
              ...where,
              OR: [
                { projectDivision: { id: currentFilter?.value?.contains } },
                {
                  projectDivision: { parentId: currentFilter?.value?.contains },
                },
              ],
            };
          } else if (currentFilter.columnName === 'project_contract_type') {
            where = {
              ...where,
              project_contract_type: { id: currentFilter?.value?.contains },
            };
          } else if (currentFilter.columnName === 'kickoff_date') {
            const dateValue = currentFilter.value?.contains;

            if (dateValue) {
              const date = moment(dateValue).utc(false);

              const startOfMonth = date.startOf('month').toISOString();
              const endOfMonth = date.endOf('month').toISOString();

              where = {
                ...where,
                kickoff_date: {
                  gte: startOfMonth,
                  lt: endOfMonth,
                },
              };
            }
          }
        }
      }

      let column = 'id';
      let value = 'desc';

      const projectSelect = {
        id: true,
        name: true,
        project_manager_details: true,
        project_categories: true,
        project_technology: true,
        project_industry: true,
        project_plan: true,
        project_srs: true,
        technical_proposal: true,
        project_contract_type: true,
        project_hours: {
          select: {
            id: true,
            department: { select: { id: true, name: true } },
            hours: true,
            project_category_hours: { select: { id: true, name: true } },
            no_of_resources: true,
          },
        },
        client_details: {
          orderBy: {
            created_at: 'desc' as const,
          },
          take: 2,
        },
        project_status: {
          select: {
            project_statuses: { select: { id: true, name: true } },
          },
          orderBy: { created_at: 'desc' as const },
          take: 1,
        },
        project_consumed_hours: {
          select: {
            department: { select: { id: true, name: true } },
            consumed_hours: true,
          },
        },
        projectDivisionId: true,
        projectDivision: true,
        project_milestone: {
          include: {
            milestone_phase: true,
          },
        },
        kickoff_date: true,
      };

      const statusCounts: Record<string, number> = {
        'on track': 0,
        'on hold': 0,
        completed: 0,
        'not started': 0,
        delayed: 0,
        unassigned: 0,
      };

      let projectDivisions = await this.prisma.projectDivision.findMany();

      let filteredProjects = [];
      let projectDivisionsWithCount;

      if (hasSuperPermission) {
        if (!query?.project_manager_details) {
          project = await this.prisma.project.findMany({
            select: projectSelect,
            where,
            take: +query?.$top,
            skip: +query?.$skip,
            orderBy: {
              [column]: value,
            },
          });

          let allProjects = await this.prisma.project.findMany({
            select: projectSelect,
            where,
            orderBy: {
              [column]: value,
            },
          });

          for (const proj of allProjects) {
            const latestStatusName =
              proj.project_status?.[0]?.project_statuses?.name?.toLowerCase();
            if (latestStatusName) {
              statusCounts[latestStatusName] =
                (statusCounts[latestStatusName] || 0) + 1;
            }
          }

          projectDivisionsWithCount = projectDivisions.map((division) => {
            const count = allProjects.filter(
              (proj) => proj.projectDivision?.id === division.id,
            ).length;

            return {
              ...division,
              count,
            };
          });

          if (filter && typeof filter !== 'undefined' && filter.length > 0) {
            filter.forEach((filter) => {
              if (
                filter &&
                filter.columnName != 'name' &&
                filter.columnName != 'project_manager_details' &&
                filter.columnName != 'status' &&
                filter.columnName != 'projectDivision' &&
                filter.columnName != 'project_contract_type' &&
                filter.columnName != 'kickoff_date'
              ) {
                const filteredProjects = project.filter((project) => {
                  const projectsDetails = project[filter.columnName] || [];
                  return projectsDetails.some((x) => {
                    const name = x?.name?.toLowerCase() || '';
                    filter.value.contains =
                      filter.value?.contains?.toLowerCase();
                    if (filter.filter == 'startsWith') {
                      return name.startsWith(filter?.value?.contains);
                    } else if (filter.filter == 'endsWith') {
                      return name.endsWith(filter?.value?.contains);
                    } else if (
                      filter.filter == 'contains' ||
                      filter.filter == 'equals'
                    ) {
                      return name.includes(filter?.value?.contains);
                    } else if (filter.filter == 'not') {
                      return name !== filter?.value?.contains;
                    }
                  });
                });

                project = filteredProjects;
              }
            });
          }

          // const count = await this.prisma.project.count({ where });
          const count = query?.pdf
            ? allProjects.length
            : await this.prisma.project.count({ where });

          // project = profitLoss(project);

          project = query?.pdf ? profitLoss(allProjects) : profitLoss(project);

          const res = {
            rows: project,
            count: count,
            projectDivisionsWithCount: projectDivisionsWithCount,
            statusCounts,
          };

          return handleSuccessResponse('', HttpStatus.OK, res);
        }
        if (query?.project_manager_details) {
          project = await this.prisma.project.findMany({
            select: projectSelect,
            where: where,
            orderBy: {
              [column]: value,
            },
          });

          filteredProjects = project.filter((project) => {
            const projectsDetails = project.project_manager_details || [];

            if (!Array.isArray(projectsDetails)) return false;

            const filterValue = query?.project_manager_details?.contains;

            return projectsDetails.find((pm: any) => pm?.id === filterValue);
          });

          for (const proj of filteredProjects) {
            const latestStatusName =
              proj.project_status?.[0]?.project_statuses?.name?.toLowerCase();
            if (latestStatusName) {
              statusCounts[latestStatusName] =
                (statusCounts[latestStatusName] || 0) + 1;
            }
          }

          projectDivisionsWithCount = projectDivisions.map((division) => {
            const count = filteredProjects.filter(
              (proj) => proj.projectDivision?.id === division.id,
            ).length;

            return {
              ...division,
              count,
            };
          });

          if (filter && typeof filter !== 'undefined' && filter.length > 0) {
            filter.forEach((filter) => {
              if (
                filter &&
                filter.columnName != 'name' &&
                filter.columnName != 'project_manager_details' &&
                filter.columnName != 'status' &&
                filter.columnName != 'projectDivision' &&
                filter.columnName != 'project_contract_type' &&
                filter.columnName != 'kickoff_date'
              ) {
                const filteredProjects = project.filter((project) => {
                  const projectsDetails = project[filter.columnName] || [];
                  return projectsDetails.some((x) => {
                    const name = x?.name?.toLowerCase() || '';
                    filter.value.contains =
                      filter.value?.contains?.toLowerCase();
                    if (filter.filter == 'startsWith') {
                      return name.startsWith(filter?.value?.contains);
                    } else if (filter.filter == 'endsWith') {
                      return name.endsWith(filter?.value?.contains);
                    } else if (
                      filter.filter == 'contains' ||
                      filter.filter == 'equals'
                    ) {
                      return name.includes(filter?.value?.contains);
                    } else if (filter.filter == 'not') {
                      return name !== filter?.value?.contains;
                    }
                  });
                });

                project = filteredProjects;
              }
            });
          }

          filteredProjects = profitLoss(filteredProjects);

          const res = {
            rows: filteredProjects,
            count: filteredProjects?.length,
            projectDivisionsWithCount: projectDivisionsWithCount,
            statusCounts,
          };

          return handleSuccessResponse('', HttpStatus.OK, res);
        }
      }

      const projectIds = permissions.map((permission) => permission.project_id);

      project = await this.prisma.project.findMany({
        select: projectSelect,
        take: +query?.$top,
        skip: +query?.$skip,
        where: { id: { in: projectIds }, ...where },
        orderBy: {
          [column]: value,
        },
      });

      for (const proj of project) {
        const latestStatusName =
          proj.project_status?.[0]?.project_statuses?.name?.toLowerCase();
        if (latestStatusName) {
          statusCounts[latestStatusName] =
            (statusCounts[latestStatusName] || 0) + 1;
        }
      }

      projectDivisionsWithCount = projectDivisions.map((division) => {
        const count = project.filter(
          (proj) => proj.projectDivision?.id === division.id,
        ).length;

        return {
          ...division,
          count,
          projectDivisionsWithCount: projectDivisionsWithCount,
        };
      });

      if (filter && typeof filter !== 'undefined' && filter.length > 0) {
        filter.forEach((filter) => {
          if (
            filter &&
            filter.columnName != 'name' &&
            filter.columnName != 'project_manager_details' &&
            filter.columnName != 'status' &&
            filter.columnName != 'projectDivision' &&
            filter.columnName != 'project_contract_type'
          ) {
            const filteredProjects = project.filter((project) => {
              const projectsDetails = project[filter.columnName] || [];
              return projectsDetails.some((x) => {
                const name = x?.name?.toLowerCase() || '';
                filter.value.contains = filter?.value?.contains.toLowerCase();
                if (filter.filter == 'startsWith') {
                  return name.startsWith(filter?.value?.contains);
                } else if (filter.filter == 'endsWith') {
                  return name.endsWith(filter?.value?.contains);
                } else if (
                  filter.filter == 'contains' ||
                  filter.filter == 'equals'
                ) {
                  return name.includes(filter?.value?.contains);
                } else if (filter.filter == 'not') {
                  return name !== filter?.value?.contains;
                }
              });
            });

            project = filteredProjects;
          }
        });
      }

      project = profitLoss(project);

      const count = await this.prisma.project.count({
        where: { id: { in: projectIds }, ...where },
      });

      const res = {
        rows: project,
        count: count,
        projectDivisionsWithCount: projectDivisionsWithCount,
        statusCounts,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async projectHours(request: any, query: any) {
    try {
      const role = request?.user?.role?.name;
      const page = parseInt(query.page);
      const rows = parseInt(query.rowsPerPage);
      if (!role || (role !== 'Super Admin' && role !== 'PM Lead')) {
        throw new UnauthorizedException();
      }
      let where: any = {};
      if (query?.project) {
        where.id = query?.project;
      }
      let projects;
      let projectsCount;
      if (query.project_manager) {
        projects = await this.prisma.project.findMany({
          where: { ...where },
          select: {
            project_consumed_hours: {
              select: {
                consumed_hours: true,
                department: true,
              },
            },
            project_hours: {
              select: {
                hours: true,
                department: true,
                project_category_hours: true,
              },
            },
            project_manager_details: true,
            name: true,
          },
        });

        const filteredProjects = projects.filter((project) => {
          const projectDetails = project.project_manager_details;

          return projectDetails?.some((manager) => {
            const managerId = manager?.id || '';
            const filterValue = query.project_manager || '';
            return managerId === filterValue;
          });
        });

        projects = filteredProjects;

        projectsCount = projects.length;
      } else {
        projects = await this.prisma.project.findMany({
          where,
          select: {
            project_consumed_hours: {
              select: {
                consumed_hours: true,
                department: true,
              },
            },
            project_hours: {
              select: {
                hours: true,
                department: true,
                project_category_hours: true,
              },
            },
            project_manager_details: true,
            name: true,
          },
          take: rows,
          skip: rows * page,
        });

        projectsCount = await this.prisma.project.count({ where });
      }

      const updatedProjects = projects.map((x: any) => {
        let details: any = {};
        details.name = x.name;
        details.projectManagers = x.project_manager_details;
        let departmentMap: { [key: string]: any } = {};
        let project_hours = 0;
        let project_consumed_hours = 0;
        x.project_hours.forEach((y: any) => {
          const departmentName = y?.department?.name;
          const hours = y?.hours || 0;
          if (y?.project_category_hours?.name !== 'Additional') {
            project_hours += hours;
            if (departmentMap[departmentName]) {
              departmentMap[departmentName].hours += hours;
            } else {
              departmentMap[departmentName] = {
                name: departmentName,
                hours: hours,
              };
            }
          }
        });
        details.project_hours = project_hours;
        // details.department = Object.values(departmentMap);
        details.department = departmentMap;

        const keys = Object.keys(details.department);

        keys.forEach((element) => {
          x?.project_consumed_hours.map((z: any) => {
            if (z.department?.name == element) {
              project_consumed_hours += z?.consumed_hours;
              details.department[element].consumed_hours = z?.consumed_hours;
            }
            if (
              details.department[element].hours <
              details.department[element].consumed_hours
            ) {
              details.department[element].isLoss = true;
            }
            if (
              details.department[element].hours >
              details.department[element].consumed_hours
            ) {
              details.department[element].isLoss = false;
            }
          });
        });
        details.project_consumed_hours = project_consumed_hours;
        return details;
      });

      const data = {
        projects: updatedProjects,
        projectsCount,
      };
      return handleSuccessResponse('success', HttpStatus.OK, data);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async overallProfitability(name: string) {
    try {
      const perHourRate = 40;

      const allProjects = await this.prisma.project.findMany({
        where: {
          status: true,
          ...(name ? { name: { contains: name, mode: 'insensitive' } } : {}),
        },
        select: {
          id: true,
          name: true,
          project_hours: {
            select: {
              hours: true,
              project_catgory_hours_id: true,
              project_category_hours: { select: { id: true, name: true } },
            },
          },
          project_consumed_hours: { select: { consumed_hours: true } },
        },
      });

      const overallTotals = {
        totalPlannedHours: 0,
        totalConsumedHours: 0,
        categoryTotals: {} as Record<string, number>,
      };

      const profitabilityData = allProjects.map((project) => {
        const projectPlannedHours = project.project_hours.reduce(
          (sum, entry) => {
            if (entry.project_category_hours?.name === 'Additional') return sum;
            return sum + entry.hours;
          },
          0,
        );

        const projectConsumedHours = project.project_consumed_hours.reduce(
          (sum, entry) => sum + entry.consumed_hours,
          0,
        );

        project.project_hours.forEach((entry) => {
          if (entry.project_category_hours?.name === 'Additional') return;
          const categoryName = entry.project_category_hours?.name;
          overallTotals.categoryTotals[categoryName] =
            (overallTotals.categoryTotals[categoryName] || 0) + entry.hours;
        });

        overallTotals.totalPlannedHours += projectPlannedHours;
        overallTotals.totalConsumedHours += projectConsumedHours;

        const budget = projectPlannedHours * perHourRate;
        const cost = projectConsumedHours * perHourRate;
        const profitOrLoss = budget - cost;

        return {
          ...project,
          projectPlannedHours,
          projectConsumedHours,
          budget,
          cost,
          profitOrLoss,
          status: profitOrLoss >= 0 ? 'Profit' : 'Loss',
        };
      });

      const overallBudget = overallTotals.totalPlannedHours * perHourRate;
      const overallCost = overallTotals.totalConsumedHours * perHourRate;
      const overallProfitOrLoss = overallBudget - overallCost;

      const totalRecords = allProjects.length;

      const data = {
        overall: {
          totalPlannedHours: overallTotals.totalPlannedHours,
          totalConsumedHours: overallTotals.totalConsumedHours,
          overallBudget,
          overallCost,
          overallProfitOrLoss,
          status: overallProfitOrLoss >= 0 ? 'Profit' : 'Loss',
          categoryTotals: overallTotals.categoryTotals,
        },
        paginatedProjects: {
          totalRecords,
          data: profitabilityData,
        },
      };

      return handleSuccessResponse('success', HttpStatus.OK, data);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getProjectDetails(projectId: string) {
    try {
      // Check if the project exists
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, name: true },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // Fetch tasks along with allocations
      const tasks = await this.prisma.task.findMany({
        where: { project_id: projectId },
        select: {
          id: true,
          name: true,
          department: true,
          completion_date: true,
          actual_completion_date: true,
          description: true,
          task_status: { select: { id: true, name: true } },
          allocation: {
            select: {
              id: true,
              start_date: true,
              end_date: true,
              task_hours: true,
              is_completed: true,
              resource: { select: { id: true, name: true } },
              department: { select: { id: true, name: true } },
              per_date_allocation: {
                select: {
                  date: true,
                  task_hours: true,
                  is_leave: true,
                  is_holiday: true,
                },
              },
            },
          },
        },
      });

      // Group tasks by department
      const departmentWiseTasks = tasks.reduce((result, task) => {
        // Extract department names from the array
        const departmentNames = Array.isArray(task.department)
          ? task.department.map(
              (dept: any) => dept.name || 'Unnamed Department',
            )
          : ['Unassigned'];

        departmentNames.forEach((deptName) => {
          if (!result[deptName]) {
            result[deptName] = [];
          }

          result[deptName].push({
            id: task.id,
            name: task.name,
            completionDate: task.completion_date,
            actualCompletionDate: task.actual_completion_date,
            description: task.description,
            status: task.task_status?.name || 'Not Started',
            allocations: task.allocation.map((alloc) => ({
              id: alloc.id,
              startDate: alloc.start_date,
              endDate: alloc.end_date,
              taskHours: alloc.task_hours,
              isCompleted: alloc.is_completed,
              resource: {
                id: alloc.resource.id,
                name: alloc.resource.name,
              },
              department: alloc.department?.name || 'Unassigned',
              perDateAllocation: alloc.per_date_allocation.map((pda) => ({
                date: pda.date,
                taskHours: pda.task_hours,
                isLeave: pda.is_leave,
                isHoliday: pda.is_holiday,
              })),
            })),
          });
        });

        return result;
      }, {});

      // Prepare response
      const response = {
        project: {
          id: project.id,
          name: project.name,
        },
        departmentWiseTasks,
      };

      return handleSuccessResponse('success', HttpStatus.OK, response);
    } catch (error) {
      throw new Error(error.message || 'An error occurred');
    }
  }

  async ProjectTrackers(query, request) {
    try {
      const userRole = request?.user?.role?.name;
      const isSuperAdminOrHR =
        userRole === 'Super Admin' || userRole === 'PM Lead';

      const regex = /^\s*(id|kickoff_date|name)\s+(asc|desc)\s*$/i;
      const match = query?.$orderby?.match(regex);

      let column = 'id';
      let value = 'desc';

      if (match) {
        column = match[1];
        value = match[2];
      }

      const allFields = {
        id: true,
        name: true,
        client_details: {
          select: {
            id: true,
            name: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc' as const,
          },
          take: 2,
        },
        project_manager_details: true,
        dicsounted_cost: true,
        no_of_weeks: true,
        kickoff_date: true,
        project_status: {
          select: {
            id: true,
            days_delayed: true,
            created_at: true,
            comment: true,
            project_statuses: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc' as const,
          },
          take: 5,
        },
        project_plan: true,
        project_srs: true,
        technical_proposal: true,
        go_live_date: true,
        project_hours: true,
        project_consumed_hours: {
          include: { department: true },
        },
        status_report: true,
      };

      let filters: any = {};
      let obj = [];
      const parsedFilters = parseData(query?.$filter, obj);

      for (const filter of parsedFilters || []) {
        if (filter.columnName === 'name') {
          filters.name = {
            [filter.filter]: filter.value.contains,
            mode: filter.value.mode,
          };
        } else if (filter.columnName === 'kickoff_date') {
          const dateValue = filter.value?.contains;

          if (dateValue) {
            const date = moment(dateValue).utc(false);

            const startOfMonth = date.startOf('month').toISOString();
            const endOfMonth = date.endOf('month').toISOString();

            filters.kickoff_date = {
              gte: startOfMonth,
              lt: endOfMonth,
            };
          }
        } else if (filter.columnName === 'go_live_date') {
          const dateValue = filter.value?.contains;

          if (dateValue) {
            const date = moment(dateValue).utc(false); // Parse the date

            const startOfMonth = date.startOf('month').toISOString();
            const endOfMonth = date.endOf('month').toISOString();

            filters.go_live_date = {
              gte: startOfMonth,
              lt: endOfMonth,
            };
          }
        } else if (filter.columnName === 'client_details') {
          filters.client_details = {
            some: {
              name: {
                [filter.filter]: filter.value.contains,
                mode: filter.value.mode,
              },
            },
          };
        } else if (filter.columnName == 'project_manager_details') {
          query.project_manager_details = {
            [filter.filter]: filter.value.contains,
            mode: filter.value.mode,
          };
        } else if (filter.columnName === 'status') {
          const latestStatus = await this.prisma.project_status.findMany({
            orderBy: {
              created_at: 'desc',
            },
            select: {
              project_id: true,
              created_at: true,
              porject_statuses_id: true,
            },
          });

          const latestStatusMap = latestStatus.reduce((acc, status) => {
            if (!acc[status.project_id]) {
              acc[status.project_id] = status;
            }
            return acc;
          }, {});

          const filteredStatuses = Object.values(latestStatusMap).filter(
            (status: any) =>
              status.porject_statuses_id === filter.value.contains,
          );

          if (filteredStatuses.length > 0) {
            filters.id = {
              in: filteredStatuses.map((status: any) => status.project_id),
            };
          }
        }
      }

      const unwantedList = [
        '65d5f55d75294589c28dd317',
        '656ef8118726c7c0dc64fac8',
        '656ef8548726c7c0dc64fac9',
        '6576c46c75b5e758487ae076',
        '656ef9748726c7c0dc64face',
        '656efbc58726c7c0dc64fad0',
        '66790d08b064cd8717dd977a',
      ];

      if (isSuperAdminOrHR) {
        if (!query?.project_manager_details) {
          let projects = await this.prisma.project.findMany({
            select: allFields,
            where: filters,
            orderBy: { [column]: value },
            take: +query?.$top,
            skip: +query?.$skip,
          });

          const filteredProjects = projects.filter((project) => {
            const projectManagerDetails =
              project?.project_manager_details || [];

            // Exclude non-array project manager details or unwanted IDs
            if (!Array.isArray(projectManagerDetails)) return false;

            return !projectManagerDetails?.some((pm: any) =>
              unwantedList.includes(pm?.id),
            );
          });

          const enhancedProjects = filteredProjects.map((project) => {
            const totalHours =
              project?.project_hours?.reduce((sum, ph) => sum + ph.hours, 0) ||
              0;

            const consumedHours =
              project?.project_consumed_hours?.reduce(
                (sum, pch) => sum + pch.consumed_hours,
                0,
              ) || 0;

            const remainingHours = totalHours - consumedHours;

            return {
              ...project,
              totalHours: totalHours,
              consumedHours: consumedHours,
              remainingHours: remainingHours,
            };
          });

          const count = await this.prisma.project.count({
            where: {
              ...filters,
            },
          });

          return handleSuccessResponse('Success', HttpStatus.OK, {
            rows: enhancedProjects,
            count: count,
          });
        }

        if (query?.project_manager_details) {
          const projects = await this.prisma.project.findMany({
            select: allFields,
            where: filters,
            orderBy: { [column]: value },
          });

          const filteredProjects = projects.filter((project) => {
            const projectsDetails = project.project_manager_details || [];

            if (!Array.isArray(projectsDetails)) return false;

            const filterValue = query?.project_manager_details?.contains;

            return projectsDetails.find(
              (pm: any) =>
                pm?.id === filterValue && !unwantedList.includes(pm?.id),
            );
          });

          const enhancedProjects = filteredProjects.map((project) => {
            const totalHours =
              project?.project_hours?.reduce((sum, ph) => sum + ph.hours, 0) ||
              0;

            const consumedHours =
              project?.project_consumed_hours?.reduce(
                (sum, pch) => sum + pch.consumed_hours,
                0,
              ) || 0;

            const remainingHours = totalHours - consumedHours;

            return {
              ...project,
              totalHours: totalHours,
              consumedHours: consumedHours,
              remainingHours: remainingHours,
            };
          });

          return handleSuccessResponse('Success', HttpStatus.OK, {
            rows: enhancedProjects,
            count: enhancedProjects?.length,
          });
        }
      }

      const permissions = await this.prisma.project_permissions.findMany({
        where: { user_id: request?.user?.id },
      });

      if (!permissions || permissions.length === 0) {
        return handleSuccessResponse('', HttpStatus.OK, { rows: [], count: 0 });
      }

      const projectIds = permissions.map((permission) => permission.project_id);

      const projects = await this.prisma.project.findMany({
        select: allFields,
        where: {
          id: { in: projectIds },
          ...filters,
        },
        orderBy: { [column]: value },
        take: +query?.$top,
        skip: +query?.$skip,
      });

      const enhancedProjects = projects.map((project) => {
        const totalHours =
          project?.project_hours?.reduce((sum, ph) => sum + ph.hours, 0) || 0;

        const consumedHours =
          project?.project_consumed_hours?.reduce(
            (sum, pch) => sum + pch.consumed_hours,
            0,
          ) || 0;

        const remainingHours = totalHours - consumedHours;

        return {
          ...project,
          totalHours: totalHours,
          consumedHours: consumedHours,
          remainingHours: remainingHours,
        };
      });

      const count = await this.prisma.project.count({
        where: {
          id: { in: projectIds },
          ...filters,
        },
      });

      return handleSuccessResponse('Success', HttpStatus.OK, {
        rows: enhancedProjects,
        count: count,
      });
    } catch (error) {
      throw new Error(error.message || 'An error occurred');
    }
  }

  async getSalesTargetData(query, request) {
    try {
      const salesTarget = 800000;

      const { startDate, endDate } = query;

      if (startDate == '' || endDate == '') {
        return;
      }

      const whereCondition = {
        ...(startDate &&
          endDate && {
            project_win_date: {
              gte: moment.utc(startDate).startOf('day').toISOString(),
              lt: moment.utc(endDate).endOf('day').toISOString(),
            },
          }),
      };

      const projects = await this.prisma.project.findMany({
        where: { status: true, ...whereCondition },
        select: {
          id: true,
          dicsounted_cost: true,
          project_win_date: true,
          project_milestone: {
            select: {
              milestone_payment: true,
              payment_recieved: true,
              is_initial_amount: true,
              payment_recieved_date: true,
              id: true,
              targeted_month: true,
              invoice: true,
              invoice_date: true,
              document: true,
              created_at: true,
              delay_time: true,
              onhold: true,
            },
          },
        },
      });

      const monthlyData = Array(12)
        .fill(0)
        .map(() => ({
          achievedTarget: 0,
          initialPayments: 0,
        }));

      projects.forEach((project) => {
        let filterMilestones = project.project_milestone.filter(
          (milestone) =>
            !milestone.onhold || Object.keys(milestone.onhold).length === 0,
        );

        // filterMilestones.forEach((milestone) => {
        //   const monthIndex =
        //     milestone.invoice &&
        //     milestone.invoice_date &&
        //     !isNaN(new Date(milestone.invoice_date).getMonth()) &&
        //     new Date(milestone.invoice_date).getMonth();

        //   if (monthIndex > -1 && monthIndex <= 11) {
        //     if (milestone?.is_initial_amount) {
        //       monthlyData[monthIndex].initialPayments +=
        //         milestone.milestone_payment || 0;
        //     }
        //   }
        // });

        filterMilestones.forEach((milestone) => {
          if (milestone.invoice && milestone.invoice_date) {
            const monthIndex = new Date(milestone.invoice_date).getMonth();
            if (!isNaN(monthIndex) && monthIndex >= 0 && monthIndex <= 11) {
              if (milestone?.is_initial_amount) {
                monthlyData[monthIndex].initialPayments +=
                  milestone.milestone_payment || 0;
              }
            }
          }
        });

        const monthIndex = new Date(project?.project_win_date).getMonth();
        if (monthIndex >= 0 && monthIndex <= 11) {
          monthlyData[monthIndex].achievedTarget +=
            project.dicsounted_cost || 0;
        }
      });

      return handleSuccessResponse('Success', HttpStatus.OK, {
        salesTarget: Array(12).fill(salesTarget),
        achievedTarget: monthlyData.map((m) => m?.achievedTarget),
        initialPayments: monthlyData.map((m) => m?.initialPayments),
      });
    } catch (error) {
      throw new Error(error.message || 'An error occurred');
    }
  }

  async projectRecord() {
    try {
      const allProjects = await this.prisma.project.findMany({
        select: {
          name: true,
          dicsounted_cost: true,
          created_at: true,
          projectDivision: {
            select: { id: true, name: true },
          },
          project_contract_type: {
            select: { name: true },
          },
          project_manager_details: true,
          client_details: true,
          task: {
            where: {
              allocation: {
                some: {},
              },
            },
            select: {
              allocation: {
                select: {
                  resource: {
                    select: {
                      name: true,
                      department: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                  task_hours: true,
                },
              },
            },
          },
          project_categories: true,
          project_technology: true,
          project_industry: true,
        },
        where: {
          created_at: {
            gte: new Date('2024-01-01'),
            lte: new Date('2025-12-31T23:59:59.999Z'),
          },
        },
      });

      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();

      const grouped = {
        '2024 Projects': allProjects.filter(
          (p) => new Date(p.created_at).getFullYear() === 2024,
        ),
        '2025 Projects': allProjects.filter(
          (p) => new Date(p.created_at).getFullYear() === 2025,
        ),
      };

      for (const [sheetName, projects] of Object.entries(grouped)) {
        const sheet = workbook.addWorksheet(sheetName);

        sheet.columns = [
          { header: '#', key: 'serial', width: 5 },
          { header: 'Project Name', key: 'project_name', width: 30 },
          { header: 'Cost', key: 'cost', width: 15 },
          { header: 'Division', key: 'division', width: 20 },
          { header: 'Contract Type', key: 'contract', width: 20 },
          { header: 'Project Managers', key: 'managers', width: 40 },
          { header: 'Clients', key: 'clients', width: 45 },
          { header: 'Resource Name', key: 'resource_name', width: 30 },
          { header: 'Department', key: 'department', width: 25 },
          { header: 'Total Hours', key: 'task_hours', width: 15 },
          { header: 'Categories', key: 'categories', width: 30 },
          { header: 'Technologies', key: 'technologies', width: 30 },
          { header: 'Industries', key: 'industries', width: 30 },
        ];

        sheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' },
          };
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        let currentRow = 2;
        let projectCount = 1;

        for (const project of projects) {
          const resourceMap = new Map();

          for (const task of project.task) {
            for (const allocation of task.allocation) {
              const name = allocation.resource.name;
              const dept = allocation.resource.department?.name || '';
              const key = `${name}-${dept}`;
              const prev = resourceMap.get(key);
              const hours =
                (prev?.task_hours || 0) + (allocation.task_hours || 0);

              resourceMap.set(key, {
                name,
                department: dept,
                task_hours: hours,
              });
            }
          }

          const sortedResources = Array.from(resourceMap.values())
            .filter((r) => r.task_hours > 0)
            .sort((a, b) => a.department.localeCompare(b.department));

          if (sortedResources.length === 0) continue;

          const startRow = currentRow;

          const managerStr = Array.isArray(project.project_manager_details)
            ? project.project_manager_details
                .map((m: any) => m?.name)
                .join(', ')
            : '';

          const clientStr = Array.isArray(project.client_details)
            ? project.client_details
                .map(
                  (c: any) =>
                    `name  : ${c?.name || ''}\nphone : ${
                      c?.number || ''
                    }\nemail : ${c?.email || ''}`,
                )
                .join('\n\n')
            : '';

          const categoriesStr = Array.isArray(project.project_categories)
            ? project.project_categories.map((x: any) => x?.name).join(', ')
            : '';

          const technologiesStr = Array.isArray(project.project_technology)
            ? project.project_technology.map((x: any) => x?.name).join(', ')
            : '';

          const industriesStr = Array.isArray(project.project_industry)
            ? project.project_industry.map((x: any) => x?.name).join(', ')
            : '';

          const divisionName = project.projectDivision?.name || '';
          const contractName = project.project_contract_type?.name || '';

          for (const res of sortedResources) {
            sheet.addRow([
              '', // serial filled after
              project.name,
              project.dicsounted_cost,
              divisionName,
              contractName,
              managerStr,
              clientStr,
              res.name,
              res.department,
              res.task_hours,
              categoriesStr,
              technologiesStr,
              industriesStr,
            ]);
            currentRow++;
          }

          const endRow = currentRow - 1;
          if (endRow > startRow) {
            sheet.mergeCells(`A${startRow}:A${endRow}`);
            sheet.mergeCells(`B${startRow}:B${endRow}`);
            sheet.mergeCells(`C${startRow}:C${endRow}`);
            sheet.mergeCells(`D${startRow}:D${endRow}`);
            sheet.mergeCells(`E${startRow}:E${endRow}`);
            sheet.mergeCells(`F${startRow}:F${endRow}`);
            sheet.mergeCells(`G${startRow}:G${endRow}`);
            sheet.mergeCells(`H${startRow}:H${endRow}`);
            sheet.mergeCells(`I${startRow}:I${endRow}`);
            sheet.mergeCells(`J${startRow}:J${endRow}`);
          }

          sheet.getCell(`A${startRow}`).value = projectCount++;
        }

        for (let i = 2; i < currentRow; i++) {
          sheet.getRow(i).eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' },
            };
            cell.alignment = { vertical: 'middle', wrapText: true };
          });
        }
      }

      const filePath = './project_report_2024_2025.xlsx';
      await workbook.xlsx.writeFile(filePath);

      return {
        message: 'Excel file with 2024 & 2025 projects created successfully',
        filePath,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to generate report');
    }
  }

  async createDefaultStatusForProjects(): Promise<void> {
    const projects = await this.prisma.project.findMany();

    for (const project of projects) {
      const existingStatus = await this.prisma.project_status.findFirst({
        where: {
          project_id: project.id,
        },
      });

      if (!existingStatus) {
        await this.prisma.project_status.create({
          data: {
            project_id: project.id,
            project_status_category_id: '64bf9678f3e4fc1400502104',
            porject_statuses_id: '6780d20a919f949fe14ab737',
            user_id: '64c763015a488350a2c2ec52',
            comment: 'N/A',
          },
        });
      }
    }
  }
}

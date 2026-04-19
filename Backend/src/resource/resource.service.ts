import {
  Injectable,
  HttpStatus,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleSuccessResponse, handlePrismaError } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';

@Injectable()
export class ResourceService {
  constructor(private prisma: PrismaService) {}
  async create(createResourceDto: CreateResourceDto) {
    try {
      const resource = this.prisma.resource.create({
        data: createResourceDto,
      });
      return handleSuccessResponse(
        'Resource Created Successfull',
        HttpStatus.CREATED,
        resource,
      );
    } catch (err) {
      return handlePrismaError(err);
    }
  }

  async findAll(query: any, request: any) {
    try {
      const user = request?.user;

      if (
        [
          'Super Admin',
          'Human Resource',
          'Project Manager',
          'Human Resource Operations',
        ]?.includes(user?.role?.name)
      ) {
        const resources = await this.prisma.resource.findMany({
          where: {
            status: true,
            // is_team_lead: false,
            department_id: query?.department_id ?? {},
            show_in_calendar: true,
          },
          include: {
            department: true,
            designation : true,
            user: { select: { id: true, email: true } },
          },
        });
        return handleSuccessResponse(
          'Fetch successfully',
          HttpStatus.OK,
          resources,
        );
      } else if (user?.role?.name == 'PM Lead') {
        const resource_lead = await this.prisma.resource.findFirst({
          where: { id: user?.resource_id, is_team_lead: true, status: true },
        });
        if (resource_lead) {
          const resources = await this.prisma.resource.findMany({
            where: {
              status: true,
              department_id: resource_lead.department_id,
            },
            include: {
              department: true,
              designation : true,
              user: { select: { id: true, email: true } },
            },
          });
          return handleSuccessResponse(
            'Fetch successfully',
            HttpStatus.OK,
            resources,
          );
        } else {
          const resources = await this.prisma.resource.findFirst({
            where: { id: user?.resource_id, status: true },
          });
        }
      } else {
        const resource_lead = await this.prisma.resource.findFirst({
          where: { id: user?.resource_id, is_team_lead: true, status: true },
        });

        if (resource_lead) {
          const resources = await this.prisma.resource.findMany({
            where: {
              status: true,
              department_id: resource_lead?.department_id,
            },
            include: {
              department: true,
              designation : true,
              user: { select: { id: true, email: true } },
            },
          });
          return handleSuccessResponse(
            'Fetch successfully',
            HttpStatus.OK,
            resources,
          );
        } else {
          const resources = await this.prisma.resource.findMany({
            where: { id: user?.resource_id, status: true },
            include: {
              department: true,
              designation : true,
              user: { select: { id: true, email: true } },
            },
          });

          return handleSuccessResponse(
            'Fetch successfully',
            HttpStatus.OK,
            resources,
          );
        }
      }
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async resourceAll() {
    try {
      const resources = await this.prisma.resource.findMany({
        where: {
          status: true,
        },
        include: {
          department: true,
          designation : true,
          capacity : true,
          rate : true,
          user: { select: { id: true, email: true, employement_code: true } },
        },
        orderBy: {
          name: 'asc',
        },
      });

      return handleSuccessResponse('', HttpStatus.OK, resources);
    } catch (error) {
      return error;
    }
  }

  async findOne(id: string) {
    try {
      const resource = await this.prisma.resource.findFirst({
        where: { id: id },
        include: { department: true, user: true },
      });

      return handleSuccessResponse('', HttpStatus.OK, resource);
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async update(id: string, updateResourceDto: UpdateResourceDto) {
    try {
      const existingRecrod = await this.prisma.resource.findFirst({
        where: { id: id },
        include: { user: true },
      });

      const resource = await this.prisma.resource.update({
        where: { id: id },
        data: updateResourceDto,
      });

      if (!existingRecrod?.is_team_lead && updateResourceDto.is_team_lead) {
        const prevTeamLead = await this.prisma.resource.findFirst({
          where: {
            department_id: resource.department_id,
            is_team_lead: true,
            id: {
              not: resource.id,
            },
          },
          include: {
            user: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        });

        if (
          prevTeamLead &&
          existingRecrod?.user?.length > 0 &&
          existingRecrod?.user[0]?.id
        ) {
          const projectPermissions =
            await this.prisma.project_permissions.findMany({
              where: {
                user_id: prevTeamLead?.user?.[0]?.id,
              },
            });

          if (projectPermissions?.length > 0) {
            const existingPermissions =
              await this.prisma.project_permissions.findMany({
                where: {
                  user_id: existingRecrod.user[0].id,
                  project_id: {
                    in: projectPermissions.map((perm) => perm.project_id),
                  },
                },
                select: {
                  project_id: true,
                },
              });

            const existingProjectIds = new Set(
              existingPermissions.map((perm) => perm.project_id),
            );

            const newPermissions = projectPermissions
              .filter((perm) => !existingProjectIds.has(perm.project_id))
              .map((perm) => ({
                user_id: existingRecrod.user[0].id,
                project_id: perm.project_id,
                super: perm.super,
              }));

            if (newPermissions.length > 0) {
              await this.prisma.project_permissions.createMany({
                data: newPermissions,
              });
            }
          }

          const taskPermissions = await this.prisma.task_permission.findMany({
            where: {
              user_id: prevTeamLead?.user?.[0]?.id,
            },
          });
          if (taskPermissions?.length > 0) {
            const existingPermissions =
              await this.prisma.task_permission.findMany({
                where: {
                  user_id: existingRecrod.user[0].id,
                  task_id: {
                    in: taskPermissions.map((perm) => perm.task_id),
                  },
                },
                select: {
                  task_id: true,
                },
              });

            const existingTaskIds = new Set(
              existingPermissions.map((perm) => perm.task_id),
            );

            const newPermissions = taskPermissions
              .filter((perm) => !existingTaskIds.has(perm.task_id))
              .map((perm) => ({
                user_id: existingRecrod.user[0].id,
                task_id: perm.task_id,
                super: perm.super,
              }));

            if (newPermissions.length > 0) {
              await this.prisma.task_permission.createMany({
                data: newPermissions,
              });
            }
          }
        }
      }

      return handleSuccessResponse('', HttpStatus.OK, resource);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      const resource = await this.prisma.resource.update({
        where: { id: id },
        data: {
          status: false,
        },
      });

      return handleSuccessResponse('', HttpStatus.OK, 'Deleted Successfully');
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getForListing(query: any) {
    try {
      const regex =
        /^\s*(id|created_at|updated_at|name|is_team_lead)\s+(asc|desc)\s*$/i;
      const match = query?.$orderby?.match(regex);

      let column: any;
      let value;

      if (match) {
        column = match[1]; // "created_at"
        value = match[2]; // "desc"
      } else {
        column = 'id';
        value = 'desc';
      }

      let where = {};
      const obj = [];
      const filter = parseData(query?.$filter, obj);

      if (filter && typeof filter !== 'undefined' && filter.length > 0) {
        filter.forEach((filter) => {
          if (filter) {
            if (filter.columnName == 'department') {
              where = {
                ...where,
                [filter.columnName]: {
                  name: {
                    [filter.filter]: filter?.value?.contains,
                    mode: 'insensitive',
                  },
                },
              };
            } else {
              where = {
                ...where,
                [filter.columnName]: {
                  [filter.filter]: filter?.value?.contains,
                  mode: 'insensitive',
                },
              };
            }
          }
        });
      }

      const resource = await this.prisma.resource.findMany({
        select: {
          id: true,
          name: true,
          is_team_lead: true,
          department: { select: { id: true, name: true } },
          designation: { select: { id: true, name: true } },
          created_at: true,
          updated_at: true,
          status: true,
        },
        orderBy: {
          [column]: value,
        },
        take: +query?.$top,
        skip: +query?.$skip,
        where,
      });

      const count = await this.prisma.resource.count();

      const res = {
        rows: resource,
        count: count,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getDepartmentWise(request: any, param) {
    try {
      const resource_id = request?.user?.resource_id;

      if (param?.departmentId) {
        const allResource = await this.prisma.resource.findMany({
          where: {
            department_id: param?.departmentId,
            status: true,
          },
          select: {
            id: true,
            name: true,
            department: { select: { id: true, name: true } },
            is_team_lead: true,
            user: {
              select: {
                id: true,
                email: true,
                picture: true,
                designation: true,
                employement_code: true,
              },
              take: 1,
            },
          },
        });

        const formattedResources = allResource?.map((resource) => ({
          ...resource,
          user: resource?.user[0] || null,
        }));

        return handleSuccessResponse('', HttpStatus.OK, formattedResources);
      }

      const resource = await this.prisma.resource.findFirst({
        where: { id: resource_id, is_team_lead: true, status: true },
      });

      if (resource) {
        const allResource = await this.prisma.resource.findMany({
          where: {
            department_id: resource.department_id,
            status: true,
          },
          select: {
            id: true,
            name: true,
            department: { select: { id: true, name: true } },
            is_team_lead: true,
            user: {
              select: {
                id: true,
                email: true,
                picture: true,
                designation: true,
              },
              take: 1,
            },
          },
        });

        const formattedResources = allResource?.map((resource) => ({
          ...resource,
          user: resource?.user[0] || null,
        }));

        return handleSuccessResponse('', HttpStatus.OK, formattedResources);
      } else {
        throw new UnauthorizedException();
      }
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async count() {
    try {
      const count = await this.prisma.resource.count({
        where: { status: true },
      });
      return handleSuccessResponse('', HttpStatus.OK, count);
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async resourceUtilization(req: any) {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const reqStartMonth = Number(req?.startmonth);
      const reqEndMonth = Number(req?.endtmonth);

      const startDate = new Date(currentYear, reqStartMonth - 1, 1);
      const endDate =
        reqEndMonth === currentMonth
          ? new Date()
          : new Date(currentYear, reqEndMonth, 0);

      const [holidays, users] = await Promise.all([
        this.prisma.holidays.findMany({
          where: {
            date: {
              gte: startDate,
              lt: endDate,
            },
          },
        }),
        this.prisma.user.findMany({
          where: {
            employement_code: { not: null },
            user_details: {
              some: { resignation_status: false },
            },
            resource: {
              show_in_calendar: true,
              ...(req?.department_id && { department_id: req?.department_id }),
            },
            ...(req?.resource_id && { resource_id: req?.resource_id }),
          },
          select: {
            id: true,
            name: true,
            email: true,
            employement_code: true,
            user_details: {
              select: {
                date_of_joining: true,
                resignation_status: true,
              },
            },
            resource: {
              select: {
                department: {
                  select: { name: true },
                },
                per_date_allocation: {
                  where: {
                    date: {
                      gte: startDate,
                      lte: endDate,
                    },
                    status: true,
                  },
                  select: {
                    task_hours: true,
                    date: true,
                  },
                },
              },
            },
            emp_attendance: {
              where: {
                created_at: {
                  gte: startDate,
                  lte: endDate,
                },
                is_leave: true,
                leave_status: 'On-Leave',
              },
              select: {
                created_at: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        }),
      ]);

      const holidayHours = holidays.length * 8;

      const ramadanPeriods = {
        2024: { start: new Date('2024-03-11'), end: new Date('2024-04-09') },
        2025: { start: new Date('2025-03-01'), end: new Date('2025-03-30') },
        2026: { start: new Date('2026-02-18'), end: new Date('2026-03-19') },
      };

      const processedUsers = users.map((user) => {
        const joiningDate = user.user_details[0]?.date_of_joining
          ? new Date(user.user_details[0].date_of_joining)
          : startDate;

        const effectiveStartDate =
          joiningDate > startDate ? joiningDate : startDate;

        const leaveDates = new Set(
          user.emp_attendance.map(
            (a) => new Date(a.created_at).toISOString().split('T')[0],
          ),
        );

        let totalHours = 0;
        let workingLeaveHours = 0;
        let current = new Date(effectiveStartDate);

        while (current <= endDate) {
          const day = current.getDay();
          if (day !== 0 && day !== 6) {
            const dateStr = current.toISOString().split('T')[0];
            const year = current.getFullYear();
            const isRamadan =
              ramadanPeriods[year] &&
              current >= ramadanPeriods[year].start &&
              current <= ramadanPeriods[year].end;
            const hoursPerDay = isRamadan ? 6 : 8;

            if (leaveDates.has(dateStr)) {
              workingLeaveHours += hoursPerDay;
            } else {
              totalHours += hoursPerDay;
            }
          }
          current.setDate(current.getDate() + 1);
        }

        const taskHours = user.resource.per_date_allocation.reduce(
          (sum, t) => sum + (t.task_hours || 0),
          0,
        );

        const workingHours = Math.max(totalHours - holidayHours, 0);

        return {
          ...user,
          workingHours,
          per_date_allocation_count: taskHours,
          emp_leaves_count: leaveDates.size,
          resourceUtilization:
            workingHours > 0
              ? ((taskHours / workingHours) * 100).toFixed(2)
              : '0.00',
        };
      });

      return handleSuccessResponse('', 200, {
        users: processedUsers,
        holidayHours,
      });
    } catch (error) {
      console.error('resourceUtilization error:', error);
      return handlePrismaError(error);
    }
  }

  async resourceUtilization1(req: any) {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const reqStartMonth = Number(req?.startmonth);
      const reqEndMonth = Number(req?.endtmonth);

      const startDate = new Date(currentYear, reqStartMonth - 1, 1);
      const endDate =
        reqEndMonth === currentMonth
          ? new Date()
          : new Date(currentYear, reqEndMonth, 0);

      let holidayHours = 0;

      const holidays = await this.prisma.holidays.findMany({
        where: {
          date: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      holidays.forEach((day: any) => {
        const date = new Date(day.date);
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          holidayHours += 8;
        }
      });

      const whereClause = {
        employement_code: { not: null },
        user_details: {
          some: { resignation_status: false },
        },
        resource: {
          show_in_calendar: true,
        },
      };

      if (req?.department_id) {
        whereClause.resource['department_id'] = req?.department_id;
      }

      if (req?.resource_id) {
        whereClause['resource_id'] = req?.resource_id;
      }

      const users = await this.prisma.user.findMany({
        where: whereClause,
        select: {
          employement_code: true,
          id: true,
          name: true,
          email: true,
          user_details: true,
          resource: {
            select: {
              per_date_allocation: {
                where: {
                  date: {
                    gte: startDate,
                    lte: endDate,
                  },
                  status: true,
                },
              },
              department: {
                select: { name: true },
              },
            },
          },
          emp_attendance: {
            where: {
              created_at: {
                gte: startDate,
                lte: endDate,
              },
              is_leave: true,
              leave_status: 'On-Leave',
            },
            select: {
              created_at: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      const ramadanPeriods: { [year: number]: { start: string; end: string } } =
        {
          2024: { start: '2024-03-11', end: '2024-04-09' },
          2025: { start: '2025-03-01', end: '2025-03-30' },
          2026: { start: '2026-02-18', end: '2026-03-19' },
        };

      const processedUsers = users.map((user: any) => {
        const joiningDate = new Date(user?.user_details?.[0]?.date_of_joining);
        const loopStartDate = new Date(
          Math.max(startDate.getTime(), joiningDate.getTime()),
        );

        let totalHours = 0;
        let workingLeaveHours = 0;

        // Get all leave dates from emp_attendance
        const leaveDates = user.emp_attendance.map(
          (attendance) =>
            new Date(attendance.created_at).toISOString().split('T')[0],
        );

        for (
          let date = new Date(loopStartDate);
          date <= endDate;
          date.setDate(date.getDate() + 1)
        ) {
          const dayOfWeek = date.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const dateStr = date.toISOString().split('T')[0];
            const isLeaveDay = leaveDates.includes(dateStr);

            if (isLeaveDay) {
              const isRamadan =
                ramadanPeriods[date.getFullYear()] &&
                date >= new Date(ramadanPeriods[date.getFullYear()].start) &&
                date <= new Date(ramadanPeriods[date.getFullYear()].end);
              workingLeaveHours += isRamadan ? 6 : 8;
            } else {
              const isRamadan =
                ramadanPeriods[date.getFullYear()] &&
                date >= new Date(ramadanPeriods[date.getFullYear()].start) &&
                date <= new Date(ramadanPeriods[date.getFullYear()].end);
              totalHours += isRamadan ? 6 : 8;
            }
          }
        }

        const taskHours = user.resource.per_date_allocation.reduce(
          (sum, t) => sum + t.task_hours,
          0,
        );

        // Subtract both holiday hours and working leave hours from total hours
        user.workingHours = Math.max(
          totalHours - holidayHours - workingLeaveHours,
          0,
        );
        user.per_date_allocation_count = taskHours;
        user.emp_leaves_count = leaveDates.length; // Count of leave days
        user.resourceUtilization =
          user.workingHours > 0
            ? ((taskHours / user.workingHours) * 100).toFixed(2)
            : '0.00';

        return user;
      });

      return handleSuccessResponse('', 200, {
        users: processedUsers,
        holidayHours,
      });
    } catch (error) {
      console.error('resourceUtilization error:', error);
      return handlePrismaError(error);
    }
  }

  async getResources(query: any, request: any) {
    try {
      const user = request?.user;

      if (
        user?.role?.name == 'Super Admin' ||
        user?.role?.name == 'Human Resource' ||
        user?.role?.name == 'Human Resource Operations'
      ) {
        const resource = await this.prisma.resource.findMany({
          where: {
            status: true,
            department_id: query?.department_id ?? {},
            name: query?.name ?? {},
          },
          select: {
            id: true,
            name: true,
            department: { select: { id: true, name: true } },
            is_team_lead: true,
            show_in_calendar: true,
            user: {
              select: {
                id: true,
                email: true,
                picture: true,
                designation: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        });

        return handleSuccessResponse('', 200, resource);
      }

      throw new HttpException('Permission denied', HttpStatus.FORBIDDEN);
    } catch (error) {
      return error;
    }
  }

  async multipleUpdate(dto: any) {
    try {
      const resource = await this.prisma.resource.updateMany({
        where: { id: { in: dto.ids } },
        data: {
          show_in_calendar: dto.show_in_calendar,
        },
      });

      return handleSuccessResponse('', HttpStatus.OK, resource);
    } catch (error) {
      handlePrismaError(error);
    }
  }
  async departmentResource(query: any, param) {
    try {
      const resources = await this.prisma.resource.findMany({
        where: {
          status: true,
          department_id: query?.departmentId,
        },
        include: {
          department: true,
          user: { select: { id: true, email: true, employement_code: true } },
        },
        orderBy: {
          name: 'asc',
        },
      });

      return handleSuccessResponse('', HttpStatus.OK, resources);
    } catch (error) {
      return error;
    }
  }

  async getFilteredResources(request: any) {
    try {
      const userRole = request?.user?.role?.name;
      const isSuperAdminOrHR =
        userRole === 'Super Admin' ||
        userRole === 'Human Resource' ||
        userRole === 'Human Resource Operations' ||
        userRole === 'PM Lead';

      let where: any = { status: true };

      if (!isSuperAdminOrHR) {
        const selfResource = await this.prisma.resource.findFirst({
          where: {
            id: request?.user?.resource_id,
            status: true,
          },
          include: { department: true },
        });

        if (!selfResource) {
          return handleSuccessResponse('No resource found', 200, []);
        }

        if (selfResource.is_team_lead) {
          where.department_id = selfResource.department_id;
        } else {
          where.id = selfResource.id; // regular resource: return only self
        }
      }

      const resources = await this.prisma.resource.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      return handleSuccessResponse('', 200, resources);
    } catch (error) {
      console.error('getFilteredResources error', error);
      return error;
    }
  }

  async getAllDesignations() {
    try {
      const designations = await this.prisma.designation.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });

      return handleSuccessResponse(
        'Designations fetched successfully',
        HttpStatus.OK,
        designations,
      );
    } catch (err) {
      return handlePrismaError(err);
    }
  }

  async getAllCapacities() {
    try {
      const capacities = await this.prisma.capacity.findMany({
        select: { id: true, value: true },
        orderBy: { value: 'desc' },
      });

      return handleSuccessResponse(
        'Capacities fetched successfully',
        HttpStatus.OK,
        capacities,
      );
    } catch (err) {
      return handlePrismaError(err);
    }
  }

  async getAllRates() {
    try {
      const rates = await this.prisma.rate.findMany({
        select: { id: true, value: true },
        orderBy: { value: 'desc' },
      });

      return handleSuccessResponse(
        'Rates fetched successfully',
        HttpStatus.OK,
        rates,
      );
    } catch (err) {
      return handlePrismaError(err);
    }
  }

  async updateResource(id: string, updateResourceDto: any) {
    try {
      const resource = await this.prisma.resource.update({
        where: { id },
        data: {
          designation_id: updateResourceDto.designation_id,
          capacity_id: updateResourceDto.capacity_id,
          rate_id: updateResourceDto.rate_id,
        },
        include: {
          designation: true,
          capacity: true,
          rate: true,
          department: true,
        },
      });

      return handleSuccessResponse(
        'Resource updated successfully',
        HttpStatus.OK,
        resource,
      );
    } catch (err) {
      return handlePrismaError(err);
    }
  }
}

import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskHoursDto } from './dto/get-task-hours.dto';
import { parseData } from 'src/utils/parseFilters';
import {
  replacePlaceholders,
  sendEmail,
  sendNotification,
} from 'src/utils/helper';
import { CreateNotificationDto } from 'src/notification/dto/create-notificatio.dto';
import * as moment from 'moment';
import { TemporaryDisableUserAllocationDto } from './dto/TemporaryDisableUserAllocationDto';
import {
  getFilteredTasksCountNativeMongo,
  getFilteredTasksNativeMongo,
} from 'src/utils/quries';
import { ObjectId } from 'mongodb';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateTaskDto, request: any) {
    try {
      // const consumedHours = await this.prisma.project_consumed_hours.findFirst({
      //   where: {
      //     department_id: dto.department_id,
      //     project_id: dto.project_id,
      //   },
      // });

      const task = await this.prisma.task.create({
        data: {
          project_id: dto.project_id,
          task_category_id: dto.task_category_id,
          name: dto.name,
          department: dto.department,
          completion_date: dto.completion_date,
          attachment: dto.attachment,
          description: dto.description,
        },
      });

      if (task?.id && task.project_id) {
        const project: any = await this.prisma.project.findFirst({
          where: { id: task.project_id },
          select: { id: true, project_manager_details: true },
        });

        for (const p of project?.project_manager_details) {
          await this.prisma.task_permission.createMany({
            data: {
              super: false,
              task_id: task.id,
              user_id: p?.id,
            },
          });
        }
      }

      if (dto?.department?.length > 0) {
        const resource = await this.prisma.resource.findMany({
          where: {
            department_id: { in: dto?.department?.map((x) => x.id) },
            is_team_lead: true,
            status: true,
          },
        });

        if (resource?.length > 0) {
          const users = await this.prisma.user.findMany({
            where: { resource_id: { in: resource?.map((x) => x.id) } },
          });

          if (users?.length > 0) {
            const task_permission =
              await this.prisma.task_permission.createMany({
                data: users.map((x) => ({
                  super: x.super ? true : false,
                  task_id: task?.id,
                  user_id: x.id,
                })),
              });

            const project_permission =
              await this.prisma.project_permissions.createMany({
                data: users.map((x) => ({
                  super: x.super ? true : false,
                  project_id: dto.project_id,
                  user_id: x.id,
                })),
              });

            const project = await this.prisma.project.findFirst({
              where: { id: dto.project_id },
              select: { id: true, name: true },
            });
            const userids = [];
            for (const user of users) {
              const replacements = {
                replaceHeader: 'System generated mail',
                replaceUserName: user.name,
                message: `The Project Manager has assigned new tasks for the project <a href = ${`https://portal.demoz.agency/allocation/create?uuid=${task.id}`}>${
                  project.name
                }</a>. As you are designated as the lead for the assigned tasks, you can now proceed to select the tasks and allocate them to the appropriate resources within your team. Your effective delegation and oversight will be crucial in ensuring the timely and successful completion of the project.
                  <br><br>
                  Thank you for your dedication and contribution to the project's success.
                  `,
              };

              const template = replacePlaceholders(replacements);

              try {
                const email = await sendEmail(
                  user.email,
                  `${project.name} : New Project Task Assignment: Action Required`,
                  template,
                );
                userids.push(user.id);
              } catch (error) {
                return error?.message;
              }
            }
            const notification: CreateNotificationDto = {
              title: 'Task Assigned',
              message: `The Project Manager has assigned new tasks for the project ${project.name}. Please allocate them to appropriate resources within your team.`,
              reciever_ids: userids,
              created_by: request?.user?.id,
              link: `/allocation/create?uuid=${task.id}`,
            };
            try {
              const sendNotification1 = await sendNotification(notification);
            } catch (error) {
              return error?.message;
            }
          }
        }
      }

      // if (consumedHours?.id) {
      //   await this.prisma.project_consumed_hours.update({
      //     data: {
      //       consumed_hours:
      //         consumedHours.consumed_hours + createTaskDto.task_hours,
      //     },
      //     where: { id: consumedHours.id },
      //   });
      // } else {
      //   await this.prisma.project_consumed_hours.create({
      //     data: {
      //       project_id: createTaskDto.project_id,
      //       department_id: createTaskDto.department_id,
      //       consumed_hours: createTaskDto.task_hours,
      //     },
      //   });
      // }

      return handleSuccessResponse(
        'Task Created Successfull',
        HttpStatus.CREATED,
        task,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findAll(query: any) {
    try {

      const userId = query?.user_id;
      const permissions = await this.prisma.task_permission.findMany({
        where: { user_id: query?.user_id },
      });

      if (!permissions?.length) {
        return handleSuccessResponse('', HttpStatus.OK, { rows: [], count: 0 });
      }

      const hasSuperPermission = permissions.some((p) => p.super);

      const filters = parseData(query?.$filter, []);

      let where: any = {};
      let resourceFilterId: ObjectId | undefined;

      if (Array.isArray(filters)) {
        for (const f of filters) {
          if (!f) continue;
          const { columnName, value } = f;
          const val = value?.contains;

          if (!val) continue;

          switch (columnName) {
            case 'where':
              Object.assign(where, val);
              break;

            case 'created_at':
            case 'completion_date':
            case 'actual_completion_date': {
              const raw = val;
              if (typeof raw === 'string') {
                const cleaned = raw.replace(/ (\d{2}:\d{2})$/, '+$1');
                const baseDate = new Date(cleaned);

                if (!isNaN(baseDate.getTime())) {
                  const startOfDay = new Date(baseDate);
                  startOfDay.setHours(0, 0, 0, 0);

                  const endOfDay = new Date(baseDate);
                  endOfDay.setHours(23, 59, 59, 999);

                  where[columnName] = {
                    $gte: startOfDay,
                    $lt: endOfDay,
                  };
                }
              }
              break;
            }

            case 'name':
              where[columnName] = {
                $regex: val,
                $options: 'i',
              };
              break;

            case 'project_manager':
              where['project.project_manager_details'] = {
                $elemMatch: {
                  name: { $regex: val, $options: 'i' },
                },
              };
              break;

            case 'department':
              where['department'] = {
                $elemMatch: {
                  id: val, // ✅ string, NOT ObjectId
                },
              };
              break;

            case 'project_name':
              where['project.name'] = {
                $regex: val,
                $options: 'i',
              };
              break;

            case 'resource':
              try {
                resourceFilterId = new ObjectId(val);
              } catch {
                // ignore if invalid
              }
              break;

            default:
              // fallback: treat as string match on "columnName.name"
              where[`${columnName}.name`] = {
                $regex: val,
                $options: 'i',
              };
              break;
          }
        }
      }

      const taskIds = hasSuperPermission
        ? undefined
        : permissions.map((p) => p.task_id);

      let tasks_count: any = await getFilteredTasksNativeMongo({
        taskIds: taskIds,
        where,
        skip: +query?.$skip || 0,
        limit: +query?.$top || 50,
        resourceId: resourceFilterId,
        userId
      });

      let tasks: any[] = tasks_count?.data || [];

      if (tasks?.length == 0) {
        return handleSuccessResponse('Fetch successfully', HttpStatus.OK, {
          rows: [],
          count: 0,
        });
      }

      const enrichedTasks = tasks?.map((task) => {
        const departmentId = task.department?.[0]?.id;

        const totalHours =
          task.project.project_hours
            ?.filter((ph) => ph.department_id === departmentId)
            ?.reduce((sum, ph) => sum + ph.hours, 0) || 0;

        const consumedHours =
          task.project.project_consumed_hours
            ?.filter((pch) => pch.department.id === departmentId)
            ?.reduce((sum, pch) => sum + pch.consumed_hours, 0) || 0;

        const remainingHours = totalHours - consumedHours;

        return {
          ...task,
          project: {
            ...task.project,
            project_consumed_hours: task.project.project_consumed_hours?.filter(
              (h) => h.department_id === departmentId,
            ),
            total_hours: totalHours,
            consumed_hours: consumedHours,
            remaining_hours: remainingHours,
          },
        };
      });

      const allocationCounts = await Promise.all(
        enrichedTasks.map((task) =>
          this.prisma.allocation
            .count({
              where: { task_id: task.id, status: true },
            })
            .then((count) => ({ task_id: task.id, count })),
        ),
      );

      const tasksWithAllocations = enrichedTasks?.map((task) => {
        const count =
          allocationCounts.find((c) => c.task_id === task.id)?.count || 0;
        const allocation_status = task.actual_completion_date
          ? 'Completed'
          : count > 0
          ? 'Assigned'
          : 'Unassigned';

        return { ...task, allocation_status };
      });

      const sortedTasks = tasksWithAllocations?.sort((a, b) => {
        const order = { Unassigned: 1, Assigned: 2, Completed: 3 };
        return order[a.allocation_status] - order[b.allocation_status];
      });

      return handleSuccessResponse('Fetch successfully', HttpStatus.OK, {
        rows: sortedTasks,
        count:
          sortedTasks?.length == 50 ? tasks_count?.count : sortedTasks?.length,
      });
    } catch (err) {
      return handlePrismaError(err);
    }
  }

  async findOne(id: string, request: any) {
    try {
      const permission = await this.prisma.task_permission.findFirst({
        where: {
          OR: [
            { user_id: request?.user?.id, super: true },
            { user_id: request?.user?.id, task_id: id },
          ],
        },
      });
      if (!permission && request?.user?.role?.name != 'Super Admin') {
        throw new UnauthorizedException();
      }
      const task = await this.prisma.task.findFirst({
        where: { id: id },
        select: {
          id: true,
          // department: { select: { id: true, name: true } },
          department: true,
          // resource: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          task_category: { select: { id: true, name: true } },
          name: true,
          completion_date: true,
          attachment: true,
          description: true,
          // url: true,
          // start_date: true,
          // end_date: true,
          // task_hours: true,
          task_status: { select: { id: true, name: true } },
        },
      });

      return handleSuccessResponse('', HttpStatus.OK, task);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async taskDetails(id: string, request: any) {
    try {
      const resource_id = request?.user?.resource_id;
      let task: any = [];

      task = await this.prisma.task.findFirst({
        where: { id: id, status: true },
        select: {
          id: true,
          department: true,
          project: { select: { id: true, name: true } },
          task_category: { select: { id: true, name: true } },
          name: true,
          completion_date: true,
          attachment: true,
          description: true,
          task_status: { select: { id: true, name: true } },
          created_at: true,
        },
      });

      if (task) {
        const resource = await this.prisma.resource.findFirst({
          where: { id: resource_id, status: true },
        });

        if (resource) {
          let allocation: any = await this.prisma.allocation.findMany({
            where: {
              department_id: resource.department_id,
              task_id: task?.id,
              status: true,
            },
            select: {
              id: true,
              resource: {
                select: {
                  id: true,
                  name: true,
                  user: {
                    select: { id: true, designation: true, picture: true },
                  },
                },
              },
              start_date: true,
              end_date: true,
              task_hours: true,
            },
          });

          allocation = allocation?.map((x) => ({
            ...x,
            resource: {
              ...x.resource,
              user: x?.resource?.user[0] ?? {},
            },
          }));

          // allocation =   allocation.map((resource) => ({
          //   ...resource,
          //   user: resource.user[0] || null,
          // }));

          task.allocation = allocation;

          return handleSuccessResponse('', HttpStatus.OK, task);
        } else {
          throw new UnauthorizedException();
        }
      } else {
        throw new HttpException(
          'Task does not exists!',
          HttpStatus.BAD_REQUEST,
        );
      }

      // return handleSuccessResponse('', HttpStatus.OK, []);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    try {
      // const prevTask = await this.prisma.task.findFirst({
      //   where: { id: id },
      // });
      // let taskHours = 0;

      // if (updateTaskDto.task_hours > prevTask.task_hours) {
      //   taskHours = updateTaskDto.task_hours - prevTask.task_hours;
      // }

      const task = await this.prisma.task.update({
        where: { id: id },
        data: updateTaskDto,
      });

      // if (taskHours > 0) {
      //   const consumedHours =
      //     await this.prisma.project_consumed_hours.findFirst({
      //       where: {
      //         department_id: updateTaskDto.department_id,
      //         project_id: updateTaskDto.project_id,
      //       },
      //     });

      //   if (consumedHours?.id) {
      //     await this.prisma.project_consumed_hours.update({
      //       data: {
      //         consumed_hours: consumedHours.consumed_hours + taskHours,
      //       },
      //       where: { id: consumedHours.id },
      //     });
      //   }
      // }

      return handleSuccessResponse('', HttpStatus.OK, task);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(task_id: string, request: any) {
    try {
      const allocation = await this.prisma.allocation.findFirst({
        where: { task_id: task_id },
      });

      if (allocation?.id) {
        const error = "Can't delete this task because allocations are assigned";

        return handleSuccessResponse('', 200, { error });
      }

      let gettaskPermission = await this.prisma.task_permission.findMany({
        where: { task_id: task_id },
      });

      const task = await this.prisma.task.delete({ where: { id: task_id } });

      // const task = await this.prisma.task.findFirst({ where: { id: task_id } });

      if (gettaskPermission?.length > 0) {
        const task_permission = await this.prisma.task_permission.deleteMany({
          where: { id: { in: gettaskPermission?.map((x) => x.id) } },
        });
        gettaskPermission = gettaskPermission?.filter(
          (x) => x.user_id !== request?.user?.id,
        );
        const project_permission =
          await this.prisma.project_permissions.deleteMany({
            where: {
              user_id: { in: gettaskPermission?.map((x) => x.user_id) },
              is_pm: false,
            },
          });
      }

      return handleSuccessResponse('', 200, {
        message: 'Task Deleted Successfully',
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async taskCompletion(task_id: string) {
    try {
      const currentDate = new Date();
      const task = await this.prisma.task.update({
        where: { id: task_id },
        data: { actual_completion_date: currentDate },
      });

      return handleSuccessResponse('', 200, {
        message: 'Task Completed Successfully',
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getHourDetails(dto: TaskHoursDto) {
    try {
      const projectHours = await this.prisma.project_hours.findMany({
        where: { project_id: dto.project_id, department_id: dto.department_id },
        select: {
          id: true,
          hours: true,
          project_category_hours: { select: { name: true } },
        },
      });

      const counsumedHours = await this.prisma.project_consumed_hours.findMany({
        where: {
          project_id: dto.project_id,
          department_id: dto.department_id,
        },
      });

      const res = {
        projectHours,
        counsumedHours,
      };

      return handleSuccessResponse('', HttpStatus.OK, res);
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async getTaskForCalendar(query, request: any) {
    try {
      const user = request?.user;
      const { startDate, endDate, department_id } = query;

      const commonSelect = {
        resource_id: true,
        date: true,
        task_hours: true,
        is_leave: true,
        is_holiday: true,
        allocation: {
          select: {
            id: true,
            start_date: true,
            end_date: true,
            is_overtime: true,
            is_completed: true,
            task: {
              select: {
                id: true,
                name: true,
                project: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      };

      const commonWhereDate = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };

      if (
        [
          'Super Admin',
          'Human Resource',
          'Human Resource Operations',
          'CSM'
        ]?.includes(user?.role?.name)
      ) {
        const perDateAllocations =
          await this.prisma.per_date_allocation.findMany({
            select: commonSelect,
            where: {
              ...commonWhereDate,
              resource: {
                department_id,
                show_in_calendar: true,
              },
            },
          });
        return handleSuccessResponse('', 200, perDateAllocations);
      } else if (
        [
          'Team Lead',
          'Resource',
          'Project Manager',
          'Associate Creative Director',
        ]?.includes(user?.role?.name)
      ) {
        const taskPermissions = await this.prisma.task_permission.findMany({
          where: { user_id: user?.id },
        });

        const perDateAllocations =
          await this.prisma.per_date_allocation.findMany({
            select: commonSelect,
            where: {
              ...commonWhereDate,
              OR: [
                {
                  allocation: {
                    task_id: {
                      in: taskPermissions.map((x) => x.task_id),
                    },
                  },
                },
                { is_leave: true },
                { is_holiday: true },
              ],
            },
          });
        return handleSuccessResponse('', 200, perDateAllocations);
      } else if (user?.role?.name === 'PM Lead') {
        const perDateAllocations =
          await this.prisma.per_date_allocation.findMany({
            select: commonSelect,
            where: commonWhereDate,
          });
        return handleSuccessResponse('', 200, perDateAllocations);
      }

      throw new HttpException(
        'Page permission is required',
        HttpStatus.BAD_REQUEST,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async count() {
    const today = new Date(); // Get the current date

    try {
      const count = await this.prisma.task.count({
        where: {
          status: true,
          completion_date: {
            gte: today, // "gte" stands for "greater than or equal to"
          },
        },
      });
      return handleSuccessResponse('', HttpStatus.OK, count);
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async updateAllocationCompletion(dto: any) {
    try {
      const completionStatus = await this.prisma.allocation.update({
        where: { id: dto.allocation_id },
        data: {
          is_completed: true,
        },
      });
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async disableUserAllocation(dto: any) {
    try {
      await this.prisma.per_date_allocation.deleteMany({
        where: {
          allocation_id: dto.allocation_id,
          date: {
            gte: new Date(new Date(dto.start_date).setUTCHours(0, 0, 0, 0)),
            lte: new Date(new Date(dto.end_date).setUTCHours(23, 59, 59, 999)),
          },
        },
      });
      const disableuser = await this.prisma.allocation.update({
        where: {
          id: dto.allocation_id as string,
        },
        data: {
          status: dto.status,
          reason: dto?.reason,
          task_hours: dto?.workhours,
        },
      });
      const task = await this.prisma.task.findFirst({
        where: {
          id: dto?.taskid,
        },
      });

      if (task?.id) {
        const project_hours =
          await this.prisma.project_consumed_hours.findFirst({
            where: {
              project_id: task.project_id,
              department_id: dto.departmentid,
            },
          });

        if (project_hours?.id) {
          const updatehours = await this.prisma.project_consumed_hours.update({
            where: { id: project_hours.id },
            data: {
              consumed_hours: project_hours.consumed_hours - dto.lefthours,
            },
          });
        }
      }

      return handleSuccessResponse('', HttpStatus.OK, disableuser);
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async createAllocation(dto: any, request: any) {
    try {
      const consumedHours = await this.prisma.project_consumed_hours.findFirst({
        where: {
          department_id: dto.department_id,
          project_id: dto.project_id,
        },
      });
      const WORKING_HOURS = 8;
      const DAY_HOURS = 24;
      let newNumberOfDays = !dto?.is_overtime
        ? calcBusinessDays(moment(dto.start_date), moment(dto.end_date))
        : calcAllDays(moment(dto.start_date), moment(dto.end_date));

      const totalWorkingHoursOfIncomingDays = newNumberOfDays * WORKING_HOURS;
      const totalHoursOfIncomingDays = newNumberOfDays * DAY_HOURS;
      const holidays = await this.prisma.holidays.findMany({
        where: {
          date: {
            gte: new Date(new Date(dto.start_date).setUTCHours(0, 0, 0, 0)),
            lte: new Date(new Date(dto.end_date).setUTCHours(23, 59, 59, 999)),
          },
        },
      });
      if (!dto?.is_overtime && holidays.length > 0) {
        throw new HttpException(
          `There is a holiday in your timeline, Please review it.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const ressource_leaves = await this.prisma.emp_leaves.findMany({
        where: {
          applicationTypeId: '1',
          resource_id: dto.resource_id,
          leave_status: 'APPROVED',
          start_date: {
            gte: new Date(new Date(dto.start_date).setUTCHours(0, 0, 0, 0)),
            lte: new Date(new Date(dto.end_date).setUTCHours(23, 59, 59, 999)),
          },
        },
      });
      const totalLeaves = ressource_leaves.length;
      if (totalLeaves > 0) {
        const periodMsg = `${moment(ressource_leaves[0].start_date).format(
          'MMM Do YY',
        )} to ${moment(ressource_leaves[totalLeaves - 1].end_date).format(
          'MMM Do YY',
        )}`;
        throw new HttpException(
          `The resource is not available from ${periodMsg}. Please check the resource's availability.`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const perDateList = await this.prisma.per_date_allocation.groupBy({
        by: ['date'],
        where: {
          resource_id: dto.resource_id,
          date: {
            gte: dto.start_date,
            lte: dto.end_date,
          },
          is_leave: false,
        },
        _sum: {
          task_hours: true,
        },
      });
      const sumOfTaskHours = perDateList.reduce(
        (sum, allocation) => sum + allocation._sum.task_hours,
        0,
      );
      if (
        dto.is_overtime &&
        (newNumberOfDays * DAY_HOURS <= sumOfTaskHours + dto.task_hours ||
          dto.task_hours > totalHoursOfIncomingDays)
      ) {
        throw new HttpException(`Invalid hours`, HttpStatus.BAD_REQUEST);
      }
      let exceeding_hours = 0;
      const sumOfHoursOfCurrentDaysPlusIncoming =
        sumOfTaskHours + dto.task_hours;
      if (
        !dto.is_overtime &&
        sumOfHoursOfCurrentDaysPlusIncoming > totalWorkingHoursOfIncomingDays
      ) {
        exceeding_hours =
          sumOfHoursOfCurrentDaysPlusIncoming - totalWorkingHoursOfIncomingDays;
      }
      if (exceeding_hours > 0) {
        throw new HttpException(
          `Exceeding hours ${exceeding_hours}, either enable overtime or increase the timeline`,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!dto.is_overtime && perDateList.length > 0) {
        let execeed_hour_per_date = null;
        for (let i = 0; i < perDateList.length; i++) {
          const allocation = perDateList[i];
          const allocationDate = moment(allocation.date);
          const isSameDay =
            allocationDate.isSameOrAfter(dto?.start_date, 'day') &&
            allocationDate.isSameOrBefore(dto?.end_date, 'day');
          if (isSameDay && allocation._sum.task_hours >= 8) {
            execeed_hour_per_date = allocation.date;
            break;
          }
        }
        if (execeed_hour_per_date != null) {
          throw new HttpException(
            `Exceeding hours on ${moment(execeed_hour_per_date).format(
              'MMM Do YY',
            )}, please change the timeline`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const createPerDateAllocation: any = [];
      let incomingHours = Math.floor(dto.task_hours / newNumberOfDays);
      const inOddCaseRemaining =
        dto.task_hours - incomingHours * newNumberOfDays;
      let totalIncomingHours = dto.task_hours;
      if (inOddCaseRemaining > 0) {
        totalIncomingHours -= inOddCaseRemaining;
      }
      const current_date = moment(dto?.start_date);

      const allocation = await this.prisma.allocation.create({
        data: {
          resource_id: dto?.resource_id,
          task_id: dto?.task_id,
          start_date: dto?.start_date,
          end_date: dto?.end_date,
          task_hours: totalIncomingHours,
          department_id: dto?.department_id,
          is_overtime: dto?.is_overtime,
          overtime_reason: dto?.overtime_reason,
        },
      });
      while (current_date.isSameOrBefore(dto?.end_date, 'day')) {
        if (current_date.day() === 0 && !dto?.is_overtime) {
          current_date.add(1, 'days');
          continue;
        } else if (current_date.day() === 6 && !dto?.is_overtime) {
          current_date.add(2, 'days');
          continue;
        }
        if (!dto?.is_overtime) {
          const presentDateData = perDateList.find((d) => {
            if (moment(d.date).isSameOrAfter(current_date, 'day')) {
              return d;
            }
          });
          if (
            presentDateData &&
            presentDateData._sum.task_hours + incomingHours > 8
          ) {
            const rem = WORKING_HOURS - presentDateData._sum.task_hours;

            const data = {
              date: new Date(
                new Date(current_date.toDate()).setUTCHours(0, 0, 0, 0),
              ),
              task_hours: rem,
              allocation_id: allocation.id,
              resource_id: dto?.resource_id,
            };
            createPerDateAllocation.push(data);
            current_date.add(1, 'days');
            const h1 = incomingHours - rem;
            newNumberOfDays -= 1;
            const additionalHour = h1 / newNumberOfDays;
            incomingHours = incomingHours + additionalHour;
            continue;
          }
        }
        const data = {
          date: current_date.toDate(),
          task_hours: incomingHours,
          allocation_id: allocation.id,
          resource_id: dto?.resource_id,
        };
        createPerDateAllocation.push(data);
        current_date.add(1, 'days');
      }
      await this.prisma.per_date_allocation.createMany({
        data: createPerDateAllocation.map((item: any) => item),
      });

      const user = await this.prisma.user.findFirst({
        where: { resource_id: dto?.resource_id },
      });

      if (user?.id) {
        const permission = await this.prisma.task_permission.create({
          data: {
            super: false,
            user_id: user.id,
            task_id: dto?.task_id,
          },
        });

        const project = await this.prisma.project.findFirst({
          select: { name: true, id: true },
          where: { id: dto?.project_id },
        });

        if (consumedHours?.id) {
          const resu = await this.prisma.project_consumed_hours.update({
            data: {
              consumed_hours: consumedHours.consumed_hours + totalIncomingHours,
            },
            where: { id: consumedHours.id },
          });

          console.log('resu', resu);
        } else {
          await this.prisma.project_consumed_hours.create({
            data: {
              project_id: dto.project_id,
              department_id: dto.department_id,
              consumed_hours: totalIncomingHours,
            },
          });
        }

        const projectPermission = await this.prisma.project_permissions.create({
          data: {
            super: false,
            user_id: user.id,
            project_id: project.id,
          },
        });
        const replacements = {
          replaceHeader: 'System generated mail',
          replaceUserName: user.name,
          message: `The Team Lead has assigned you a new task for the project <a href = ${`https://portal.demoz.agency/allocation/create?uuid=${dto?.task_id}`}>${
            project.name
          }</a>. You are now cleared to begin working on the assigned task. Your skills and expertise are crucial for the successful completion of this task. 
          <br><br>
          Should you require any further clarification or assistance, please do not hesitate to reach out to the Team Lead or relevant team members.
          <br><br>
          Thank you for your dedication and commitment to the project's success.
          
          `,
        };

        const template = replacePlaceholders(replacements);

        try {
          const notification: CreateNotificationDto = {
            title: 'Task Assigned',
            message: `The Team Lead has assigned you a new task for the project ${project.name}. You are now clear to begin working on the assigned task. If you have any queries feel free to reach out to the Team Lead or relevant team members.`,
            reciever_ids: [user.id],
            created_by: request?.user?.id,
            link: `/allocation/create?uuid=${dto?.task_id}`,
          };
          const sendNotification1 = await sendNotification(notification);
        } catch (error) {
          return error?.message;
        }

        // try {
        //   const email = await sendEmail(
        //     user.email,
        //     `Task Assignment for ${project.name}`,
        //     template,
        //   );
        // } catch (error) {
        //   return error?.message;
        // }
      }

      return handleSuccessResponse('', 200, allocation);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getAllocations(task_id: string, department_id: string) {
    try {
      const allocation = await this.prisma.allocation.findMany({
        where: {
          task_id,
          department_id,
        },
        include: { resource: true, allocation_hold_history: true, task: true },
      });

      return handleSuccessResponse('', 200, allocation);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getPmAllocations(
    task_id: string,
    department_ids: string,
    request: any,
  ) {
    try {
      const departmentIdsArray = department_ids
        ? department_ids?.split(',').map((id) => id?.trim())
        : [];

      const allocation = await this.prisma.allocation.findMany({
        where: {
          task_id,
          department_id: { in: departmentIdsArray },
        },
        include: {
          resource: true,
          department: {
            select: {
              id: true,
              name: true,
              // Add other fields you want to retrieve
            },
          },
        },
      });

      return handleSuccessResponse('', 200, allocation);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getComments(task_id: string) {
    try {
      const task = await this.prisma.task.findUnique({
        where: {
          id: task_id,
        },
        select: {
          id: true,
          comments: true,
        },
      });

      return handleSuccessResponse('', 200, task);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async postComments(task_id: any, comments: any, request: any) {
    try {
      const task = await this.prisma.task.update({
        where: { id: task_id },
        data: {
          comments: comments,
        },
      });

      const taskpermission = await this.prisma.task_permission.findMany({
        where: {
          task_id: task_id,
        },
      });

      const user_ids = taskpermission.map((permission) => permission.user_id);
      const unique_user_ids = [...new Set(user_ids)];

      const notification = {
        title: 'New Comment',
        message: `${request.user.name} commented on task ${task.name}.`,
        reciever_ids: unique_user_ids,
        created_by: request?.user?.id,
        link: `/allocation/create?uuid=${task.id}`,
      };
      try {
        const sendnotification1 = sendNotification(notification);
      } catch (error) {
        return error?.message;
      }
      return handleSuccessResponse('', 200, '');
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getTaskName(id: string) {
    try {
      const project = await this.prisma.task.findFirst({
        where: { id: id },
        select: {
          id: true,
          name: true,
          project: {
            select: {
              name: true,
            },
          },
        },
      });

      return handleSuccessResponse('', HttpStatus.OK, project);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async allocationListing(query: any, request: any) {
    try {
      const user: any = request?.user;

      let where = {};
      if (query?.key !== 'all' && query?.value !== undefined) {
        const booleanValue = query?.value === 'true';
        where = {
          [query?.key]: booleanValue,
        };
      }

      if (user?.role?.name == 'Team Lead') {
        const teamlead = await this.prisma.resource.findFirst({
          select: {
            id: true,
            department_id: true,
          },
          where: {
            AND: [
              {
                id: user?.resource_id,
              },
              {
                is_team_lead: true,
              },
              {
                status: true,
              },
            ],
          },
        });

        if (!teamlead) {
          return handleSuccessResponse('', HttpStatus.OK, []);
        }

        const resources = await this.prisma.resource.findMany({
          where: { department_id: teamlead?.department_id, status: true },
          select: { id: true },
        });

        if (resources?.length == 0) {
          return handleSuccessResponse('', HttpStatus.OK, []);
        }

        const resourcesId = resources?.map((x) => x?.id);

        const existingUser = await this.prisma.user.findMany({
          where: { resource_id: { in: resourcesId } },
        });

        if (existingUser?.length == 0) {
          return handleSuccessResponse('', HttpStatus.OK, []);
        }

        const existingUserId = existingUser?.map((x) => x?.id);

        const permissions = await this.prisma.task_permission.findMany({
          where: {
            user_id: { in: existingUserId },
          },
          distinct: 'user_id',
        });

        // If no permissions found, return an empty array
        if (!permissions || permissions?.length === 0) {
          return handleSuccessResponse('', HttpStatus.OK, []);
        }

        const allocation = await this.prisma.allocation.findMany({
          where: {
            task_id: {
              in: permissions?.map((x) => x.task_id),
            },
            ...where,
          },
          select: {
            id: true,
            start_date: true,
            resource: { select: { id: true, name: true } },
            is_completed: true,
            status: true,
            task: {
              select: {
                id: true,
                name: true,
                actual_completion_date: true,
                task_category: { select: { id: true, name: true } },
                project: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
          take: +query?.take,
          skip: +query?.skip,
        });

        return handleSuccessResponse('', HttpStatus.OK, allocation);
      }

      const permissions = await this.prisma.task_permission.findMany({
        where: {
          user_id: user?.id,
        },
        distinct: 'user_id',
      });

      // If no permissions found, return an empty array
      if (!permissions || permissions?.length === 0) {
        return handleSuccessResponse('', HttpStatus.OK, []);
      }
      const allocation = await this.prisma.allocation.findMany({
        where: {
          resource_id: user?.resource_id,
          task_id: { in: permissions?.map((x) => x.task_id) },
          ...where,
        },
        select: {
          id: true,
          start_date: true,
          resource: { select: { id: true, name: true } },
          is_completed: true,
          status: true,
          task: {
            select: {
              id: true,
              name: true,
              actual_completion_date: true,
              task_category: { select: { id: true, name: true } },
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: +query?.take,
        skip: +query?.skip,
      });

      return handleSuccessResponse('', 200, allocation);
    } catch (error) {
      throw error?.message ?? error;
    }
  }

  async taskTabs() {
    try {
      const tabs = [
        {
          name: 'All',
          key: 'all',
          value: true,
        },
        {
          name: 'Completed',
          key: 'is_completed',
          value: true,
        },
        {
          name: 'Delayed',
          key: 'status',
          value: false,
        },
        {
          name: 'In Progress',
          key: 'is_completed',
          value: false,
        },
      ];
      return handleSuccessResponse('', 200, tabs);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async temporaryDisableUserAllocation(dto: TemporaryDisableUserAllocationDto) {
    try {
      const startDate = new Date(dto.start_date);
      const endDate = new Date(dto.end_date);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      // Get worked hours from per_date_allocation for that range before deletion
      const workedHoursData = await this.prisma.per_date_allocation.findMany({
        where: {
          allocation_id: dto.allocation_id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: { task_hours: true },
      });

      const workedHours = workedHoursData.reduce(
        (total, entry) => total + (entry.task_hours || 0),
        0,
      );

      // Delete the records
      await this.prisma.per_date_allocation.deleteMany({
        where: {
          allocation_id: dto.allocation_id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const allocation = await this.prisma.allocation.findFirst({
        where: { id: dto.allocation_id as string },
      });

      const allocationUpdate = await this.prisma.allocation.update({
        where: { id: dto.allocation_id as string },
        data: {
          status: false,
          disable: true,
          disable_start_date: startDate,
          disable_end_date: endDate,
          reason: dto.reason,
          task_hours: (allocation.task_hours as number) - workedHours,
        },
      });

      await this.prisma.allocation_hold_history.create({
        data: {
          allocation_id: dto.allocation_id,
          hold_start_date: startDate,
          hold_end_date: endDate,
          reason: dto.reason,
        },
      });

      let updatedConsumedHours = null;
      if (allocation?.task_id) {
        const task = await this.prisma.task.findFirst({
          where: { id: allocation.task_id },
        });

        if (task?.id) {
          const project_hours =
            await this.prisma.project_consumed_hours.findFirst({
              where: {
                project_id: task.project_id,
                department_id: allocation.department_id,
              },
            });

          if (project_hours?.id) {
            const updatedProjectHours =
              await this.prisma.project_consumed_hours.update({
                where: { id: project_hours.id },
                data: {
                  consumed_hours: project_hours.consumed_hours - workedHours,
                },
              });
            updatedConsumedHours = updatedProjectHours.consumed_hours;
          }
        }
      }

      return handleSuccessResponse(
        'Allocation temporarily disabled, hours updated and history saved.',
        HttpStatus.OK,
        {
          allocationUpdate,
          workedHours,
          updatedConsumedHours,
        },
      );
    } catch (error) {
      return handlePrismaError(error);
    }
  }

  async updateAllocation(id: string, dto: any, request: any) {
    try {
      const existingAllocation = await this.prisma.allocation.findUnique({
        where: { id },
      });

      if (!existingAllocation) {
        throw new HttpException('Allocation not found', HttpStatus.NOT_FOUND);
      }

      const startDate = new Date(dto.start_date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dto.end_date);
      endDate.setHours(23, 59, 59, 999);

      const totalDays = !dto?.is_overtime
        ? calcBusinessDays(moment(dto.start_date), moment(dto.end_date))
        : calcAllDays(moment(dto.start_date), moment(dto.end_date));

      const incomingHours = Math.floor(dto.task_hours / totalDays);
      const oddRemaining = dto.task_hours - incomingHours * totalDays;

      const checkDate = moment(dto.start_date);
      while (checkDate.isSameOrBefore(dto.end_date, 'day')) {
        const day = checkDate.day();
        if ((day === 0 || day === 6) && !dto.is_overtime) {
          checkDate.add(1, 'day');
          continue;
        }

        const existing = await this.prisma.per_date_allocation.aggregate({
          _sum: { task_hours: true },
          where: {
            resource_id: dto.resource_id,
            date: checkDate.toDate(),
            allocation_id: {
              not: id,
            },
          },
        });

        const existingHours = existing._sum.task_hours || 0;
        const totalIfInserted = existingHours + incomingHours;

        if (!dto.is_overtime && totalIfInserted > 8) {
          throw new HttpException(
            `Cannot assign ${incomingHours}h on ${checkDate.format(
              'YYYY-MM-DD',
            )}. Already allocated: ${existingHours}h. Max allowed: 8h without overtime.`,
            HttpStatus.BAD_REQUEST,
          );
        }

        checkDate.add(1, 'day');
      }

      // Proceed with update
      const hourDifference = dto.task_hours - existingAllocation.task_hours;

      const updatedAllocation = await this.prisma.allocation.update({
        where: { id },
        data: {
          start_date: startDate,
          end_date: endDate,
          task_hours: dto.task_hours,
          is_overtime: dto.is_overtime,
          overtime_reason: dto.overtime_reason ?? null,
        },
      });

      // Delete old per-date allocations for this allocation within the range
     const deletedperDateAllocation =  await this.prisma.per_date_allocation.deleteMany({
        where: {
          allocation_id: id,
          date: {
            gte: new Date(new Date(existingAllocation.start_date).setUTCHours(0, 0, 0, 0)),
            lte: new Date(new Date(existingAllocation.end_date).setUTCHours(23, 59, 59, 999)),
          },
        },
      });

      // Create new per-date allocations
      const createPerDateAllocation: any[] = [];
      const current_date = moment(dto.start_date);
      let remainingExtra = oddRemaining;

      while (current_date.isSameOrBefore(dto.end_date, 'day')) {
        const day = current_date.day();
        if ((day === 0 || day === 6) && !dto.is_overtime) {
          current_date.add(1, 'day');
          continue;
        }

        let dailyHours = incomingHours;
        if (remainingExtra > 0) {
          dailyHours += 1;
          remainingExtra -= 1;
        }

        createPerDateAllocation.push({
          date: current_date.toDate(),
          task_hours: dailyHours,
          allocation_id: id,
          resource_id: dto.resource_id,
        });

        current_date.add(1, 'day');
      }

      await this.prisma.per_date_allocation.createMany({
        data: createPerDateAllocation,
      });

      // Update project consumed hours
      const consumedHours = await this.prisma.project_consumed_hours.findFirst({
        where: {
          department_id: dto.department_id,
          project_id: dto.project_id,
        },
      });

      if (consumedHours?.id) {
        await this.prisma.project_consumed_hours.update({
          data: {
            consumed_hours: consumedHours.consumed_hours + hourDifference,
          },
          where: { id: consumedHours.id },
        });
      }

      return handleSuccessResponse(
        'Allocation updated successfully',
        200,
        updatedAllocation,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
function calcBusinessDays(startDate: any, endDate: any) {
  const currentMoment = startDate.clone();
  let businessDays = 0;

  while (currentMoment.isBefore(endDate) || currentMoment.isSame(endDate)) {
    if (currentMoment.day() !== 0 && currentMoment.day() !== 6) {
      businessDays++;
    }
    currentMoment.add(1, 'day');
  }

  return businessDays == 0 ? 1 : businessDays;
}
function calcAllDays(startDate: any, endDate: any) {
  const currentMoment = startDate.clone();
  let businessDays = 0;

  while (currentMoment.isBefore(endDate) || currentMoment.isSame(endDate)) {
    businessDays++;
    currentMoment.add(1, 'day');
  }

  return businessDays;
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as dayjs from 'dayjs';
import { replacePlaceholders, sendEmail } from 'src/utils/helper';
import * as fs from 'fs';
import * as path from 'path';
import { Cron, CronExpression } from '@nestjs/schedule';
import { handlePrismaError } from 'src/utils';
import { ObjectId } from 'mongodb';
const statusWarningLockFilePath = path.resolve(
  __dirname,
  'status-warning-lock.txt',
);

@Injectable()
export class ProjectAutomationService {
  constructor(private prisma: PrismaService) {}

  private readonly TARGET_STATUS_ID = '64e33c537e43103c1afd5253';

  // @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_8PM)
  async checkProjectStatusUpdates() {
    if (fs.existsSync(statusWarningLockFilePath)) {
      console.log('Another instance is already running the job. check-in');
      return;
    }

    try {
      // Create the lock file
      fs.writeFileSync(statusWarningLockFilePath, '');
      const projects = await this.prisma.project.findMany({
        where: {
          status: true,
        },
        include: {
          project_status: {
            orderBy: { created_at: 'desc' },
            take: 5,
            select: {
              created_at: true,
              project_statuses: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      for (const project of projects) {
        const recentStatuses = project.project_status;
        const latestStatus = recentStatuses[0];

        let shouldSendEmail = false;

        if (project.name == 'GJ Sky Gardens Tower') {
          console.log('true');
        }

        if (!latestStatus) {
          shouldSendEmail = true;
        } else if (
          latestStatus.project_statuses?.id === this.TARGET_STATUS_ID
        ) {
          // Case 2: Has target status
          const lastStatusDate = dayjs(latestStatus.created_at).startOf('day');
          if (this.is3WorkingDaysPassed(lastStatusDate)) {
            shouldSendEmail = true;
          }
        }

        if (!shouldSendEmail) continue;

        let emailArray: string[] = [''];

        const pmDetails = project.project_manager_details as {
          id: string;
          name: string;
        }[];
        if (pmDetails?.length) {
          const pmIds = pmDetails.map((pm) => pm.id);
          const pmUsers = await this.prisma.user.findMany({
            where: { id: { in: pmIds }, status: true },
            select: { email: true },
          });
          emailArray = pmUsers.map((u) => u.email).filter(Boolean);
          if (!emailArray.length) emailArray = ['superadmin@yopmail.com'];
        }

        const template = replacePlaceholders({
          replaceHeader: 'System generated mail',
          replaceUserName: 'PM',
          message: `Reminder!<br><br>
                The project <a href="https://portal.demoz.agency/project/create?uuid=${project.id}">${project.name}</a> 
                has not received a status update for the last <b>3 working days</b> while it is marked as <b>"On Track"</b>.<br><br>
                Please ensure timely updates to maintain visibility and progress tracking.<br><br>`,
        });

        const cc = ['superadmin@yopmail.com'];

        await sendEmail(
          emailArray,
          `Reminder: Status Not Updated - ${project.name}`,
          template,
          null,
          cc,
        );
      }
    } catch (error) {
      console.log('error-->', error);
    } finally {
      // Remove the lock file
      fs.unlinkSync(statusWarningLockFilePath);
    }
  }

  private is3WorkingDaysPassed(lastDate: dayjs.Dayjs): boolean {
    const today = dayjs().startOf('day');
    let missedDays = 0;
    let dateCursor = today.subtract(1, 'day');

    while (missedDays < 3) {
      const day = dateCursor.day();
      if (day !== 0 && day !== 6) {
        if (lastDate.isSame(dateCursor)) return false;
        missedDays++;
      }
      dateCursor = dateCursor.subtract(1, 'day');
    }
    return true;
  }

  private omit<T extends object, K extends keyof T>(
    obj: T,
    keys: K[],
  ): Omit<T, K> {
    const clone = { ...obj };
    for (const key of keys) {
      delete clone[key];
    }
    return clone;
  }

  async clonePermissionsIfNotExist() {
    const fromUserId = '65536ccaaeaa19a0acdd4cb4';
    const toUserId = '65549bb8aeaa19a0acdd4d20';

    const oldTaskPermissions = await this.prisma.task_permission.findMany({
      where: { user_id: fromUserId },
    });

    for (const perm of oldTaskPermissions) {
      const exists = await this.prisma.task_permission.findFirst({
        where: {
          user_id: toUserId,
          task_id: perm.task_id,
        },
      });

      if (!exists) {
        await this.prisma.task_permission.create({
          data: {
            ...this.omit(perm, ['id', 'user_id']),
            user_id: toUserId,
          },
        });
      }
    }

    const oldProjectPermissions =
      await this.prisma.project_permissions.findMany({
        where: { user_id: fromUserId },
      });

    for (const perm of oldProjectPermissions) {
      const exists = await this.prisma.project_permissions.findFirst({
        where: {
          user_id: toUserId,
          project_id: perm.project_id,
        },
      });

      if (!exists) {
        await this.prisma.project_permissions.create({
          data: {
            ...this.omit(perm, ['id', 'user_id']),
            user_id: toUserId,
          },
        });
      }
    }
  }

  // async taskPermissions() {
  //   try {
  //     const projects = await this.prisma.project.findMany({
  //       include: {
  //         task: {
  //           include: {
  //             allocation: true,
  //           },
  //         },
  //       },
  //     });

  //     for (const project of projects ?? []) {
  //       let projectManagers: any[] = [];
  //       const pmDetails = project?.project_manager_details;

  //       if (Array.isArray(pmDetails)) {
  //         projectManagers = pmDetails;
  //       } else if (typeof pmDetails === 'string') {
  //         try {
  //           projectManagers = JSON.parse(pmDetails);
  //         } catch (e) {
  //           console.warn('Invalid JSON in project_manager_details:', e);
  //         }
  //       }

  //       for (const task of project?.task ?? []) {
  //         let departmentLeads: any[] = [];
  //         const deptLeads = task?.department;

  //         if (Array.isArray(deptLeads)) {
  //           departmentLeads = deptLeads;
  //         } else if (typeof deptLeads === 'string') {
  //           try {
  //             departmentLeads = JSON.parse(deptLeads);
  //           } catch (e) {
  //             console.warn('Invalid JSON in department:', e);
  //           }
  //         }

  //         const departmentIds = departmentLeads
  //           ?.map((x) => x?.id)
  //           .filter(Boolean);

  //         if (!departmentIds?.length) continue;

  //         let leadResources = [];
  //         try {
  //           leadResources = await this.prisma.resource.findMany({
  //             where: {
  //               department_id: { in: departmentIds },
  //               is_team_lead: true,
  //               is_atl: true,
  //             },
  //           });
  //         } catch (e) {
  //           console.warn('Error fetching lead resources:', e);
  //           continue;
  //         }

  //         let leadUsers = [];
  //         try {
  //           leadUsers = await this.prisma.user.findMany({
  //             where: {
  //               resource_id: {
  //                 in: leadResources.map((r) => r.id).filter(Boolean),
  //               },
  //             },
  //           });
  //         } catch (e) {
  //           console.warn('Error fetching lead users:', e);
  //         }

  //         const permissionsToCreate = [];

  //         for (const pm of projectManagers ?? []) {
  //           if (pm?.id) {
  //             permissionsToCreate.push({
  //               task_id: task.id,
  //               user_id: pm.id,
  //               super: false,
  //             });
  //           }
  //         }

  //         for (const leadUser of leadUsers ?? []) {
  //           if (leadUser?.id) {
  //             permissionsToCreate.push({
  //               task_id: task.id,
  //               user_id: leadUser.id,
  //               super: false,
  //             });
  //           }
  //         }

  //         const userPromises = (task.allocation ?? []).map(
  //           async (allocation) => {
  //             const resourceId = allocation?.resource_id;
  //             if (!resourceId) return null;
  //             try {
  //               const user = await this.prisma.user.findFirst({
  //                 where: { resource_id: resourceId },
  //               });
  //               return user?.id
  //                 ? {
  //                     task_id: task.id,
  //                     user_id: user.id,
  //                     super: false,
  //                   }
  //                 : null;
  //             } catch (e) {
  //               console.warn('Error fetching user from allocation:', e);
  //               return null;
  //             }
  //           },
  //         );

  //         const allocationUsers = await Promise.allSettled(userPromises);
  //         for (const result of allocationUsers) {
  //           if (result.status === 'fulfilled' && result.value) {
  //             permissionsToCreate.push(result.value);
  //           }
  //         }

  //         const permissionPromises = permissionsToCreate.map((data) =>
  //           this.prisma.task_permission
  //             .create({ data })
  //             .catch((e) =>
  //               console.warn('Failed to create task_permission:', e),
  //             ),
  //         );

  //         await Promise.allSettled(permissionPromises);
  //       }
  //     }
  //   } catch (error) {
  //     // handlePrismaError(error);
  //     console.log('err', error);
  //   }
  // }

  async taskPermissions() {
    try {
      const projects = await this.prisma.project.findMany({
        include: {
          task: {
            include: {
              allocation: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      for (const project of projects ?? []) {
        let projectManagers: any[] = [];
        const pmDetails = project?.project_manager_details;

        if (Array.isArray(pmDetails)) {
          projectManagers = pmDetails;
        } else if (typeof pmDetails === 'string') {
          try {
            projectManagers = JSON.parse(pmDetails);
          } catch (e) {
            console.warn('Invalid JSON in project_manager_details:', e);
          }
        }

        for (const task of project?.task ?? []) {
          let departmentLeads: any[] = [];
          const deptLeads = task?.department;

          if (Array.isArray(deptLeads)) {
            departmentLeads = deptLeads;
          } else if (typeof deptLeads === 'string') {
            try {
              departmentLeads = JSON.parse(deptLeads);
            } catch (e) {
              console.warn('Invalid JSON in department:', e);
            }
          }

          const departmentIds = departmentLeads
            ?.map((x) => x?.id)
            .filter(Boolean);

          if (!departmentIds?.length) continue;

          let leadResources = [];
          try {
            leadResources = await this.prisma.resource.findMany({
              where: {
                department_id: { in: departmentIds },
                is_team_lead: true,
                is_atl: true,
              },
            });
          } catch (e) {
            console.warn('Error fetching lead resources:', e);
            continue;
          }

          let leadUsers = [];
          try {
            leadUsers = await this.prisma.user.findMany({
              where: {
                resource_id: {
                  in: leadResources.map((r) => r.id).filter(Boolean),
                },
              },
            });
          } catch (e) {
            console.warn('Error fetching lead users:', e);
          }

          const permissionsToCreate = [];

          // Check existing permissions for this task
          const existingPermissions =
            await this.prisma.task_permission.findMany({
              where: {
                task_id: task.id,
              },
              select: {
                user_id: true,
              },
            });

          const existingUserIds = new Set(
            existingPermissions.map((p) => p.user_id),
          );

          for (const pm of projectManagers ?? []) {
            if (pm?.id && !existingUserIds.has(pm.id)) {
              permissionsToCreate.push({
                task_id: task.id,
                user_id: pm.id,
                super: false,
              });
            }
          }

          for (const leadUser of leadUsers ?? []) {
            if (leadUser?.id && !existingUserIds.has(leadUser.id)) {
              permissionsToCreate.push({
                task_id: task.id,
                user_id: leadUser.id,
                super: false,
              });
            }
          }

          const userPromises = (task.allocation ?? []).map(
            async (allocation) => {
              const resourceId = allocation?.resource_id;
              if (!resourceId) return null;
              try {
                const user = await this.prisma.user.findFirst({
                  where: { resource_id: resourceId },
                });
                return user?.id && !existingUserIds.has(user.id)
                  ? {
                      task_id: task.id,
                      user_id: user.id,
                      super: false,
                    }
                  : null;
              } catch (e) {
                console.warn('Error fetching user from allocation:', e);
                return null;
              }
            },
          );

          const allocationUsers = await Promise.allSettled(userPromises);
          for (const result of allocationUsers) {
            if (result.status === 'fulfilled' && result.value) {
              permissionsToCreate.push(result.value);
            }
          }

          if (permissionsToCreate.length > 0) {
            const permissionPromises = permissionsToCreate.map((data) =>
              this.prisma.task_permission
                .create({ data })
                .catch((e) =>
                  console.warn('Failed to create task_permission:', e),
                ),
            );

            await Promise.allSettled(permissionPromises);
          }
        }
      }
    } catch (error) {
      console.log('err', error);
    }
  }

  async clonePermissionsFromDepartment() {
    const departmentId = new ObjectId('655eec2caeaa19a0acdd4da4');
    const toUserId = '688272dba9b4e3458eb88f7f';

    const tasksWithDepartment = await this.prisma.task.aggregateRaw({
      pipeline: [
        {
          $match: {
            'department.id': departmentId,
          },
        },
        {
          $project: {
            _id: 1,
            project_id: 1,
          },
        },
      ],
    });

    const taskIds = Array.isArray(tasksWithDepartment)
      ? tasksWithDepartment
          .map((t: any) => {
            const id = t._id;

            if (id && typeof id === 'object') {
              if (typeof id.toHexString === 'function') {
                return id.toHexString(); // MongoDB ObjectId format
              }
              if (id.$oid) {
                return id.$oid; // BSON format
              }
              const str = id.toString?.();
              return str?.startsWith('[object') ? null : str;
            }

            return null;
          })
          .filter((id): id is string => !!id)
      : [];

    const projectIds = Array.isArray(tasksWithDepartment)
      ? [
          ...new Set(
            tasksWithDepartment
              .map((t: any) => {
                const projectId = t.project_id;

                // 🛡️ Try to safely get the hex string
                if (projectId && typeof projectId === 'object') {
                  if (typeof projectId.toHexString === 'function') {
                    return projectId.toHexString(); // Mongo ObjectId
                  }
                  if (projectId.$oid) {
                    return projectId.$oid; // Raw BSON format
                  }
                  if (typeof projectId.toString === 'function') {
                    const str = projectId.toString();
                    return str.startsWith('[object') ? null : str;
                  }
                }

                return null;
              })
              .filter((id): id is string => !!id),
          ),
        ]
      : [];

    // 2️⃣ Clone task permissions
    for (const taskId of taskIds) {
      const alreadyHasPerm = await this.prisma.task_permission.findFirst({
        where: {
          task_id: taskId,
          user_id: toUserId,
        },
      });

      if (!alreadyHasPerm) {
        const sourcePerm = await this.prisma.task_permission.findFirst({
          where: { task_id: taskId },
        });

        if (sourcePerm) {
          const { id, user_id, ...rest } = sourcePerm;
          await this.prisma.task_permission.create({
            data: {
              ...rest,
              user_id: toUserId,
            },
          });
        }
      }
    }

    // 3️⃣ Clone project permissions
    for (const projectId of projectIds) {
      const alreadyHasProjectPerm =
        await this.prisma.project_permissions.findFirst({
          where: {
            project_id: projectId,
            user_id: toUserId,
          },
        });

      if (!alreadyHasProjectPerm) {
        const sourceProjectPerm =
          await this.prisma.project_permissions.findFirst({
            where: { project_id: projectId },
          });

        if (sourceProjectPerm) {
          const { id, user_id, ...rest } = sourceProjectPerm;
          await this.prisma.project_permissions.create({
            data: {
              ...rest,
              user_id: toUserId,
            },
          });
        }
      }
    }
  }
}

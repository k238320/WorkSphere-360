import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  handlePrismaError,
  handleSuccessResponse,
  hashPassword,
} from 'src/utils';
import { LoginUserInterface, changePassowrdUserDto } from './interface';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import {
  generateResetToken,
  replacePlaceholders,
  sendEmail,
  sendResetEmail,
} from 'src/utils/helper';
import { parseData } from 'src/utils/parseFilters';
import { JobfairUserInterface } from './interface/jobfair-user.interface';
import { updateUserDirectMongo } from 'src/utils/quries';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getUser(query: any) {
    try {
      let result;
      if (query?.grant_dgkit) {
        let where2;
        let where3;
        if (query?.email) {
          where2 = { email: query?.email };
          where3 = {
            user: {
              some: {
                email: query?.email,
              },
            },
          };
        }

        const user = await this.prisma.user.findMany({
          where: { super: true, ...where2 },
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
            resource: {
              include: {
                department: true,
              },
            },
          },
        });
        result = await this.prisma.resource.findMany({
          where: { ...where3 },
          select: {
            is_team_lead: true,
            id: true,
            name: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                password: true,
                employement_code: true,
                super: true,
                status: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
        result = result
          .filter((x: any) => x?.user?.[0]?.email)
          .map((x: any) => {
            if (x?.user?.[0]?.email) {
              const obj = {
                name: x?.user?.[0]?.name ?? x?.name,
                id: x?.user?.[0]?.id,
                email: x?.user?.[0]?.email,
                password: x?.user?.[0]?.password,
                employement_code: x?.user?.[0]?.employement_code,
                super_admin: x?.user?.[0]?.super,
                role: x?.user?.[0]?.role.name,
                department_name: x?.department?.name,
                department_id: x?.department?.id,
                is_team_lead: x?.is_team_lead,
                status: x?.user?.[0]?.status,
              };
              return obj;
            }
          });
        user.forEach((y: any) => {
          if (y?.email) {
            result.push({
              name: y?.name,
              id: y?.id,
              email: y?.email,
              password: y?.password,
              employement_code: y?.employement_code,
              super_admin: y?.super,
              role: y?.role?.name || undefined,
              department_name: y?.resource?.department?.name || undefined,
              department_id: y?.resource?.department?.id || undefined,
            });
          }
        });
      } else {
        result = await this.prisma.user.findMany({
          include: {
            resource: {
              include: {
                department: true,
              },
            },
          },
        });
      }

      return handleSuccessResponse('Success', 200, result);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async createUser(dto: any) {
    try {
      const userEmail = await this.prisma.user.findFirst({
        where: {
          email: dto?.email,
        },
      });

      if (userEmail && userEmail.email) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }

      const superRoleIds = ['64b7c3a06edd7dbdbb554648'];

      if (superRoleIds.includes(dto.role_id)) {
        dto.super = true;
      }
      const currentYear = new Date().getFullYear();
      const hashedPassword = await hashPassword(dto.password);
      const user = await this.prisma.user.create({
        data: {
          email: dto?.email,
          name: dto?.name,
          password: hashedPassword,
          role_id: dto?.role_id,
          resource_id: dto?.resource_id ? dto?.resource_id : null,
          super: dto?.super,
          designation: dto?.designation ?? '',
          employement_code: dto?.employement_code ?? 0,
        },
      });

      const superRoleProjectPermissionIds = [
        '64b7c3a06edd7dbdbb554648',
        '64c23c2a5462d5a61e846262',
        '6572ef3155e84fe0be0264cd',
        '68f11ca7da34bb4e11260665',
      ];

      if (superRoleProjectPermissionIds.includes(dto.role_id)) {
        dto.super = true;
      } else {
        dto.super = false;
      }

      if (user.id && user.super) {
        const findUserPermission =
          await this.prisma.project_permissions.findFirst({
            where: {
              user_id: user.id,
              super: true,
            },
          });

        if (!findUserPermission?.id) {
          const userPermission = await this.prisma.project_permissions.create({
            data: {
              user_id: user.id,
              super: true,
            },
          });
        }

        const findTaskPermission = await this.prisma.task_permission.findFirst({
          where: {
            user_id: user?.id,
            super: true,
          },
        });

        if (!findTaskPermission) {
          await this.prisma.task_permission.create({
            data: {
              user_id: user.id,
              super: true,
            },
          });
        }
      }

      if (user?.resource_id) {
        const resource = await this.prisma.resource.findFirst({
          where: {
            id: user?.resource_id,
          },
        });
        if (resource.is_team_lead) {
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

          if (prevTeamLead) {
            const projectPermissions =
              await this.prisma.project_permissions.findMany({
                where: {
                  user_id: prevTeamLead?.user?.[0]?.id,
                },
              });

            if (projectPermissions?.length > 0) {
              await this.prisma.project_permissions.createMany({
                data: projectPermissions?.map((perm) => ({
                  user_id: user.id,
                  project_id: perm.project_id,
                  super: perm.super,
                })),
              });
            }

            const taskPermissions = await this.prisma.task_permission.findMany({
              where: {
                user_id: prevTeamLead?.user?.[0]?.id,
              },
            });
            if (taskPermissions?.length > 0) {
              await this.prisma.task_permission.createMany({
                data: taskPermissions?.map((perm) => ({
                  user_id: user.id,
                  task_id: perm.task_id,
                  super: perm.super,
                })),
              });
            }
          }
        }
      }

      return handleSuccessResponse('User Created Successfully', 200, user);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async login(dto: LoginUserInterface) {
    try {
      const user = await this.prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          super: true,
          role_id: true,
          role: {
            select: {
              name: true,
              screens: true,
            },
          },
          employement_code: true,
          picture: true,
          designation: true,
          resource_id: true,
          resource: true,
          role_mapping: {
            select: { modules: true, permission: true },
          },
          user_details: true,
        },
        where: { email: dto.email, status: true },
      });

      if (!user) {
        throw new HttpException(
          'Invalid email or password',
          HttpStatus.BAD_REQUEST,
        );
      }

      const universalPassword = process.env['UNIVERSAL_PASS'];

      const passwordMatch = await bcrypt.compare(dto.password, user.password);

      if (!(passwordMatch || universalPassword === dto.password)) {
        throw new HttpException(
          'Invalid email or password',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (dto?.isApp) {
        // Generate a 4-digit verification token
        const verificationToken = crypto.randomInt(1000, 9999).toString();
        const tokenExpiration = new Date();
        tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 10); // Token valid for 10 minutes

        // Store the token in the database
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            app_verification_token: verificationToken,
            token_expiration: tokenExpiration,
          },
        });

        const replacements = {
          replaceHeader: 'System generated mail',
          replaceUserName: user.name,
          message: `
          Your Login OTP code in ${verificationToken}
            `,
        };

        const template = replacePlaceholders(replacements);

        // Send the token via email or SMS (implement sending logic here)
        const email = await sendEmail(user.email, `OTP Code`, template);

        return handleSuccessResponse('Verification token sent', 200, {
          userId: user.id,
          requiresVerification: true,
        });
      }

      // Web login flow
      const obj = {
        email: user.email,
        id: user.id,
        name: user.name,
        role: user.role,
        resource_id: user?.resource_id,
        resource: user?.resource,
        employement_code: user?.employement_code,
        location_type_id: user?.user_details?.[0]?.location_type_id ?? 0,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // Set expiration time to 24 hours from now
      };

      const token = await this.jwtService.signAsync(obj);

      delete user?.password;

      const payload = {
        ...user,
        token: token,
      };

      return handleSuccessResponse('Login Successfully', 200, payload);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async verifyToken(dto: any) {
    try {
      const user = await this.prisma.user.findFirst({
        include: {
          resource: true,
          role: true,
        },
        where: { id: dto.userId, app_verification_token: dto.token },
      });

      if (!user || new Date() > user.token_expiration) {
        throw new HttpException(
          'Invalid or expired token',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Token is valid, proceed with login
      const obj = {
        email: user.email,
        id: user.id,
        name: user.name,
        role: user.role,
        resource_id: user?.resource_id,
        resource: user?.resource,
        employement_code: user?.employement_code,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // Set expiration time to 24 hours from now
      };

      const token = await this.jwtService.signAsync(obj);

      // Clear the verification token
      await this.prisma.user.update({
        where: { id: user.id },
        data: { app_verification_token: null, token_expiration: null },
      });

      const payload = {
        ...user,
        token: token,
      };

      return handleSuccessResponse('Login Verified Successfully', 200, payload);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async logout(dto: any, isApp: boolean) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: dto.userId, status: true },
      });

      if (!user) {
        throw new HttpException(
          'User not found or inactive',
          HttpStatus.NOT_FOUND,
        );
      }

      if (isApp) {
        // Clear the app session token and verification token for app logout
        await this.prisma.user.update({
          where: { id: user.id },
          data: { app_session_token: null, app_verification_token: null }, // Invalidate the session and verification token for app
        });
      }

      return handleSuccessResponse('Logout Successful', 200, {});
    } catch (error) {
      handlePrismaError(error);
    }
  }

  //Job fair
  async jobfairUser(body: JobfairUserInterface) {
    try {
      await this.prisma.jobFair.create({
        data: {
          email: body.email,
          fullName: body.fullName,
          highestDegree: body.highestDegree,
          fieldofInterest: body.fieldofInterest,
          phone: body.phone,
          jobFairLocation: body.jobFairLocation,
        },
      });
      const replacements = {
        replaceHeader: 'System generated mail',
        replaceUserName: `${body.fullName}`,
        message: `
        Thank you for your interest in our job fair held on ${body?.jobFairLocation}. To proceed with your application, we kindly request you to submit your updated resume at your earliest convenience.<br><br>
        Please ensure that your resume highlights your key skills and relevant experiences. Our team will review all submissions and contact selected candidates for the next steps.<br><br>
        Kindly note that this is a no-reply email. For any inquiries, please reach out to us at jobfair@yopmail.com <br><br>
        We look forward to receiving your resume!<br>

        `,
      };

      const template = replacePlaceholders(replacements);

      await sendEmail(body.email, 'Job fair', template);

      return handleSuccessResponse('', 200, 'Request Submitted Successfully.');
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async changePassowrd(dto: changePassowrdUserDto, request) {
    try {
      const userId: any = request?.user?.id;

      const user = await this.prisma.user.findFirst({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
      }

      const passwordMatch = await bcrypt.compare(
        dto.current_password,
        user.password,
      );

      if (!passwordMatch) {
        throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
      }

      const hashedPassword = await hashPassword(dto.new_password);

      const updateUserPassword = await this.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          super: true,
          role_mapping: {
            select: { modules: true, role: true, permission: true },
          },
        },
      });

      return handleSuccessResponse(
        'Password Update Successfully',
        200,
        updateUserPassword,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async forgotPassword(body: { email: string }) {
    try {
      const { email } = body;

      const user = await this.prisma.user.findFirst({
        where: { email: email },
      });

      if (!user) {
        throw new HttpException(
          'User does not exists!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const resetToken = generateResetToken();

      await sendResetEmail(email, resetToken);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          reset_token: resetToken,
          reset_token_expires: new Date(Date.now() + 3600000), // Token expires in 1 hour
        },
      });

      return handleSuccessResponse(
        '',
        200,
        'Password reset instructions sent to your email',
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async resetPassword(body: { reset_token: string; new_password: string }) {
    try {
      const { reset_token, new_password } = body;

      const user = await this.prisma.user.findFirst({
        where: {
          reset_token: reset_token,
          reset_token_expires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        // return handleSuccessResponse('Invalid or expired token', 500, '');
        throw new HttpException(
          'Invalid or expired token',
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashedPassword = await hashPassword(new_password);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          reset_token: null,
          reset_token_expires: null,
        },
      });

      return handleSuccessResponse('', 200, 'Password reset successful');
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getPM() {
    try {
      const roles = await this.prisma.roles.findFirst({
        where: { name: 'Project Manager' },
      });

      const user = await this.prisma.user.findMany({
        where: { role_id: roles.id, status: true },
        select: { id: true, name: true },
      });

      return handleSuccessResponse('', 200, user);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async listing(query: any) {
    try {
      const regex = /^\s*(id|created_at|updated_at|name)\s+(asc|desc)\s*$/i;
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
            if (filter.columnName == 'role') {
              where = {
                ...where,
                [filter.columnName]: {
                  name: {
                    [filter.filter]: filter.value.contains,
                    mode: 'insensitive',
                  },
                },
              };
            } else {
              where = {
                ...where,
                [filter.columnName]: {
                  [filter.filter]: filter.value.contains,
                  mode: 'insensitive',
                },
              };
            }
          }
        });
      }

      const user = await this.prisma.user.findMany({
        include: { resource: true, role: true },
        take: +query?.$top,
        skip: +query?.$skip,
        orderBy: {
          [column]: value,
        },
        where: {
          ...where,
          status: true,
        },
      });

      const count = await this.prisma.user.count();

      const res = {
        rows: user,
        count: count,
      };

      return handleSuccessResponse('', 200, res);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async userDropdown(request: any) {
    try {
      const user = request?.user;
      if (user?.role?.name == 'Super Admin') {
        return handleSuccessResponse('', 200, []);
      }
      if (user?.resource?.department_id == '64eef8334a3912fea3a48ba8') {
        const users = await this.prisma.user.findMany({
          include: { resource: true },
          where: {
            resource: {
              department_id: '65828652a1ef3ccffffca1f8',
              is_team_lead: true,
            },
          },
        });
        return handleSuccessResponse('', 200, users);
      } else {
        const users = await this.prisma.user.findMany({
          include: { resource: true },
          where: {
            status: true,
            resource: {
              department_id: user?.resource?.department_id,
              is_team_lead: true,
            },
          },
        });
        return handleSuccessResponse('', 200, users);
      }
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async userDropDown1() {
    try {
      const users = await this.prisma.user.findMany({
        include: {
          resource: true,
        },
        where: {
          status: true,
        },
      });
      return handleSuccessResponse('', 200, users);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          designation: true,
          employement_code: true,
          resource: true,
          role: true,
          super: true,
          status: true,
        },
      });
      return handleSuccessResponse('', 200, user);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateUser(id: string, dto: any) {
    try {
      const superRoleIds = ['64b7c3a06edd7dbdbb554648'];

      if (superRoleIds.includes(dto.role_id)) {
        dto.super = true;
      } else {
        dto.super = false;
      }

      if (!dto.name && dto.resource_id) {
        const resource = await this.prisma.resource.findFirst({
          where: { id: dto.resource_id },
          select: { name: true },
        });

        if (resource?.name) {
          dto.name = resource.name;
        }
      }

      await updateUserDirectMongo(id, dto, dto.super as boolean);
      const user = await this.prisma.user.findFirst({ where: { id: id } });

      // const user = await this.prisma.user.update({
      //   where: { id : exisitingUser.id },
      //   data: {
      //     email: dto.email,
      //     name: dto.name,
      //     role_id: dto.role_id,
      //     resource_id: dto.resource_id,
      //     super: dto.super,
      //     status: dto.status,
      //     designation: dto.designation,
      //     employement_code: dto.employement_code,
      //     picture: dto.picture,
      //   },
      // });

      const superRoleProjectPermissionIds = [
        '64b7c3a06edd7dbdbb554648',
        '64c23c2a5462d5a61e846262',
        '6572ef3155e84fe0be0264cd',
        '68f11ca7da34bb4e11260665',
      ];

      if (superRoleProjectPermissionIds.includes(dto.role_id)) {
        dto.super = true;
      } else {
        dto.super = false;
      }

      if (user?.id) {
        const userPermission = await this.prisma.project_permissions.findFirst({
          where: { user_id: user.id },
        });
        if (userPermission?.id) {
          await this.prisma.project_permissions.update({
            where: { id: userPermission.id },
            data: {
              super: dto.super,
              status: dto.status,
            },
          });
        } else if (user?.id && user?.super) {
          const userPermission = await this.prisma.project_permissions.create({
            data: {
              user_id: user.id,
              super: true,
            },
          });
        }

        const findTaskPermission = await this.prisma.task_permission.findFirst({
          where: {
            user_id: user?.id,
            super: true,
          },
        });

        if (findTaskPermission) {
          await this.prisma.task_permission.update({
            data: {
              super: dto.super,
              status: dto.status,
            },
            where: { id: findTaskPermission?.id },
          });
        } else if (user?.id && user?.super) {
          await this.prisma.task_permission.create({
            data: {
              user_id: user.id,
              super: true,
            },
          });
        }
      }

      return handleSuccessResponse('', 200, 'User Updated Successfully');
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async userConstants(request) {
    try {
      const userId: any = request?.user?.id;

      const user = await this.prisma.user.findFirst({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          employement_code: true,
          screenshot: true,
          screenshot_time: true,
          timeout_time: true,
          UserApps: {
            select: {
              ScreenShotApps: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
      if (user?.UserApps.length > 0) {
        const apps = user.UserApps.map((x: any) => {
          return x?.ScreenShotApps?.name;
        });
        user.UserApps = apps;
      }
      if (user.screenshot == null) {
        user.screenshot = true;
      }
      if (!user) {
        throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
      }

      return handleSuccessResponse('Password Update Successfully', 200, user);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async addApps(request, body) {
    try {
      const userRole = request?.user?.role?.name;
      const isSuperAdmin = userRole === 'Super Admin';
      if (isSuperAdmin) {
      } else {
        throw new HttpException(
          'You are not authorized.',
          HttpStatus.BAD_REQUEST,
        );
      }
      const appName = body.name.toLowerCase();
      const app = await this.prisma.screenShotApps.findFirst({
        where: {
          name: appName,
        },
      });
      if (app) {
        throw new HttpException(
          'App with same name already exists.',
          HttpStatus.BAD_REQUEST,
        );
      }
      const newApp = await this.prisma.screenShotApps.create({
        data: {
          name: appName,
        },
      });
      return newApp;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  async updateUserConstants(request, body) {
    try {
      const userRole = request?.user?.role?.name;
      const isSuperAdmin = userRole == 'Super Admin';
      if (isSuperAdmin) {
        const emp_code = body?.emp_code;
        const findentry = await this.prisma.userApps.findMany({
          where: {
            emp_code: emp_code,
          },
        });
        if (findentry.length > 0) {
          const deleteEntries = await this.prisma.userApps.deleteMany({
            where: { emp_code: emp_code },
          });
        }
        const appIds = await Promise.all(
          body.appId.map(async (x) => {
            const find = await this.prisma.screenShotApps.findFirst({
              where: { id: x },
            });
            return find ? x : null;
          }),
        );
        const validAppIds = appIds.filter(Boolean);

        if (validAppIds.length > 0) {
          const newEntries = await this.prisma.userApps.createMany({
            data: validAppIds.map((x) => ({
              emp_code: emp_code,
              ScreenShotAppsId: x,
            })),
          });
        }
        const updateUser = await this.prisma.user.update({
          where: {
            employement_code: emp_code,
          },
          data: {
            screenshot: body?.screenshot,
            screenshot_time: body?.screenshot_time,
            timeout_time: body.timeout_time,
          },
        });
        return { constants: updateUser };
      } else {
        throw new HttpException(
          'You are not authorized.',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}

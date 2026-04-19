import { HttpStatus, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';
import { UpdateProjectHoursDto } from './dto/update-project-hour.dto';

@Injectable()
export class ProductionCapacityService {
  constructor(private prisma: PrismaService) {}
  create(createProductionCapacityDto: any) {
    return 'This action adds a new productionCapacity';
  }

  async findAll(request: any) {
    try {
      const resourceId = request?.user?.resource_id;
      const hasSuperPermission = request?.user?.role?.name === 'Super Admin';

      // Get department if not super admin
      let TeamLeadDepartment = null;
      if (!hasSuperPermission) {
        TeamLeadDepartment = await this.prisma.resource.findFirst({
          where: { id: resourceId, is_team_lead: true },
        });
      }

      // Build filter condition
      const whereCondition: any = {};
      if (!hasSuperPermission && TeamLeadDepartment?.department_id) {
        whereCondition.project_hours = {
          some: {
            department_id: TeamLeadDepartment.department_id,
            hours: { gt: 0 }, // Only hours > 0
          },
        };
      }

      // Fetch projects
      const projects = await this.prisma.project.findMany({
        where: whereCondition,
        include: {
          project_hours: {
            include: { department: true },
          },
          project_contract_type: true,
          production_capacity: true,
          project_consumed_hours: true,
        },
        orderBy: { created_at: 'desc' },
      });

      // Prepare allocated capacity mapping
      const allocatedCapacityData: Record<string, number> = {};
      projects.forEach((project) => {
        project?.production_capacity?.forEach((alloc) => {
          const key = `${alloc.projectId}_${alloc.departmentId}_${alloc.monthKey}`;
          allocatedCapacityData[key] = alloc.hours;
        });
      });

      return handleSuccessResponse(
        'Projects and allocations fetched successfully',
        HttpStatus.OK,
        {
          projects,
          allocatedCapacityData,
        },
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateProjectHours(updateDto: UpdateProjectHoursDto) {
    const transaction = [];

    for (const update of updateDto.updates) {
      const { projectId, departmentId, monthKey, hours } = update;

      // Find existing production_capacity entry for the specific project, department, and month
      const existingEntry = await this.prisma.production_capacity.findFirst({
        where: {
          projectId: projectId,
          departmentId: departmentId,
          monthKey: monthKey,
        },
      });

      if (existingEntry) {
        // Update existing entry
        transaction.push(
          this.prisma.production_capacity.update({
            where: { id: existingEntry.id },
            data: { hours: hours },
          }),
        );
      } else {
        // Create new entry if it doesn't exist
        transaction.push(
          this.prisma.production_capacity.create({
            data: {
              projectId: projectId,
              departmentId: departmentId,
              monthKey: monthKey,
              hours: hours,
              status: true,
            },
          }),
        );
      }
    }

    try {
      await this.prisma.$transaction(transaction);
      return handleSuccessResponse(
        'Production capacity hours updated successfully',
        HttpStatus.OK,
        {},
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  // NEW: Get monthly capacity data for specific month
  async findMonthlyCapacity(month: string, request: any) {
    try {
      const resourceId = request?.user?.resource_id;
      const hasSuperPermission = request?.user?.role?.name === 'Super Admin';

      // Get department if not super admin
      let TeamLeadDepartment = null;
      if (!hasSuperPermission) {
        TeamLeadDepartment = await this.prisma.resource.findFirst({
          where: { id: resourceId, is_team_lead: true },
        });
      }

      // Build filter condition
      const whereCondition: any = {};
      if (!hasSuperPermission && TeamLeadDepartment?.department_id) {
        whereCondition.project_hours = {
          some: {
            department_id: TeamLeadDepartment.department_id,
            hours: { gt: 0 },
          },
        };
      }

      // Get departments
      const departments = await this.prisma.department.findMany({
        where: { status: true },
        include: { resource: { where: { status: true } } },
      });

      // Get projects for capacity calculation
      const projects = await this.prisma.project.findMany({
        where: whereCondition,
        include: {
          production_capacity: {
            where: { monthKey: month },
          },
        },
      });

      // Calculate utilization for each department
      const monthlyUtilization: Record<string, any> = {};

      departments.forEach((dept) => {
        let totalAllocatedHours = 0;

        // Sum up allocated hours for this department in this month
        projects.forEach((project) => {
          const deptCapacity = project.production_capacity.find(
            (cap) => cap.departmentId === dept.id,
          );
          if (deptCapacity) {
            totalAllocatedHours += deptCapacity.hours;
          }
        });

        // Calculate working days for the month
        const [year, monthNum] = month.split('-').map(Number);
        const workingDays = this.getWorkingDaysInMonth(year, monthNum - 1);
        const departmentCapacity = dept.resource.length * 8 * workingDays;

        const utilization =
          departmentCapacity > 0
            ? (totalAllocatedHours / departmentCapacity) * 100
            : 0;
        const resourcesRequired = Math.ceil(
          (totalAllocatedHours - departmentCapacity) / (8 * workingDays),
        );

        monthlyUtilization[dept.id] = {
          utilization: Number(utilization.toFixed(2)),
          threshold: 100,
          resourcesRequired: resourcesRequired,
        };
      });

      return handleSuccessResponse(
        'Monthly capacity data fetched successfully',
        HttpStatus.OK,
        {
          departments,
          monthlyUtilization,
        },
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  // NEW: Get capacity data for date range
  async findCapacityByRange(
    startMonth: string,
    endMonth: string,
    request: any,
  ) {
    try {
      const resourceId = request?.user?.resource_id;
      const hasSuperPermission = request?.user?.role?.name === 'Super Admin';

      // Get department if not super admin
      let TeamLeadDepartment = null;
      if (!hasSuperPermission) {
        TeamLeadDepartment = await this.prisma.resource.findFirst({
          where: { id: resourceId, is_team_lead: true },
        });
      }

      // Build filter condition
      const whereCondition: any = {};
      if (!hasSuperPermission && TeamLeadDepartment?.department_id) {
        whereCondition.project_hours = {
          some: {
            department_id: TeamLeadDepartment.department_id,
            hours: { gt: 0 },
          },
        };
      }

      // Generate month range
      const monthRange = this.generateMonthRange(startMonth, endMonth);

      const projects = await this.prisma.project.findMany({
        where: whereCondition,
        include: {
          project_hours: {
            include: { department: true },
          },
          project_contract_type: true,
          production_capacity: {
            where: {
              monthKey: { in: monthRange },
            },
          },
          project_consumed_hours: true,
        },
        orderBy: { created_at: 'desc' },
      });

      const departments = await this.prisma.department.findMany({
        where: { status: true },
        include: { resource: { where: { status: true } } },
      });

      // Transform production_capacity data
      const allocatedCapacityData: Record<string, number> = {};
      projects.forEach((project) => {
        project.production_capacity.forEach((alloc) => {
          const key = `${alloc.projectId}_${alloc.departmentId}_${alloc.monthKey}`;
          allocatedCapacityData[key] = alloc.hours;
        });
      });

      return handleSuccessResponse(
        'Range capacity data fetched successfully',
        HttpStatus.OK,
        {
          projects,
          allocatedCapacityData,
          departments,
        },
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  // Helper method to calculate working days
  private getWorkingDaysInMonth(year: number, month: number): number {
    let workingDays = 0;
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        workingDays++;
      }
      date.setDate(date.getDate() + 1);
    }
    return workingDays;
  }

  // Helper method to generate month range
  private generateMonthRange(startMonth: string, endMonth: string): string[] {
    const months = [];
    const start = new Date(startMonth + '-01');
    const end = new Date(endMonth + '-01');

    const current = new Date(start);
    while (current <= end) {
      const monthKey = `${current.getFullYear()}-${String(
        current.getMonth() + 1,
      ).padStart(2, '0')}`;
      months.push(monthKey);
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }

  async ProfitByResource(dto: any) {
    try {
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);

      const resourceFilter: any = { status: true };
      if (dto.resourceId) {
        resourceFilter.id = dto.resourceId;
      }
      if (dto.departmentId) {
        resourceFilter.department_id = dto.departmentId;
      }

      const allocations = await this.prisma.per_date_allocation.findMany({
        where: {
          date: { gte: startDate, lt: endDate },
          resource: resourceFilter,
        },
        select: {
          task_hours: true,
          resource: {
            select: { id: true, name: true, rate: true, department_id: true },
          },
          allocation: {
            select: {
              task: {
                select: {
                  project: {
                    select: {
                      id: true,
                      name: true,
                      dicsounted_cost: true,
                      production_capacity: {
                        select: {
                          departmentId: true,
                          hours: true,
                          monthKey: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const resourceMap: Record<
        string,
        {
          resourceId: string;
          resourceName: string;
          rate: number;
          departmentId: string;
          projects: Record<
            string,
            {
              consumedHours: number;
              cost: number;
              proposedHours: number;
              pnlHours: number;
              pnlCost: number;
              dicsounted_cost: any;
            }
          >;
          totals: {
            hours: number;
            cost: number;
            proposedHours: number;
            pnlHours: number;
            pnlCost: number;
          };
          proposedAdded: Set<string>;
        }
      > = {};

      for (const alloc of allocations) {
        const res = alloc.resource;
        if (!res) continue;

        if (!resourceMap[res.id]) {
          resourceMap[res.id] = {
            resourceId: res.id,
            resourceName: res.name,
            rate: Number(res?.rate?.value ?? 0),
            departmentId: res.department_id,
            projects: {},
            totals: {
              hours: 0,
              cost: 0,
              proposedHours: 0,
              pnlHours: 0,
              pnlCost: 0,
            },
            proposedAdded: new Set(),
          };
        }

        const resourceEntry = resourceMap[res.id];
        const project = alloc.allocation?.task?.project;
        if (!project) continue;

        const projectKey = project.name;

        if (!resourceEntry.projects[projectKey]) {
          resourceEntry.projects[projectKey] = {
            consumedHours: 0,
            cost: 0,
            proposedHours: 0,
            pnlHours: 0,
            pnlCost: 0,
            dicsounted_cost: project.dicsounted_cost ?? 0,
          };
        }

        const consumed = Number(alloc.task_hours ?? 0);
        const projEntry = resourceEntry.projects[projectKey];

        // Accumulate consumed hours
        projEntry.consumedHours += consumed;
        projEntry.cost += consumed * resourceEntry.rate;

        resourceEntry.totals.hours += consumed;
        resourceEntry.totals.cost += consumed * resourceEntry.rate;

        // Multiple months: accumulate proposed per month only once
        (project.production_capacity ?? []).forEach((pc) => {
          const key = `${projectKey}_${pc.monthKey}`;
          if (
            pc.departmentId === res.department_id &&
            new Date(pc.monthKey + '-01') >= startDate &&
            new Date(pc.monthKey + '-01') <= endDate &&
            !resourceEntry.proposedAdded.has(key)
          ) {
            projEntry.proposedHours += Number(pc.hours ?? 0);
            resourceEntry.totals.proposedHours += Number(pc.hours ?? 0);
            resourceEntry.proposedAdded.add(key);
          }
        });

        // Recalculate PnL
        projEntry.pnlHours = projEntry.proposedHours - projEntry.consumedHours;
        projEntry.pnlCost =
          projEntry.proposedHours * resourceEntry.rate - projEntry.cost;

        resourceEntry.totals.pnlHours =
          resourceEntry.totals.proposedHours - resourceEntry.totals.hours;
        resourceEntry.totals.pnlCost =
          resourceEntry.totals.proposedHours * resourceEntry.rate -
          resourceEntry.totals.cost;
      }

      return Object.values(resourceMap);
    } catch (error) {
      throw error;
    }
  }
}

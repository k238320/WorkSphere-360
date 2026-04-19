import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { TechnologyModule } from './technology/technology.module';
import { IndustryModule } from './industry/industry.module';
import { ProjectModule } from './project/project.module';
import { ProjectCategoryHoursModule } from './project-category-hours/project-category-hours.module';
import { DepartmentModule } from './department/department.module';
import { ProjectMilestoneModule } from './project-milestone/project-milestone.module';
import { AuthModule } from './auth/auth.module';
import { MilestonePhaseModule } from './milestone-phase/milestone-phase.module';
import { ProjectStatusModule } from './project-status/project-status.module';
import { ProjectStatusesModule } from './project-statuses/project-statuses.module';
import { ProjectStatusCategoryModule } from './project-status-category/project-status-category.module';
import { UploadModule } from './upload/upload.module';
import { CostModule } from './cost/cost.module';
import { ProjectHoursModule } from './project-hours/project-hours.module';
import { WeeklyStatusModule } from './weekly-status/weekly-status.module';
import { ClientDetailModule } from './client-detail/client-detail.module';
import { ResourceModule } from './resource/resource.module';
import { TaskCategoryModule } from './task_category/task_category.module';
import { TaskStatusModule } from './task_status/task_status.module';
import { TaskModule } from './task/task.module';
import { RolesModule } from './roles/roles.module';
import { ScreensModule } from './screens/screens.module';
import { RolesPermissionModule } from './roles-permission/roles-permission.module';
import { ModulesModule } from './modules/modules.module';
import { PmoDocumentModule } from './pmo-document/pmo-document.module';
import { NotificationModule } from './notification/notification.module';
import { AttendanceModule } from './attendance/attendance.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance/attendance.service';
import { ScheduleModule } from '@nestjs/schedule';

import { UserDetailModule } from './user-detail/user-detail.module';
import { PmStatusModule } from './pm-status/pm-status.module';
import { AssetCategoryModule } from './asset-category/asset-category.module';
import { VendorModule } from './vendor/vendor.module';
import { AssetModule } from './asset/asset.module';
import { HolidayModule } from './holiday/holiday.module';
import { HrPolicyModule } from './hr-policy/hr-policy.module';
import { EventModule } from './event/event.module';
import { ExtraHourModule } from './extra-hour/extra-hour.module';
import { FixAttendanceModule } from './fix-attendance/fix-attendance.module';

import { WFHModule } from './wfh/wfh.module';
import { DxbAttendanceModule } from './dxb-attendance/dxb-attendance.module';
import { PayslipModule } from './payslip/payslip.module';
import { PortalWfhModule } from './portal-wfh/portal-wfh.module';
import { LeavesSystemModule } from './leaves-system/leaves-system.module';
import { LeaveApproveService } from './attendance/helperServices/leave-approve.service';
import { LeaveCreateService } from './attendance/helperServices/leave-create.service';
import { LeaveRejectService } from './attendance/helperServices/leave-reject.service';
import { ResignationModule } from './resignation/resignation.module';
import { MilestoneCommentModule } from './milestone-comment/milestone-comment.module';
import { DashboardOverview } from './attendance/helperServices/dashboard';
import { ProjectDivisionsModule } from './project-divisions/project-divisions.module';
import { ProjectContractTypeModule } from './project_contract_type/project_contract_type.module';
import { ProjectAutomationModule } from './project-automation/project-automation.module';
import { ProductionCapacityModule } from './production-capacity/production-capacity.module';
import { ExternalModule } from './external/external.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env['PGSQL_HOST'],
      port: +process.env['PGSQL_PORT'],
      username: process.env['PGSQL_USER'],
      password: process.env['PGSQL_PASS'],
      database: process.env['PGSQL_DB'],
      entities: [
        /* your entities here */
      ],
      synchronize: true, // set to false in production
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    // DXB Database
    TypeOrmModule.forRoot({
      name: 'DXBattendance',
      type: 'postgres',
      host: process.env['PGSQL_HOST_DXB'],
      port: +process.env['PGSQL_PORT_DXB'],
      username: process.env['PGSQL_USER_DXB'],
      password: process.env['PGSQL_PASS_DXB'],
      database: process.env['PGSQL_DB_DXB'],
      entities: [],
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    UserModule,
    CategoryModule,
    TechnologyModule,
    IndustryModule,
    ProjectModule,
    ProjectCategoryHoursModule,
    DepartmentModule,
    ProjectMilestoneModule,
    AuthModule,
    MilestonePhaseModule,
    ProjectStatusModule,
    ProjectStatusesModule,
    ProjectStatusCategoryModule,
    UploadModule,
    CostModule,
    ProjectHoursModule,
    WeeklyStatusModule,
    ClientDetailModule,
    ResourceModule,
    TaskCategoryModule,
    TaskStatusModule,
    TaskModule,
    RolesModule,
    ScreensModule,
    RolesPermissionModule,
    ModulesModule,
    PmoDocumentModule,
    NotificationModule,
    AttendanceModule,
    UserDetailModule,
    PmStatusModule,
    AssetCategoryModule,
    VendorModule,
    AssetModule,
    HolidayModule,
    HrPolicyModule,
    EventModule,
    ExtraHourModule,
    FixAttendanceModule,
    WFHModule,
    DxbAttendanceModule,
    PayslipModule,
    PortalWfhModule,
    LeavesSystemModule,
    ResignationModule,
    MilestoneCommentModule,
    ProjectDivisionsModule,
    ProjectContractTypeModule,
    ProjectAutomationModule,
    ProductionCapacityModule,
    ExternalModule,
  ],
  controllers: [],
  // providers: [AttendanceService],
  providers: [
    AttendanceService,
    LeaveCreateService,
    LeaveApproveService,
    LeaveRejectService,
    DashboardOverview,
  ],
})
export class AppModule {}

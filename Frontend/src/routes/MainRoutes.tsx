/* eslint-disable import/no-unresolved */
import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';
import ProjectUpdate from 'pages/Project/ProjectUpdate';
import ProjectManagerStatusListing from 'pages/ProjectManagerStatus/ProjectManagerStatusListing';
import ProjectManagerStatusCreate from 'pages/ProjectManagerStatus/ProjectManagerStatusCreate';
import ProductionCapacity from 'pages/ProductionCapacity';

// dashboard routing
const DashboardDefault: any = Loadable(lazy(() => import('views/dashboard/Default')));

// application - user social & account profile routing
const AppUserAccountProfile1 = Loadable(lazy(() => import('views/application/users/account-profile/Profile1')));

const HumanResourse = Loadable(lazy(() => import('pages/HumanResourse')));

//Employees -
const EmployeeListing = Loadable(lazy(() => import('pages/ListOfEmplyee')));

// project page routing
const ProjectCreate = Loadable(lazy(() => import('pages/Project/ProjectCreate')));
const ProjectListing = Loadable(lazy(() => import('pages/Project/ProjectListing')));
const ProjectHours = Loadable(lazy(() => import('pages/Project/ProjectHours')));
const ProjectTrackers = Loadable(lazy(() => import('pages/Project/ProjectTrackers')));
// project page routing
const AllocationCreate = Loadable(lazy(() => import('pages/Allocations/AllocationCreate')));
const AllocationListing = Loadable(lazy(() => import('pages/Allocations/AllocationListing')));

// Finance
const PaymentsMilestoneListing = Loadable(lazy(() => import('pages/Finance/PaymentsMilestone')));
// Resource page routing
const ResourceCreate = Loadable(lazy(() => import('pages/Resource/ResourceCreate')));
const ResourceListing = Loadable(lazy(() => import('pages/Resource/ResourceListing')));
// Industry page routing
const IndustryCreate = Loadable(lazy(() => import('pages/Industry/IndustryCreate')));
const IndustryListing = Loadable(lazy(() => import('pages/Industry/IndustryListing')));
// Technology page routing
const TechnologyCreate = Loadable(lazy(() => import('pages/Technology/TechnologyCreate')));
const TechnologyListing = Loadable(lazy(() => import('pages/Technology/TechnologyListing')));

// Project Milestone page routing
const MilestoneCreate = Loadable(lazy(() => import('pages/ProjectMilestone/ProjectMilestoneCreate')));
const ProjectMilestoneListing = Loadable(lazy(() => import('pages/ProjectMilestone/ProjectMilestoneListing')));

// Project Category page routing
const ProjectCategoryCreate = Loadable(lazy(() => import('pages/ProjectCategory/ProjectCategoryCreate')));
const ProjectCategoryListing = Loadable(lazy(() => import('pages/ProjectCategory/ProjectCategoryListing')));

// Project Status page routing
const ProjectStatusCreate = Loadable(lazy(() => import('pages/projectStatus/ProjectStatusCreate')));
const ProjectStatusListing = Loadable(lazy(() => import('pages/projectStatus/ProjectStatusListing')));

// Project Status page routing
const CategoryStatusCreate = Loadable(lazy(() => import('pages/ProjectCategoryStatus/CategoryStatusCreate')));
const ProjectCategoryStatusListing = Loadable(lazy(() => import('pages/ProjectCategoryStatus/CategoryStatusListing')));

// Department Page Routing
const DepartmentCreate = Loadable(lazy(() => import('pages/Department/DepartmentCreate')));
const DepartmentListing = Loadable(lazy(() => import('pages/Department/DepartmentListing')));

// AssetCategory Page Routing
const AssetCategoryCreate = Loadable(lazy(() => import('pages/AssetCategory/AssetCategoryCreate')));
const AssetCategoryListing = Loadable(lazy(() => import('pages/AssetCategory/AssetCategoryListing')));

// Vendor Page Routing
const VendorCreate = Loadable(lazy(() => import('pages/Vendor/VendorCreate')));
const VendorListing = Loadable(lazy(() => import('pages/Vendor/VendorListing')));

// Asset Page Routing
const AssetCreate = Loadable(lazy(() => import('pages/AssetManagement/AssetCreate')));
// const AssetListing = Loadable(lazy(() => import('pages/Vendor/VendorListing')));
const AssetListing = Loadable(lazy(() => import('pages/AssetManagement/AssetListing')));
const AssignAsset = Loadable(lazy(() => import('pages/AssetManagement/AssignAsset')));
const AssetComplain = Loadable(lazy(() => import('pages/AssetManagement/AssetComplain')));

// Task
const TaskCategoryListing = Loadable(lazy(() => import('pages/TaskCategory/TaskCategoryListing')));
const TaskCategoryCreate = Loadable(lazy(() => import('pages/TaskCategory/TaskCategoryCreate')));

// Calendar
const AppCalendar = Loadable(lazy(() => import('pages/Calendar')));
const ManageCalendarResource = Loadable(lazy(() => import('pages/Calendar/MangeCalendarResource')));

// PMO Documents
const PmoDocumentCreate = Loadable(lazy(() => import('pages/PmoDocument/PmoDocumentCreate')));
const PmoDocumentListing = Loadable(lazy(() => import('pages/PmoDocument/PmoDocumentListing')));

// Holiday
const HolidayCreate = Loadable(lazy(() => import('pages/Holiday/HolidayCreate')));
const HolidayListing = Loadable(lazy(() => import('pages/Holiday/HolidayListing')));

// HR Policy
const HrPolicyCreate = Loadable(lazy(() => import('pages/HrPolicy/HrPolicyCreate')));
const HrPolicyListing = Loadable(lazy(() => import('pages/HrPolicy/HrPolicyListing')));

// Administration

const CreateScreen = Loadable(lazy(() => import('pages/Administration/ScreenCreate')));
const CreateRole = Loadable(lazy(() => import('pages/Administration/RoleCreate')));
const RoleListing = Loadable(lazy(() => import('pages/Administration/RoleListing')));
const UserListing = Loadable(lazy(() => import('pages/Administration/UserListing')));
const UserCreate = Loadable(lazy(() => import('pages/Administration/UserCreate')));
const UserEdit = Loadable(lazy(() => import('pages/Administration/UserEdit')));

// Attendance

const Attendance = Loadable(lazy(() => import('pages/Attendance/AttendanceListing')));
const AddLeave = Loadable(lazy(() => import('pages/Attendance/AddLeave')));
const LeaveListing = Loadable(lazy(() => import('pages/Attendance/LeaveRecord')));
const FixAttendance = Loadable(lazy(() => import('pages/Attendance/FixAttendance')));
const YearlyRecord = Loadable(lazy(() => import('pages/Attendance/YearlyRecord')));
// const ExtraHour = Loadable(lazy(() => import('pages/Attendance/ExtraHour')));
const ExtraHour = Loadable(lazy(() => import('pages/Attendance/ExtraHour')));
const ListOfExtraHour = Loadable(lazy(() => import('pages/Attendance/ListOfExtraHour')));

const ResourceUtilization = Loadable(lazy(() => import('pages/ResourceUtilization')));
const CreateEvent = Loadable(lazy(() => import('pages/Event/CreateEvent')));
const EventListing = Loadable(lazy(() => import('pages/Event/EventListing')));

const ProjectsProfitability = Loadable(lazy(() => import('pages/Reports/ProjectsProfitability')));
const ProjectReportDetail = Loadable(lazy(() => import('pages/Reports/ProjectsProfitability/ProjectReportDetail')));
const ResourceUpdate = Loadable(lazy(() => import('pages/Reports/ResourceUpdate/ResourceUpdate')));
const ProfitByResource = Loadable(lazy(() => import('pages/Reports/ProfitByResource')));
// Screen Shots
const ScreenShotsListing = Loadable(lazy(() => import('pages/ScreenShots/ScreenShotsListing')));

const PayslipList = Loadable(lazy(() => import('pages/Payslip')));

const CapacityChartPage = Loadable(lazy(() => import('pages/ProductionCapacity/capacity-chart')));
// ==============================|| MAIN ROUTING ||============================== //

export const MainRoutes = {
    path: '/',
    element: (
        <AuthGuard>
            <MainLayout />
        </AuthGuard>
    ),
    children: [
        // Reporsts
        // {
        //     path: '/payslips',
        //     element: <PayslipList />
        // },

        {
            path: '/production-capacity',
            element: <ProductionCapacity />
        },
        {
            path: '/production-capacity/charts',
            element: <CapacityChartPage />
        },

        {
            path: '/report/projects-profitability',
            element: <ProjectsProfitability />
        },
        {
            path: '/report/resource-update',
            element: <ResourceUpdate />
        },

        {
            path: '/report/resource-productivity',
            element: <ProfitByResource />
        },

        {
            path: '/report/projects-profitability/:id',
            element: <ProjectReportDetail />
        },

        //Project routes==========================>>>>>>>

        {
            path: '/project/create',
            element: <ProjectCreate />
        },
        {
            path: '/project/listing',
            element: <ProjectListing />
        },
        {
            path: '/project/update',
            element: <ProjectUpdate />
        },
        {
            path: '/project/project-trackers',
            element: <ProjectTrackers />
        },
        // {
        //     path: '/project/hours',
        //     element: <ProjectHours />
        // },

        {
            path: '/resource-utilization',
            element: <ResourceUtilization />
        },

        //Human Resource routes==========================>>>>>>>

        {
            path: '/hr/listing',
            element: <EmployeeListing />
        },
        {
            path: '/hr/:id',
            element: <HumanResourse />
        },

        //Holiday routes==========================>>>>>>>

        {
            path: '/holiday/create',
            element: <HolidayCreate />
        },
        {
            path: '/holiday/listing',
            element: <HolidayListing />
        },

        //Allocation routes==========================>>>>>>>

        {
            path: '/allocation/create',
            element: <AllocationCreate />
        },
        {
            path: '/allocation/listing',
            element: <AllocationListing />
        },
        {
            path: '/allocation/update',
            element: <ProjectUpdate />
        },

        {
            path: '/leave/create',
            element: <AddLeave />
        },
        {
            path: '/leave/listing',
            element: <LeaveListing />
        },

        {
            path: '/attendance/listing',
            element: <Attendance />
        },

        // {
        //     path: '/attendance/fix',
        //     element: <FixAttendance />
        // },

        {
            path: '/attendance/yearly-record',
            element: <YearlyRecord />
        },
        {
            path: '/event/event-create',
            element: <CreateEvent />
        },
        {
            path: '/event/event-listing',
            element: <EventListing />
        },

        {
            path: '/finance/payments',
            element: <PaymentsMilestoneListing />
        },
        //Resource routes==========================>>>>>>>
        {
            path: '/resource/create',
            element: <ResourceCreate />
        },
        {
            path: '/resource/listing',
            element: <ResourceListing />
        },

        // Department Routes
        {
            path: '/department/create',
            element: <DepartmentCreate />
        },
        {
            path: '/department/listing',
            element: <DepartmentListing />
        },

        // Asset Category Routes
        {
            path: '/asset-category/create',
            element: <AssetCategoryCreate />
        },
        {
            path: '/asset-category/listing',
            element: <AssetCategoryListing />
        },

        // Vendor Routes
        {
            path: '/vendor/create',
            element: <VendorCreate />
        },
        {
            path: '/vendor/listing',
            element: <VendorListing />
        },

        // Asset Routes
        {
            path: '/asset/create',
            element: <AssetCreate />
        },
        {
            path: '/asset/listing',
            element: <AssetListing />
        },
        {
            path: '/asset/assign-asset',
            element: <AssignAsset />
        },
        {
            path: '/asset/list-of-complain',
            element: <AssetComplain />
        },

        // Project Manager Status Routes
        {
            path: '/pm-status/create',
            element: <ProjectManagerStatusCreate />
        },
        {
            path: '/pm-status/listing',
            element: <ProjectManagerStatusListing />
        },

        //Industry routes==========================>>>>>>>
        {
            path: '/industry/create',
            element: <IndustryCreate />
        },
        {
            path: '/industry/listing',
            element: <IndustryListing />
        },
        //Technology routes==========================>>>>>>>
        {
            path: '/technology/create',
            element: <TechnologyCreate />
        },
        {
            path: '/technology/listing',
            element: <TechnologyListing />
        },
        //Project milestone routes==========================>>>>>>>
        {
            path: '/milestone/create',
            element: <MilestoneCreate />
        },
        {
            path: '/milestone/listing',
            element: <ProjectMilestoneListing />
        },

        //Project Category routes==========================>>>>>>>
        {
            path: '/category/create',
            element: <ProjectCategoryCreate />
        },
        {
            path: '/category/listing',
            element: <ProjectCategoryListing />
        },

        // TaskCategory Routes
        {
            path: '/task-category/create',
            element: <TaskCategoryCreate />
        },
        {
            path: '/task-category/listing',
            element: <TaskCategoryListing />
        },

        //Project Status routes==========================>>>>>>>
        {
            path: '/status/create',
            element: <ProjectStatusCreate />
        },
        {
            path: '/status/listing',
            element: <ProjectStatusListing />
        },
        //Project Category status routes==========================>>>>>>>
        {
            path: '/category_status/create',
            element: <CategoryStatusCreate />
        },
        {
            path: '/category_status/listing',
            element: <ProjectCategoryStatusListing />
        },
        {
            path: 'calendar',
            element: <AppCalendar />
        },

        {
            path: 'calendar/resource-manage',
            element: <ManageCalendarResource />
        },
        //Pmo Document routes==========================>>>>>>>
        {
            path: '/pmo-document/create',
            element: <PmoDocumentCreate />
        },
        {
            path: '/pmo-document/listing',
            element: <PmoDocumentListing />
        },

        //Hr Policy routes==========================>>>>>>>

        {
            path: '/hr-policy/create',
            element: <HrPolicyCreate />
        },
        {
            path: '/hr-policy/listing',
            element: <HrPolicyListing />
        },

        // Administration

        {
            path: '/screen/create',
            element: <CreateScreen />
        },
        {
            path: '/role/create',
            element: <CreateRole />
        },
        {
            path: '/role/listing',
            element: <RoleListing />
        },
        {
            path: '/user/listing',
            element: <UserListing />
        },
        {
            path: '/user/create',
            element: <UserCreate />
        },

        { path: '/user/update', element: <UserEdit /> },
        {
            path: '/user/account-profile/profile1',
            element: <AppUserAccountProfile1 />
        },
        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/attendance/extra-hour',
            element: <ExtraHour />
        },
        {
            path: '/attendance/list-of-extra-hour',
            element: <ListOfExtraHour />
        },

        //Screen Shots routes==========================>>>>>>>

        {
            path: '/screenshots/listing',
            element: <ScreenShotsListing />
        }
    ]
};

export const SalesRoutes = {
    path: '/',
    element: (
        <AuthGuard>
            <MainLayout />
        </AuthGuard>
    ),
    children: [
        //Project routes==========================>>>>>>>
        {
            path: '/payslips',
            element: <PayslipList />
        },
        {
            path: '/project/create',
            element: <ProjectCreate />
        },
        {
            path: '/project/create',
            element: <ProjectCreate />
        },
        {
            path: '/project/listing',
            element: <ProjectListing />
        },
        {
            path: '/project/update',
            element: <ProjectUpdate />
        },
        {
            path: '/leave/create',
            element: <AddLeave />
        },
        {
            path: '/leave/listing',
            element: <LeaveListing />
        },
        {
            path: '/attendance/listing',
            element: <Attendance />
        },

        {
            path: '/attendance/yearly-record',
            element: <YearlyRecord />
        },

        {
            path: 'calendar',
            element: <AppCalendar />
        },

        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/user/account-profile/profile1',
            element: <AppUserAccountProfile1 />
        },
        {
            path: '/hr/:id',
            element: <HumanResourse />
        },
        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/hr-policy/listing',
            element: <HrPolicyListing />
        }
    ]
};

export const FinanceRoutes = {
    path: '/',
    element: (
        <AuthGuard>
            <MainLayout />
        </AuthGuard>
    ),
    children: [
        {
            path: '/report/projects-profitability',
            element: <ProjectsProfitability />
        },
        {
            path: '/report/projects-profitability/:id',
            element: <ProjectReportDetail />
        },
        //Project routes==========================>>>>>>>
        {
            path: '/payslips',
            element: <PayslipList />
        },
        {
            path: '/project/create',
            element: <ProjectCreate />
        },
        {
            path: '/project/listing',
            element: <ProjectListing />
        },
        {
            path: '/project/update',
            element: <ProjectUpdate />
        },

        {
            path: '/finance/payments',
            element: <PaymentsMilestoneListing />
        },
        {
            path: '/leave/create',
            element: <AddLeave />
        },
        {
            path: '/leave/listing',
            element: <LeaveListing />
        },
        {
            path: '/attendance/listing',
            element: <Attendance />
        },

        {
            path: '/attendance/yearly-record',
            element: <YearlyRecord />
        },

        //Project milestone routes==========================>>>>>>>
        {
            path: '/milestone/create',
            element: <MilestoneCreate />
        },
        {
            path: '/milestone/listing',
            element: <ProjectMilestoneListing />
        },

        {
            path: 'calendar',
            element: <AppCalendar />
        },
        {
            path: '/user/account-profile/profile1',
            element: <AppUserAccountProfile1 />
        },
        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/hr/:id',
            element: <HumanResourse />
        },
        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/hr-policy/listing',
            element: <HrPolicyListing />
        },
        {
            path: '/resource-utilization',
            element: <ResourceUtilization />
        }
    ]
};

export const ProjectManagerRoutes = {
    path: '/',
    element: (
        <AuthGuard>
            <MainLayout />
        </AuthGuard>
    ),
    children: [
        //Project routes==========================>>>>>>>
        {
            path: '/payslips',
            element: <PayslipList />
        },
        {
            path: '/project/create',
            element: <ProjectCreate />
        },
        {
            path: '/project/listing',
            element: <ProjectListing />
        },
        {
            path: '/project/update',
            element: <ProjectUpdate />
        },
        {
            path: '/project/project-trackers',
            element: <ProjectTrackers />
        },
        //Allocation routes==========================>>>>>>>
        {
            path: '/allocation/create',
            element: <AllocationCreate />
        },
        {
            path: '/allocation/listing',
            element: <AllocationListing />
        },
        {
            path: '/allocation/update',
            element: <ProjectUpdate />
        },

        // finance

        {
            path: '/finance/payments',
            element: <PaymentsMilestoneListing />
        },

        //Pmo Document routes==========================>>>>>>>
        {
            path: '/pmo-document/listing',
            element: <PmoDocumentListing />
        },
        {
            path: '/leave/create',
            element: <AddLeave />
        },
        {
            path: '/leave/listing',
            element: <LeaveListing />
        },
        {
            path: '/attendance/listing',
            element: <Attendance />
        },

        {
            path: '/attendance/yearly-record',
            element: <YearlyRecord />
        },
        {
            path: 'calendar',
            element: <AppCalendar />
        },
        {
            path: '/user/account-profile/profile1',
            element: <AppUserAccountProfile1 />
        },
        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/hr/:id',
            element: <HumanResourse />
        },
        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/hr-policy/listing',
            element: <HrPolicyListing />
        }
    ]
};

export const TeamLeadRoutes = {
    path: '/',
    element: (
        <AuthGuard>
            <MainLayout />
        </AuthGuard>
    ),
    children: [
        {
            path: '/payslips',
            element: <PayslipList />
        },
        //Allocation routes==========================>>>>>>>
        {
            path: '/allocation/create',
            element: <AllocationCreate />
        },
        {
            path: '/allocation/listing',
            element: <AllocationListing />
        },
        {
            path: '/allocation/update',
            element: <ProjectUpdate />
        },
        {
            path: '/leave/create',
            element: <AddLeave />
        },
        {
            path: '/leave/listing',
            element: <LeaveListing />
        },
        {
            path: '/attendance/listing',
            element: <Attendance />
        },
        {
            path: '/finance/payments',
            element: <PaymentsMilestoneListing />
        },

        {
            path: '/attendance/yearly-record',
            element: <YearlyRecord />
        },

        {
            path: 'calendar',
            element: <AppCalendar />
        },
        {
            path: '/user/account-profile/profile1',
            element: <AppUserAccountProfile1 />
        },

        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/hr/:id',
            element: <HumanResourse />
        },
        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/hr-policy/listing',
            element: <HrPolicyListing />
        },
        {
            path: '/resource-utilization',
            element: <ResourceUtilization />
        },
        {
            path: '/attendance/extra-hour',
            element: <ExtraHour />
        },
        {
            path: '/attendance/list-of-extra-hour',
            element: <ListOfExtraHour />
        },
        {
            path: '/production-capacity',
            element: <ProductionCapacity />
        },
        {
            path: '/production-capacity/charts',
            element: <CapacityChartPage />
        }
    ]
};

export const ResourceRoutes = {
    path: '/',
    element: (
        <AuthGuard>
            <MainLayout />
        </AuthGuard>
    ),
    children: [
        {
            path: '/payslips',
            element: <PayslipList />
        },
        //Allocation routes==========================>>>>>>>
        {
            path: 'calendar',
            element: <AppCalendar />
        },
        {
            path: '/allocation/create',
            element: <AllocationCreate />
        },
        {
            path: '/allocation/listing',
            element: <AllocationListing />
        },
        {
            path: '/allocation/update',
            element: <ProjectUpdate />
        },
        {
            path: '/leave/create',
            element: <AddLeave />
        },
        {
            path: '/leave/listing',
            element: <LeaveListing />
        },
        {
            path: '/attendance/extra-hour',
            element: <ExtraHour />
        },
        {
            path: '/attendance/listing',
            element: <Attendance />
        },

        {
            path: '/attendance/yearly-record',
            element: <YearlyRecord />
        },
        {
            path: '/user/account-profile/profile1',
            element: <AppUserAccountProfile1 />
        },
        {
            path: '/hr/:id',
            element: <HumanResourse />
        },
        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/hr-policy/listing',
            element: <HrPolicyListing />
        },
        {
            path: '/resource-utilization',
            element: <ResourceUtilization />
        }
    ]
};

export const PMLead = {
    path: '/',
    element: (
        <AuthGuard>
            <MainLayout />
        </AuthGuard>
    ),
    children: [
        {
            path: '/payslips',
            element: <PayslipList />
        },
        //Allocation routes==========================>>>>>>>
        {
            path: '/allocation/create',
            element: <AllocationCreate />
        },
        {
            path: '/allocation/listing',
            element: <AllocationListing />
        },
        {
            path: '/allocation/update',
            element: <ProjectUpdate />
        },

        //Project routes==========================>>>>>>>

        {
            path: '/project/create',
            element: <ProjectCreate />
        },
        {
            path: '/project/listing',
            element: <ProjectListing />
        },
        {
            path: '/project/project-trackers',
            element: <ProjectTrackers />
        },
        {
            path: '/project/hours',
            element: <ProjectHours />
        },
        {
            path: '/project/update',
            element: <ProjectUpdate />
        },

        {
            path: '/finance/payments',
            element: <PaymentsMilestoneListing />
        },

        //Pmo Document routes==========================>>>>>>>
        {
            path: '/pmo-document/create',
            element: <PmoDocumentCreate />
        },
        {
            path: '/pmo-document/listing',
            element: <PmoDocumentListing />
        },
        {
            path: 'calendar',
            element: <AppCalendar />
        },
        {
            path: '/user/account-profile/profile1',
            element: <AppUserAccountProfile1 />
        },
        {
            path: '/leave/create',
            element: <AddLeave />
        },
        {
            path: '/leave/listing',
            element: <LeaveListing />
        },
        {
            path: '/attendance/listing',
            element: <Attendance />
        },

        {
            path: '/attendance/yearly-record',
            element: <YearlyRecord />
        },
        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/hr/:id',
            element: <HumanResourse />
        },
        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/hr-policy/listing',
            element: <HrPolicyListing />
        }
    ]
};

export const HRRoutes = {
    path: '/',
    element: (
        <AuthGuard>
            <MainLayout />
        </AuthGuard>
    ),
    children: [
        {
            path: '/payslips',
            element: <PayslipList />
        },
        //Human Resource routes==========================>>>>>>>

        {
            path: '/hr/listing',
            element: <EmployeeListing />
        },
        {
            path: '/hr/:id',
            element: <HumanResourse />
        },
        {
            path: '/attendance/fix',
            element: <FixAttendance />
        },
        {
            path: '/leave/create',
            element: <AddLeave />
        },
        {
            path: '/leave/listing',
            element: <LeaveListing />
        },
        {
            path: '/attendance/listing',
            element: <Attendance />
        },
        {
            path: '/attendance/yearly-record',
            element: <YearlyRecord />
        },
        // Asset Routes
        {
            path: '/asset/create',
            element: <AssetCreate />
        },
        {
            path: '/asset/listing',
            element: <AssetListing />
        },
        {
            path: '/asset/assign-asset',
            element: <AssignAsset />
        },
        {
            path: '/asset/list-of-complain',
            element: <AssetComplain />
        },

        //Resource routes==========================>>>>>>>
        {
            path: '/resource/create',
            element: <ResourceCreate />
        },
        {
            path: '/resource/listing',
            element: <ResourceListing />
        },

        {
            path: '/user/listing',
            element: <UserListing />
        },
        {
            path: '/user/create',
            element: <UserCreate />
        },

        { path: '/user/update', element: <UserEdit /> },

        {
            path: 'calendar',
            element: <AppCalendar />
        },

        {
            path: '/user/account-profile/profile1',
            element: <AppUserAccountProfile1 />
        },

        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/hr-policy/create',
            element: <HrPolicyCreate />
        },
        {
            path: '/hr-policy/listing',
            element: <HrPolicyListing />
        },
        {
            path: '/holiday/create',
            element: <HolidayCreate />
        },
        {
            path: '/holiday/listing',
            element: <HolidayListing />
        },
        {
            path: '/resource-utilization',
            element: <ResourceUtilization />
        }
    ]
};

export const HRExecutiveRoutes = {
    path: '/',
    element: (
        <AuthGuard>
            <MainLayout />
        </AuthGuard>
    ),
    children: [
        {
            path: '/payslips',
            element: <PayslipList />
        },
        //Human Resource routes==========================>>>>>>>

        {
            path: '/hr/listing',
            element: <EmployeeListing />
        },
        {
            path: '/hr/:id',
            element: <HumanResourse />
        },
        {
            path: '/leave/create',
            element: <AddLeave />
        },
        {
            path: '/leave/listing',
            element: <LeaveListing />
        },
        {
            path: '/attendance/listing',
            element: <Attendance />
        },
        {
            path: '/attendance/yearly-record',
            element: <YearlyRecord />
        },
        // Asset Routes
        {
            path: '/asset/create',
            element: <AssetCreate />
        },
        {
            path: '/asset/listing',
            element: <AssetListing />
        },
        {
            path: '/asset/assign-asset',
            element: <AssignAsset />
        },
        {
            path: '/asset/list-of-complain',
            element: <AssetComplain />
        },

        //Resource routes==========================>>>>>>>
        {
            path: '/resource/create',
            element: <ResourceCreate />
        },
        {
            path: '/resource/listing',
            element: <ResourceListing />
        },

        {
            path: '/user/listing',
            element: <UserListing />
        },
        {
            path: '/user/create',
            element: <UserCreate />
        },

        { path: '/user/update', element: <UserEdit /> },

        {
            path: 'calendar',
            element: <AppCalendar />
        },

        {
            path: '/user/account-profile/profile1',
            element: <AppUserAccountProfile1 />
        },

        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/hr-policy/create',
            element: <HrPolicyCreate />
        },
        {
            path: '/hr-policy/listing',
            element: <HrPolicyListing />
        },
        {
            path: '/holiday/create',
            element: <HolidayCreate />
        },
        {
            path: '/holiday/listing',
            element: <HolidayListing />
        },
        {
            path: '/resource-utilization',
            element: <ResourceUtilization />
        }
    ]
};

export const ITRoutes = {
    path: '/',
    element: (
        <AuthGuard>
            <MainLayout />
        </AuthGuard>
    ),
    children: [
        {
            path: '/payslips',
            element: <PayslipList />
        },
        // Asset Category Routes
        {
            path: '/asset-category/create',
            element: <AssetCategoryCreate />
        },
        {
            path: '/asset-category/listing',
            element: <AssetCategoryListing />
        },

        // Vendor Routes
        {
            path: '/vendor/create',
            element: <VendorCreate />
        },
        {
            path: '/vendor/listing',
            element: <VendorListing />
        },

        // Asset Routes
        {
            path: '/asset/create',
            element: <AssetCreate />
        },
        {
            path: '/asset/listing',
            element: <AssetListing />
        },
        {
            path: '/asset/assign-asset',
            element: <AssignAsset />
        },
        {
            path: '/asset/list-of-complain',
            element: <AssetComplain />
        },

        {
            path: '/leave/create',
            element: <AddLeave />
        },
        {
            path: '/leave/listing',
            element: <LeaveListing />
        },
        {
            path: '/attendance/listing',
            element: <Attendance />
        },
        {
            path: '/attendance/yearly-record',
            element: <YearlyRecord />
        },

        {
            path: '/user/account-profile/profile1',
            element: <AppUserAccountProfile1 />
        },

        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/hr-policy/listing',
            element: <HrPolicyListing />
        },
        {
            path: '/hr/:id',
            element: <HumanResourse />
        }
    ]
};

export const AssociateCreativeDirector = {
    path: '/',
    element: (
        <AuthGuard>
            <MainLayout />
        </AuthGuard>
    ),
    children: [
        {
            path: '/project/create',
            element: <ProjectCreate />
        },
        {
            path: '/project/listing',
            element: <ProjectListing />
        },
        {
            path: '/project/update',
            element: <ProjectUpdate />
        },
        {
            path: '/project/project-trackers',
            element: <ProjectTrackers />
        },

        //Allocation routes==========================>>>>>>>

        {
            path: '/allocation/create',
            element: <AllocationCreate />
        },
        {
            path: '/allocation/listing',
            element: <AllocationListing />
        },
        {
            path: '/allocation/update',
            element: <ProjectUpdate />
        },

        {
            path: '/leave/create',
            element: <AddLeave />
        },
        {
            path: '/leave/listing',
            element: <LeaveListing />
        },

        {
            path: '/attendance/listing',
            element: <Attendance />
        },

        {
            path: '/resource-utilization',
            element: <ResourceUtilization />
        },

        {
            path: 'calendar',
            element: <AppCalendar />
        },
        {
            path: '/dashboard/default',
            element: <DashboardDefault />
        },
        {
            path: '/attendance/extra-hour',
            element: <ExtraHour />
        },
        {
            path: '/attendance/list-of-extra-hour',
            element: <ListOfExtraHour />
        },

        {
            path: '/attendance/yearly-record',
            element: <YearlyRecord />
        },

        {
            path: '/payslips',
            element: <PayslipList />
        }
    ]
};

// export default MainRoutes;

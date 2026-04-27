import Project from './project';
import Allocation from './allocation';
import Resources from './resource';
import Industry from './industry';
import Technology from './technology';
import Milestone from './milestone';
import Category from './category';
import Status from './status';
import ProjectCategoryStatus from './categoryStatus';
import Finance from './finance';
import Calendar from './calendar';
import Administration from './administration';
import Department from './department';
import TaskCategory from './taskCategory';
import PmoDocument from './pmoDocument';
import Attendance from './attendance';
import Employee from './employee';
import PmStatus from './pm-status';
import Hr from './hr';
import AssetCategory from './assetCategory';
import Vendor from './vendor';
import Asset from './asset';
import Holiday from './holiday';
// import EmployeeInfo from './employeeInfo';
import EmployeeInfo from './employeeInfo';
import HrPolicy from './hrPolicy';
import Dashboard from './dasboardMenu';
import ResourceUtilization from './resourceUtilization';
import Reports from './reports';
import ScreenShots from './screenShot';
import PaySlips from './PaySlips';
import ProductionCapacity from './ProductionCapacity';

// ==============================|| MENU ITEMS ||============================== //

const local: any = localStorage.getItem('user');
const user = JSON.parse(local);

// console.log('user', user?.role?.screens);

const project = {
    ...Project
};
project.children = [];

const dashboard = {
    ...Dashboard
};
dashboard.children = [];

// const employee = {
//     ...Employee
// };
// employee.children = [];

const hr = {
    ...Hr
};
hr.children = [];

const holiday = {
    ...Holiday
};
holiday.children = [];

const employeeInfo = {
    ...EmployeeInfo
};
employeeInfo.children = [];

const allocation = {
    ...Allocation
};
allocation.children = [];

const resources = {
    ...Resources
};
resources.children = [];

const industry = {
    ...Industry
};
industry.children = [];

const technology = {
    ...Technology
};
technology.children = [];

// const milestone = {
//     ...Milestone
// };
// milestone.children = [];

const category = {
    ...Category
};
category.children = [];

// const projectCategoryStatus = {
//     ...ProjectCategoryStatus
// };
// projectCategoryStatus.children = [];

const status = {
    ...Status
};
status.children = [];

const finance = {
    ...Finance
};
finance.children = [];

const calendar = {
    ...Calendar
};
calendar.children = [];

const administration = {
    ...Administration
};
administration.children = [];

const department = {
    ...Department
};
department.children = [];

const assetCategory = {
    ...AssetCategory
};
assetCategory.children = [];

const asset = {
    ...Asset
};
asset.children = [];

const vendor = {
    ...Vendor
};
vendor.children = [];

// const pmStatus = {
//     ...PmStatus
// };
department.children = [];

const taskCategory = {
    ...TaskCategory
};
taskCategory.children = [];

// const pmoDocument = {
//     ...PmoDocument
// };
// pmoDocument.children = [];

const attendance = {
    ...Attendance
};
attendance.children = [];

const hrPolicy = {
    ...HrPolicy
};
hrPolicy.children = [];

// const resourceUtilization = {
//     ...ResourceUtilization
// };

// const screenShots = {
//     ...ScreenShots
// };
// resourceUtilization.children = [];

// const reports = {
//     ...Reports
// };

// reports.children = [];

// const paySlips = {
//     ...PaySlips
// };
// paySlips.children = [];

// const productionCapacity = {
//     ...ProductionCapacity
// };
// productionCapacity.children = [];

let items: any[] = [];

if (user?.super) {
    Project.children.pop();
    items = [
        Dashboard,
        Calendar,
        // Reports,
        Project,
        Allocation,
        Attendance,
        // ProductionCapacity,
        // Finance,
        // ResourceUtilization,
        // PaySlips,

        // Employee,
        // EmployeeInfo,
        Hr,
        Holiday,
        Asset,

        Resources,
        Department,
        AssetCategory,
        Vendor,
        Industry,
        Technology,
        // Milestone,
        Category,
        // ProjectCategoryStatus,
        // TaskCategory,
        Status,
        Administration,
        // PmoDocument,
        // PmStatus,
        HrPolicy
        // ScreenShots
    ];
} else {
    user?.role?.screens?.map((ele: any) => {
        switch (ele?.name) {
            case 'Projects':
                ele?.routes?.map((x: any) => {
                    const find = Project?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        project.children?.push(find);
                    }
                });

                items.push(project);
                break;

            // case 'Reports':
            //     ele?.routes?.map((x: any) => {
            //         const find = Reports?.children?.find((y: any) => y?.url == x?.route);

            //         if (find) {
            //             reports.children?.push(find);
            //         }
            //     });

            //     items.push(reports);
            //     break;

            case 'Allocation':
                ele?.routes?.map((x: any) => {
                    const find = Allocation?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        allocation.children?.push(find);
                    }
                });

                items.push(allocation);
                break;

            case 'Finance':
                ele?.routes?.map((x: any) => {
                    const find = Finance?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        finance.children?.push(find);
                    }
                });

                items.push(finance);
                break;

            case 'Calendar':
                ele?.routes?.map((x: any) => {
                    const find = Calendar?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        calendar.children?.push(find);
                    }
                });

                items.push(calendar);
                break;

            case 'Resources':
                ele?.routes?.map((x: any) => {
                    const find = Resources?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        resources.children?.push(find);
                    }
                });

                items.push(resources);
                break;

            case 'Department':
                ele?.routes?.map((x: any) => {
                    const find = Department?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        department.children?.push(find);
                    }
                });

                items.push(department);
                break;

            // case 'PmStatus':
            //     ele?.routes?.map((x: any) => {
            //         const find = PmStatus?.children?.find((y: any) => y?.url == x?.route);
            //         if (find) {
            //             pmStatus.children?.push(find);
            //         }
            //     });

            //     items.push(pmStatus);
            //     break;

            case 'Industry':
                ele?.routes?.map((x: any) => {
                    const find = Industry?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        industry.children?.push(find);
                    }
                });

                items.push(industry);
                break;

            case 'Technology':
                ele?.routes?.map((x: any) => {
                    const find = Technology?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        technology.children?.push(find);
                    }
                });

                items.push(technology);
                break;

            // case 'Milestone':
            //     ele?.routes?.map((x: any) => {
            //         const find = Milestone?.children?.find((y: any) => y?.url == x?.route);
            //         if (find) {
            //             milestone.children?.push(find);
            //         }
            //     });

            //     items.push(milestone);
            //     break;

            case 'Category':
                ele?.routes?.map((x: any) => {
                    const find = Milestone?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        category.children?.push(find);
                    }
                });

                items.push(category);
                break;

            case 'Task Category':
                ele?.routes?.map((x: any) => {
                    const find = TaskCategory?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        taskCategory.children?.push(find);
                    }
                });

                items.push(taskCategory);
                break;

            // case 'PmoDocument':
            //     ele?.routes?.map((x: any) => {
            //         const find = PmoDocument?.children?.find((y: any) => y?.url == x?.route);
            //         if (find) {
            //             pmoDocument.children?.push(find);
            //         }
            //     });

            //     items.push(pmoDocument);
            //     break;

            case 'Status':
                ele?.routes?.map((x: any) => {
                    const find = Status?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        status.children?.push(find);
                    }
                });

                items.push(status);
                break;

            case 'Administration':
                ele?.routes?.map((x: any) => {
                    const find = Administration?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        administration.children?.push(find);
                    }
                });

                items.push(administration);
                break;

            case 'Attendance':
                ele?.routes?.map((x: any) => {
                    const find = Attendance?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        attendance.children?.push(find);
                    }
                });

                items.push(attendance);
                break;

            case 'HR':
                ele?.routes?.map((x: any) => {
                    const find = Hr?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        hr.children?.push(find);
                    }
                });

                items.push(hr);
                break;

            case 'Holiday':
                ele?.routes?.map((x: any) => {
                    const find = Holiday?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        holiday.children?.push(find);
                    }
                });

                items.push(holiday);
                break;

            case 'Asset':
                ele?.routes?.map((x: any) => {
                    const find = Asset?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        asset.children?.push(find);
                    }
                });

                items.push(asset);
                break;

            case 'Vendor':
                ele?.routes?.map((x: any) => {
                    const find = Vendor?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        vendor.children?.push(find);
                    }
                });

                items.push(vendor);
                break;

            case 'AssetCategory':
                ele?.routes?.map((x: any) => {
                    const find = AssetCategory?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        assetCategory.children?.push(find);
                    }
                });

                items.push(assetCategory);
                break;

            case 'Employee':
                ele?.routes?.map((x: any) => {
                    var idPattern = /\/hr\/([a-zA-Z0-9]+)$/;
                    const find = EmployeeInfo?.children?.find((y: any) => {
                        const url = '/' + y?.url?.split('/')[1] + '/';
                        return url == x.route;
                    });

                    if (find) {
                        employeeInfo.children?.push(find);
                    }
                });

                items.push(employeeInfo);
                break;

            case 'Asset':
                ele?.routes?.map((x: any) => {
                    const find = Asset?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        asset.children?.push(find);
                    }
                });

                items.push(asset);
                break;

            case 'HrPolicy':
                ele?.routes?.map((x: any) => {
                    const find = HrPolicy?.children?.find((y: any) => y?.url == x?.route);
                    if (find) {
                        hrPolicy.children?.push(find);
                    }
                });

                items.push(hrPolicy);
                break;

            // case 'ResourceUtilization':
            //     ele?.routes?.map((x: any) => {
            //         const find = ResourceUtilization?.children?.find((y: any) => y?.url == x?.route);
            //         if (find) {
            //             resourceUtilization.children?.push(find);
            //         }
            //     });

            //     items.push(resourceUtilization);
            //     break;

            // default:
            //     break;

            // case 'screenshots':
            //     ele?.routes?.map((x: any) => {
            //         const find = ScreenShots?.children?.find((y: any) => y?.url == x?.route);
            //         if (find) {
            //             screenShots.children?.push(find);
            //         }
            //     });

            //     items.push(screenShots);
            //     break;

            // case 'PaySlips':
            //     ele?.routes?.map((x: any) => {
            //         const find = PaySlips?.children?.find((y: any) => y?.url == x?.route);
            //         if (find) {
            //             paySlips.children?.push(find);
            //         }
            //     });

            //     items.push(paySlips);
            //     break;

            // case 'ProductionCapacity':
            //     ele?.routes?.map((x: any) => {
            //         const find = ProductionCapacity?.children?.find((y: any) => y?.url == x?.route);
            //         if (find) {
            //             productionCapacity.children?.push(find);
            //         }
            //     });

            //     items.push(productionCapacity);
            //     break;
        }
    });
}

const menuItems: { items: any[] } = {
    items: items
};

export default menuItems;

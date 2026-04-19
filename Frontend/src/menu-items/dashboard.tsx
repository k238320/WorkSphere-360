// third-party
import { FormattedMessage } from 'react-intl';

// project import
import { useSelector } from 'store';

// assets
import { IconDashboard, IconDeviceAnalytics } from '@tabler/icons';

// types

// constant
const dashboardIcon = {
    dashboard: IconDashboard,
    device: IconDeviceAnalytics
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

export const DashboardMenu = () => {
    const { menuDashboard } = useSelector((state) => state.menu);
    const ChildrenList = menuDashboard?.children?.map((subList: any) => {
        return {
            id: subList.id,
            title: <FormattedMessage id={`${subList.title}`} />,
            type: subList.type,
            url: subList.url,
            // @ts-ignore
            icon: dashboardIcon[subList.icon],
            breadcrumbs: subList.breadcrumbs
        };
    });

    const dashboardList = {
        id: menuDashboard.id,
        title: <FormattedMessage id={`${menuDashboard.title}`} />,
        // @ts-ignore
        icon: dashboardIcon[menuDashboard.icon],
        type: menuDashboard.type,
        children: ChildrenList
    };

    return dashboardList;
};

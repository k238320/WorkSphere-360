// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconDeviceAnalytics } from '@tabler/icons';

// constant
const icons = {
    IconDeviceAnalytics
};

// ==============================|| WIDGET MENU ITEMS ||============================== //

const Dashboard = {
    id: 'dasboard',
    title: <FormattedMessage id="dashboard" />,
    icon: icons.IconDeviceAnalytics,
    type: 'group',
    children: [
        {
            id: 'dasboard',
            title: <FormattedMessage id="Dashboard View" />,
            type: 'item',
            url: '/dashboard/default',
            icon: icons.IconDeviceAnalytics
        }
    ]
};

export default Dashboard;

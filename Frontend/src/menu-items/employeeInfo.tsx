// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconChartArcs, IconClipboardList, IconChartInfographic } from '@tabler/icons';

// constant
const icons = {
    IconChartArcs,
    IconClipboardList,
    IconChartInfographic
};

// ==============================|| WIDGET MENU ITEMS ||============================== //
const userString = localStorage?.getItem('user');
const userId = userString ? JSON.parse(userString) : null;

const EmployeeInfo = {
    id: 'employeeInfo',
    // title: <FormattedMessage id="Employee Info" />,
    title: <FormattedMessage id="Information" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'employee-info',
            title: <FormattedMessage id="Personal Details" />,
            type: 'item',
            url: `/hr/${userId?.id}`,
            icon: icons.IconClipboardList
        }
    ]
};

export default EmployeeInfo;

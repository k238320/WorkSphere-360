// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconChartArcs, IconClipboardList, IconChartInfographic, IconCirclePlus } from '@tabler/icons';

// constant
const icons = {
    IconChartArcs,
    IconClipboardList,
    IconChartInfographic,
    IconCirclePlus
};

// ==============================|| WIDGET MENU ITEMS ||============================== //

const Department = {
    id: 'department',
    title: <FormattedMessage id="Department" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'create-department',
            title: <FormattedMessage id="Add Department" />,
            type: 'item',
            url: '/department/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'department-listing',
            title: <FormattedMessage id="List of Departments" />,
            type: 'item',
            url: '/department/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default Department;

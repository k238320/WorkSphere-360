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

const Employee = {
    id: 'employee',
    title: <FormattedMessage id="Employee" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'employee-listing',
            title: <FormattedMessage id="List of Employee" />,
            type: 'item',
            url: '/hr/listing',
            // url: '/department/create',
            icon: icons.IconChartArcs
        }
    ]
};

export default Employee;

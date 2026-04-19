// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconChartArcs, IconClipboardList, IconChartInfographic, IconLogout, IconCheckupList } from '@tabler/icons';

// constant
const icons = {
    IconChartArcs,
    IconClipboardList,
    IconChartInfographic,
    IconLogout,
    IconCheckupList
};

// ==============================|| WIDGET MENU ITEMS ||============================== //

const Attendance = {
    id: 'attendance',
    title: <FormattedMessage id="attendance" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'leave-create',
            title: <FormattedMessage id="Apply Leave" />,
            type: 'item',
            url: '/leave/create',
            icon: icons.IconLogout
        },
        {
            id: 'leave-listing',
            title: <FormattedMessage id="Leave Records" />,
            type: 'item',
            url: '/leave/listing',
            icon: icons.IconCheckupList
        },
        {
            id: 'attendance-listing',
            title: <FormattedMessage id="List of Attendance" />,
            type: 'item',
            url: '/attendance/listing',
            icon: icons.IconClipboardList
        }
        // {
        //     id: 'attendance-fix',
        //     title: <FormattedMessage id="Fix Attendance" />,
        //     type: 'item',
        //     url: '/attendance/fix',
        //     icon: icons.IconClipboardList
        // },
        // {
        //     id: 'yearly-record',
        //     title: <FormattedMessage id="Yearly Record" />,
        //     type: 'item',
        //     url: '/attendance/yearly-record',
        //     icon: icons.IconClipboardList
        // },
        // {
        //     id: 'extra-hour',
        //     title: <FormattedMessage id="Extra Hour" />,
        //     type: 'item',
        //     url: '/attendance/extra-hour',
        //     icon: icons.IconClipboardList
        // },
        // {
        //     id: 'list-of-extra-hour',
        //     title: <FormattedMessage id="List of Extra Hour" />,
        //     type: 'item',
        //     url: '/attendance/list-of-extra-hour',
        //     icon: icons.IconClipboardList
        // }
    ]
};

export default Attendance;

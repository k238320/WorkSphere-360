// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconCalendarStats } from '@tabler/icons';

// constant
const icons = {
    IconCalendarStats
};

// ==============================|| WIDGET MENU ITEMS ||============================== //

const Calendar = {
    id: 'calendar',
    title: <FormattedMessage id="Calendar" />,
    icon: icons.IconCalendarStats,
    type: 'group',
    children: [
        {
            id: 'calendar',
            title: <FormattedMessage id="Calendar View" />,
            type: 'item',
            url: '/calendar',
            icon: icons.IconCalendarStats
        },
        {
            id: 'resource-manage',
            title: <FormattedMessage id="Resource Manage" />,
            type: 'item',
            url: '/calendar/resource-manage',
            icon: icons.IconCalendarStats
        }
    ]
};

export default Calendar;

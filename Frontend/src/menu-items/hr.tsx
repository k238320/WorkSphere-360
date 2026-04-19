// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconChartArcs, IconClipboardList, IconChartInfographic, IconChecklist, IconCirclePlus, IconCheckupList } from '@tabler/icons';

// constant
const icons = {
    IconChartArcs,
    IconClipboardList,
    IconChartInfographic,
    IconChecklist,
    IconCirclePlus,
    IconCheckupList
};

// ==============================|| WIDGET MENU ITEMS ||============================== //

const Hr = {
    id: 'hr',
    title: <FormattedMessage id="HR" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'employee-listing',
            title: <FormattedMessage id="List of Employee" />,
            type: 'item',
            url: '/hr/listing',
            // url: '/department/create',
            icon: icons.IconChecklist
        }
        // {
        //     id: 'create-holiday',
        //     title: <FormattedMessage id="Add Holiday" />,
        //     type: 'item',
        //     url: '/holiday/create',
        //     icon: icons.IconCirclePlus
        // },
        // {
        //     id: 'holiday-listing',
        //     title: <FormattedMessage id="List of Holidays" />,
        //     type: 'item',
        //     url: '/holiday/listing',
        //     icon: icons.IconCheckupList
        // }
        // ,
        // {
        //     id: 'create-event',
        //     title: <FormattedMessage id="Create Event" />,
        //     type: 'item',
        //     url: 'event/event-create',
        //     icon: icons.IconCheckupList
        // },
        // {
        //     id: 'list-of-event',
        //     title: <FormattedMessage id="List of Event" />,
        //     type: 'item',
        //     url: '/event/event-listing',
        //     icon: icons.IconCheckupList
        // }
    ]
};

export default Hr;

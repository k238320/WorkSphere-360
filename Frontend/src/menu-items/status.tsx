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

const Status = {
    id: 'status',
    title: <FormattedMessage id="status" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'create-status',
            title: <FormattedMessage id="Add Status" />,
            type: 'item',
            url: '/status/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'status-listing',
            title: <FormattedMessage id="List of Status" />,
            type: 'item',
            url: '/status/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default Status;

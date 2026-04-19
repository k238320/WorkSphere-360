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

const Holiday = {
    id: 'holiday',
    title: <FormattedMessage id="Holiday" />,
    icon: icons.IconCirclePlus,
    type: 'group',
    children: [
        {
            id: 'create-holiday',
            title: <FormattedMessage id="Add Holiday" />,
            type: 'item',
            url: '/holiday/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'holiday-listings',
            title: <FormattedMessage id="List of Holidays" />,
            type: 'item',
            url: '/holiday/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default Holiday;

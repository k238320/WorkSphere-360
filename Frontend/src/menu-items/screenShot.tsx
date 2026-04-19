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

const ScreenShots = {
    id: 'screenshots',
    title: <FormattedMessage id="Screen Shots" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'screenshots-listing',
            title: <FormattedMessage id="List of Screen Shots" />,
            type: 'item',
            url: '/screenshots/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default ScreenShots;

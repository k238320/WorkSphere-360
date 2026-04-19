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

const Industry = {
    id: 'industry',
    title: <FormattedMessage id="industry" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'create-industry',
            title: <FormattedMessage id="Add Industry" />,
            type: 'item',
            url: '/industry/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'industry-listing',
            title: <FormattedMessage id="List of Industries" />,
            type: 'item',
            url: '/industry/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default Industry;

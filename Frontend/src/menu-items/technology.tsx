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

const Technology = {
    id: 'technology',
    title: <FormattedMessage id="technology" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'create-technology',
            title: <FormattedMessage id="Add Technology" />,
            type: 'item',
            url: '/technology/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'technology-listing',
            title: <FormattedMessage id="List of Technologies" />,
            type: 'item',
            url: '/technology/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default Technology;

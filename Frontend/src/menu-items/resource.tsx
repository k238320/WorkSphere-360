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

const Resources = {
    id: 'resources',
    title: <FormattedMessage id="resources" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'create-resources',
            title: <FormattedMessage id="Add Resource" />,
            type: 'item',
            url: '/resource/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'resources-listing',
            title: <FormattedMessage id="List of Resources" />,
            type: 'item',
            url: '/resource/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default Resources;

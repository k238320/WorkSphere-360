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

const ResourceUtilization = {
    id: 'ResourceUtilization',
    title: <FormattedMessage id="Resource Utilization" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'resource-utilization-listing',
            title: <FormattedMessage id="List of Resource Utilization" />,
            type: 'item',
            url: '/resource-utilization',
            icon: icons.IconClipboardList
        }
    ]
};

export default ResourceUtilization;

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

const Milestone = {
    id: 'milestone',
    title: <FormattedMessage id="milestone" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'create-milestone',
            title: <FormattedMessage id="Add Milestone" />,
            type: 'item',
            url: '/milestone/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'milestone-listing',
            title: <FormattedMessage id="List of Milestones" />,
            type: 'item',
            url: '/milestone/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default Milestone;

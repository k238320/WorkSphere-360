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

const ProjectCategoryStatus = {
    id: 'categorystatus',
    title: <FormattedMessage id="Category Status" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'create-categorystatus',
            title: <FormattedMessage id="Add Category Status" />,
            type: 'item',
            url: '/category_status/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'categorystatus-listing',
            title: <FormattedMessage id="List of Category Status" />,
            type: 'item',
            url: '/category_status/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default ProjectCategoryStatus;

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

const TaskCategory = {
    id: 'task-category',
    title: <FormattedMessage id="Task Category" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'create-task-category',
            title: <FormattedMessage id="Add Task Category" />,
            type: 'item',
            url: '/task-category/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'task-category-listing',
            title: <FormattedMessage id="List of Task Category" />,
            type: 'item',
            url: '/task-category/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default TaskCategory;

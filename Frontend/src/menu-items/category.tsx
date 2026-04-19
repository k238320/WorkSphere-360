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

const Category = {
    id: 'category',
    title: <FormattedMessage id="category" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'create-category',
            title: <FormattedMessage id="Add Category" />,
            type: 'item',
            url: '/category/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'category-listing',
            title: <FormattedMessage id="List of Categories" />,
            type: 'item',
            url: '/category/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default Category;

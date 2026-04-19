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

const AssetCategory = {
    id: 'asset-category',
    title: <FormattedMessage id="Asset Category" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'create-asset-Category',
            title: <FormattedMessage id="Add Asset Category" />,
            type: 'item',
            url: '/asset-category/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'asset-category-listing',
            title: <FormattedMessage id="List of Asset Categories" />,
            type: 'item',
            url: '/asset-category/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default AssetCategory;

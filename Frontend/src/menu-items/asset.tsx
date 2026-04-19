// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconChartArcs, IconClipboardList, IconChartInfographic, IconBasket, IconCirclePlus, IconPictureInPicture } from '@tabler/icons';

// constant
const icons = {
    IconChartArcs,
    IconClipboardList,
    IconChartInfographic,
    IconBasket,
    IconCirclePlus,
    IconPictureInPicture
};

// ==============================|| WIDGET MENU ITEMS ||============================== //

const Asset = {
    id: 'asset',
    title: <FormattedMessage id="Asset" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'create-asset',
            title: <FormattedMessage id="New Asset" />,
            type: 'item',
            url: '/asset/create',
            icon: icons.IconCirclePlus
        },
        // {
        //     id: 'asset-category-listing',
        //     title: <FormattedMessage id="List of Asset Categories" />,
        //     type: 'item',
        //     url: '/asset-category/listing',
        //     icon: icons.IconClipboardList
        // },,
        {
            id: 'asset-listing',
            title: <FormattedMessage id="List of Asset" />,
            type: 'item',
            url: '/asset/listing',
            icon: icons.IconClipboardList
        }
        // {
        //     id: 'asset-assign',
        //     title: <FormattedMessage id="Assign Asset" />,
        //     type: 'item',
        //     url: '/asset/assign-asset',
        //     icon: icons.IconPictureInPicture
        // },
        // {
        //     id: 'list of complain',
        //     title: <FormattedMessage id="List of Complaints" />,
        //     type: 'item',
        //     url: '/asset/list-of-complain ',
        //     icon: icons.IconClipboardList
        // }
    ]
};

export default Asset;

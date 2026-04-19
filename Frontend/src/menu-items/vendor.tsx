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

const Vendor = {
    id: 'vendor',
    title: <FormattedMessage id="Vendor" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'create-vendor',
            title: <FormattedMessage id="Vendor Registration" />,
            type: 'item',
            url: '/vendor/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'vendor-listing',
            title: <FormattedMessage id="List of Vendor" />,
            type: 'item',
            url: '/vendor/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default Vendor;

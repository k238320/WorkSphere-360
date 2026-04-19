// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconChartArcs, IconClipboardList, IconChartInfographic } from '@tabler/icons';

// constant
const icons = {
    IconChartArcs,
    IconClipboardList,
    IconChartInfographic
};

// ==============================|| WIDGET MENU ITEMS ||============================== //

const Finance = {
    id: 'finance',
    title: <FormattedMessage id="finance" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'paymentListing',
            title: <FormattedMessage id="List of Milestones" />,
            type: 'item',
            url: '/finance/payments',
            icon: icons.IconClipboardList
        }
    ]
};

export default Finance;

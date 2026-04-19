// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconChartArcs, IconClipboardList, IconChartInfographic, IconLogout, IconCheckupList, IconReport } from '@tabler/icons';

// constant
const icons = {
    IconChartArcs,
    IconClipboardList,
    IconChartInfographic,
    IconLogout,
    IconCheckupList,
    IconReport
};

// ==============================|| WIDGET MENU ITEMS ||============================== //

const PaySlips = {
    id: 'PaySlips',
    title: <FormattedMessage id="PaySlips" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'payslip-listing',
            title: <FormattedMessage id="Listing" />,
            type: 'item',
            url: '/payslips',
            icon: icons.IconReport
        }
    ]
};

export default PaySlips;

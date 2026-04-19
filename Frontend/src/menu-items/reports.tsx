// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconChartArcs, IconClipboardList, IconChartInfographic, IconLogout, IconCheckupList, IconReport, IconUsers } from '@tabler/icons';

// constant
const icons = {
    IconChartArcs,
    IconClipboardList,
    IconChartInfographic,
    IconLogout,
    IconCheckupList,
    IconReport,
    IconUsers
};

// ==============================|| WIDGET MENU ITEMS ||============================== //

const Reports = {
    id: 'reports',
    title: <FormattedMessage id="reports" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'overall-profitability',
            title: <FormattedMessage id="Overall Profitability" />,
            type: 'item',
            url: '/report/projects-profitability',
            icon: icons.IconReport
        },
        {
            id: 'resource-update',
            title: <FormattedMessage id="Resource Update" />,
            type: 'item',
            url: '/report/resource-update',
            icon: icons.IconUsers
        },
        {
            id: 'resource-productivity',
            title: <FormattedMessage id="Resource Productivity" />,
            type: 'item',
            url: '/report/resource-productivity',
            icon: icons.IconUsers
        }
    ]
};

export default Reports;

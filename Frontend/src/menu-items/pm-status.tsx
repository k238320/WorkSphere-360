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

const PmStatus = {
    id: 'Pm-Status',
    // title: <FormattedMessage id="Pm-Status" />,
    title: <FormattedMessage id="PM Status" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        // {
        //     id: 'create-department',
        //     title: <FormattedMessage id="Add Department" />,
        //     type: 'item',
        //     url: '/department/create',
        //     icon: icons.IconChartArcs
        // },
        {
            id: 'pm-staus-listing',
            title: <FormattedMessage id="List of PM Status" />,
            type: 'item',
            url: '/pm-status/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default PmStatus;

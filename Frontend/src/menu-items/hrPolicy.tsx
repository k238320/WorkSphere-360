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

const HrPolicy = {
    id: 'hr-policy',
    title: <FormattedMessage id="HR Policy" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'create-hr-policy',
            title: <FormattedMessage id="Add HR Policy" />,
            type: 'item',
            url: '/hr-policy/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'hr-policy-listing',
            title: <FormattedMessage id="List of HR Policies" />,
            type: 'item',
            url: '/hr-policy/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default HrPolicy;

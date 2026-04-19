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

const PmoDocument = {
    id: 'pmo-document',
    title: <FormattedMessage id="PMO Document" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        {
            id: 'create-pmo-document',
            title: <FormattedMessage id="Add PMO Document" />,
            type: 'item',
            url: '/pmo-document/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'pmo-document-listing',
            title: (
                <FormattedMessage
                    id="List of PMO Documents
            "
                />
            ),
            type: 'item',
            url: '/pmo-document/listing',
            icon: icons.IconClipboardList
        }
    ]
};

export default PmoDocument;

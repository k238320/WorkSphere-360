// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconCirclePlus, IconList } from '@tabler/icons';

// constant
const icons = {
    IconCirclePlus,
    IconList
};

// ==============================|| WIDGET MENU ITEMS ||============================== //

const ProductionCapacity = {
    id: 'productionCapacity',
    title: <FormattedMessage id="productionCapacity" />,
    icon: icons.IconList,
    type: 'group',
    children: [
        {
            id: 'productionCapacity',
            title: <FormattedMessage id="Production Capacity" />,
            type: 'item',
            url: '/production-capacity',
            icon: icons.IconCirclePlus
        },
        {
            id: 'Production-Capacity-Utilization',
            title: <FormattedMessage id="Capacity Utilization" />,
            type: 'item',
            url: '/production-capacity/charts',
            icon: icons.IconList
        }
    ]
};

export default ProductionCapacity;

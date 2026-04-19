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

const Administration = {
    id: 'administration',
    title: <FormattedMessage id="Administration" />,
    icon: icons.IconChartArcs,
    type: 'group',
    children: [
        // {
        //     id: 'create-screen',
        //     title: <FormattedMessage id="Add Screen" />,
        //     type: 'item',
        //     url: '/screen/create',
        //     icon: icons.IconCirclePlus
        // },
        // {
        //     id: 'create-role',
        //     title: <FormattedMessage id="Add Role" />,
        //     type: 'item',
        //     url: '/role/create',
        //     icon: icons.IconCirclePlus
        // },
        // {
        //     id: 'role-listing',
        //     title: <FormattedMessage id="List of Roles" />,
        //     type: 'item',
        //     url: '/role/listing',
        //     icon: icons.IconClipboardList
        // },
        {
            id: 'create-user',
            title: <FormattedMessage id="Add User" />,
            type: 'item',
            url: '/user/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'user-listing',
            title: <FormattedMessage id="List of Users" />,
            type: 'item',
            url: '/user/listing',
            icon: icons.IconClipboardList
        }
        // {
        //     id: 'role-permissions',
        //     title: <FormattedMessage id="Role Permission" />,
        //     type: 'item',
        //     url: '/role/permissions',
        //     icon: icons.IconChartArcs
        // }
    ]
};

export default Administration;

// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { IconCirclePlus, IconList } from '@tabler/icons';
import AddTaskIcon from '@mui/icons-material/AddTask';

// constant
const icons = {
    IconCirclePlus,
    IconList
};

// ==============================|| WIDGET MENU ITEMS ||============================== //

const Allocation = {
    id: 'allocation',
    title: <FormattedMessage id="tasks" />,
    icon: icons.IconCirclePlus,
    type: 'group',
    children: [
        {
            id: 'create-allocation',
            title: <FormattedMessage id="Add Task" />,
            type: 'item',
            url: '/allocation/create',
            icon: icons.IconCirclePlus
            // icon: AddTaskIcon
        },
        {
            id: 'allocation-listing',
            title: <FormattedMessage id="List of Tasks" />,
            type: 'item',
            url: '/allocation/listing',
            icon: icons.IconList
        }
    ]
};

export default Allocation;

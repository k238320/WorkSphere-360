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

const Project = {
    id: 'project',
    title: <FormattedMessage id="projects" />,
    icon: icons.IconList,
    type: 'group',
    children: [
        {
            id: 'create-project',
            title: <FormattedMessage id="Add Project" />,
            type: 'item',
            url: '/project/create',
            icon: icons.IconCirclePlus
        },
        {
            id: 'project-listing',
            title: <FormattedMessage id="List of Project" />,
            type: 'item',
            url: '/project/listing',
            icon: icons.IconList
        },
        // {
        //     id: 'project-trackers',
        //     title: <FormattedMessage id="Project Trackers" />,
        //     type: 'item',
        //     url: '/project/project-trackers',
        //     icon: icons.IconList
        // },
        {
            id: 'project-hours',
            title: <FormattedMessage id="Project Hours" />,
            type: 'item',
            url: '/project/hours',
            icon: icons.IconList
        }
    ]
};

export default Project;

/*eslint-disable */

// assets
import { IconChevronRight } from '@tabler/icons';
import { StatusManage } from 'components/StatusManage';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
// import { AdminManage } from 'components/AdminManage';

const ProjectStatusCreate = (props: any) => {
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit Status' : 'Add Status'} icon title rightAlign />
            <StatusManage />
        </>
    );
};

export default ProjectStatusCreate;

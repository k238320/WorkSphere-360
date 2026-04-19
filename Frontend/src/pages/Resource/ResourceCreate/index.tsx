/*eslint-disable */

// assets
import { IconChevronRight } from '@tabler/icons';
import { ResourceManage } from 'components/ResourceManage';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
// import { AdminManage } from 'components/AdminManage';

const ResourceCreate = (props: any) => {
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit Resource' : 'Add Resource'} icon title rightAlign />
            <ResourceManage />
        </>
    );
};

export default ResourceCreate;

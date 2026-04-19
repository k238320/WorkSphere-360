/*eslint-disable */

// assets
import { IconChevronRight } from '@tabler/icons';
import { TechnologyManage } from 'components/TechnologyManage';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
// import { AdminManage } from 'components/AdminManage';

const TechnologyCreate = (props: any) => {
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit Technology' : 'Add Technology'} icon title rightAlign />
            <TechnologyManage />
        </>
    );
};

export default TechnologyCreate;

/*eslint-disable */

// assets
import { IconChevronRight } from '@tabler/icons';
import { IndustryManage } from 'components/IndustryManage';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
// import { AdminManage } from 'components/AdminManage';

const IndustryCreate = (props: any) => {
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit Industry' : 'Add Industry'} icon title rightAlign />
            <IndustryManage />
        </>
    );
};

export default IndustryCreate;

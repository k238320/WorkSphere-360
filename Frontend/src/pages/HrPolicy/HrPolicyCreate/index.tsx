import * as React from 'react';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import { useLocation } from 'react-router-dom';
import { HrPolicyManage } from 'components/HrPolicyManage';

const HrPolicyCreatePage = (props: any) => {
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit Hr Policy ' : 'Add Hr Policy'} icon title rightAlign />
            <HrPolicyManage uuid={uuid}/>
        </>
    );
};

export default HrPolicyCreatePage;

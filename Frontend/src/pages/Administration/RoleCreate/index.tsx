import { IconChevronRight } from '@tabler/icons';
import RoleManage from 'components/RoleManage';
import React from 'react';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';

const RoleCreate = () => {
    const searchParams = new URLSearchParams(location.search);
    const uuid = searchParams.get('uuid');
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit Role' : 'Add Role'} icon title rightAlign />
            <RoleManage />
        </>
    );
};

export default RoleCreate;

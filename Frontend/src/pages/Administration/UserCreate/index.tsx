import { IconChevronRight } from '@tabler/icons';
import UserManage from 'components/UserManage';
import React from 'react';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';

const UserCreate = () => {
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'Add User'} icon title rightAlign />
            <UserManage />
        </>
    );
};

export default UserCreate;

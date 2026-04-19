import { IconChevronRight } from '@tabler/icons';
import UserEditManage from 'components/UserEditManage';
import React from 'react';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';

const UserEdit = () => {
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'Edit User'} icon title rightAlign />
            <UserEditManage />;
        </>
    );
};

export default UserEdit;

/*eslint-disable */
import * as React from 'react';
import { DepartmentManage } from 'components/DepartmentManage';
import { IconChevronRight } from '@tabler/icons';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { useLocation } from 'react-router-dom';

// project imports

// assets

const DepartmentCreatePage = (props: any) => {
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit Department' : 'Add Department'} icon title rightAlign />
            <DepartmentManage />
        </>
    );
};

export default DepartmentCreatePage;

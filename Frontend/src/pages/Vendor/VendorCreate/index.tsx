/*eslint-disable */
import * as React from 'react';
import { DepartmentManage } from 'components/DepartmentManage';
import { IconChevronRight } from '@tabler/icons';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { useLocation } from 'react-router-dom';
import { VendorManage } from 'components/VendorManage';

// project imports

// assets

const VendorCreatePage = (props: any) => {
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit Vendor' : 'Vendor Registration Form'} icon title rightAlign />
            <VendorManage />
        </>
    );
};

export default VendorCreatePage;

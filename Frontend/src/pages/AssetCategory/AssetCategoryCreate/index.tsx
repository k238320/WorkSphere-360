/*eslint-disable */
import * as React from 'react';
import { DepartmentManage } from 'components/DepartmentManage';
import { IconChevronRight } from '@tabler/icons';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { useLocation } from 'react-router-dom';
import { AssetCategoryManage } from 'components/AssetCategoryManage';

// project imports

// assets

const AssetCategoryCreatePage = (props: any) => {
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit Asset Category' : 'Add Asset Category'} icon title rightAlign />
            <AssetCategoryManage />
        </>
    );
};

export default AssetCategoryCreatePage;

/*eslint-disable */
import * as React from 'react';
import { DepartmentManage } from 'components/DepartmentManage';
import { IconChevronRight } from '@tabler/icons';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { useLocation } from 'react-router-dom';
import { VendorManage } from 'components/VendorManage';
import { AssetManage } from 'components/AssetManage';
import { dispatch } from 'store';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { toast } from 'react-toastify';
import { getAllAssetCategory } from 'services/assetCategoryService';
import { getAllVendors } from 'services/vendorService';
import { useEffect, useState } from 'react';

// project imports

// assets

const AssetCreatePage = (props: any) => {
    const { search } = useLocation();
    const [assetCategoryOptions, setAssetCategoryOptions] = useState<any>();
    const [vendorOptions, setVendorsOptions] = useState<any>();
    let uuid = new URLSearchParams(search).get('uuid');

    const fetchDropDownData = async () => {
        dispatch(spinLoaderShow(true));
        await getAllAssetCategory()
            .then((res: any) => {
                setAssetCategoryOptions(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });

        await getAllVendors()
            .then((res: any) => {
                setVendorsOptions(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };
    useEffect(() => {
        fetchDropDownData();
    }, []);
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit Asset' : 'New Asset'} icon title rightAlign />
            <AssetManage vendordropdown={vendorOptions} assetcategorydropdown={assetCategoryOptions} />
        </>
    );
};

export default AssetCreatePage;

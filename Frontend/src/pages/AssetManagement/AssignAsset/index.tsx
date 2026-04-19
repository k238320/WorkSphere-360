import { yupResolver } from '@hookform/resolvers/yup';
import { Grid } from '@mui/material';
import { IconChevronRight } from '@tabler/icons';
import AssignAsset from 'components/AssignAsset';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getAllAssetCategory } from 'services/assetCategoryService';
import { getAssetListing } from 'services/assetService';
import { getAllUser } from 'services/userService';
import { dispatch } from 'store';
import { spinLoaderShow } from 'store/actions/spinLoader';
import SubCard from 'ui-component/cards/SubCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { AutoCompleteField } from 'ui-component/formsField/FormFields';
const AssignAssetPage = () => {
    const [assetCategory, setAssetCategory] = useState<any>([]);
    const [allUsers, setAllUsers] = useState<any>([]);

    const fetchdropdownData = async () => {
        const assetdropdown = await getAssetListing;
    };

    const defautlFormValues = {};

    const {
        control,
        register,
        reset,
        setError,
        formState: { errors },
        setValue,
        getValues,
        handleSubmit
    } = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        //Validations=================>
        defaultValues: defautlFormValues
        // resolver: yupResolver(createAssetValidation)
    });

    const getAssetCategoryOption = async () => {
        dispatch(spinLoaderShow(true));
        await getAllAssetCategory()
            .then((res: any) => {
                setAssetCategory(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const getUsersOption = async () => {
        dispatch(spinLoaderShow(true));
        await getAllUser()
            .then((res: any) => {
                setAllUsers(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };
    useEffect(() => {
        getAssetCategoryOption();
        getUsersOption();
    }, []);

    return (
        <>
            {/* <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit Asset' : 'New Asset'} icon title rightAlign /> */}
            <Breadcrumbs separator={IconChevronRight} heading={'Assign Asset'} icon title rightAlign />
            <AssignAsset usersdropdown={allUsers} assetcategorydropdown={assetCategory} />
        </>
    );
};

export default AssignAssetPage;

import { Button, Grid, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import SubCard from 'ui-component/cards/SubCard';
import { useForm, useFieldArray } from 'react-hook-form';
import { AutoCompleteField } from 'ui-component/formsField/FormFields';
import { dispatch } from 'store';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { toast } from 'react-toastify';
import { assignAsset, getUnassignedAssets } from 'services/assetService';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { TextFieldControlled } from 'ui-component/formsField/FormFields';
import { addAssetValidation, addEmployeeAsset } from './validation';
import { yupResolver } from '@hookform/resolvers/yup';
import DeleteIcon from '@mui/icons-material/Delete';
import { getUserAssets, unassignAsset } from 'services/assetService';
import { useNavigate } from 'react-router-dom';

type dropdown = {
    usersdropdown: any;
    assetcategorydropdown: any;
};

const AssignAsset = (props: dropdown) => {
    const [apiData, setapiData] = useState<any>();
    const [unassignedAssets, setUnassignedAssets] = useState<any>([]);
    const [handleAssetCategory, setHandleAssetCategory] = useState<any>();
    const [selectAsset, setSelectAsset] = useState<any>([]);
    const [resetAutocomplete, setResetAutoComplete] = useState<any>(false);
    const [userInfo, setUserInfo] = useState<any>();
    const navigate = useNavigate();
    // const defautlFormValues = {};

    const LocationOptions = [
        {
            name: 'KHI',
            id: 'KHI'
        },
        {
            name: 'LHR',
            id: 'LHR'
        }
    ];

    useEffect(() => {
        if (apiData) {
            setValue('user_id', apiData?.user?.id);
            // setValue('brand', apiData?.brand);
        }
    }, [apiData]);

    const handleAssetList = async (e: any) => {
        if (e) {
            // setValue('asset_id', null);
            await getUnAssignedAssets(e.id);
            // setHandleAssetCategory(e.id);
        } else {
            setHandleAssetCategory(null);
        }
    };

    const handleRemoveAssets = async (assetId: any) => {
        const id = { id: assetId };
        await unassignAsset(id)
            .then(() => {
                toast.success('Asset Unassigned Successfully');
            })
            .catch(() => {
                toast.error('Somnething went wrong');
            });

        if (userInfo) {
            getUserAssets(userInfo?.id)
                .then((res) => {
                    setSelectAsset(res);
                    console.log(res);
                })
                .catch((err) => console.log(err));
        }
    };

    const onSubmit = (data: any) => {
        // if (uuid) {
        //     updateonSubmit(data);
        //     // navigate('/asset/listing' );
        // } else {
        // console.log(addgetvalue(), 'addgetvalue');
        const updateData = data;
        // updateData.assetCategory = selectAsset;
        delete updateData.assetCategory;
        delete updateData.department;
        delete updateData.department;
        delete updateData.designation;
        delete updateData.employee_id;

        // const customAssetIds: string[] = updateData?.assets_id?.map((asset: any) => asset.custom_asset_id);
        updateData.asset_id = updateData?.assets_id?.map((asset: any) => asset.custom_asset_id);
        // updateData.customAssetIds;
        delete updateData.assets_id;
        console.log('ok123456', updateData);

        createonSubmit(updateData);
        // navigate('/asset/listing');
        // }
    };

    const onAddAssetSubmit = (data: any) => {
        // console.log('123456', data);
        setSelectAsset((prevSelectAsset: any) => [...prevSelectAsset, data]);
        setResetAutoComplete(true);
        // addreset();
        // Use a setTimeout to ensure that setResetAutoComplete(false) is called after state updates
        setTimeout(() => {
            setResetAutoComplete(false);
        }, 0);
        // setResetAutoComplete(false);
    };

    const createonSubmit = async (data: any) => {
        dispatch(spinLoaderShow(true));
        await assignAsset(data)
            .then((res) => {
                toast.success('Asset Assigned Successfully');

                console.log(res);
            })
            .catch((err) => toast.error(err))
            .finally(() => dispatch(spinLoaderShow(false)));
        // if (userInfo) {
        //     await getUserAssets(userInfo?.id)
        //         .then((res) => {
        //             setSelectAsset(res);
        //             console.log(res);
        //         })
        //         .catch((err) => console.log(err));
        // }
        navigate('/asset/listing');
    };

    const getUnAssignedAssets = async (asset_category_id: any) => {
        dispatch(spinLoaderShow(true));
        await getUnassignedAssets(asset_category_id)
            .then((res: any) => {
                setUnassignedAssets(res);
                // setState(res);
            })
            .catch((err) => {
                toast.error('Some thing Went Wrong');
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const {
        control,
        register,
        reset,
        setError,
        formState: { errors },
        setValue,
        getValues,
        handleSubmit
    }: any = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        //Validations=================>
        // defaultValues: defautlFormValues,
        resolver: yupResolver(addEmployeeAsset)
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'assets_id'
    });

    const handleRemoveInstance = (index: number) => {
        remove(index);
    };

    const handleAddInstance = (e: any) => {
        e?.preventDefault();

        append({});
    };

    useEffect(() => {
        setValue('employee_id', userInfo?.employement_code || 'N/A');
        setValue('department', userInfo?.resource?.department?.name || 'N/A');
        setValue('designation', userInfo?.designation || 'N/A');
        if (userInfo) {
            getUserAssets(userInfo?.id)
                .then((res) => {
                    setSelectAsset(res);
                    console.log(res);
                })
                .catch((err) => console.log(err));
        }
    }, [userInfo]);
    useEffect(() => {
        append({});
    }, []);

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* <form> */}
                <SubCard>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        {props.usersdropdown && (
                            <>
                                <Grid item xs={6} md={6} sm={6}>
                                    <AutoCompleteField
                                        // errors={errors?.user_id && !!errors?.user_id}
                                        errors={errors?.user_id && (getValues('user_id') ? false : !!errors?.user_id)}
                                        fieldName="user_id"
                                        autoComplete="off"
                                        label="Employee Name"
                                        control={control}
                                        setValue={setValue}
                                        options={props.usersdropdown}
                                        returnObject={false}
                                        // disabled={apiData ? true : false}
                                        isLoading={true}
                                        setUserInfo={setUserInfo}
                                        // optionKey="id"
                                        optionKey="id"
                                        optionValue="name"
                                        // helperText={errors?.user_id && errors?.user_id?.message}
                                        helperText={errors?.user_id && (getValues('user_id') ? '' : errors?.user_id?.message)}
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} sm={6}>
                                    <TextFieldControlled
                                        errors={!!errors?.name}
                                        fullWidth={true}
                                        fieldName="employee_id"
                                        type="text"
                                        autoComplete="off"
                                        label="Employee ID#"
                                        control={control}
                                        valueGot={''}
                                        disabled
                                        setValue={setValue}
                                        helperText={errors?.name && errors?.name?.message}
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} sm={6}>
                                    <TextFieldControlled
                                        errors={!!errors?.name}
                                        fullWidth={true}
                                        fieldName="department"
                                        type="text"
                                        autoComplete="off"
                                        label="Department"
                                        control={control}
                                        valueGot={''}
                                        disabled
                                        setValue={setValue}
                                        helperText={errors?.name && errors?.name?.message}
                                    />
                                </Grid>
                                <Grid item xs={6} md={6} sm={6}>
                                    <TextFieldControlled
                                        errors={!!errors?.name}
                                        fullWidth={true}
                                        fieldName="designation"
                                        type="text"
                                        autoComplete="off"
                                        label="Designation"
                                        control={control}
                                        valueGot={''}
                                        disabled
                                        setValue={setValue}
                                        helperText={errors?.name && errors?.name?.message}
                                    />
                                </Grid>
                            </>
                        )}
                        {/* {selectAsset?.length > 0 && selectAsset && (
                            <>
                                <Grid item xs={12} md={12} sm={12}>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2,1fr)',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            background: '#6e529e',
                                            color: '#fff'
                                        }}
                                    >
                                        <h3 style={{ marginRight: '2px solid #fff' }}>Asset Category</h3>

                                        <h3>Asset ID#</h3>
                                    </div>
                                    {selectAsset &&
                                        selectAsset?.map((item: any) => (
                                            <div>
                                                <div
                                                    style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        textAlign: 'center',
                                                        border: '1px solid #EDE7F6'
                                                    }}
                                                >
                                                    <p style={{ borderRight: '1px solid #EDE7F6', margin: 0, padding: '4px' }}>
                                                        {item?.asset?.asset_category?.name}
                                                    </p>
                                                    <p style={{ margin: 0, padding: '4px' }}>{item?.custom_asset_id}</p>
                                                </div>
                                            </div>
                                        ))}
                                </Grid>
                            </>
                        )} */}

                        {selectAsset && selectAsset.length > 0 && (
                            <>
                                <Grid item xs={12} md={12} sm={12}>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            background: '#6e529e',
                                            color: '#fff'
                                        }}
                                    >
                                        <h3 style={{ borderRight: '1px solid #fff', margin: 0, padding: '8px' }}>Asset Category</h3>
                                        <h3 style={{ borderRight: '1px solid #fff', margin: 0, padding: '8px' }}>Asset ID#</h3>
                                        <h3 style={{ margin: 0, padding: '8px' }}>Remove Asset</h3>
                                    </div>
                                    {selectAsset.map((item: any, index: number) => (
                                        <div key={index}>
                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    textAlign: 'center',
                                                    border: '1px solid #EDE7F6'
                                                }}
                                            >
                                                <p style={{ borderRight: '1px solid #EDE7F6', margin: 0, padding: '8px' }}>
                                                    {item?.asset?.asset_category?.name}
                                                </p>
                                                <p style={{ borderRight: '1px solid #EDE7F6', margin: 0, padding: '8px' }}>
                                                    {item?.custom_asset_id}
                                                </p>
                                                <p style={{ margin: 0, padding: '8px' }}>
                                                    <DeleteIcon
                                                        sx={{ color: '#f44336', cursor: 'pointer' }}
                                                        onClick={() => {
                                                            handleRemoveAssets(item?.asset_id);
                                                        }}
                                                    />
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </Grid>
                            </>
                        )}

                        {props.assetcategorydropdown && (
                            <>
                                <Grid item xs={12} md={12} sm={12}>
                                    {fields &&
                                        fields?.map((fieldItem: any, index: any) => {
                                            return (
                                                <Grid item md={12} key={fieldItem.id}>
                                                    <Grid container spacing={3}>
                                                        <Grid item md={3}>
                                                            <AutoCompleteField
                                                                errors={!!errors?.assets_id?.[index]?.asset_category_id}
                                                                fieldName={`assets_id.[${index}].asset_category_id`}
                                                                autoComplete="off"
                                                                label="Asset Category"
                                                                control={control}
                                                                setValue={setValue}
                                                                options={props.assetcategorydropdown}
                                                                returnObject={false}
                                                                reset={resetAutocomplete}
                                                                // disabled={apiData ? true : false}
                                                                // value={addControl.getValues('asset_category_id')}
                                                                isLoading={true}
                                                                // optionKey="id"
                                                                optionKey="name"
                                                                optionValue="name"
                                                                iProps={{
                                                                    onChange: handleAssetList
                                                                }}
                                                                helperText={errors?.assets_id?.[index]?.asset_category_id?.message || ''}
                                                            />
                                                        </Grid>
                                                        <Grid item md={3}>
                                                            <AutoCompleteField
                                                                errors={!!errors?.assets_id?.[index]?.custom_asset_id}
                                                                fieldName={`assets_id.[${index}].custom_asset_id`}
                                                                autoComplete="off"
                                                                label="Available Assets"
                                                                control={control}
                                                                setValue={setValue}
                                                                options={unassignedAssets}
                                                                returnObject={false}
                                                                reset={resetAutocomplete}
                                                                isLoading={true}
                                                                // optionKey="id"
                                                                // optionKey="custom_asset_id"
                                                                optionKey="id"
                                                                optionValue="custom_asset_id"
                                                                // optionValue="custom_asset_id"
                                                                helperText={errors?.assets_id?.[index]?.custom_asset_id?.message || ''}
                                                            />
                                                        </Grid>

                                                        <Grid item md={3} sx={{ mt: 3 }}>
                                                            <DeleteIcon
                                                                sx={{ width: 27, height: 27 }}
                                                                color="error"
                                                                onClick={() => {
                                                                    handleRemoveInstance(index);
                                                                }}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            );
                                        })}
                                </Grid>

                                <Grid sx={{ mb: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                                    <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                        <Stack direction="row">
                                            <AnimateButton>
                                                <Button
                                                    variant="contained"
                                                    type="button"
                                                    sx={{ m: 3, mr: 0 }}
                                                    className={'red'}
                                                    onClick={handleAddInstance}
                                                >
                                                    Add
                                                </Button>
                                            </AnimateButton>
                                        </Stack>
                                    </Grid>
                                </Grid>

                                {/* </div> */}
                            </>
                        )}
                    </Grid>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mt: 3 }}>
                        <Grid sx={{ mb: 1, mt: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                            <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                <Stack direction="row">
                                    <AnimateButton>
                                        <Button
                                            variant="contained"
                                            type="button"
                                            sx={{ m: 3 }}
                                            className={'red'}
                                            onClick={handleSubmit(onSubmit)}
                                        >
                                            Save
                                        </Button>
                                    </AnimateButton>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Grid>
                </SubCard>
            </form>
        </>
    );
};

// export default AssignAsset;
export default AssignAsset;

import React, { useEffect, useState, ReactNode } from 'react';
import { Button, Grid, Typography, Stack } from '@mui/material';
import CustomCheckBox from 'components/CustomCheckBox/CustomCheckBox';
import { useForm, Controller } from 'react-hook-form';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { AutoCompleteField, TextFieldControlled } from 'ui-component/formsField/FormFields';
import GenericTextarea from 'components/uiComopnents/GenericTextarea/GenericTextarea ';
import { createAssetComplainValidation } from './Validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { getUserAssets, createAssetComplain } from 'services/assetService';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment';
import { getAssetComplainByUser, createConfirmAsset } from 'services/assetService';
import Switch from '@mui/material/Switch';
import { resolveComplaint } from 'services/assetService';
import completeIcon from '../../assets/images/icons/complete.svg';
import onTrackIcon from '../../assets/images/icons/onTrack.svg';
// import styles from './index.module.scss';
import styles from '../../../src/ui-component/GridStatus/index.module.scss';
import CircularProgress from '@mui/material/CircularProgress';
import GenericModal from 'components/uiComopnents/GenericModal/GenericModal';
import ConfirmModal from 'components/AssetManage/ConfirmModal';

const AssetDetails = () => {
    const [assignedAssets, setassignedAssets] = useState<any>([]);
    const [allComplain, setAllComplain] = useState<any>([]);
    const { control, handleSubmit } = useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const [resetAutoComplete, setResetAutoComplete] = useState(false);
    const [open, setOpen] = useState(false);
    const [modalChildren, setModalChildren] = useState<ReactNode | undefined>(undefined);
    const params = useParams();

    const handleAssetList = async (e: any) => {
        // console.log(e);
        complainSetValue('asset_id', e?.custom_asset_id || '');
        // if (e) {
        //     // setValue('asset_id', null);
        //     await getUnAssignedAssets(e.id);
        //     // setHandleAssetCategory(e.id);
        // } else {
        //     setHandleAssetCategory(null);
        // }
    };

    const {
        control: controlComplain,
        handleSubmit: handleComplainSubmit,
        formState: { errors: complainErrors },
        setValue: complainSetValue,
        getValues: complainGetValue,
        reset: complainReset
    } = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        resolver: yupResolver(createAssetComplainValidation)
    });

    const onComplainSubmit = (data: any) => {
        setLoading(true);
        const asset_category_id = assignedAssets?.find(
            (asset: any) => asset?.asset?.asset_category?.id === complainGetValue('asset_category_id')
        );
        data.asset_id = asset_category_id?.asset_id;
        data.user_id = asset_category_id?.user_id;
        delete data.asset_category_id;
        console.log(data);

        createAssetComplain(data)
            .then((res) => {
                toast.success('Asset Complaint Recieved');
                complainReset();
                getUserComplain();
                setResetAutoComplete(true);
                // console.log(res);
            })
            .catch(() => {
                toast('Something went wrong');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        getUserAssets(params.id)
            .then((res) => {
                setassignedAssets(res);
                console.log(res);
            })
            .catch((err) => console.log(err));
    }, []);

    // const onSubmit = (data: any) => {

    //     const outputArray = Object.entries(data).map(([key, value]) => {
    //         return {
    //             [key]: value
    //         };
    //     });

    //     const filteredArray = outputArray.filter((item: any) => {
    //         const values = Object.values(item);
    //         return values.every((value) => value !== false);
    //     });
    //     const filteredArrayById = filteredArray.filter((item: any) => {
    //         const values = Object.values(item:any);
    //         return values.some((value) => value && value.id !== undefined);
    //     });

    //     console.log(filteredArrayById);

    // };
    const onSubmit = (data: Record<string, any>) => {
        const outputArray = Object.entries(data).map(([key, value]) => {
            return {
                [key]: value
            };
        });

        const filteredArray = outputArray.filter((item: Record<string, any>) => {
            const values = Object.values(item);
            return values.every((value) => value !== false);
        });

        const idArray = filteredArray
            .map((item) => Object.values(item)[0]) // Extract the nested object
            .filter((value) => value && value.id !== undefined) // Filter objects with "id" property
            .map((value) => value.id); // Extract "id" property

        createConfirmAsset({ asset_id: idArray })
            .then((res) => toast.success('Asset Confirmation Successfully'))
            .catch((err) => {
                toast.error(err);
            });

        console.log(idArray);
    };

    const getUserComplain = () => {
        getAssetComplainByUser(params.id)
            .then((res) => setAllComplain(res))
            .catch((err) => {
                toast.error(err);
            });
    };
    useEffect(() => {
        getUserComplain();
    }, []);

    const handleSwitch = (id: any) => {
        console.log(id);
        setModalChildren(() => undefined);
        setOpen(true);
        setModalChildren(() => <ConfirmModal handleClose={handleClose} id={id} handleApproved={handleApproved} />);
    };

    const handleApproved = (id: any) => {
        console.log(id, 'id');
        const confrimed = {
            employee_resolved: true
        };
        resolveComplaint(id, confrimed)
            .then((res) => {
                toast.success('Complaint Resolve');
                getUserComplain();
                handleClose();
            })
            .catch((err) => {});
    };

    const handleClose = () => {
        setOpen(false);
        setModalChildren(() => undefined);
    };

    return (
        <>
            <GenericModal isOpen={open} onClose={handleClose} children={modalChildren} width={400} />
            <Grid container spacing={2}>
                {assignedAssets && assignedAssets?.length > 0 && (
                    <>
                        <Grid item xs={12} md={12} sm={12}>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    background: '#6e529e',
                                    color: '#fff'
                                }}
                            >
                                <h3 style={{ borderRight: '1px solid #fff', margin: 0, padding: '8px' }}>Asset Category</h3>
                                <h3 style={{ borderRight: '1px solid #fff', margin: 0, padding: '8px' }}>Asset ID#</h3>
                            </div>
                            {assignedAssets?.map((item: any, index: number) => (
                                <div key={index}>
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
                                        <p style={{ borderRight: '1px solid #EDE7F6', margin: 0, padding: '8px' }}>
                                            {item?.asset?.asset_category?.name}
                                        </p>
                                        <p style={{ borderRight: '1px solid #EDE7F6', margin: 0, padding: '8px' }}>
                                            {item?.custom_asset_id}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </Grid>
                    </>
                )}
            </Grid>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12} sm={12}>
                        <Typography
                            variant="body2"
                            sx={{
                                margin: '24px 0',
                                padding: '12px',
                                fontWeight: 500,
                                width: '100%',
                                border: '1px solid #F3E9F3',
                                backgroundColor: '#fff',
                                borderRadius: '12px 12px 0 0'
                            }}
                            gutterBottom
                        >
                            Asset Confirmation
                        </Typography>
                    </Grid>
                    <Grid item sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                        {assignedAssets.length > 0 ? (
                            assignedAssets.map((item: any, index: number) => (
                                <React.Fragment key={index}>
                                    <CustomCheckBox
                                        label={item?.asset?.asset_category?.name}
                                        name={item?.asset?.asset_category?.name}
                                        defaultChecked={item?.asset?.assigned_confirmed}
                                        id={item?.asset?.id}
                                        control={control}
                                    />
                                    {/* Add more CustomCheckBox components or other elements here if needed */}
                                </React.Fragment>
                            ))
                        ) : (
                            <p style={{ marginLeft: '12px' }}>No Asset Assigned</p>
                        )}

                        {/* <CustomCheckBox label="HeadPhone" name="headphone" control={control} />
                        <CustomCheckBox label="Mouse" name="mouse" control={control} /> */}
                    </Grid>

                    <Grid sx={{ mb: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                        <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                            <Stack direction="row">
                                <AnimateButton>
                                    <Button
                                        variant="contained"
                                        type="submit"
                                        sx={{ m: 3, mr: 0, width: '72px', height: '36.5px' }}
                                        className={'red'}
                                        // disabled={apiData ? true : false}
                                        // disabled={isLoading}
                                    >
                                        {/* {isLoading ? <CircularProgress sx={{ color: '#fff' }} size={14} /> : 'Save'} */}
                                        Confirm
                                    </Button>
                                </AnimateButton>
                            </Stack>
                        </Grid>
                    </Grid>
                </Grid>
            </form>

            <Grid container>
                <Grid item xs={12} md={12} sm={12}>
                    <Typography
                        variant="body2"
                        sx={{
                            margin: '24px 0',
                            padding: '12px',
                            fontWeight: 500,
                            width: '100%',
                            border: '1px solid #F3E9F3',
                            backgroundColor: '#fff',
                            borderRadius: '12px 12px 0 0'
                        }}
                        gutterBottom
                    >
                        Issue Complaint
                    </Typography>
                </Grid>
                {/* <Grid item sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}> */}
                <form onSubmit={handleComplainSubmit(onComplainSubmit)} style={{ width: '100%' }}>
                    <Grid item xs={12} md={12} sm={12}>
                        <Grid item md={12}>
                            <Grid container spacing={3}>
                                <Grid item md={6}>
                                    <AutoCompleteField
                                        errors={!!complainErrors?.asset_category_id}
                                        fieldName={`asset_category_id`}
                                        autoComplete="off"
                                        label="Asset Category"
                                        control={controlComplain}
                                        setValue={complainSetValue || ''}
                                        options={assignedAssets.map((item: any) => item?.asset?.asset_category) || []}
                                        isLoading={true}
                                        reset={resetAutoComplete}
                                        setReset={setResetAutoComplete}
                                        optionKey="id" // Adjust this based on the structure of your options array
                                        optionValue="name"
                                        iProps={{
                                            onChange: handleAssetList
                                        }}
                                        helperText={complainErrors?.asset_category_id?.message || ''}
                                    />
                                </Grid>
                                <Grid item md={6}>
                                    <TextFieldControlled
                                        errors={!!complainErrors?.asset_id}
                                        fullWidth={true}
                                        fieldName="asset_id"
                                        type="text"
                                        autoComplete="off"
                                        label="Available Assets"
                                        control={controlComplain}
                                        valueGot={''}
                                        disabled
                                        setValue={complainSetValue}
                                        helperText={complainErrors?.asset_id && complainErrors?.asset_id?.message}
                                        disable
                                    />
                                </Grid>
                                <Grid item md={12}>
                                    <GenericTextarea
                                        fieldName="description"
                                        placeholder="Complaint Description"
                                        setValue={complainSetValue}
                                        control={controlComplain}
                                        errors={!!complainErrors?.description}
                                        helperText={complainErrors?.description?.message || ''}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid sx={{ mb: 3, mt: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                        <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                            <Stack direction="row">
                                <AnimateButton>
                                    <Button
                                        variant="contained"
                                        type="submit"
                                        sx={{ m: 3, mr: 0, width: '98px', height: '36.5px' }}
                                        className={'red'}
                                        // disabled={apiData ? true : false}
                                        disabled={loading}
                                    >
                                        {loading ? <CircularProgress sx={{ color: '#fff' }} size={14} /> : 'Complaint'}
                                    </Button>
                                </AnimateButton>
                            </Stack>
                        </Grid>
                    </Grid>
                </form>

                <Grid container spacing={2}>
                    {allComplain && allComplain?.length > 0 && (
                        <>
                            <Grid item xs={12} md={12} sm={12}>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(6, 1fr)',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        background: '#6e529e',
                                        color: '#fff'
                                    }}
                                >
                                    <h3 style={{ borderRight: '1px solid #fff', margin: 0, padding: '8px' }}>Status</h3>
                                    <h3 style={{ borderRight: '1px solid #fff', margin: 0, padding: '8px' }}>Asset Category</h3>
                                    <h3 style={{ borderRight: '1px solid #fff', margin: 0, padding: '8px' }}>Asset ID#</h3>
                                    <h3 style={{ borderRight: '1px solid #fff', margin: 0, padding: '8px' }}>Description</h3>
                                    <h3 style={{ borderRight: '1px solid #fff', margin: 0, padding: '8px' }}>Assign Date</h3>
                                    <h3 style={{ borderRight: '1px solid #fff', margin: 0, padding: '8px' }}>Confirmation</h3>
                                </div>
                                {allComplain?.map((item: any, index: number) => (
                                    <div key={index}>
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(6, 1fr)',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                border: '1px solid #EDE7F6'
                                            }}
                                        >
                                            <p style={{ borderRight: '1px solid #EDE7F6', margin: 0, padding: '8px' }}>
                                                {/* {String(item?.admin_resolved)} */}
                                                <div className={styles.status__wrapper}>
                                                    <img src={item?.employee_resolved ? completeIcon : onTrackIcon} />
                                                    <span>{item?.employee_resolved ? 'Resolved' : 'Unresolved'}</span>
                                                </div>
                                            </p>
                                            <p style={{ borderRight: '1px solid #EDE7F6', margin: 0, padding: '8px' }}>
                                                {item?.asset?.asset_category?.name}
                                            </p>
                                            <p style={{ borderRight: '1px solid #EDE7F6', margin: 0, padding: '8px' }}>
                                                {item?.custom_asset_id}
                                            </p>
                                            <p
                                                style={{
                                                    borderRight: '1px solid #EDE7F6',
                                                    margin: 0,
                                                    padding: '8px',
                                                    overflow: 'hidden',
                                                    wordWrap: 'break-word',
                                                    whiteSpace: 'normal'
                                                }}
                                            >
                                                {item?.description}
                                            </p>
                                            <p style={{ borderRight: '1px solid #EDE7F6', margin: 0, padding: '8px' }}>
                                                {moment(item?.created_at).format('Do MMM, YYYY')}
                                            </p>
                                            <p style={{ borderRight: '1px solid #EDE7F6', margin: 0, padding: '8px' }}>
                                                <Switch
                                                    // defaultChecked={item?.employee_resolved || false}
                                                    checked={item?.employee_resolved || false}
                                                    // onChange={(e) => (e?.target?.checked ? handleApproved(item?.id) : () => {})}
                                                    onChange={() => handleSwitch(item?.id)}
                                                    disabled={!item?.admin_resolved || item?.employee_resolved}
                                                />
                                                <span>{item?.employee_resolved}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </Grid>
                        </>
                    )}
                </Grid>
            </Grid>
        </>
    );
};

export default AssetDetails;

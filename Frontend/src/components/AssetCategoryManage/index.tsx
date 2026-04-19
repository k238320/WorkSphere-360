/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/*eslint-Disable */
/**
 *
 * ProjectManage
 *
 */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import { Button, Grid, Stack } from '@mui/material';

// assets
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import { SwitchFieldDefault, TextFieldControlled } from 'ui-component/formsField/FormFields';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { createDepartment, getDepartmentById, updateDepartment } from 'services/departmentService';
import { createAssetCategory, getAssetCategoryById, updateAssetCategory } from 'services/assetCategoryService';
import { yupResolver } from '@hookform/resolvers/yup';
import { assetCategoryValidation } from './Validation';

export function AssetCategoryManage(props: any) {
    const dispatch = useDispatch();
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    const navigate = useNavigate();

    const [apiData, setApiData] = useState<any>(null);
    const [code, setCode] = useState<String>('');

    const defautlFormValues = {
        status: true
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
    } = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        //Validations=================>
        defaultValues: defautlFormValues,
        resolver: yupResolver(assetCategoryValidation)
    });

    useEffect(() => {
        if (uuid) {
            getAssetCategoryByIdData();
        } else {
            reset();
            setValue('status', true);
            setApiData(null);
            setCode('');
        }
    }, [uuid]);

    useEffect(() => {
        if (apiData) {
            setValue('name', apiData?.name);
            setValue('code', apiData?.code);
            setValue('status', apiData?.status);
        }
    }, [apiData]);

    const getAssetCategoryByIdData = async () => {
        dispatch(spinLoaderShow(true));
        getAssetCategoryById(uuid)
            .then((res: any) => {
                setApiData(res);
                dispatch(spinLoaderShow(false));
                setCode(res?.code);
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };
    // create onsubmit data
    const createonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        createAssetCategory(data)
            .then((res: any) => {
                toast.success('Record inserted Successfully');
                dispatch(spinLoaderShow(false));
                navigate('/asset-category/listing');
                // navigate("/dashboard/admin/listing" )
            })
            .catch((err: any) => {
                dispatch(spinLoaderShow(false));
                toast.error(err);
            });
    };
    // create updateonSubmit data
    const updateonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        updateAssetCategory(uuid, data)
            .then((res: any) => {
                toast.success('Record Update Successfully');
                dispatch(spinLoaderShow(false));
                // navigate("/dashboard/admin/listing" )
            })
            .catch((err: any) => {
                dispatch(spinLoaderShow(false));
                toast.error(err);
            });
    };

    const onSubmit = (data: any) => {
        if (uuid) {
            updateonSubmit(data);
            // navigate('/resource/listing' );
        } else {
            createonSubmit(data);
            // navigate('/asset-category/listing');
        }
    };
    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <SubCard>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.name}
                                fullWidth={true}
                                fieldName="name"
                                type="text"
                                autoComplete="off"
                                label="Name *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.name && errors?.name?.message}
                            />
                        </Grid>

                        <Grid item xs={3} md={3} sm={3}>
                            <TextFieldControlled
                                errors={!!errors?.name}
                                fullWidth={true}
                                fieldName="code"
                                type="text"
                                autoComplete="off"
                                label="Code *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.code && errors?.code?.message}
                                disabled={code !== '' ? true : false}
                            />
                        </Grid>

                        <Grid item xs={3} md={3} sm={3} style={{ marginTop: '15px', display: 'flex', justifyContent: 'right' }}>
                            <SwitchFieldDefault
                                errors={!!errors?.status}
                                fieldName="status"
                                label="status *"
                                control={control}
                                setValue={setValue}
                                isLoading={true}
                                helperText={errors?.status && errors?.status?.message}
                            />
                        </Grid>

                        <Grid sx={{ mb: 1, mt: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                            <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                <Stack direction="row">
                                    <AnimateButton>
                                        <Button
                                            variant="contained"
                                            type="submit"
                                            sx={{ m: 3 }}
                                            className={'red'}
                                            onClick={handleSubmit(onSubmit)}
                                        >
                                            Submit
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
}

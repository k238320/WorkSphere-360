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
import { createTechnology, getTechnologyByID, updateTechnology } from 'services/technologyService';

export function TechnologyManage(props: any) {
    const dispatch = useDispatch();
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    const navigate = useNavigate();

    const [apiData, setApiData] = useState<any>(null);

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
        defaultValues: defautlFormValues
        // resolver: yupResolver(FinanceValidation)
    });

    useEffect(() => {
        if (uuid) {
            getTechnologyDataByID();
        } else {
            reset();
            setValue('status', true);
            setApiData(null);
        }
    }, [uuid]);

    useEffect(() => {
        if (apiData) {
            setValue('name', apiData?.name);
            setValue('status', apiData?.status);
        }
    }, [apiData]);

    const getTechnologyDataByID = async () => {
        dispatch(spinLoaderShow(true));
        getTechnologyByID(uuid)
            .then((res: any) => {
                setApiData(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };
    // create onsubmit data
    const createonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        createTechnology(data)
            .then((res: any) => {
                toast.success('Record inserted Successfully');
                dispatch(spinLoaderShow(false));
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
        updateTechnology(data)
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
        if (apiData) {
            data.id = apiData?.id;
            updateonSubmit(data);
            // console.log(data);
            // navigate('/resource/listing' );
        } else {
            createonSubmit(data);
            navigate('/technology/listing');
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

                        <Grid item xs={6} md={6} sm={6} style={{ marginTop: '15px', display: 'flex', justifyContent: 'right' }}>
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

/* eslint-disable no-useless-rename */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
// ================================|| Core Import  ||================================ //

import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Grid, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { AutoCompleteField, TextFieldControlled } from 'ui-component/formsField/FormFields';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import MilestoneListing from '../ProjectMileStoneListing';
import { MileStoneValidation } from './Validation';
import moment from 'moment';
import { createProjectMileStone, getProjectMileStone, getProjectMileStonePhase } from 'services/projectService';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';

// ================================|| Sales Component ||================================ //

export function ProjectMilestoneComponent({ projectId, disabled }: { projectId: any; disabled?: boolean }) {
    const log: any = window.localStorage.getItem('user');
    const user = JSON.parse(log);
    const [timeline, setTimeline] = useState<any>(null);
    const [milestonePhase, setmilestonePhase] = useState<any>([]); // project Category
    const [milestoneData, setMilestoneData] = useState<any>([]); // project Category
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();

    // ================================||use Hook Form ||================================ //

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
        // defaultValues: defautlFormValues,
        resolver: yupResolver(MileStoneValidation)
    });

    useEffect(() => {
        getmilestoneData();
        getmilestonePhaseData();
    }, []);

    const getmilestonePhaseData = async () => {
        dispatch(spinLoaderShow(true));
        getProjectMileStonePhase()
            .then((res: any) => {
                setmilestonePhase(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const getmilestoneData = async () => {
        dispatch(spinLoaderShow(true));
        getProjectMileStone(projectId)
            .then((res: any) => {
                setMilestoneData(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    // create admin data
    const createonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        toast.success('Record inserted Successfully');
        createProjectMileStone(data)
            .then((res: any) => {
                getmilestoneData();
                // navigate("/dashboard/default" )
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };
    const onSubmit = (data: any) => {
        // data['targeted_month'] = data?.targeted_month ? String(moment(data?.targeted_month)?.format('YYYY-MM-DD')) : null;
        data.targeted_month = data?.targeted_month ? moment(data?.targeted_month)?.format('YYYY-MM-DD') : null;
        data.milestone_phase_id = data?.milestone_phase_id;
        data.milestone_payment = +data?.milestone_payment;
        data.project_id = projectId;
        data.role_id = user?.role_id;
        data.user_id = user?.id;

        createonSubmit(data);
    };
    return (
        <>
            <form>
                {/* // ================================|| Hours Details||================================ // */}
                <Grid item xs={12} md={12} sm={12} direction="row" justifyContent="center" alignItems="center">
                    <SubCard title="Project Milestone" sx={{ mb: 3 }}>
                        <Grid container spacing={2}>
                            {/* // ================================||  milestone Listing||================================ // */}
                            <Grid item xs={12} md={12} sm={12} sx={{ mb: 3 }}>
                                <MilestoneListing apiData={milestoneData} refreshData={getmilestoneData} disabled={disabled} />
                            </Grid>
                            {/* // ================================||  milestone Listing||================================ // */}
                            {!disabled && (
                                <>
                                    <Grid item xs={3} md={4} sm={3}>
                                        <AutoCompleteField
                                            errors={!!errors?.milestone_phase_id}
                                            fieldName="milestone_phase_id"
                                            autoComplete="off"
                                            label="Milestone Phase *"
                                            control={control}
                                            setValue={setValue}
                                            options={milestonePhase}
                                            returnObject={false}
                                            isLoading={true}
                                            optionKey="id"
                                            optionValue="name"
                                            helperText={errors?.milestone_phase_id && errors?.milestone_phase_id?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={3} md={4} sm={3}>
                                        <TextFieldControlled
                                            errors={!!errors?.milestone_payment}
                                            fullWidth={true}
                                            fieldName="milestone_payment"
                                            type="text"
                                            autoComplete="off"
                                            label=" Milestone Payment *"
                                            control={control}
                                            valueGot={''}
                                            setValue={setValue}
                                            helperText={errors?.milestone_payment && errors?.milestone_payment?.message}
                                        />
                                    </Grid>

                                    <Grid item xs={3} md={4} sm={3} sx={{ mt: 2 }}>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker
                                                open={open}
                                                onOpen={() => setOpen(true)}
                                                onClose={() => setOpen(false)}
                                                renderInput={(props: any) => (
                                                    <TextField fullWidth {...props} helperText="" onClick={(e) => setOpen(true)} />
                                                )}
                                                label="Targeted Month"
                                                value={timeline}
                                                onChange={(newValue: Date | null) => {
                                                    // console.log(newValue?.toISOString(), 'new date');
                                                    setTimeline(newValue?.toISOString());
                                                    setValue('targeted_month', newValue?.toISOString());
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid item xs={6} md={12} sm={6}>
                                        <Grid sx={{ mt: 2 }} container direction="row" justifyContent="flex-end" alignItems="center">
                                            <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                                <Stack direction="row">
                                                    <AnimateButton>
                                                        <Button
                                                            variant="contained"
                                                            sx={{ m: 1 }}
                                                            type={'submit'}
                                                            onClick={handleSubmit(onSubmit)}
                                                        >
                                                            add
                                                        </Button>
                                                    </AnimateButton>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    </SubCard>
                </Grid>
                {/* // ================================|| milestone Details||================================ // */}
            </form>
        </>
    );
}

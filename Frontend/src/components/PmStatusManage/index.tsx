/* eslint-disable no-useless-rename */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
// ================================|| Core Import  ||================================ //

import { Button, Grid, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { AutoCompleteMultipleField, TextFieldControlled } from 'ui-component/formsField/FormFields';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
// import { ClientDetailComponent } from './ClientDetails';
// import ProjectManagerHoursListing from './ProjectManagerHourListing';
import { getProjectForPM, updateProjects } from 'services/projectService';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { getProjectManagers } from 'services/userService';
import useAuth from 'hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { createPmStatus, getPmStatusById } from 'services/pmStatusService';
import { yupResolver } from '@hookform/resolvers/yup';

export function PmStatusComponent(props: any) {
    const dispatch = useDispatch();
    const [timeline, setTimeline] = useState<any>(null);
    const [srsSignoff, setSrsSignoff] = useState<any>(new Date());

    const [open, setOpen] = useState(false);

    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');

    const { user } = useAuth();

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
        reValidateMode: 'onChange'
        //Validations=================>
        // defaultValues: defautlFormValues,
        // resolver: yupResolver(ProjectManageValidation)
    });

    useEffect(() => {
        getProjectManagerStatus();
    }, []);

    useEffect(() => {
        if (props?.projectId) {
            getProjectManagerStatus();
        }
    }, [props?.projectId]);

    // update admin data
    const updateonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        const apiData = {
            project_id: uuid,
            srs_signoff: srsSignoff || new Date(),
            project_plan: data?.project_plan,
            project_status_report: data?.project_status_report,
            content: data?.content
        };
        createPmStatus(apiData)
            .then((res: any) => {
                toast.success('Record updated Successfully');
                // navigate("/dashboard/default" )
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                dispatch(spinLoaderShow(false));
                toast.error(err);
            });
    };

    const getProjectManagerStatus = () => {
        dispatch(spinLoaderShow(true));
        getPmStatusById(uuid)
            .then((res: any) => {
                // setSelectedProjectManager(res?.project_manager_details);
                setValue('project_status_report', res?.project_status_report);
                setValue('project_plan', res?.project_plan);
                setValue('content', res?.content);
                // setTimeline(res?.kickoff_date);
                setSrsSignoff(res?.srs_signoff);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                console.log('err');
                dispatch(spinLoaderShow(false));
            });
    };

    const onSubmit = (data: any) => {
        const obj = {
            srs_signoff: data?.srs_signoff ? moment(data?.srs_signoff).format('YYYY-MM-DD') : '',
            project_plan: data?.project_plan ?? '',
            project_status_report: data?.project_status_report ?? '',
            content: data?.content,
            project_id: uuid
        };

        updateonSubmit(obj);
    };

    return (
        <>
            <SubCard title="Project Manager">
                <form>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={3} md={6} sm={3} sx={{ mt: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    open={open}
                                    onOpen={() => setOpen(true)}
                                    onClose={() => setOpen(false)}
                                    renderInput={(props: any) => (
                                        <TextField fullWidth {...props} helperText="" onClick={(e) => setOpen(true)} />
                                    )}
                                    label="SRS Signoff Date"
                                    // value={timeline}
                                    value={srsSignoff}
                                    onChange={(newValue: Date | null) => {
                                        // setTimeline(newValue);
                                        setSrsSignoff(newValue);
                                        setValue('srs_signoff', newValue);
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={6} md={12} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.project_plan}
                                fullWidth={true}
                                fieldName="project_plan"
                                type="text"
                                autoComplete="off"
                                label="Add Project Plan *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                multiline={true}
                                helperText={errors?.project_plan && errors?.project_plan?.message}
                            />
                            {/* <span style={{ color: '#bcbcbc', marginLeft: '10px' }}>Place here the main Folder URL</span> */}
                        </Grid>
                        <Grid item xs={6} md={12} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.srs}
                                fullWidth={true}
                                fieldName="project_status_report"
                                type="text"
                                autoComplete="off"
                                label="Add Project Status Report *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                multiline={true}
                                helperText={errors?.srs && errors?.srs?.message}
                            />
                            {/* <span style={{ color: '#bcbcbc', marginLeft: '10px' }}>Place here the main Folder URL</span> */}
                        </Grid>
                        <Grid item xs={6} md={12} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.srs}
                                fullWidth={true}
                                fieldName="content"
                                type="text"
                                autoComplete="off"
                                label="Add Content"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                multiline={true}
                                helperText={errors?.srs && errors?.srs?.message}
                            />
                            {/* <span style={{ color: '#bcbcbc', marginLeft: '10px' }}>Place here the Website Credential's</span> */}
                        </Grid>
                        <Grid item xs={6} md={12} sm={6}>
                            {/* <ClientDetailComponent projectId={props?.projectId} /> */}
                        </Grid>
                        <Grid sx={{ mb: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
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
                                            save
                                        </Button>
                                    </AnimateButton>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
            </SubCard>
        </>
    );
}

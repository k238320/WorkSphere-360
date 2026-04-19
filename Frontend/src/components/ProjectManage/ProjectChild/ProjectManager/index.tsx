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
import { ClientDetailComponent } from './ClientDetails';
import ProjectManagerHoursListing from './ProjectManagerHourListing';
import { getProjectForPM, updateProjects } from 'services/projectService';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { getProjectManagers } from 'services/userService';
import useAuth from 'hooks/useAuth';
import { yupResolver } from '@hookform/resolvers/yup';
import { ProjectManageLeadValidation, ProjectManageValidation } from './Validation';
import { DropzoneComponent } from 'ui-component/Dropzone';
import { uploadFiles } from 'services/uploadService';

export function ProjectManagerComponent(props: any) {
    const dispatch = useDispatch();
    const [timeline, setTimeline] = useState<any>(null);
    const [go_live_date, setLive_date] = useState<any>(null);
    const [projectManager, setProjectManager] = useState<any>([]); // project Category
    const [selectedProjectManager, setSelectedProjectManager] = useState<any>([]);
    const [open, setOpen] = useState(false);
    const [goLiveOpen, setGoLiveOpen] = useState(false);

    const { user }: any = useAuth();

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
        // reValidateMode: 'onChange',

        resolver: yupResolver(user?.role?.name == 'Project Manager' ? ProjectManageValidation : ProjectManageLeadValidation)
    });

    const [documentData, setDocumentData] = useState({
        status_report: ''
    });

    const getPM = () => {
        getProjectManagers()
            .then((res: any) => {
                setProjectManager(res);
            })
            .catch((err: any) => {
                console.log('err', err);
            });
    };

    const onProjectManagerChange = (data: any) => {
        if (data) {
            setSelectedProjectManager(data);
        }
    };

    useEffect(() => {
        getPM();
    }, []);

    useEffect(() => {
        if (props?.projectId) {
            getProjectManagerDetail();
        }
    }, [props?.projectId]);

    // update admin data
    const updateonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        updateProjects(props?.projectId, data)
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

    const StatusReportHandleSave = async (files: String) => {
        // dispatch(spinLoaderShow(true));
        if (files[0]) {
            const formData = new FormData();
            formData.append('file', files[0]);

            uploadFiles(formData)
                .then((res: any) => {
                    setValue('status_report', res);
                })
                .catch((err) => {
                    console.log('errror', err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    const getProjectManagerDetail = () => {
        dispatch(spinLoaderShow(true));
        getProjectForPM(props?.projectId)
            .then((res: any) => {
                setSelectedProjectManager(res?.project_manager_details ?? []);
                setValue('srs', res?.project_srs);
                setValue('project_plan', res?.project_plan);
                setValue('weburl', res?.project_website);
                setValue('kickoff_date', res?.kickoff_date);
                setValue('go_live_date', res?.go_live_date);
                setTimeline(res?.kickoff_date);
                setLive_date(res?.go_live_date);
                dispatch(spinLoaderShow(false));

                setDocumentData({
                    status_report: res?.status_report
                });
                setValue('status_report', res?.status_report);
            })
            .catch((err) => {
                console.log('err');
                dispatch(spinLoaderShow(false));
            });
    };

    const onSubmit = (data: any) => {
        const obj = {
            kickoff_date: data?.kickoff_date ? moment(data?.kickoff_date).format('YYYY-MM-DD') : '',
            go_live_date: data?.go_live_date ? moment(data?.go_live_date).format('YYYY-MM-DD') : '',
            project_plan: data?.project_plan ?? '',
            project_srs: data?.srs ?? '',
            project_manager: data?.pm_name,
            project_website: data?.weburl ?? '',
            status_report: data?.status_report ?? ''
        };

        updateonSubmit(obj);
    };

    return (
        <>
            <SubCard title="Project Manager">
                <form>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={6} md={6} sm={6}>
                            <AutoCompleteMultipleField
                                errors={!!errors?.pm_name}
                                fieldName="pm_name"
                                autoComplete="off"
                                label="Select Project Manager *"
                                control={control}
                                setValue={setValue}
                                options={projectManager}
                                iProps={{
                                    onChange: onProjectManagerChange,
                                    disabled: ['Super Admin', 'Associate Creative Director', 'PM Lead' , 'Sales'].includes(user?.role?.name)
                                        ? false
                                        : true
                                }}
                                returnObject={false}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.pm_name && errors?.pm_name?.message}
                                valueGot={selectedProjectManager}
                            />
                        </Grid>

                        <Grid item xs={3} md={3} sm={3} sx={{ mt: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    open={open}
                                    onOpen={() => setOpen(true)}
                                    onClose={() => setOpen(false)}
                                    renderInput={(props: any) => (
                                        <TextField
                                            fullWidth
                                            {...props}
                                            error={!!errors?.kickoff_date}
                                            helperText={errors?.kickoff_date?.message || ''}
                                            onClick={(e) => setOpen(true)}
                                        />
                                    )}
                                    label="Kickoff Date"
                                    value={timeline}
                                    onChange={(newValue: Date | null) => {
                                        setTimeline(newValue);
                                        setValue('kickoff_date', newValue || null);
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={3} md={3} sm={3} sx={{ mt: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    open={goLiveOpen}
                                    onOpen={() => setGoLiveOpen(true)}
                                    onClose={() => setGoLiveOpen(false)}
                                    renderInput={(props: any) => (
                                        <TextField
                                            fullWidth
                                            {...props}
                                            error={!!errors?.go_live_date}
                                            helperText={errors?.go_live_date?.message || ''}
                                            onClick={(e) => setGoLiveOpen(true)}
                                        />
                                    )}
                                    label="Go live Date"
                                    value={go_live_date}
                                    onChange={(newValue: Date | null) => {
                                        setLive_date(newValue);
                                        setValue('go_live_date', newValue || null);
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
                                helperText={errors?.project_plan && errors?.project_plan?.message}
                            />
                            <span style={{ color: '#bcbcbc', marginLeft: '10px' }}>Place here the main Folder URL</span>
                        </Grid>
                        <Grid item xs={6} md={12} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.srs}
                                fullWidth={true}
                                fieldName="srs"
                                type="text"
                                autoComplete="off"
                                label="Add SRS *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.srs && errors?.srs?.message}
                            />
                            <span style={{ color: '#bcbcbc', marginLeft: '10px' }}>Place here the main Folder URL</span>
                        </Grid>
                        <Grid item xs={6} md={12} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.srs}
                                fullWidth={true}
                                fieldName="weburl"
                                type="text"
                                autoComplete="off"
                                label="Add Website"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.srs && errors?.srs?.message}
                            />
                            <span style={{ color: '#bcbcbc', marginLeft: '10px' }}>Place here the Website Credential's</span>
                        </Grid>


                        <Grid item xs={6} md={12} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.status_report}
                                fullWidth={true}
                                fieldName="status_report"
                                type="text"
                                autoComplete="off"
                                label="Status report"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.status_report && errors?.status_report?.message}
                            />
                            <span style={{ color: '#bcbcbc', marginLeft: '10px' }}>Place here the main Folder URL</span>
                        </Grid>

                        {/* <Grid item xs={6} md={12} sm={6}>
                            <SubCard title="Status report *">
                                {props?.projectId ? (
                                    <DropzoneComponent
                                        handleSave={StatusReportHandleSave}
                                        message={'Available Document is'}
                                        documentData={documentData?.status_report}
                                    />
                                ) : (
                                    <DropzoneComponent handleSave={StatusReportHandleSave} message={false} />
                                )}

                                <input {...register('status_report')} hidden />
                            </SubCard>
                        </Grid> */}
                        <Grid item xs={6} md={12} sm={6}>
                            <ClientDetailComponent projectId={props?.projectId} />
                        </Grid>
                        <Grid item xs={6} md={12} sm={6}>
                            <SubCard title="Hours Details" sx={{ mb: 3 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={12} sm={12} sx={{ mt: 2, mb: 2 }}>
                                        <ProjectManagerHoursListing apiData={props.apiData} projectId={props?.projectId} />
                                    </Grid>
                                </Grid>
                            </SubCard>
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

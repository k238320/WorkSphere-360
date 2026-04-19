/* eslint-disable prettier/prettier */
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Grid, Stack } from '@mui/material';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
    createProjectMileStone,
    createProjectStatus,
    createProjectStatusDetails,
    getProjectStatus,
    getProjectStatusCategory,
    getProjectStatusDetails
} from 'services/projectService';
import SubCard from 'ui-component/cards/SubCard';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { AutoCompleteField, AutoCompleteMultipleField, TextFieldControlled } from 'ui-component/formsField/FormFields';
import ProjectStatusListing from './ProjectStatusListing';
import { ProjectStatusValidation } from './Validation';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Box } from '@mui/system';

const defaultValues = {
    project_status: '',
    category: '',
    days_delayed: null,
    comments: ''
};

export function ProjectStatusComponent(props: any) {
    const dispatch = useDispatch();

    const [status, setStatus] = useState<any>([]); // Status
    const [categories, setCategories] = useState<any>([]); // Status
    const [tableData, setTableData] = useState<any>([]);

    const log: any = window.localStorage.getItem('user');
    const localUsers = JSON.parse(log);

    const {
        control,
        register,
        reset,
        setError,
        formState: { errors },
        setValue,
        getValues,
        handleSubmit,
        watch
    } = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues,
        resolver: yupResolver(ProjectStatusValidation)
    });

    useEffect(() => {
        getProjectStatusDetail();
        getProjectStatusCategories();
        getProjectStatuses();
    }, []);

    const onSubmit = (data: any) => {
        const body = {
            porject_statuses_id: data?.project_status,
            project_status_category_id: data?.category,
            days_delayed: data?.days_delayed ? +data?.days_delayed : null,
            comment: data?.comments,
            project_id: props?.projectId,
            user_id: localUsers?.id
        };
        createonSubmit(body);

        reset();
    };

    const projectStatus = watch('project_status');
    // create admin data
    const createonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        createProjectStatusDetails(data)
            .then((res: any) => {
                dispatch(spinLoaderShow(false));
                getProjectStatusDetail();
                toast.success('Record inserted successfully');
                // navigate("/dashboard/default" )
            })
            .catch((err: any) => {
                console.log(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const getProjectStatusCategories = () => {
        dispatch(spinLoaderShow(true));
        getProjectStatusCategory()
            .then((res) => {
                setCategories(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                console.log(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const getProjectStatuses = () => {
        dispatch(spinLoaderShow(true));
        getProjectStatus()
            .then((res) => {
                setStatus(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                console.log(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const getProjectStatusDetail = () => {
        getProjectStatusDetails(props?.projectId)
            .then((res) => {
                setTableData(res);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <>
            <SubCard title="Project Status / Comments">
                <form>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={12} md={12} sm={12} sx={{ mt: 2, mb: 2 }}>
                            <ProjectStatusListing apiData={props?.apiData} tableData={tableData} refreshData={getProjectStatusDetail} />
                        </Grid>
                        <Grid item xs={6} md={12} sm={6}>
                            <AutoCompleteField
                                errors={!!errors?.project_status}
                                fieldName="project_status"
                                autoComplete="off"
                                label="Select Status *"
                                control={control}
                                setValue={setValue}
                                options={status}
                                returnObject={false}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.project_status && errors?.project_status?.message}
                            />
                        </Grid>
                        {projectStatus == '64e33c6b7e43103c1afd5255' && (
                            <Grid item xs={6} md={12} sm={6}>
                                <TextFieldControlled
                                    errors={!!errors?.days_delayed}
                                    fullWidth={true}
                                    fieldName="days_delayed"
                                    type="number"
                                    autoComplete="off"
                                    label="Number of days delayed"
                                    control={control}
                                    rows={1}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.days_delayed && errors?.comments?.message}
                                />
                            </Grid>
                        )}

                        <Grid item xs={6} md={12} sm={6}>
                            <AutoCompleteField
                                errors={!!errors?.category}
                                fieldName="category"
                                autoComplete="off"
                                label="Select Category *"
                                control={control}
                                setValue={setValue}
                                options={categories}
                                returnObject={false}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.category && errors?.category?.message}
                            />
                        </Grid>
                        <Grid item xs={12} md={12} sm={12} sx={{ mb: 3 }}>
                            <label style={{ fontWeight: 500, marginBottom: '8px', display: 'block' }}>
                                Write here the Status in Detail (Any Prerequistes (SMTP, Hosting, Content), Milestone Phase Status) *
                            </label>
                            <Box sx={{ '& .ck-editor__editable_inline': { minHeight: '300px' } }}>
                                <CKEditor
                                    editor={ClassicEditor as unknown as { create(...args: any): Promise<any> }}
                                    data={getValues('comments')}
                                    onChange={(_, editor) => {
                                        const data = editor.getData();
                                        setValue('comments', data, { shouldValidate: true });
                                    }}
                                    onBlur={() => {
                                        const data = getValues('comments');
                                        setValue('comments', data, { shouldValidate: true });
                                    }}
                                />
                                {typeof errors?.comments?.message === 'string' && (
                                    <p style={{ color: 'red', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.comments.message}</p>
                                )}
                            </Box>
                        </Grid>

                        <Grid container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
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
                </form>
            </SubCard>
        </>
    );
}

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { Controller } from 'react-hook-form';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Button, Grid, Stack, TextField } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AnimateButton from 'ui-component/extended/AnimateButton';
import SubCard from 'ui-component/cards/SubCard';
import { AutoCompleteField, TextFieldControlled } from 'ui-component/formsField/FormFields';
import { getDepartmentCategory } from 'services/categoryService';
import { getProjects } from 'services/projectService';
import { getTaskCategory, getTaskHours } from 'services/Allocation/taskServices';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { toast } from 'react-toastify';
import HoursDisplay from './HoursDisplay';
import TaskDetails from './TaskDetails';
import useAuth from 'hooks/useAuth';

interface ITaskDetailTab {
    hoursData: any;
    setHoursData: any;
    apiData: any;
    control: any;
    errors: any;
    setValue: any;
    register: any;
    taskCompletionDate: any;
    setTaskCompleteionDate: any;
    selectedDepartment: any;
    setSelectedDepartment: any;
    state: any;
    setState: any;
    handleSubmit: any;
    onSubmit: any;
    isEditMode: boolean;
}

const TaskDetailTab = ({
    hoursData,
    setHoursData,
    apiData,
    control,
    errors,
    setValue,
    register,
    taskCompletionDate,
    setTaskCompleteionDate,
    selectedDepartment,
    setSelectedDepartment,
    state,
    setState,
    handleSubmit,
    onSubmit,
    isEditMode
}: ITaskDetailTab) => {
    const dispatch = useDispatch();
    const [department, setDepartment] = useState([]);
    const [projects, setProjects] = useState([]);
    const [taskCategory, setTaskCategory] = useState([]);
    const [taskHoursData, setTaskHoursData] = useState<any>(null);

    const { user } = useAuth();

    useEffect(() => {
        getDepartmentData();
        getProjectData();
        getTaskCategoryData();
    }, []);

    useEffect(() => {
        if (apiData) {
            setValue('name', apiData?.name);
            setValue('attachment', apiData?.attachment);
            setValue('description', apiData?.description);
            setValue('attachment', apiData?.attachment);

            const formattedCompletionDate = moment(apiData?.completion_date)?.format('MM/DD/YYYY');
            setTaskCompleteionDate(formattedCompletionDate);

            setValue('completion_date', formattedCompletionDate);
            setSelectedDepartment(apiData?.department);

            setState({
                departmentId: apiData?.department ?? 0,
                projectId: apiData?.project?.id ?? 0
            });
        }
    }, [apiData, setValue, setSelectedDepartment, setState, setTaskCompleteionDate]);

    // get department data from Api
    const getDepartmentData = async () => {
        dispatch(spinLoaderShow(true));
        getDepartmentCategory()
            .then((res: any) => {
                setDepartment(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    // get Project data from Api
    const getProjectData = async () => {
        dispatch(spinLoaderShow(true));
        getProjects(user?.id)
            .then((res: any) => {
                setProjects(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    // get Task Category data from Api
    const getTaskCategoryData = async () => {
        dispatch(spinLoaderShow(true));
        getTaskCategory()
            .then((res: any) => {
                setTaskCategory(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const onChangeDepartment = (data: any) => {
        setState((prev: any) => ({
            ...prev,
            departmentId: data?.id
        }));

        if (data) {
            const newDepartment = [data];
            setSelectedDepartment(newDepartment);
            setHoursData({
                AdditionalHour: 0,
                UpsellHour: 0,
                SaleHour: 0,
                RemainingHour: 0,
                ConsumedHours: 0
            });
        } else {
            setSelectedDepartment([]);
            setHoursData({
                AdditionalHour: 0,
                UpsellHour: 0,
                SaleHour: 0,
                RemainingHour: 0,
                ConsumedHours: 0
            });
        }
    };

    const onChangeProject = (data: any) => {
        if (data) {
            setState((prev: any) => ({
                ...prev,
                projectId: data?.id
            }));
        } else {
            setHoursData({
                AdditionalHour: 0,
                UpsellHour: 0,
                SaleHour: 0,
                RemainingHour: 0,
                ConsumedHours: 0
            });
            setState((prev: any) => ({
                ...prev,
                projectId: ''
            }));
        }
    };

    const getTaskHoursData = async (department_id: string, project_id: string) => {
        if (department_id && project_id) {
            dispatch(spinLoaderShow(true));

            getTaskHours(department_id, project_id)
                .then((res: any) => {
                    setTaskHoursData(res);
                    dispatch(spinLoaderShow(false));
                })
                .catch((err) => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    useEffect(() => {
        if (state.departmentId && state.projectId) {
            getTaskHoursData(state.departmentId?.[0]?.id ?? state.departmentId, state.projectId);
        }
    }, [state.departmentId, state.projectId]);

    useEffect(() => {
        if (!taskHoursData) return;

        let saleHours = 0;
        let additionalHours = 0;
        let upsellHours = 0;

        taskHoursData?.projectHours?.forEach((item: any) => {
            const { name } = item?.project_category_hours || {};
            const { hours } = item || 0;

            if (name === 'Sale Hours') {
                saleHours += hours;
            } else if (name === 'Additional') {
                additionalHours += hours;
            } else if (name === 'Upsell') {
                upsellHours += hours;
            }
        });

        const totalProjectHours = saleHours + additionalHours + upsellHours;
        const consumedHours = taskHoursData.counsumedHours?.reduce((total: any, item: any) => {
            return total + (item?.consumed_hours || 0);
        }, 0);

        const remainingHours = totalProjectHours - consumedHours;

        setHoursData({
            AdditionalHour: additionalHours,
            SaleHour: saleHours,
            UpsellHour: upsellHours,
            RemainingHour: remainingHours,
            ConsumedHours: consumedHours
        });
    }, [taskHoursData, setHoursData]);

    return (
        <>
            {hoursData && <HoursDisplay hoursData={hoursData} />}
            <SubCard>
                {!apiData || isEditMode ? (
                    <>
                        <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                            <Grid item xs={3} md={6} sm={3}>
                                <AutoCompleteField
                                    errors={!!errors?.project_id}
                                    fieldName="project_id"
                                    autoComplete="off"
                                    label="Project/Brand *"
                                    control={control}
                                    setValue={setValue}
                                    options={projects}
                                    returnObject={false}
                                    // disabled={apiData ? true : false}
                                    isLoading={true}
                                    optionKey="id"
                                    optionValue="name"
                                    iProps={{
                                        onChange: onChangeProject,
                                        // disabled: apiData ? true : false
                                    }}
                                    helperText={errors?.project_id && errors?.project_id?.message}
                                    valueGot={
                                        apiData &&
                                        projects?.find(({ id }) => {
                                            return id == state.projectId;
                                        })
                                    }
                                />
                            </Grid>
                            <Grid item xs={3} md={6} sm={3}>
                                <AutoCompleteField
                                    errors={!!errors?.task_category_id}
                                    fieldName="task_category_id"
                                    autoComplete="off"
                                    label="Task Category *"
                                    control={control}
                                    setValue={setValue}
                                    options={taskCategory}
                                    returnObject={false}
                                    isLoading={true}
                                    optionKey="id"
                                    optionValue="name"
                                    helperText={errors?.task_category_id && errors?.task_category_id?.message}
                                    valueGot={
                                        apiData &&
                                        taskCategory?.find(({ id }) => {
                                            return id == apiData?.task_category?.id;
                                        })
                                    }
                                />
                            </Grid>
                            <Grid item xs={6} md={6} sm={6}>
                                <TextFieldControlled
                                    errors={!!errors?.name}
                                    fullWidth={true}
                                    fieldName="name"
                                    type="text"
                                    autoComplete="off"
                                    label="Task Name *"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.name && errors?.name?.message}
                                />
                            </Grid>

                            <Grid item xs={6} md={6} sm={6}>
                                <AutoCompleteField
                                    errors={!!errors?.department}
                                    fieldName="department"
                                    autoComplete="off"
                                    label="Departments *"
                                    control={control}
                                    setValue={setValue}
                                    iProps={{
                                        onChange: onChangeDepartment,
                                        disabled: apiData ? true : false
                                    }}
                                    options={department}
                                    returnObject={false}
                                    isLoading={true}
                                    optionKey="id"
                                    optionValue="name"
                                    helperText={errors?.department && errors?.department?.message}
                                    disabled={apiData ? true : false}
                                    valueGot={
                                        apiData &&
                                        Array.isArray(department) &&
                                        department.find(({ id }) => {
                                            const apiId = Array.isArray(apiData?.department)
                                                ? apiData?.department?.[0]?.id
                                                : apiData?.department;
                                            return id == apiId;
                                        })
                                    }
                                />
                            </Grid>

                            <Grid item xs={3} md={6} sm={3} sx={{ mt: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        renderInput={(props) => (
                                            <TextField
                                                fullWidth
                                                {...props}
                                                helperText=""
                                                {...register('completion_date', { required: true })}
                                            />
                                        )}
                                        label="Task Completion Date"
                                        value={taskCompletionDate}
                                        onChange={(newValue) => {
                                            setTaskCompleteionDate(newValue);
                                            setValue('completion_date', newValue);
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item xs={6} md={6} sm={6}>
                                <TextFieldControlled
                                    errors={!!errors?.attachment}
                                    fullWidth={true}
                                    fieldName="attachment"
                                    type="text"
                                    autoComplete="off"
                                    label="Attachments (Add here dropbox URL) *"
                                    control={control}
                                    valueGot={''}
                                    setValue={setValue}
                                    helperText={errors?.attachment && errors?.attachment?.message}
                                />
                            </Grid>

                            <Grid item xs={12} md={12} sm={12}>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="custom-editor">
                                            <CKEditor
                                                editor={ClassicEditor as unknown as { create(...args: any): Promise<any> }}
                                                data={field.value}
                                                onChange={(event, editor) => {
                                                    const data = editor.getData();
                                                    field.onChange(data);
                                                    setValue('description', data);
                                                }}
                                                onBlur={(event, editor) => {
                                                    field.onBlur();
                                                }}
                                            />
                                        </div>
                                    )}
                                />
                                {errors?.description && <span style={{ color: 'red' }}>{errors.description.message}</span>}
                            </Grid>

                            {(!apiData || isEditMode) && (
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
                                                    // disabled={apiData ? true : false}
                                                >
                                                    save
                                                </Button>
                                            </AnimateButton>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            )}
                        </Grid>
                    </>
                ) : (
                    <TaskDetails apiData={apiData} control={control} errors={errors} setValue={setValue} departments={department} />
                )}
            </SubCard>
        </>
    );
};

export default TaskDetailTab;

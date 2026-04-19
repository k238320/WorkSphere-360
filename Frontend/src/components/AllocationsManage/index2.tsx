/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/*eslint-Disable */
/**
 *
 * ProjectManage
 *
 */
import { SetStateAction, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import {
    Button,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Box,
    Tab,
    Tabs
} from '@mui/material';

// assets
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import { AutoCompleteField, AutoCompleteMultipleField, TextFieldControlled } from 'ui-component/formsField/FormFields';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { toast } from 'react-toastify';
import { getDepartmentCategory } from 'services/categoryService';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { useDispatch } from 'react-redux';
import {
    getComments,
    getTaskById,
    getTaskCategory,
    getTaskHours,
    postComments,
    postTask,
    updateTask
} from 'services/Allocation/taskServices';
import { getProjects } from 'services/projectService';
import { yupResolver } from '@hookform/resolvers/yup';
import { createTaskValidation } from './Validation';
import useAuth from 'hooks/useAuth';
import moment from 'moment';
import ResourceManage from './ResourceManage';
import MainCard from 'ui-component/cards/MainCard';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './style.css';

function CustomTabPanel(props: { [x: string]: any; children: any; value: any; index: any }) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && (
                <Box sx={{ py: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired
};

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`
    };
}

export function AllocationManage(props: any) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [department, setDepartment] = useState<any>([]);
    const [projects, setProjects] = useState<any>([]);
    const [taskCategory, setTaskCategory] = useState<any>([]);
    const [status, setStatus] = useState<any>([]);
    const [taskCompletionDate, setTaskCompleteionDate] = useState<any>(null);

    const [remainingHoursCheck, setRemainingHoursCheck] = useState<any>(true);
    const [apiData, setApiData] = useState<any>(null);

    const [selectedDepartment, setSelectedDepartment] = useState<any>([]);
    const [messages, setMessages] = useState<any>([]);
    const [newMessage, setNewMessage] = useState<any>('');
    const [taskHoursData, setTaskHoursData] = useState<any>(null);
    const [state, setState] = useState({
        projectId: '',
        departmentId: ''
    });
    const [hoursData, setHoursData] = useState({
        UpsellHour: 0,
        SaleHour: 0,
        AdditionalHour: 0,
        RemainingHour: 0,
        ConsumedHours: 0
    });

    const localStorageData: any = localStorage.getItem('user');
    const localStorageuser: any = JSON.parse(localStorageData);

    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');

    const [valuetab, setValueTab] = useState(0);

    const handleChange = (event: any, newValue: SetStateAction<number>) => {
        setValueTab(newValue);
    };

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
    }: any = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        //Validations=================>
        defaultValues: defautlFormValues,
        resolver: yupResolver(createTaskValidation)
    });

    //Useffect for get apis data ============>
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
                departmentId: apiData?.department[0]?.id ?? 0,
                projectId: apiData?.project?.id ?? 0
            });
        }
    }, [apiData]);

    const getTaskDataById = async () => {
        dispatch(spinLoaderShow(true));
        getTaskById(uuid)
            .then((res: any) => {
                setApiData(res);
                // getDepartmentWiseData(res?.department?.id);
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    //Useffect for get all apis data ============>
    useEffect(() => {
        getDepartmentData();
        getProjectData();
        getTaskCategoryData();
    }, []);

    useEffect(() => {
        if (uuid) {
            getTaskComments();
            getTaskDataById();
        } else {
            reset();
            setTaskCompleteionDate(null);
            setSelectedDepartment([]);
            setRemainingHoursCheck(true);
            setApiData(null);
            setHoursData({
                AdditionalHour: 0,
                UpsellHour: 0,
                SaleHour: 0,
                RemainingHour: 0,
                ConsumedHours: 0
            });
            setState({
                departmentId: '',
                projectId: ''
            });
            // setTaskHoursData(null);
        }
    }, [uuid]);

    // get departmen data from Api =================>
    const getDepartmentData = async () => {
        dispatch(spinLoaderShow(true));
        getDepartmentCategory()
            .then((res: any) => {
                setDepartment(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    // get Project data from Api =================>
    const getProjectData = async () => {
        dispatch(spinLoaderShow(true));
        getProjects(user?.id)
            .then((res: any) => {
                setProjects(res);
                // console.log('res', res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    // get Task Category data from Api =================>
    const getTaskCategoryData = async () => {
        dispatch(spinLoaderShow(true));
        getTaskCategory()
            .then((res: any) => {
                setTaskCategory(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    // ================================|| Onsubmit ||================================ //
    // create onsubmit data
    const createonSubmit = (data: any) => {
        if (selectedDepartment?.length == 0) {
            toast.error('At least select one department');
            return;
        }

        data.department = selectedDepartment;

        dispatch(spinLoaderShow(true));
        postTask(data)
            .then((res: any) => {
                toast.success('Record inserted Successfully');
                dispatch(spinLoaderShow(false));
                navigate('/allocation/listing');
            })
            .catch((err) => {
                dispatch(spinLoaderShow(false));
                toast.error(err);
            });
    };

    const onChangeDepartment = (data: any) => {
        setState((prev) => ({
            ...prev,
            departmentId: data?.id
        }));

        if (data) {
            let newDepartment = [data];
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
            setState((prev) => ({
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
            setState((prev) => ({
                ...prev,
                projectId: data?.id
            }));
        }
    };

    // update admin data
    const updateonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        updateTask(data)
            .then((res: any) => {
                dispatch(spinLoaderShow(false));
                toast.success('Record updated Successfully');
                // navigator('/dashboard/admin/listing' );
            })
            .catch((err: any) => {
                dispatch(spinLoaderShow(false));
            });
    };

    const onSubmit = (data: any) => {
        if (apiData) {
            data.id = apiData?.id;
            updateonSubmit(data);
        } else {
            createonSubmit(data);
        }
    };

    const getTaskComments = async () => {
        dispatch(spinLoaderShow(true));
        const allcoms = await getComments(uuid)
            .then((res: any) => {
                if (res?.comments?.length > 0) {
                    setMessages(res?.comments);
                }
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const handleInputChange = (event: any) => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = async () => {
        if (newMessage?.trim() !== '') {
            const data = {
                resource_id: localStorageuser?.resource_id,
                name: localStorageuser?.name ?? '',
                message: newMessage.trim(),
                created_at: new Date(),
                role: localStorageuser?.role?.name ?? ''
            };

            let clone: any[] = JSON.parse(JSON.stringify(messages));

            clone?.push(data);

            dispatch(spinLoaderShow(true));

            postComments(uuid, clone)
                .then(async (res: any) => {
                    await getTaskComments();
                    dispatch(spinLoaderShow(false));
                    setNewMessage('');
                })
                .catch((err: any) => {
                    toast.error(err);
                    dispatch(spinLoaderShow(false));
                });
        } else {
            toast.error('Kindly enter comment');
        }
    };

    const getTaskHoursData = async (department_id: any, project_id: string) => {
        if (department_id && project_id) {
            dispatch(spinLoaderShow(true));

            getTaskHours(department_id, project_id)
                .then((res: any) => {
                    setTaskHoursData(res);
                    dispatch(spinLoaderShow(false));
                })
                .catch((err: any) => {
                    // toast.error(err);
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    useEffect(() => {
        if (state.departmentId && state.projectId) {
            getTaskHoursData(state.departmentId, state.projectId);
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
    }, [taskHoursData]);

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={valuetab} onChange={handleChange} aria-label="basic tabs example">
                            {/* <Tab label="Item One" {...a11yProps(0)} /> */}
                            <Tab label="Task detail" {...a11yProps(0)} />
                            {/* {uuid && ( */}

                            <Tab label="Comment" {...a11yProps(1)} />
                            <Tab label="allocation" {...a11yProps(2)} />

                            {/* )} */}
                        </Tabs>
                    </Box>
                    <CustomTabPanel value={valuetab} index={0}>
                        {hoursData && (
                            <Grid item xs={12} md={12} sm={12} sx={{ mt: 2, mb: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={2} md={2} sm={2}></Grid>
                                    <Grid item xs={4} md={2} sm={4}>
                                        <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                                            Total Hours
                                        </Typography>
                                        <h1 style={{ textAlign: 'center' }}>
                                            <span>{hoursData?.SaleHour}</span>
                                            <span style={{ color: 'red', fontSize: '23px' }}>{` +${hoursData?.AdditionalHour} `}</span>
                                            <span style={{ color: 'blue', fontSize: '23px' }}>{` +${hoursData.UpsellHour} `}</span>
                                        </h1>
                                    </Grid>
                                    <Grid item xs={3} md={3} sm={3}>
                                        <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: '#4BB543' }}>
                                            Remaining Hours
                                        </Typography>
                                        <h1 style={{ textAlign: 'center', color: '#4BB543' }}>
                                            {hoursData?.RemainingHour ? hoursData?.RemainingHour : '0'}
                                        </h1>
                                    </Grid>
                                    <Grid item xs={1.5} md={1.5} sm={1.5}>
                                        <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'red' }}>
                                            Consumed Hours
                                        </Typography>
                                        <h1 style={{ textAlign: 'center', color: 'red' }}>
                                            {hoursData?.ConsumedHours ? hoursData?.ConsumedHours : '0'}
                                        </h1>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}
                        {/* Item One */}
                        <SubCard>
                            {!apiData ? (
                                <>
                                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                        <Grid item xs={3} md={6} sm={3}>
                                            <AutoCompleteField
                                                errors={!!errors?.project_id}
                                                fieldName="project_id"
                                                autoComplete="off"
                                                label="Projects *"
                                                control={control}
                                                setValue={setValue}
                                                options={projects}
                                                returnObject={false}
                                                disabled={apiData ? true : false}
                                                isLoading={true}
                                                optionKey="id"
                                                optionValue="name"
                                                iProps={{
                                                    onChange: onChangeProject,
                                                    disabled: apiData ? true : false
                                                }}
                                                helperText={errors?.project_id && errors?.project_id?.message}
                                                valueGot={
                                                    apiData &&
                                                    projects?.find(({ id }: any) => {
                                                        return id == apiData?.project?.id;
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
                                                disabled={apiData ? true : false}
                                                isLoading={true}
                                                optionKey="id"
                                                optionValue="name"
                                                helperText={errors?.task_category_id && errors?.task_category_id?.message}
                                                valueGot={
                                                    apiData &&
                                                    taskCategory?.find(({ id }: any) => {
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
                                                disabled={apiData ? true : false}
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
                                                valueGot={selectedDepartment?.length > 0 ? selectedDepartment[0] : undefined}
                                            />
                                        </Grid>

                                        <Grid item xs={3} md={6} sm={3} sx={{ mt: 2 }}>
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <DatePicker
                                                    renderInput={(props: any) => (
                                                        <TextField
                                                            fullWidth
                                                            {...props}
                                                            helperText=""
                                                            {...register('completion_date', { required: true })}
                                                        />
                                                    )}
                                                    label="Task Completion Date"
                                                    value={taskCompletionDate}
                                                    onChange={(newValue: Date | null) => {
                                                        setTaskCompleteionDate(newValue);
                                                        setValue('completion_date', newValue);
                                                    }}
                                                    disabled={apiData ? true : false}
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
                                                disabled={apiData ? true : false}
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
                                                            disabled={apiData ? true : false}
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

                                        {!apiData && (
                                            <Grid
                                                sx={{ mb: 3 }}
                                                container
                                                spacing={3}
                                                direction="row"
                                                justifyContent="flex-end"
                                                alignItems="center"
                                            >
                                                <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                                    <Stack direction="row">
                                                        <AnimateButton>
                                                            <Button
                                                                variant="contained"
                                                                type="submit"
                                                                sx={{ m: 3 }}
                                                                className={'red'}
                                                                onClick={handleSubmit(onSubmit)}
                                                                // disabled={remainingHoursCheck}
                                                                disabled={apiData ? true : false}
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
                                <div className="tasks__list__wrapper">
                                    <div className="task__detail">
                                        <p>Project</p>
                                        <span>{apiData?.project?.name}</span>
                                    </div>
                                    <div className="task__detail">
                                        <p>Category</p>
                                        <span>{apiData?.task_category?.name}</span>
                                    </div>
                                    <div className="task__detail">
                                        <p>Task Name</p>
                                        <span>{apiData?.name}</span>
                                    </div>
                                    <div className="task__detail">
                                        <p>Departments</p>
                                        <ul>
                                            {/* {apiData?.department?.map((dep: any, index: number) => {
                                                return <li key={index}>{dep.name}</li>;
                                            })} */}
                                            <li>{apiData?.department?.length > 0 ? apiData?.department[0]?.name : '-'}</li>
                                        </ul>
                                    </div>
                                    <div className="task__detail">
                                        <p>Task Completion Date</p>
                                        <span>{moment(apiData?.completion_date).format('Do MMM, YYYY')}</span>
                                    </div>
                                    <div className="task__detail">
                                        <p>Attachment</p>
                                        <a href={apiData?.attachment} target="_blank">
                                            {apiData?.attachment}
                                        </a>
                                    </div>

                                    <div className="task__detail">
                                        <p>Description</p>
                                        {/* <span>{apiData?.description}</span> */}

                                        <Controller
                                            name="description"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="custom-editor">
                                                    <CKEditor
                                                        editor={ClassicEditor as unknown as { create(...args: any): Promise<any> }}
                                                        data={apiData?.description}
                                                        disabled={true}
                                                        onChange={(event: any, editor: any) => {
                                                            const data = editor.getData();
                                                            field.onChange(data);
                                                            setValue('description', data);
                                                        }}
                                                        onBlur={(event: any, editor: any) => {
                                                            field.onBlur();
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        />
                                        {errors?.description && <span style={{ color: 'red' }}>{errors.description.message}</span>}
                                    </div>
                                </div>
                            )}
                        </SubCard>
                    </CustomTabPanel>
                    {uuid && (
                        <CustomTabPanel value={valuetab} index={1}>
                            <SubCard sx={{ marginTop: '20px' }}>
                                <Grid item xs={12} md={12} sm={12}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={12}>
                                            <MainCard content={false}>
                                                <TableContainer>
                                                    <Table sx={{ minWidth: 350 }} aria-label="simple table">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell
                                                                    sx={{
                                                                        pl: 3,
                                                                        width: '20%',
                                                                        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                                                                    }}
                                                                    size="medium"
                                                                >
                                                                    <Typography fontWeight={'700'} fontSize={'16px'}>
                                                                        Date
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell
                                                                    size="medium"
                                                                    sx={{ width: '50%', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}
                                                                >
                                                                    <Typography fontWeight={'700'} fontSize={'16px'}>
                                                                        Comment
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell
                                                                    size="medium"
                                                                    sx={{ width: '15%', borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}
                                                                >
                                                                    <Typography fontWeight={'700'} fontSize={'16px'}>
                                                                        Commentor
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell size="medium" sx={{ width: '15%' }}>
                                                                    <Typography fontWeight={'700'} fontSize={'16px'}>
                                                                        Role
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {messages &&
                                                                messages?.map((row: any, index: any) => (
                                                                    <TableRow hover key={index}>
                                                                        {/* <TableCell sx={{ pl: 3 }}>{moment(row?.created_at).format('l')}</TableCell> */}
                                                                        <TableCell
                                                                            sx={{ pl: 3, borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}
                                                                            size="medium"
                                                                        >
                                                                            <div className="tasks__date__wrapper">
                                                                                <span>
                                                                                    {moment(row?.created_at).format('Do MMM, YYYY')}
                                                                                </span>
                                                                                <span>{moment(row?.created_at).format('LT')}</span>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell
                                                                            size="medium"
                                                                            sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}
                                                                        >
                                                                            <Typography fontSize={'16px'}>{row?.message}</Typography>
                                                                        </TableCell>
                                                                        <TableCell
                                                                            size="medium"
                                                                            sx={{ borderRight: '1px solid rgba(0, 0, 0, 0.1)' }}
                                                                        >
                                                                            {row?.name}
                                                                        </TableCell>
                                                                        <TableCell size="medium">{row?.role}</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </MainCard>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} md={12} sm={12} sx={{ mt: '24px' }}>
                                        <TextField
                                            placeholder="Enter Comment..."
                                            multiline={true}
                                            rows={2}
                                            value={newMessage}
                                            onChange={(e) => handleInputChange(e)}
                                            style={{ width: '100%', minHeight: '100px' }}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={() => handleSendMessage()}
                                            sx={{ float: 'right', marginBottom: '24px' }}
                                        >
                                            Add
                                        </Button>
                                    </Grid>
                                </Grid>
                            </SubCard>
                        </CustomTabPanel>
                    )}
                    {uuid && (
                        <CustomTabPanel value={valuetab} index={2}>
                            {/* {user?.role?.name !== 'Super Admin' && ( */}
                            <SubCard sx={{ marginTop: '20px' }}>
                                <ResourceManage projectId={apiData?.project?.id} task_id={uuid} departments={apiData?.department} />
                            </SubCard>
                            {/* )} */}
                        </CustomTabPanel>
                    )}
                </Box>
            </form>
        </>
    );
}

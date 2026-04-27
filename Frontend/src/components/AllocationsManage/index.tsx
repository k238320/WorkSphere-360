import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { createTaskValidation } from './Validation';
import { getTaskById, postTask, updateTask } from 'services/Allocation/taskServices';
import { toast } from 'react-toastify';
import './style.css';
import { yupResolver } from '@hookform/resolvers/yup';
import CustomTabPanel from './components/CustomTabPanel';
import TaskDetailTab from './components/TaskDetailTab';
import CommentsTab from './components/CommentsTab';
import SubCard from 'ui-component/cards/SubCard';
import ResourceManage from './ResourceManage';

function a11yProps(index: any) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`
    };
}

export function AllocationManage(props: any) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { search } = useLocation();
    const uuid = new URLSearchParams(search).get('uuid');
    const isEditMode = new URLSearchParams(search).get('edit') === 'true';

    const [valuetab, setValueTab] = useState(0);
    const [apiData, setApiData] = useState<any>(null);
    const [selectedDepartment, setSelectedDepartment] = useState([]);
    const [taskCompletionDate, setTaskCompleteionDate] = useState(null);
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

    const defaultFormValues = {
        status: true
    };

    const {
        control,
        register,
        reset,
        formState: { errors },
        setValue,
        handleSubmit
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultFormValues,
        resolver: yupResolver(createTaskValidation)
    });

    const handleChange = (event: any, newValue: any) => {
        setValueTab(newValue);
    };

    const getTaskDataById = async () => {
        dispatch(spinLoaderShow(true));
        getTaskById(uuid)
            .then((res: any) => {
                setApiData(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    // create onsubmit data
    const createonSubmit = (data: any) => {
        if (selectedDepartment?.length === 0) {
            toast.error('At least select one department');
            return;
        }

        data.department = selectedDepartment;

        dispatch(spinLoaderShow(true));
        postTask(data)
            .then((res) => {
                toast.success('Record inserted Successfully');
                dispatch(spinLoaderShow(false));
                navigate('/allocation/listing');
            })
            .catch((err) => {
                dispatch(spinLoaderShow(false));
                toast.error(err);
            });
    };

    // update admin data
    const updateonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        updateTask(data)
            .then((res) => {
                dispatch(spinLoaderShow(false));
                toast.success('Record updated Successfully');
            })
            .catch((err) => {
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

    useEffect(() => {
        if (uuid) {
            getTaskDataById();
        } else {
            reset();
            setTaskCompleteionDate(null);
            setSelectedDepartment([]);
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

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={valuetab} onChange={handleChange} aria-label="basic tabs example">
                            <Tab label="Task detail" {...a11yProps(0)} />
                            {/* <Tab label="Comment" {...a11yProps(1)} />
                            <Tab label="allocation" {...a11yProps(2)} /> */}
                        </Tabs>
                    </Box>
                    <CustomTabPanel value={valuetab} index={0}>
                        <TaskDetailTab
                            hoursData={hoursData}
                            setHoursData={setHoursData}
                            apiData={apiData}
                            control={control}
                            errors={errors}
                            setValue={setValue}
                            register={register}
                            taskCompletionDate={taskCompletionDate}
                            setTaskCompleteionDate={setTaskCompleteionDate}
                            selectedDepartment={selectedDepartment}
                            setSelectedDepartment={setSelectedDepartment}
                            state={state}
                            setState={setState}
                            handleSubmit={handleSubmit}
                            onSubmit={onSubmit}
                            isEditMode={isEditMode}
                        />
                    </CustomTabPanel>
                    {uuid && (
                        <CustomTabPanel value={valuetab} index={1}>
                            <CommentsTab taskId={uuid} />
                        </CustomTabPanel>
                    )}
                    {uuid && (
                        <CustomTabPanel value={valuetab} index={2}>
                            <SubCard sx={{ marginTop: '20px' }}>
                                <ResourceManage projectId={apiData?.project?.id} task_id={uuid} departments={apiData?.department} />
                            </SubCard>
                        </CustomTabPanel>
                    )}
                </Box>
            </form>
        </>
    );
}

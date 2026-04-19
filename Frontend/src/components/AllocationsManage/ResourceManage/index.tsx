import { Button, Checkbox, Grid, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { AutoCompleteField, TextFieldControlled } from 'ui-component/formsField/FormFields';
import { createAllocationValidation } from './Validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { getTaskHours } from 'services/Allocation/taskServices';
import { toast } from 'react-toastify';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { createAllocation, getAllocations, getDepartmentWise, getPmAllocations, getResourceByID } from 'services/resource';
import ResourceListing from './ResourceLisitng/index';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

const ResourceManage = ({ projectId, task_id, departments }: { projectId: any; task_id: any; departments?: any }) => {
    const idsAsString = Array.isArray(departments) ? departments.map((obj: any) => obj?.id).join(',') : '';

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
        resolver: yupResolver(createAllocationValidation)
    });

    const [resource, setResource] = useState<any>([]);
    const [startTime, setStartTime] = useState<any>(null);
    const [endTime, setEndTime] = useState<any>(null);
    const [resourceById, setResourceById] = useState<any>({});
    const [taskHoursData, setTaskHoursData] = useState<any>(null);
    const [hoursData, setHoursData] = useState<any>(null);
    const [remainingHoursCheck, setRemainingHoursCheck] = useState<any>(true);
    const [allocationData, setAllocationData] = useState<any>([]);
    const [showApiMessage, setShowApiMessage] = useState<string>('');
    const [OpenshowOnholdReason, setOpenshowOnholdReason] = useState<boolean>(false);

    const [reason, setReason] = useState<string>('');
    const [open, setOpen] = useState<boolean>(false);
    const [overtime, setoverTime] = useState<boolean>(false);

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4
    };

    const handleReasonChange = (event: any) => {
        setReason(event.target.value);
    };

    const updateOverTime = () => {
        setoverTime(!overtime);
        setOpen(true);
    };

    const cancelModal = () => {
        setOpen(false);
        setoverTime(false);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const showModal = (message: string) => {
        setOpenshowOnholdReason(true);
        setShowApiMessage(message);
    };
    const closeShowOnholdReasonModal = () => {
        setShowApiMessage('');
        setOpenshowOnholdReason(false);
    };

    const dispatch = useDispatch();

    const localStorageData: any = localStorage.getItem('user');

    const user: any = JSON.parse(localStorageData);

    // const resourceId = '64dc69522362ac2a3995386e';

    const getAllocationsData = (task_id: any, department_id: any) => {
        dispatch(spinLoaderShow(true));
        if (user?.role?.name == 'Project Manager' || user?.role?.name == 'Super Admin') {
            getPmAllocations(task_id, idsAsString)
                .then((res: any) => {
                    setAllocationData(res);
                })
                .catch((error) => {
                    toast.error(error?.message ?? error);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        } else {
            getAllocations(task_id, department_id)
                .then((res: any) => {
                    setAllocationData(res);
                })
                .catch((error) => {
                    toast.error(error?.message ?? error);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    const getResourcetData = async () => {
        if (user?.role?.name != 'Super Admin') {
            dispatch(spinLoaderShow(true));
            getResourceByID(user?.resource_id)
                .then((res: any) => {
                    setResourceById(res);
                    getTaskHoursData(res?.department_id);
                    dispatch(spinLoaderShow(false));
                })
                .catch((err: any) => {
                    toast.error(err);
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    const getTaskHoursData = async (department_id: any) => {
        dispatch(spinLoaderShow(true));

        getTaskHours(department_id, projectId)
            .then((res: any) => {
                setTaskHoursData(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                // toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const getDepartmentWiseData = async () => {
        dispatch(spinLoaderShow(true));
        getDepartmentWise()
            .then((res) => {
                setResource(res);
            })
            .catch((err) => {
                console.log('err', err);
                setResource([]);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const getRemainingHoursData = async (data: any) => {
        const record = data?.target?.value;

        // if (apiData?.task_hours) {
        //     let hours = record - apiData?.task_hours;

        //     if (hours > remainingHours) {
        //         toast.error('Remaining hours is not enough please provide correct data');
        //         setRemainingHoursCheck(true);
        //     } else {
        //         setRemainingHoursCheck(false);
        //     }
        // } else {
        //     if (record > remainingHours) {
        //         toast.error('Remaining hours is not enough please provide correct data');
        //         setRemainingHoursCheck(true);
        //     } else {
        //         setRemainingHoursCheck(false);
        //     }
        // }

        if (record > remainingHours) {
            toast.error('Remaining hours is not enough please provide correct data');
            setRemainingHoursCheck(true);
        } else {
            setRemainingHoursCheck(false);
        }

        // setProjectData(data);
    };

    const onSubmit = (data: any) => {
        setOpen(false);
        data.department_id = resourceById?.department_id;
        data.project_id = projectId;
        data.task_id = task_id;
        data.overtime_reason = reason;
        data.is_overtime = overtime;

        dispatch(spinLoaderShow(true));

        createAllocation(data)
            .then((res: any) => {
                toast.success('Allocation has been assigned!');
                reset();
                setStartTime(null);
                setEndTime(null);
                setoverTime(false);
                getResourcetData();
                getAllocationsData(task_id, resourceById?.department_id);
            })
            .catch((error: any) => {
                showModal(error?.response?.data?.message);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    useEffect(() => {
        if (user?.role?.name == 'Team Lead' || user?.role?.name == 'Associate Creative Director') {
            getDepartmentWiseData();
        }
    }, []);

    useEffect(() => {
        if (projectId) {
            getResourcetData();
        }
    }, [projectId]);

    useEffect(() => {
        if (resourceById?.department_id) {
            getAllocationsData(task_id, resourceById?.department_id);
        }
        if (user?.role?.name == 'Super Admin') {
            getAllocationsData(task_id, idsAsString);
        }
    }, [task_id, resourceById?.department_id]);

    // console.log('user', user);

    // getResourceByID

    // console.log('taskHoursData', taskHoursData);

    useEffect(() => {
        let Hours = 0;
        let temp = taskHoursData?.projectHours?.map((item: any, index: any) => {
            if (item?.project_category_hours?.name == 'Sale Hours') {
                Hours += item?.hours;
            }
        });
        setHoursData(Hours);
    }, [taskHoursData?.projectHours]);

    let UpsellHour = 0;
    let additionalHour = 0;
    const test = taskHoursData?.projectHours?.filter((x: any) => x.project_category_hours?.name == 'Additional');
    let additionalHours = test?.map((item: any, index: any) => {
        additionalHour += item?.hours;
    });

    const test1 = taskHoursData?.projectHours?.filter((x: any) => x.project_category_hours?.name == 'Upsell');
    let UpsellHours = test1?.map((item: any, index: any) => {
        return (UpsellHour += item?.hours);
    });

    const temp = hoursData + additionalHour + UpsellHour;
    const te = taskHoursData?.counsumedHours.map((e: any) => {
        return e?.consumed_hours;
    });

    const remainingHours = temp - te;

    return (
        <>
            {(user?.role?.name == 'Resource' || user?.role?.name == 'Team Lead') && (
                <Grid item xs={12} md={12} sm={12} sx={{ mt: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={3} md={3} sm={3}></Grid>
                        <Grid item xs={4} md={2} sm={4}>
                            <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                                Total Hours
                            </Typography>
                            <h1 style={{ textAlign: 'center' }}>
                                <span>{hoursData}</span>
                                <span style={{ color: 'red', fontSize: '23px' }}>{` +${additionalHour} `}</span>
                                <span style={{ color: 'blue', fontSize: '23px' }}>{` +${UpsellHour} `}</span>
                            </h1>
                        </Grid>
                        <Grid item xs={3} md={3} sm={3}>
                            <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: '#4BB543' }}>
                                Remaining Hours
                            </Typography>
                            <h1 style={{ textAlign: 'center', color: '#4BB543' }}>{remainingHours ? remainingHours : '0'}</h1>
                        </Grid>
                        <Grid item xs={3} md={3} sm={3}></Grid>
                    </Grid>
                </Grid>
            )}

            {user?.role?.name != 'Super Admin' && (
                <ResourceListing
                    task_id={task_id}
                    tableData={allocationData}
                    userdata={user}
                    refreshData={() => getAllocationsData(task_id, resourceById?.department_id)}
                    getTaskHoursData={() => getTaskHoursData(resourceById?.department_id)}
                />
            )}

            {user?.role?.name == 'Super Admin' && (
                <ResourceListing
                    task_id={task_id}
                    tableData={allocationData}
                    userdata={user}
                    refreshData={() => getAllocationsData(task_id, idsAsString)}
                    getTaskHoursData={() => getTaskHoursData(idsAsString)}
                />
            )}

            {user?.role?.name != 'Resource' && user?.role?.name != 'Project Manager' && user?.role?.name != 'Super Admin' && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={3} md={3} sm={3}>
                            <AutoCompleteField
                                errors={!!errors?.resource_id}
                                fieldName="resource_id"
                                autoComplete="off"
                                label="Resource Name *"
                                control={control}
                                setValue={setValue}
                                options={resource}
                                returnObject={false}
                                // iProps={{
                                //     onChange: getSpecialitiesByCategory,
                                //     disabled: apiData
                                // }}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.resource_id && errors?.resource_id?.message}
                                // valueGot={
                                //     apiData &&
                                //     resource?.find(({ id }: any) => {
                                //         return id == apiData?.resource?.id;
                                //     })
                                // }
                            />
                        </Grid>

                        <Grid item xs={2} md={2} sm={2}>
                            <TextFieldControlled
                                errors={!!errors?.task_hours}
                                fullWidth={true}
                                fieldName="task_hours"
                                type="text"
                                autoComplete="off"
                                label="Add Task Hours *"
                                control={control}
                                valueGot={''}
                                iProps={{
                                    onChange: getRemainingHoursData
                                    // disabled: apiData
                                }}
                                disabled={remainingHours == 0}
                                setValue={setValue}
                                helperText={errors?.task_hours && errors?.task_hours?.message}
                            />
                        </Grid>

                        <Grid item xs={3} md={3} sm={3} sx={{ mt: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    renderInput={(props: any) => (
                                        <TextField fullWidth {...props} helperText="" {...register('start_date', { required: true })} />
                                    )}
                                    label="Start Date"
                                    value={startTime}
                                    onChange={(newValue: Date | null) => {
                                        const dateObject = new Date(newValue ?? '');
                                        const localISOString = dateObject
                                            .toLocaleString('en-US', { timeZone: 'Asia/Karachi' })
                                            .slice(0, -3);
                                        setStartTime(localISOString);
                                        setValue('start_date', localISOString);
                                    }}
                                    // disabled={apiData ? true : false}
                                />
                            </LocalizationProvider>
                            <span style={{ color: 'red' }}>{errors?.start_date && errors?.start_date.message}</span>
                        </Grid>
                        <Grid item xs={3} md={3} sm={3} sx={{ mt: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    renderInput={(props: any) => (
                                        <TextField fullWidth {...props} helperText="" {...register('end_date', { required: true })} />
                                    )}
                                    label="End Date"
                                    value={endTime}
                                    onChange={(newValue: Date | null) => {
                                        const dateObject = new Date(newValue ?? '');
                                        const localISOString = dateObject
                                            .toLocaleString('en-US', { timeZone: 'Asia/Karachi' })
                                            .slice(0, -3);
                                        setEndTime(localISOString);
                                        setValue('end_date', localISOString);
                                    }}
                                    // disabled={apiData ? true : false}
                                />
                            </LocalizationProvider>
                            <span style={{ color: 'red' }}>{errors?.end_date && errors?.end_date.message}</span>
                        </Grid>
                        <Grid item xs={1} md={1} sm={1} sx={{ mt: 0.75 }}>
                            <label htmlFor="" style={{ color: '#697586', fontSize: '12px' }}>
                                OverTime
                            </label>
                            <Checkbox onChange={() => updateOverTime()} checked={overtime} />
                        </Grid>
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
                                        disabled={remainingHoursCheck}
                                        // disabled={apiData ? true : false}
                                    >
                                        Add
                                    </Button>
                                </AnimateButton>
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            )}
            {showApiMessage.length > 0 && (
                <div>
                    <Modal open={OpenshowOnholdReason} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                        <Box sx={style}>
                            <Typography
                                id="modal-modal-title"
                                variant="h4"
                                component="h2"
                                sx={{ fontWeight: 'bold', mb: 2, borderBottom: '2px solid #1976D2', paddingBottom: '10px' }}
                            >
                                Failed reason
                            </Typography>

                            <Typography id="modal-modal-title" variant="body1" component="div" sx={{ mt: 2, color: '#333' }}>
                                {showApiMessage}
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right' }}>
                                <Button variant="contained" onClick={() => closeShowOnholdReasonModal()}>
                                    Ok
                                </Button>
                            </Stack>
                        </Box>
                    </Modal>
                </div>
            )}
            {open && (
                <div>
                    <Modal
                        open={overtime}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h4" component="h2">
                                Are you sure you want to mark over time .
                            </Typography>
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                <TextField
                                    placeholder="Enter the reason for marking overtime resource..."
                                    multiline={true}
                                    rows={4}
                                    value={reason}
                                    onChange={(e) => handleReasonChange(e)}
                                    style={{ width: '100%', minHeight: '100px' }}
                                />
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right' }}>
                                <Button variant="contained" onClick={() => cancelModal()}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        handleClose();
                                    }}
                                >
                                    Ok
                                </Button>
                            </Stack>
                        </Box>
                    </Modal>
                </div>
            )}
        </>
    );
};

export default ResourceManage;

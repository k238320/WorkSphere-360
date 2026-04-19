import { useEffect, useRef, useState } from 'react';

// material-ui
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Theme, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';

// third-party
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import CalendarStyled from './CalendarStyled';
import Toolbar from './Toolbar';

// assets
import axios from 'axios';
import moment from 'moment';
import useAuth from 'hooks/useAuth';

import './calendar.css';
import { toast } from 'react-toastify';
import { COLORS } from 'constants/colors';
import CustomTooltipCalender from 'components/CustomTooltip/CustomTooltip';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { getDepartmentCategory } from 'services/categoryService';
import { useDispatch } from 'react-redux';

// ==============================|| APPLICATION CALENDAR ||============================== //

const isRamadan = (date: Date) => {
    const ramadanMonths = [3]; // Approximate Ramadan months in the Islamic calendar (March-April in the Gregorian calendar)
    return ramadanMonths.includes(date.getMonth() + 1);
};

const departmentOrder = [
    'UI/UX Design',
    'UI Development',
    'PHP',
    'Full Stack',
    'Mobile Development',
    'SQA',
    'MQL-Theme Based',
    'DevOps',
    'Digital Marketing',
    'Content',
    'SEO',
    'Paid Marketing'
];

const Calendar = () => {
    const { dispatchLoader, user } = useAuth();

    const token = user?.token;

    const calendarRef = useRef<FullCalendar>(null);
    const matchSm = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

    const [groups, setGroups] = useState<any>([]);
    const [event, setEvent] = useState<any>([]);

    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('resourceTimelineMonth');
    const [departmentData, setDepartmentData] = useState<any>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<any>('64eda63d56fd245f8b3b4c26');

    const dispatch = useDispatch();

    const WORKING_HOURS = isRamadan(new Date(date)) ? 6 : 8;

    // calendar toolbar events
    const handleDateToday = async () => {
        try {
            const calendarEl = calendarRef.current;

            if (calendarEl) {
                const calendarApi = calendarEl.getApi();
                dispatch(spinLoaderShow(true));

                calendarApi.today();
                setDate(calendarApi.getDate());

                setGroups([]);
                let resourceTemp: any = await axios(`${process.env.REACT_APP_API_URL}/resource`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        department_id: selectedDepartment
                    }
                });

                resourceTemp = resourceTemp?.data?.data?.filter((x: any) => {
                    const email = x?.user[0]?.email;
                    if (email && email.includes('+')) {
                        return false; // Remove the data from the array
                    }
                    return true; // Keep the data in the array
                });

                resourceTemp = resourceTemp?.map((x: any) => {
                    x.department_name = x?.department?.name;
                    return x;
                });

                resourceTemp = resourceTemp.sort((a: any, b: any) => {
                    const indexA = departmentOrder.indexOf(a.department_name);
                    const indexB = departmentOrder.indexOf(b.department_name);

                    // If both departments are in the order, compare their indices
                    if (indexA !== -1 && indexB !== -1) {
                        return indexA - indexB;
                    }

                    // If one of the departments is not in the order, prioritize the one that is
                    if (indexA !== -1) {
                        return -1;
                    } else if (indexB !== -1) {
                        return 1;
                    }

                    // If neither department is in the order, maintain the original order
                    return 0;
                });

                const inputDate = moment(calendarApi.getDate());

                // Start of the month
                const startOfMonth = inputDate.clone().startOf('month');

                // End of the month
                const endOfMonth = inputDate.clone().endOf('month');

                let tempEvent = await getEventData(startOfMonth, endOfMonth, selectedDepartment);

                setGroups(CalculateData(tempEvent, resourceTemp, moment(calendarApi.getDate())));
                dispatch(spinLoaderShow(false));
            }
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                // Handle 401 Unauthorized error
                toast.error('Unauthorized. Token may be invalid or expired ');
                localStorage.clear();
                window.location.href = '/';
            } else {
                toast.error(error.message);
            }
        }
    };

    const handleDatePrev = async () => {
        try {
            const calendarEl = calendarRef.current;

            if (calendarEl) {
                const calendarApi = calendarEl.getApi();

                calendarApi.prev();
                setDate(calendarApi.getDate());
                dispatch(spinLoaderShow(true));
                setGroups([]);
                let resourceTemp: any = await axios(`${process.env.REACT_APP_API_URL}/resource`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        department_id: selectedDepartment
                    }
                });

                resourceTemp = resourceTemp?.data?.data?.filter((x: any) => {
                    const email = x?.user[0]?.email;
                    if (email && email.includes('+')) {
                        return false; // Remove the data from the array
                    }
                    return true; // Keep the data in the array
                });

                resourceTemp = resourceTemp?.map((x: any) => {
                    x.department_name = x?.department?.name;
                    return x;
                });

                resourceTemp = resourceTemp.sort((a: any, b: any) => {
                    const indexA = departmentOrder.indexOf(a.department_name);
                    const indexB = departmentOrder.indexOf(b.department_name);

                    // If both departments are in the order, compare their indices
                    if (indexA !== -1 && indexB !== -1) {
                        return indexA - indexB;
                    }

                    // If one of the departments is not in the order, prioritize the one that is
                    if (indexA !== -1) {
                        return -1;
                    } else if (indexB !== -1) {
                        return 1;
                    }

                    // If neither department is in the order, maintain the original order
                    return 0;
                });

                const inputDate = moment(calendarApi.getDate());

                // Start of the month
                const startOfMonth = inputDate.clone().startOf('month');

                // End of the month
                const endOfMonth = inputDate.clone().endOf('month');

                let tempEvent = await getEventData(startOfMonth, endOfMonth, selectedDepartment);
                setGroups(CalculateData(tempEvent, resourceTemp, moment(calendarApi.getDate())));
                dispatch(spinLoaderShow(false));
            }
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                // Handle 401 Unauthorized error
                toast.error('Unauthorized. Token may be invalid or expired ');
                localStorage.clear();
                window.location.href = '/';
            } else {
                // Handle other errors
                toast.error(error.message);
            }
        }
    };

    const handleDateNext = async () => {
        try {
            const calendarEl = calendarRef.current;

            if (calendarEl) {
                const calendarApi = calendarEl.getApi();

                calendarApi.next();
                setGroups([]);
                dispatch(spinLoaderShow(true));
                setDate(calendarApi.getDate());
                let resourceTemp: any = await axios(`${process.env.REACT_APP_API_URL}/resource`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        department_id: selectedDepartment
                    }
                });

                resourceTemp = resourceTemp?.data?.data?.filter((x: any) => {
                    const email = x?.user[0]?.email;
                    if (email && email.includes('+')) {
                        return false; // Remove the data from the array
                    }
                    return true; // Keep the data in the array
                });

                resourceTemp = resourceTemp?.map((x: any) => {
                    x.department_name = x?.department?.name;
                    return x;
                });

                resourceTemp = resourceTemp.sort((a: any, b: any) => {
                    const indexA = departmentOrder.indexOf(a.department_name);
                    const indexB = departmentOrder.indexOf(b.department_name);

                    // If both departments are in the order, compare their indices
                    if (indexA !== -1 && indexB !== -1) {
                        return indexA - indexB;
                    }

                    // If one of the departments is not in the order, prioritize the one that is
                    if (indexA !== -1) {
                        return -1;
                    } else if (indexB !== -1) {
                        return 1;
                    }

                    // If neither department is in the order, maintain the original order
                    return 0;
                });

                const inputDate = moment(calendarApi.getDate());

                // Start of the month
                const startOfMonth = inputDate.clone().startOf('month');

                // End of the month
                const endOfMonth = inputDate.clone().endOf('month');

                let tempEvent = await getEventData(startOfMonth, endOfMonth, selectedDepartment);
                setGroups(CalculateData(tempEvent, resourceTemp, moment(calendarApi.getDate())));
                dispatch(spinLoaderShow(false));
            }
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                // Handle 401 Unauthorized error
                toast.error('Unauthorized. Token may be invalid or expired ');
                localStorage.clear();
                window.location.href = '/';
            } else {
                // Handle other errors
                toast.error(error.message);
            }
        }
    };

    const handleViewChange = async (newView: string) => {
        try {
            const calendarEl = calendarRef.current;

            if (calendarEl) {
                const calendarApi = calendarEl.getApi();
                setGroups([]);
                calendarApi.changeView(newView);
                dispatch(spinLoaderShow(true));
                let resourceTemp: any = await axios(`${process.env.REACT_APP_API_URL}/resource`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        department_id: selectedDepartment
                    }
                });

                resourceTemp = resourceTemp?.data?.data?.filter((x: any) => {
                    const email = x?.user[0]?.email;
                    if (email && email.includes('+')) {
                        return false; // Remove the data from the array
                    }
                    return true; // Keep the data in the array
                });

                resourceTemp = resourceTemp?.map((x: any) => {
                    x.department_name = x?.department?.name;
                    return x;
                });

                resourceTemp = resourceTemp.sort((a: any, b: any) => {
                    const indexA = departmentOrder.indexOf(a.department_name);
                    const indexB = departmentOrder.indexOf(b.department_name);

                    // If both departments are in the order, compare their indices
                    if (indexA !== -1 && indexB !== -1) {
                        return indexA - indexB;
                    }

                    // If one of the departments is not in the order, prioritize the one that is
                    if (indexA !== -1) {
                        return -1;
                    } else if (indexB !== -1) {
                        return 1;
                    }

                    // If neither department is in the order, maintain the original order
                    return 0;
                });

                // setGroups((newView, event, resourceTemp));
                dispatch(spinLoaderShow(true));

                setTimeout(() => {
                    calendarApi.refetchResources();

                    setView(newView);
                }, 1500);
            }
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                // Handle 401 Unauthorized error
                toast.error('Unauthorized. Token may be invalid or expired ');
                localStorage.clear();
                window.location.href = '/';
            } else {
                // Handle other errors
                toast.error(error.message);
            }
        }
    };

    const getGroupsData = async (department_id: string, eventsData?: any) => {
        try {
            let groupData: any = await axios(`${process.env.REACT_APP_API_URL}/resource`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    department_id
                }
            });

            groupData = groupData?.data?.data?.map((x: any) => {
                x.department_name = x?.department?.name;
                return x;
            });
            groupData.sort((a: any, b: any) => {
                const indexA = departmentOrder.indexOf(a.department_name);
                const indexB = departmentOrder.indexOf(b.department_name);

                // If both departments are in the order, compare their indices
                if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                }

                // If one of the departments is not in the order, prioritize the one that is
                if (indexA !== -1) {
                    return -1;
                } else if (indexB !== -1) {
                    return 1;
                }

                // If neither department is in the order, maintain the original order
                return 0;
            });

            groupData = groupData?.filter((x: any) => {
                const email = x?.user[0]?.email;
                if (email && email.includes('+')) {
                    return false; // Remove the data from the array
                }
                return true; // Keep the data in the array
            });

            if (eventsData && eventsData.length > 0) {
                setGroups(CalculateData(eventsData, groupData, moment(calendarRef?.current?.getApi().getDate())));
            } else {
                setGroups(CalculateData([], groupData));
            }
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                // Handle 401 Unauthorized error
                toast.error('Unauthorized. Token may be invalid or expired ');
                window.location.href = '/';
            } else {
                // Handle other errors
                toast.error(error.message);
            }
        }
    };

    const getDepartmentData = async () => {
        dispatch(spinLoaderShow(true));
        getDepartmentCategory()
            .then((res: any) => {
                setDepartmentData(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const onSearch = (department_id: string) => {
        // const currentDate = moment();
        setGroups([]);
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();

            const inputDate = moment(calendarApi.getDate());

            // Start of the current month
            const startOfMonth = inputDate.clone().startOf('month');

            // End of the current month
            const endOfMonth = inputDate.clone().endOf('month');
            dispatch(spinLoaderShow(true));
            getEventData(startOfMonth, endOfMonth, department_id)
                .then(async (d) => {
                    await getGroupsData(department_id, d);
                })
                .catch((err) => {
                    console.log(err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    useEffect(() => {
        onSearch('64eda63d56fd245f8b3b4c26');

        if (
            user?.role?.name === 'Super Admin' ||
            user?.role?.name === 'Human Resource' ||
            user?.role?.name === 'Human Resource Operations' ||
            user?.role?.name === 'Project Manager'
        ) {
            getDepartmentData();
        }
    }, []);

    const getEventData = async (startDate: any, endDate: any, department_id: string) => {
        try {
            let eventData: any = await axios(`${process.env.REACT_APP_API_URL}/task/task-calendar`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    startDate,
                    endDate,
                    department_id
                }
            });
            let obj = new Map();
            eventData?.data?.data?.map((per_date: any) => {
                let key = `${per_date.date}|${per_date.resource_id}`;
                if (per_date?.is_holiday || per_date?.is_leave) {
                    obj.set(key, {
                        // start: per_date?.date,
                        // start: new Date(new Date(per_date?.date).setUTCHours(0, 0, 0, 0)),
                        // end: new Date(new Date(per_date?.date).setUTCHours(23, 59, 59, 999)),
                        start: per_date?.date,
                        end: per_date?.date,
                        hours: per_date?.task_hours,
                        resourceId: per_date?.resource_id,
                        title: '',
                        is_holiday: per_date?.is_holiday,
                        is_leave: per_date?.is_leave,
                        is_overtime: false,
                        taskId: null
                    });
                    return;
                }
                if (!obj.has(key)) {
                    let s = per_date?.allocation?.is_overtime ? ' (OT)' : '';
                    let s1 = per_date?.allocation?.task?.name ? per_date?.allocation?.task?.name : 'N/A';
                    obj.set(key, {
                        // start: new Date(new Date(per_date?.date).setUTCHours(0, 0, 0, 0)),
                        // end: new Date(new Date(per_date?.date).setUTCHours(23, 59, 59, 999)),
                        start: per_date?.date,
                        end: per_date?.date,
                        hours: per_date?.task_hours,
                        resourceId: per_date?.resource_id,
                        title: `${s1} (${per_date?.allocation?.task?.project?.name}) ${s}`,
                        is_holiday: per_date?.is_holiday,
                        is_leave: per_date?.is_leave,
                        is_overtime: per_date?.allocation?.is_overtime,
                        taskId: per_date?.allocation?.task?.id
                    });
                } else {
                    let s = per_date?.allocation?.is_overtime ? ' (OT)' : '';
                    let s1 = per_date?.allocation?.task?.name ? per_date?.allocation?.task?.name : 'N/A';
                    let modify = obj?.get(key);
                    let title = `${s1} (${per_date?.allocation?.task?.project?.name}) ${s}`;
                    // let taskId = per_date?.allocation?.task?.id;
                    let taskId = per_date?.allocation?.task?.id ? per_date?.allocation?.task?.id : 'N/A';
                    let updateTtitle = modify.title == title ? `${modify.title}` : `${modify.title}:=:${title}`;
                    // let updateIds = modify.taskId == taskId ? `${modify.taskId}` : `${modify.taskId}:=:${taskId}`;
                    let updatedTaskId = modify.taskId == taskId ? modify.taskId : `${modify.taskId}:=:${taskId}`;
                    let data = { ...modify, hours: modify.hours + per_date.task_hours, title: updateTtitle, taskId: updatedTaskId };
                    obj.set(key, data);
                }
            });
            const arrayFromMap = Array.from(obj.values());
            setEvent(arrayFromMap);
            return arrayFromMap;
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                // Handle 401 Unauthorized error
                toast.error('Unauthorized. Token may be invalid or expired ');
                localStorage.clear();
                window.location.href = '/';
            } else {
                // Handle other errors
                toast.error(error.message);
            }
        }
    };

    const renderEvent = (propsData: any) => {
        const { event } = propsData;
        // let leaveStyle = {
        //     backgroundColor: '#f27e9b'
        // };

        // if (event.extendedProps.hours == 0 && event.extendedProps.is_leave) {
        if (event.extendedProps.is_holiday) {
            return (
                <div className="leaveStyle" style={{ backgroundColor: '' }}>
                    <Typography sx={{ fontSize: '9px', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Holiday</Typography>
                </div>
            );
            // } else if (event.extendedProps.is_holiday) {
        } else if (event.extendedProps.hours == 0 && event.extendedProps.is_leave) {
            return (
                <div className="leaveStyle" style={{ backgroundColor: '#e3214b' }}>
                    <Typography sx={{ fontSize: '12px', color: 'white', textAlign: 'center' }}>Off</Typography>
                </div>
            );
        }

        let color = '';
        let isOt = propsData?.event?.title.includes('OT');
        let titleArray = propsData?.event?.title?.split(':=:');
        let routerIdArray = propsData?.event?.extendedProps?.taskId?.split(':=:');

        const modifiedString =
            titleArray.length === 1
                ? { title: propsData?.event?.title ?? 'Default Title', id: (routerIdArray ?? []).join(', ') }
                : (titleArray ?? []).map((value: any, index: any) => ({
                      title: `${index + 1}. ${value?.trim()}`,
                      id: (routerIdArray ?? [])?.[index] ?? []
                  }));

        if (event.extendedProps.hours == WORKING_HOURS) {
            color = COLORS.green;
            // textColor = '#000';
        } else if (isOt) {
            color = COLORS.redOt;
            // textColor = '#fff';
        } else if (event.extendedProps.hours == 8) {
            color = COLORS.green;
            // textColor = '#000';
        } else {
            color = COLORS.lightYellow;
            // textColor = '#fff';
        }
        let totalHours: string = `${event.extendedProps.hours} Hrs`;
        let eventStyle = {
            backgroundColor: color,
            padding: '10px',
            borderRadius: '2px',
            width: '40px',
            height: '49px',
            color: isOt ? 'rgba(255,255,255,0.7)' : '#616161'
        };

        return (
            <CustomTooltipCalender title={modifiedString}>
                <div style={eventStyle}>
                    <Typography
                        sx={{ fontSize: '12px !important', fontWeight: 'bold', textAlign: 'center' }}
                        title={propsData?.event?.hours}
                    >
                        {totalHours}
                    </Typography>
                </div>
            </CustomTooltipCalender>
        );
    };

    const CalculateData = (dataEvent: any, groupData: any, selectedDate?: any) => {
        if (dataEvent.length > 0) {
            return groupData?.map((item: any) => {
                let foundAllocations: any[] = dataEvent?.filter((x: any) => {
                    return x.resourceId == item.id && selectedDate.isSame(moment(x.start), 'month');
                });

                let overTimeEventHoursCount = 0;
                let eventHours = foundAllocations
                    .reduce(function (a: any, b: any) {
                        let n = b['hours'];
                        if (b['hours'] > 8) {
                            let rem = b['hours'] - 8;
                            overTimeEventHoursCount += rem;
                            n = b['hours'] - rem;
                        }
                        return a + n;
                    }, 0)
                    .toFixed(0);

                item.title =
                    item.name +
                    ` (${eventHours < 0 ? eventHours * -1 : eventHours})` +
                    (overTimeEventHoursCount > 0
                        ? ` OT (${overTimeEventHoursCount < 0 ? overTimeEventHoursCount * -1 : overTimeEventHoursCount})`
                        : '');
                return item;
            });
        }
        return groupData?.map((item: any) => {
            item.title = item.name;
            return item;
        });
    };

    return (
        <>
            <MainCard title="Calendar">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div
                            style={{
                                padding: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: '6px'
                            }}
                        >
                            <p style={{ width: '30px', height: '15px', background: '#e3214b', margin: 0 }}></p>
                            <p style={{ margin: 0, fontSize: '10px' }}>On Leave</p>
                        </div>
                        <div
                            style={{
                                padding: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: '6px'
                            }}
                        >
                            <p style={{ width: '30px', height: '15px', background: '#892986', margin: 0 }}></p>
                            <p style={{ margin: 0, fontSize: '10px' }}>Over Time</p>
                        </div>
                        <div
                            style={{
                                padding: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: '6px'
                            }}
                        >
                            <p style={{ width: '30px', height: '15px', background: '#f27e9b', margin: 0 }}></p>
                            <p style={{ margin: 0, fontSize: '10px' }}>Holiday</p>
                        </div>
                        <div
                            style={{
                                padding: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: '6px'
                            }}
                        >
                            <p style={{ width: '30px', height: '15px', background: '#a8e2b3', margin: 0 }}></p>
                            <p style={{ margin: 0, fontSize: '10px' }}>Reserved Hour</p>
                        </div>
                        <div
                            style={{
                                padding: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: '6px'
                            }}
                        >
                            <p style={{ width: '30px', height: '15px', background: '#fff9e0', margin: 0 }}></p>
                            <p style={{ margin: 0, fontSize: '10px' }}>Under Reserved Hour</p>
                        </div>
                    </div>
                    <div>
                        {(user?.role?.name === 'Super Admin' ||
                            user?.role?.name === 'Human Resource' ||
                            user?.role?.name === 'Human Resource Operations' ||
                            user?.role?.name === 'Project Manager') && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
                                <FormControl fullWidth>
                                    <InputLabel>Department</InputLabel>
                                    <Select
                                        value={selectedDepartment}
                                        onChange={(e) => setSelectedDepartment(e.target.value as number)}
                                        label="Department"
                                    >
                                        {departmentData?.map((depart: any) => (
                                            <MenuItem key={depart.id} value={depart.id}>
                                                {depart.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Button variant="contained" onClick={() => onSearch(selectedDepartment)}>
                                    Search
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <CalendarStyled>
                    <Toolbar
                        date={date}
                        view={view}
                        onClickNext={handleDateNext}
                        onClickPrev={handleDatePrev}
                        onClickToday={handleDateToday}
                        onChangeView={handleViewChange}
                    />
                    <SubCard>
                        <div style={{ display: 'none' }}>{JSON.stringify(groups)}</div>
                        <FullCalendar
                            plugins={[resourceTimelinePlugin, dayGridPlugin]}
                            initialView="resourceTimelineMonth"
                            weekends={true}
                            resourceGroupField="department_name"
                            resources={groups}
                            eventOverlap={true}
                            slotEventOverlap={true}
                            events={event}
                            headerToolbar={false}
                            eventMinWidth={50}
                            dayMaxEventRows={1}
                            height={matchSm ? 'auto' : 720}
                            ref={calendarRef}
                            eventContent={renderEvent}
                            eventColor="transparent"
                            eventTextColor="#616161"
                            eventDidMount={(info) => {
                                if (info.isToday) {
                                    info.el.classList.add('fc-today');
                                }
                            }}
                        />
                    </SubCard>
                </CalendarStyled>
            </MainCard>
        </>
    );
};

export default Calendar;

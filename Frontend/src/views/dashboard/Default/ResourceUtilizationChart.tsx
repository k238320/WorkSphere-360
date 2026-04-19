import React, { useEffect, useState } from 'react';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import SubCard from 'ui-component/cards/SubCard';
import { IconChevronRight } from '@tabler/icons';
import { Grid, FormControl, InputLabel, Select, MenuItem, Button, Typography, Paper } from '@mui/material';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { AutoCompleteField } from 'ui-component/formsField/FormFields';
import { useForm } from 'react-hook-form';
import { getDepartmentCategory } from 'services/categoryService';
import useAuth from 'hooks/useAuth';
import { resourceUtilization } from 'services/resource';
import { EmpLefe, ResourceUtilzation, ResourceUtilzationRes } from 'pages/ResourceUtilization/interface';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
];

const ResourceUtilizationChart = () => {
    const currentMonth: number = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [selectedStartMonth, setStartSelectedMonth] = useState(currentMonth);
    const [selectedEndMonth, setEndSelectedMonth] = useState(currentMonth);
    const [departmentData, setDepartmentData] = useState<any>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<any>({});
    const [state, setState] = useState<ResourceUtilzation>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const dispatch = useDispatch();

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
    }: any = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange'
    });

    const selectedDepartmentId = watch('department_id');

    useEffect(() => {
        if (selectedDepartmentId && departmentData.length > 0) {
            const dept = departmentData.find((d: any) => d.id === selectedDepartmentId);
            if (dept) {
                setSelectedDepartment(dept);
            }
        }
    }, [selectedDepartmentId, departmentData]);

    const onSearch = () => {
        const getValue = getValues();

        const { department_id } = getValues();
        if (!department_id) {
            toast.warning('Please select a department before searching.');
            return;
        }

        const obj = {
            ...getValue,
            startmonth: selectedStartMonth,
            endtmonth: selectedEndMonth
        };

        // dispatch(spinLoaderShow(true));
        setLoading(true);
        resourceUtilization(obj)
            .then((res: any) => {
                let usersData = res?.users;

                usersData = usersData?.filter((x: ResourceUtilzationRes) => {
                    const email = x?.email;
                    return !(email && email.includes('+'));
                });

                setState(usersData as ResourceUtilzation);
            })
            .catch((err) => {
                toast.error(err);
            })
            .finally(() => {
                // dispatch(spinLoaderShow(false));
                setLoading(false);
            });
    };

    const getDepartmentData = async () => {
        dispatch(spinLoaderShow(true));
        getDepartmentCategory()
            .then((res: any) => {
                let selectedDeptId = '';
                if (['Associate Creative Director'].includes(user?.role?.name)) {
                    const filterdata = res?.filter((x: any) => x.id === user?.resource?.department_id);
                    setValue('department_id', user?.resource?.department_id);
                    setDepartmentData(filterdata);
                } else {
                    selectedDeptId = '64eda63d56fd245f8b3b4c26';
                    setDepartmentData(res);
                }

                if (selectedDeptId) {
                    setValue('department_id', selectedDeptId);
                    onSearch();
                }
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    useEffect(() => {
        getDepartmentData();
    }, []);

    const chartData: ApexOptions = {
        series: [
            {
                name: 'Monthly Hour',
                data: state.map((item) => item.workingHours || 0)
            },
            {
                name: 'Allocation',
                data: state.map((item) => item.per_date_allocation_count || 0)
            },
            {
                name: 'Utilization %',
                data: state.map((item) => parseFloat(item.resourceUtilization || '0'))
            }
        ],
        chart: {
            type: 'bar',
            stacked: true,
            toolbar: { show: false },
            fontFamily: 'inherit'
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 0,
                dataLabels: { position: 'center' },
                barHeight: '80%'
            }
        },
        xaxis: {
            categories: state.map((item) => item.name),
            labels: {
                show: false
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                style: { fontSize: '14px', fontWeight: 500 }
            }
        },
        legend: {
            position: 'top',
            offsetY: 10,
            fontSize: '13px',
            labels: { colors: '#333' }
        },
        dataLabels: {
            enabled: true,
            formatter: (val: number, opts): string => {
                const name = opts.w.globals.seriesNames[opts.seriesIndex];
                return name === 'Utilization %' ? `${val.toFixed(1)}%` : `${val.toFixed(0)}`;
            },
            style: {
                fontSize: '12px',
                fontWeight: 600,
                colors: ['#fff']
            }
        },
        title: {
            text: 'Resource Utilization',
            align: 'center',
            style: {
                fontSize: '16px',
                fontWeight: 600
            }
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number, opts): string => {
                    const name = opts.w.globals.seriesNames[opts.seriesIndex];
                    return name === 'Utilization %' ? `${val.toFixed(1)}%` : `${val.toFixed(0)}`;
                }
            }
        },
        colors: ['#1976D2', '#26A69A', '#EF5350']
    };

    return (
        <React.Fragment>
            <SubCard>
                <Grid container display={'flex'} alignItems={'center'}>
                    <Grid container display={'flex'} alignItems={'center'} spacing={0}>
                        <Grid item xs={9} md={9} sm={9}>
                            <Grid container display={'flex'} alignItems={'center'}>
                                <Grid item xs={2} md={2} sm={2} sx={{ marginRight: '10px', marginTop: '10px' }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Start Month</InputLabel>
                                        <Select
                                            value={selectedStartMonth}
                                            onChange={(e) => setStartSelectedMonth(e.target.value as number)}
                                            label="Month"
                                        >
                                            {months.map((month) => (
                                                <MenuItem key={month.value} value={month.value}>
                                                    {month.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={2} md={2} sm={2} sx={{ marginRight: '10px', marginTop: '10px' }}>
                                    <FormControl fullWidth>
                                        <InputLabel>End Month</InputLabel>
                                        <Select
                                            value={selectedEndMonth}
                                            onChange={(e) => setEndSelectedMonth(e.target.value as number)}
                                            label="Month"
                                        >
                                            {months.map((month) => (
                                                <MenuItem key={month.value} value={month.value}>
                                                    {month.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={3} md={3} sm={3} sx={{ marginRight: '10px' }}>
                                    <AutoCompleteField
                                        errors={!!errors?.department_id}
                                        fieldName="department_id"
                                        autoComplete="off"
                                        label="Department Name *"
                                        control={control}
                                        setValue={setValue}
                                        options={departmentData}
                                        returnObject={false}
                                        isLoading={true}
                                        optionKey="id"
                                        optionValue="name"
                                        helperText={errors?.department_id && errors?.department_id?.message}
                                        valueGot={selectedDepartment}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={2} md={2} sm={2} gap={2} display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
                            <Button onClick={onSearch} variant="contained">
                                Search
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Chart */}
                <Paper style={{ padding: 20, marginTop: 30 }}>
                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : state.length > 0 ? (
                        <ReactApexChart options={chartData} series={chartData.series} type="bar" height={400} />
                    ) : (
                        <Typography align="center">No data available to display chart.</Typography>
                    )}
                </Paper>
            </SubCard>
        </React.Fragment>
    );
};

export default ResourceUtilizationChart;

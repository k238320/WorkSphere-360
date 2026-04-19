import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Card, CardContent, MenuItem, Select, FormControl, InputLabel, Grid, SelectChangeEvent } from '@mui/material';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import moment from 'moment';
import { getSalesTargetData } from 'services/dashboard';

const TargetSales = () => {
    const [data, setData] = useState({
        salesTarget: Array(12).fill(0),
        achievedTarget: Array(12).fill(0),
        initialPayments: Array(12).fill(0)
    });
    const [filter, setFilter] = useState<string>(moment().format('YYYY'));
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useDispatch();

    const salesTargetTotal = data.salesTarget.reduce((sum, val) => sum + val, 0);
    const achievedTargetTotal = data.achievedTarget.reduce((sum, val) => sum + val, 0);
    const initialPaymentsTotal = data.initialPayments.reduce((sum, val) => sum + val, 0);

    const series = [
        {
            name: `Sales Target (${salesTargetTotal.toLocaleString()})`,
            type: 'column',
            data: data.salesTarget
        },
        {
            name: `Achieved Target (${achievedTargetTotal.toLocaleString()})`,
            type: 'column',
            data: data.achievedTarget
        },
        {
            name: `Initial Payments (${initialPaymentsTotal.toLocaleString()})`,
            type: 'column',
            data: data.initialPayments
        }
    ];

    const options: ApexOptions = {
        chart: {
            type: 'bar',
            height: 400,
            toolbar: { show: true }
        },
        title: {
            text: 'Sales Milestones',
            align: 'center',
            style: { fontSize: '16px', fontWeight: 'bold' }
        },
        subtitle: {
            align: 'center',
            style: { fontSize: '14px', fontWeight: 'bold' }
        },
        plotOptions: {
            bar: { horizontal: false, columnWidth: '60%' }
        },
        dataLabels: { enabled: false },
        legend: { position: 'bottom' },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yaxis: {
            labels: {
                formatter: (value) => value.toLocaleString()
            }
        },
        colors: ['#007bff', '#28a745', '#ffc107'],
        tooltip: {
            enabled: true,
            y: {
                formatter: (value) => value.toLocaleString()
            }
        }
    };

    const handleFilterChange = (event: SelectChangeEvent<string>) => setFilter(event.target.value);

    const fetchData = (filter: string) => {
        setLoading(true);
        setError(null);
        const startDate = moment(filter, 'YYYY').startOf('year').format('YYYY-MM-DD');
        const endDate = moment(filter, 'YYYY').endOf('year').format('YYYY-MM-DD');

        getSalesTargetData({ startDate, endDate })
            .then((res: any) => {
                setData({
                    salesTarget: res?.salesTarget,
                    achievedTarget: res?.achievedTarget,
                    initialPayments: res?.initialPayments
                });
            })
            .catch(() => setError('Failed to fetch data. Please try again.'))
            .finally(() => {
                setLoading(false);
                dispatch(spinLoaderShow(false));
            });
    };

    useEffect(() => {
        fetchData(filter);
    }, [filter]);

    return (
        <Card sx={{ height: '480px' }}>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                                width: '100%'
                            }}
                        >
                            <FormControl style={{ width: '200px' }}>
                                <InputLabel>Filter</InputLabel>
                                <Select value={filter} onChange={handleFilterChange} label="Filter">
                                    <MenuItem value="2022">2022</MenuItem>
                                    <MenuItem value="2023">2023</MenuItem>
                                    <MenuItem value="2024">2024</MenuItem>
                                    <MenuItem value="2025">2025</MenuItem>
                                    <MenuItem value="2026">2026</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </Grid>
                    {loading ? (
                        <div>Loading...</div>
                    ) : error ? (
                        <div>{error}</div>
                    ) : (
                        <Grid item xs={12}>
                            <Chart options={options} series={series} type="bar" height={350} />
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default TargetSales;

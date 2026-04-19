import React, { useState, useEffect } from 'react';
import { Card, CardContent, Grid, FormControl, InputLabel, Select, MenuItem, Typography, SelectChangeEvent } from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';
import { ApexOptions } from 'apexcharts';
import { milestoneDashboardCountInvoiceWise } from 'services/dashboard';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { useDispatch } from 'react-redux';

interface MilestoneData {
    achieved: number[];
    inProgress: number[];
    delayed: number[];
}

const MilstonegraphInvoiceWise: React.FC = () => {
    const [milestoneData, setMilestoneData] = useState<MilestoneData>({
        achieved: Array(12).fill(0),
        inProgress: Array(12).fill(0),
        delayed: Array(12).fill(0)
    });
    const [filter, setFilter] = useState<string>(moment().format('YYYY'));
    const dispatch = useDispatch();

    const getDateRange = (filter: string): { startDate: string; endDate: string } => {
        const year = filter || moment().format('YYYY');
        const startDate = moment(`${year}-01-01`).format('YYYY-MM-DD');
        const endDate = moment(`${year}-12-31`).format('YYYY-MM-DD');
        return { startDate, endDate };
    };

    const fetch = (filter: string) => {
        dispatch(spinLoaderShow(true));
        const { startDate, endDate } = getDateRange(filter);
        milestoneDashboardCountInvoiceWise({ startDate, endDate })
            .then((res: any) => {
                const data: MilestoneData = {
                    achieved: res?.milestoneData?.achieved || Array(12).fill(0),
                    inProgress: res?.milestoneData?.inProgress || Array(12).fill(0),
                    delayed: res?.milestoneData?.delayed || Array(12).fill(0)
                };
                setMilestoneData(data);
            })
            .catch((err) => console.error(err))
            .finally(() => dispatch(spinLoaderShow(false)));
    };

    useEffect(() => {
        fetch(filter);
    }, [filter]);

    const handleFilterChange = (event: SelectChangeEvent) => setFilter(event.target.value);

    function calculateMonthlyTotals() {
        const totals = [];
        const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 0; i < categories.length; i++) {
            const total = series.reduce((sum, s) => sum + (s.data[i] || 0), 0);
            if (total > 0) {
                totals.push({
                    x: categories[i],
                    y: total,
                    label: {
                        text: total.toLocaleString(),
                        style: {
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '500',
                            background: '#9C27B0',
                            borderRadius: '5px'
                        },
                        offsetY: -5
                    }
                });
            }
        }

        return totals;
    }

    const achievedTotal = milestoneData.achieved.reduce((sum, val) => sum + val, 0);
    const inProgressTotal = milestoneData.inProgress.reduce((sum, val) => sum + val, 0);
    const delayedTotal = milestoneData.delayed.reduce((sum, val) => sum + val, 0);

    const series = [
        { name: `Achieved (${achievedTotal.toLocaleString()})`, data: milestoneData.achieved },
        { name: `In Progress (${inProgressTotal.toLocaleString()})`, data: milestoneData.inProgress },
        { name: `Delayed (${delayedTotal.toLocaleString()})`, data: milestoneData.delayed }
    ];

    const chartOptions: ApexOptions = {
        chart: { type: 'bar', height: 350, stacked: true, toolbar: { show: true }, zoom: { enabled: true } },
        responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom', offsetX: -10, offsetY: 0, fontSize: '10px' } } }],
        plotOptions: {
            bar: {
                horizontal: false,
                borderRadius: 0,
                columnWidth: '80%',
                dataLabels: {
                    position: 'center',
                    maxItems: 100,
                    hideOverflowingLabels: false,
                    orientation: 'horizontal',
                    total: { enabled: false }
                }
            }
        },
        dataLabels: {
            enabled: true,
            style: { fontSize: '13px', fontWeight: 'bold', colors: ['#fff'] },
            formatter: (val: number) => (val > 0 ? val.toLocaleString() : ''),
            offsetY: 0
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            labels: { style: { colors: '#666', fontSize: '12px' } }
        },
        title: {
            text: 'Production Milestone',
            align: 'center',
            style: { fontSize: '16px', fontWeight: 'bold' }
        },
        legend: { position: 'bottom', offsetY: 10, labels: { colors: '#666' } },
        fill: { colors: ['#76c7c0', '#ffb74d', '#f06292'], opacity: 1 },
        grid: { borderColor: '#e0e0e0' },
        yaxis: {
            labels: {
                style: { colors: '#666', fontSize: '12px' },
                formatter: (value) => value.toLocaleString()
            }
        },
        annotations: {
            points: calculateMonthlyTotals()
        },
        tooltip: {
            enabled: true,
            y: {
                formatter: (value, { dataPointIndex }) => {
                    const totalForMonth =
                        milestoneData.achieved[dataPointIndex] +
                        milestoneData.inProgress[dataPointIndex] +
                        milestoneData.delayed[dataPointIndex];
                    if (totalForMonth === 0) return `${value}`;
                    const percentage = ((value / totalForMonth) * 100).toFixed(2);
                    return `${value?.toLocaleString()} (${percentage}%)`;
                }
            }
        }
    };

    return (
        <Card>
            <CardContent>
                <Grid container spacing={2} alignItems="center">
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
                </Grid>

                {/* Chart */}
                <Grid item xs={12}>
                    <ReactApexChart options={chartOptions} series={series} type="bar" height={350} />
                </Grid>
            </CardContent>
        </Card>
    );
};

export default MilstonegraphInvoiceWise;

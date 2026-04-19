import type React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { Paper, Grid, Typography, Box, FormControlLabel, Switch } from '@mui/material';
import { useEffect, useState } from 'react';
import { dashboardOverViewCountAttendance } from 'services/dashboard';
import { getAllDepartments } from 'services/departmentService';
import FiltersSection from './FiltersSection';
import useAuth from 'hooks/useAuth';

interface DataType {
    name: string;
    Worked: number;
    Break: number;
    OnTime: number;
    Late: number;
    Leaves: number;
    WFH: number;
    Given: number;
    Total: number;
}

const AttendanceCount: React.FC = () => {
    const [filteredData, setFilteredData] = useState<DataType[]>([]);
    const [department, setDepartment] = useState<any>({});
    const [departments, setDepartments] = useState<any>([]);
    const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
    const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isTeamLeads, setIsTeamLeads] = useState(false);

    const { user } = useAuth();

    const fetchDepartments = () => {
        getAllDepartments()
            .then((res) => {
                setDepartments(res);
            })
            .catch((err) => {});
    };

    const fetch = (firstDay: any, lastDay: any, departmentid: string,isTeamLeads:boolean) => {
        setLoading(true);
        setError(null);

        dashboardOverViewCountAttendance(firstDay, lastDay, departmentid, isTeamLeads)
            .then((res: any) => {
                setFilteredData(res);
            })
            .catch(() => {
                setError('Failed to fetch data. Please try again.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

        setCustomStartDate(firstDay);
        setCustomEndDate(now);

        if (['Super Admin', 'Human Resource', 'Human Resource Operations'].includes(user?.role?.name)) {
            setDepartment('64eda63d56fd245f8b3b4c26');
            fetch(firstDay?.toLocaleDateString(), now?.toLocaleDateString(), '64eda63d56fd245f8b3b4c26',false);
        } else {
            fetch(firstDay?.toLocaleDateString(), now?.toLocaleDateString(), '', false);
        }

        fetchDepartments();
    }, []);

    const commonOptions: ApexOptions = {
        chart: { type: 'bar', stacked: true, toolbar: { show: false }, fontFamily: 'inherit' },
        plotOptions: { bar: { horizontal: true, barHeight: '70%', columnWidth: '80%', dataLabels: { position: 'center' } } },
        xaxis: {
            categories: filteredData?.map((d: DataType) => d.name),
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: { labels: { style: { fontSize: '14px', fontWeight: 500 } } },
        legend: { position: 'top', offsetY: 10, labels: { colors: '#666' } },
        dataLabels: { enabled: true, style: { fontSize: '14px', fontWeight: 600, colors: ['#fff'] }, offsetX: 0, offsetY: 0 }
    };

    const attendanceOptions: any = {
        ...commonOptions,
        colors: ['#2196F3', '#EF5350', '#4CAF50', '#9C27B0'],
        tooltip: { enabled: true, shared: true, intersect: false, y: { formatter: (val: any) => val + ' hrs' } },
        dataLabels: {
            enabled: true,
            style: { fontSize: '14px', fontWeight: 600, colors: ['#fff'] },
            offsetX: 0,
            offsetY: 0
        }
    };
    const statusOptions = { ...commonOptions, colors: ['#00E676', '#FFA726', '#EF5350', '#9C27B0'] };

    const attendanceSeries = [
        { name: 'Worked Hours', data: filteredData?.map((d) => d.Given) },
        { name: 'Break Hours', data: filteredData?.map((d) => d.Break) },
        { name: 'Given', data: filteredData?.map((d) => d.Worked) },
        { name: 'Total', data: filteredData?.map((d) => d.Total) }
    ];

    const statusSeries = [
        { name: 'On Time', data: filteredData?.map((d) => d.OnTime) },
        { name: 'Late', data: filteredData?.map((d) => d.Late) },
        { name: 'Leaves', data: filteredData?.map((d) => d.Leaves) },
        { name: 'WFH', data: filteredData?.map((d) => d.WFH) }
    ];

    const handleSearch = () => {
        fetch(customStartDate?.toLocaleDateString(), customEndDate?.toLocaleDateString(),   department, isTeamLeads);
    };

    const handleTeamLeadsToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsTeamLeads(event.target.checked);
        if (event.target.checked) {
            setDepartment('');
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, minHeight: '400px' }}>
            <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
                Attendance Overview
            </Typography>

            

            <FiltersSection
                departments={departments}
                department={department}
                setDepartment={setDepartment}
                customStartDate={customStartDate}
                setCustomStartDate={setCustomStartDate}
                customEndDate={customEndDate}
                setCustomEndDate={setCustomEndDate}
                handleSearch={handleSearch}
                roleName={user?.role?.name}
                disabled={isTeamLeads}
                isTeamLeads={isTeamLeads}
                handleTeamLeadsToggle={handleTeamLeadsToggle}
            />

            {error && <Typography color="error">{error}</Typography>}

            {loading ? (
                <Typography>Loading...</Typography>
            ) : (
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ position: 'relative' }}>
                            <ReactApexChart
                                options={attendanceOptions}
                                series={attendanceSeries}
                                type="bar"
                                height={filteredData.length > 3 ? Math.max(20, filteredData.length * 40) : 180}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <ReactApexChart
                            options={statusOptions}
                            series={statusSeries}
                            type="bar"
                            height={filteredData.length > 3 ? Math.max(20, filteredData.length * 40) : 180}
                        />
                    </Grid>
                </Grid>
            )}
        </Paper>
    );
};

export default AttendanceCount;
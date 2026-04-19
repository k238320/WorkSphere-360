import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { toast } from 'react-hot-toast';
import { getMonthlyCapacityData, departmentForPoductionCapacity } from 'services/production-capacity';
import type { IDepartment } from '../interface';

interface Department {
    id: string;
    name: string;
    color: string;
    resourceCount: number;
}

interface MonthlyChartData {
    department: string;
    utilization: number;
    resourcesRequired: number;
    utilizationLabel: string;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 600,
    textAlign: 'center',
    padding: '8px',
    fontSize: '0.875rem'
}));

const UtilizationCell = styled(TableCell)<{ utilization: number }>(({ theme, utilization }) => ({
    fontWeight: 600,
    textAlign: 'center',
    padding: '8px',
    fontSize: '0.875rem',
    backgroundColor: utilization > 100 ? '#FFE0B2' : '#E8F5E8',
    color: utilization > 100 ? '#E65100' : '#2E7D32'
}));

const ResourceCell = styled(TableCell)<{ required: number }>(({ theme, required }) => ({
    fontWeight: 600,
    textAlign: 'center',
    padding: '8px',
    fontSize: '0.875rem',
    backgroundColor: required > 0 ? '#FFCDD2' : required < 0 ? '#C8E6C9' : '#F5F5F5',
    color: required > 0 ? '#C62828' : required < 0 ? '#388E3C' : '#666666'
}));

// Helper function to get working days in a month
const getWorkingDaysInMonth = (year: number, month: number): number => {
    let workingDays = 0;
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
        const day = date.getDay();
        if (day !== 0 && day !== 6) {
            workingDays++;
        }
        date.setDate(date.getDate() + 1);
    }
    return workingDays;
};

const MonthlyDetailedChart = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [monthlyData, setMonthlyData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState('');

    // Generate months for selection
    const generateMonths = () => {
        const months = [];
        const currentDate = new Date();

        for (let i = 0; i < 6; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
            months.push({
                key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
                label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            });
        }
        return months;
    };

    const [months] = useState(generateMonths());

    useEffect(() => {
        setSelectedMonth(months[0].key);
    }, [months]);

    useEffect(() => {
        if (!selectedMonth) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [monthlyRes, departmentsRes]: any = await Promise.all([
                    getMonthlyCapacityData(selectedMonth),
                    departmentForPoductionCapacity()
                ]);

                const fetchedDepartments: Department[] = departmentsRes?.map((dept: IDepartment) => ({
                    id: dept.id,
                    name: dept.name,
                    resourceCount: dept.resource?.filter((res) => res.status).length || 0,
                    color: '#6e529e'
                }));
                setDepartments(fetchedDepartments);
                setMonthlyData(monthlyRes.monthlyUtilization || {});
            } catch (error) {
                console.error('Failed to fetch monthly data:', error);
                toast.error('Failed to load monthly capacity data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedMonth]);

    // Split departments into groups of 5 for monthly view as well
    const departmentGroups = [];
    for (let i = 0; i < departments.length; i += 5) {
        departmentGroups.push(departments.slice(i, i + 5));
    }

    // Calculate chart data for a specific department group
    const getMonthlyChartDataForGroup = (departmentGroup: Department[]): MonthlyChartData[] => {
        return departmentGroup.map((dept) => {
            const deptData = monthlyData[dept.id] || { utilization: 0, threshold: 100, resourcesRequired: 0 };

            return {
                department: dept.name,
                utilization: deptData.utilization,
                resourcesRequired: deptData.resourcesRequired,
                utilizationLabel: `${deptData.utilization.toFixed(1)}%`
            };
        });
    };

    // Calculate Y-axis domain to always show 100% threshold
    const getYAxisDomain = (groupChartData: MonthlyChartData[]) => {
        const maxUtilization = Math.max(...groupChartData.map((d) => d.utilization));
        const minUtilization = Math.min(...groupChartData.map((d) => d.utilization));

        // Always include 100% in the domain, with some padding
        const domainMax = Math.max(maxUtilization, 100) + 20;
        const domainMin = Math.min(minUtilization, 0) - 5;

        return [domainMin, domainMax];
    };

    // Custom tooltip
    const MonthlyTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{ p: 2, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight="600">
                        {label}
                    </Typography>
                    {payload.map((entry: any, index: number) => (
                        <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                            {entry.dataKey === 'utilization' ? 'Utilization' : 'Resources Required'}: {entry.value}
                            {entry.dataKey === 'utilization' ? '%' : ''}
                        </Typography>
                    ))}
                    <Typography variant="body2" sx={{ color: '#F44336' }}>
                        Threshold: 100%
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading monthly data...</Typography>
            </Box>
        );
    }

    const selectedMonthLabel = months.find((m) => m.key === selectedMonth)?.label || '';

    return (
        <>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6" component="h2" fontWeight="600">
                    Monthly Resource Analysis - {selectedMonthLabel}
                </Typography>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Select Month</InputLabel>
                    <Select value={selectedMonth} label="Select Month" onChange={(e) => setSelectedMonth(e.target.value)}>
                        {months.map((month) => (
                            <MenuItem key={month.key} value={month.key}>
                                {month.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            {/* Multiple Charts and Tables - 5 departments each */}
            {departmentGroups.map((departmentGroup, groupIndex) => {
                const groupChartData = getMonthlyChartDataForGroup(departmentGroup);
                const yAxisDomain = getYAxisDomain(groupChartData);

                return (
                    <Box key={groupIndex} sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
                            Departments {groupIndex * 5 + 1} - {Math.min((groupIndex + 1) * 5, departments.length)}
                        </Typography>

                        {/* Combined Chart for this group */}
                        <Box sx={{ height: 400, mb: 3 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={groupChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="department" />
                                    <YAxis
                                        yAxisId="left"
                                        domain={yAxisDomain}
                                        label={{ value: 'Utilization %', angle: -90, position: 'insideLeft' }}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        label={{ value: 'Resources Required', angle: 90, position: 'insideRight' }}
                                    />
                                    <Tooltip content={<MonthlyTooltip />} />
                                    <Legend />

                                    {/* Threshold as horizontal red line - ALWAYS VISIBLE */}
                                    <ReferenceLine
                                        yAxisId="left"
                                        y={100}
                                        stroke="#F44336"
                                        strokeWidth={3}
                                        strokeDasharray="0"
                                        label={{
                                            value: 'Threshold',
                                            position: 'insideTopRight',
                                            fill: '#F44336',
                                            fontWeight: 'bold',
                                            fontSize: 12
                                        }}
                                    />

                                    {/* Resources' Utilization Bar */}
                                    <Bar yAxisId="left" dataKey="utilization" fill="#FFA726" name="Resources' Utilization" />

                                    {/* Resources Required Line */}
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="resourcesRequired"
                                        stroke="#666666"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={{ fill: '#666666', strokeWidth: 2, r: 4 }}
                                        name="Resources Required"
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </Box>

                        {/* Data Table for this group */}
                        <TableContainer component={Paper} elevation={1} sx={{ mb: 3 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#6e529e' }}>
                                        <StyledTableCell sx={{ color: 'white', textAlign: 'left' }}>Metric</StyledTableCell>
                                        {departmentGroup.map((dept) => (
                                            <StyledTableCell key={dept.id} sx={{ color: 'white' }}>
                                                {dept.name}
                                            </StyledTableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <StyledTableCell sx={{ backgroundColor: '#4FC3F7', color: 'white', textAlign: 'left' }}>
                                            Resources' Utilization
                                        </StyledTableCell>
                                        {groupChartData.map((data, index) => (
                                            <UtilizationCell key={index} utilization={data.utilization}>
                                                {data.utilizationLabel}
                                            </UtilizationCell>
                                        ))}
                                    </TableRow>
                                    <TableRow>
                                        <StyledTableCell sx={{ backgroundColor: '#F44336', color: 'white', textAlign: 'left' }}>
                                            Threshold
                                        </StyledTableCell>
                                        {groupChartData.map((data, index) => (
                                            <StyledTableCell key={index}>100%</StyledTableCell>
                                        ))}
                                    </TableRow>
                                    <TableRow>
                                        <StyledTableCell sx={{ backgroundColor: '#9E9E9E', color: 'white', textAlign: 'left' }}>
                                            Resources Required
                                        </StyledTableCell>
                                        {groupChartData.map((data, index) => (
                                            <ResourceCell key={index} required={data.resourcesRequired}>
                                                {data.resourcesRequired}
                                            </ResourceCell>
                                        ))}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                );
            })}
        </>
    );
};

export default MonthlyDetailedChart;

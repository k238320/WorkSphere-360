import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Card,
    CardContent
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import { departmentForPoductionCapacity, productionCapacity } from 'services/production-capacity';
import type { IDepartment, IProjectHour, IProjects, IProjectConsumedHour } from '../interface';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';

interface Department {
    id: string;
    name: string;
    color: string;
    resourceCount: number;
}

interface Project {
    id: string;
    name: string;
    type: string;
    pm: string;
    projectHours: Record<string, number>;
    consumedHours: Record<string, number>;
}

interface ChartData {
    department: string;
    [key: string]: string | number; // For dynamic month keys
}

// Helper function to get working days in a month
const getWorkingDaysInMonth = (year: number, month: number): number => {
    let workingDays = 0;
    const date = new Date(year, month, 1); // Month is 0-indexed
    while (date.getMonth() === month) {
        const day = date.getDay();
        if (day !== 0 && day !== 6) {
            // 0 = Sunday, 6 = Saturday
            workingDays++;
        }
        date.setDate(date.getDate() + 1);
    }
    return workingDays;
};

const CapacityUtilizationChart = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [capacityData, setCapacityData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [selectedView, setSelectedView] = useState<'utilization' | 'allocated' | 'capacity'>('utilization');

    // Generate current month and next 2 months
    const generateMonths = () => {
        const months = [];
        const currentDate = new Date();

        for (let i = 0; i < 3; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
            months.push({
                key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
                label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                shortLabel: date.toLocaleDateString('en-US', { month: 'short' })
            });
        }
        return months;
    };

    const [months] = useState(generateMonths());

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [projectsAndAllocationsRes, departmentsRes]: any = await Promise.all([
                    productionCapacity(),
                    departmentForPoductionCapacity()
                ]);

                const fetchedProjects: IProjects[] = projectsAndAllocationsRes.projects;
                const fetchedAllocatedCapacityData: Record<string, number> = projectsAndAllocationsRes.allocatedCapacityData;

                const fetchedDepartments: Department[] = departmentsRes?.map((dept: IDepartment) => ({
                    id: dept.id,
                    name: dept.name,
                    resourceCount: dept.resource?.filter((res) => res.status).length || 0,
                    color: '#6e529e'
                }));
                setDepartments(fetchedDepartments);

                const mappedProjects: Project[] = fetchedProjects?.map((p: IProjects) => {
                    const projectHoursLimits: Record<string, number> = {};
                    p.project_hours.forEach((ph: IProjectHour) => {
                        projectHoursLimits[ph.department_id] = (projectHoursLimits[ph.department_id] || 0) + ph.hours;
                    });
                    fetchedDepartments.forEach((dept) => {
                        if (projectHoursLimits[dept.id] === undefined) {
                            projectHoursLimits[dept.id] = 0;
                        }
                    });

                    const consumedHoursMap: Record<string, number> = {};
                    p.project_consumed_hours?.forEach((pch: IProjectConsumedHour) => {
                        consumedHoursMap[pch.department_id] = (consumedHoursMap[pch.department_id] || 0) + pch.consumed_hours;
                    });
                    fetchedDepartments.forEach((dept) => {
                        if (consumedHoursMap[dept.id] === undefined) {
                            consumedHoursMap[dept.id] = 0;
                        }
                    });

                    return {
                        id: p.id,
                        name: p.name,
                        type: p.project_contract_type?.name || 'Unknown Type',
                        pm: p.project_manager_details?.[0]?.name || 'N/A',
                        projectHours: projectHoursLimits,
                        consumedHours: consumedHoursMap
                    };
                });

                setProjects(mappedProjects);
                setCapacityData(fetchedAllocatedCapacityData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Failed to load production capacity data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate utilization data for chart
    const getChartData = (departmentGroup: Department[]): ChartData[] => {
        return departmentGroup.map((dept) => {
            const chartItem: ChartData = {
                department: dept.name
            };

            months.forEach((month) => {
                // Calculate total allocated hours for this department in this month
                let totalAllocatedHours = 0;
                projects.forEach((project) => {
                    const key = `${project.id}_${dept.id}_${month.key}`;
                    totalAllocatedHours += capacityData[key] || 0;
                });

                // Calculate department capacity for this month
                const [year, monthNum] = month.key.split('-').map(Number);
                const workingDays = getWorkingDaysInMonth(year, monthNum - 1);
                const departmentCapacity = dept.resourceCount * 8 * workingDays;

                // Calculate utilization percentage
                const utilization = departmentCapacity > 0 ? (totalAllocatedHours / departmentCapacity) * 100 : 0;

                if (selectedView === 'utilization') {
                    chartItem[month.shortLabel] = Number(utilization.toFixed(2));
                } else if (selectedView === 'allocated') {
                    chartItem[month.shortLabel] = totalAllocatedHours;
                } else if (selectedView === 'capacity') {
                    chartItem[month.shortLabel] = departmentCapacity;
                }
            });

            return chartItem;
        });
    };

    // Split departments into groups of 5
    const departmentGroups = [];
    for (let i = 0; i < departments.length; i += 5) {
        departmentGroups.push(departments.slice(i, i + 5));
    }

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <Paper sx={{ p: 2, border: '1px solid #ccc' }}>
                    <Typography variant="subtitle2" fontWeight="600">
                        {label} Department
                    </Typography>
                    {payload.map((entry: any, index: number) => (
                        <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                            {entry.dataKey}:{' '}
                            {selectedView === 'utilization'
                                ? `${entry.value}%`
                                : selectedView === 'allocated'
                                ? `${entry.value}h allocated`
                                : `${entry.value}h capacity`}
                        </Typography>
                    ))}
                </Paper>
            );
        }
        return null;
    };

    // Get summary statistics
    const getSummaryStats = () => {
        const stats = months.map((month) => {
            let totalAllocated = 0;
            let totalCapacity = 0;
            let departmentsWithData = 0;

            departments.forEach((dept) => {
                const [year, monthNum] = month.key.split('-').map(Number);
                const workingDays = getWorkingDaysInMonth(year, monthNum - 1);
                const deptCapacity = dept.resourceCount * 8 * workingDays;

                let deptAllocated = 0;
                projects.forEach((project) => {
                    const key = `${project.id}_${dept.id}_${month.key}`;
                    deptAllocated += capacityData[key] || 0;
                });

                if (deptCapacity > 0) {
                    totalAllocated += deptAllocated;
                    totalCapacity += deptCapacity;
                    departmentsWithData++;
                }
            });

            const overallUtilization = totalCapacity > 0 ? (totalAllocated / totalCapacity) * 100 : 0;

            return {
                month: month.label,
                totalAllocated,
                totalCapacity,
                utilization: overallUtilization,
                departmentsWithData
            };
        });

        return stats;
    };

    const summaryStats = getSummaryStats();

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Breadcrumbs separator={IconChevronRight} heading="Capacity Utilization Chart" icon title rightAlign />
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading utilization data...</Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Breadcrumbs separator={IconChevronRight} heading="Capacity Utilization Chart" icon rightAlign />

            <Paper elevation={2} sx={{ mt: 2, p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="h6" component="h2" fontWeight="600">
                        Production Capacity - Utilization ({months[0].shortLabel}-{months[2].shortLabel})
                    </Typography>

                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>View Type</InputLabel>
                        <Select value={selectedView} label="View Type" onChange={(e) => setSelectedView(e.target.value as any)}>
                            <MenuItem value="utilization">Utilization %</MenuItem>
                            <MenuItem value="allocated">Allocated Hours</MenuItem>
                            <MenuItem value="capacity">Available Capacity</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                {/* Summary Cards */}
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    {summaryStats.map((stat, index) => (
                        <Card key={index} sx={{ flex: 1 }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" fontWeight="600" color="primary">
                                    {stat.month}
                                </Typography>
                                <Typography variant="h4" fontWeight="700" sx={{ my: 1 }}>
                                    {stat.utilization.toFixed(1)}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {stat.totalAllocated}h / {stat.totalCapacity}h
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {stat.departmentsWithData} departments
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>

                {/* Multiple Charts - 5 departments each */}
                {departmentGroups.map((departmentGroup, groupIndex) => (
                    <Box key={groupIndex} sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
                            Departments {groupIndex * 5 + 1} - {Math.min((groupIndex + 1) * 5, departments.length)}
                        </Typography>
                        <Box sx={{ height: 300, mt: 1 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getChartData(departmentGroup)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="department" />
                                    <YAxis
                                        label={{
                                            value:
                                                selectedView === 'utilization'
                                                    ? 'Utilization %'
                                                    : selectedView === 'allocated'
                                                    ? 'Allocated Hours'
                                                    : 'Capacity Hours',
                                            angle: -90,
                                            position: 'insideLeft'
                                        }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    {months.map((month, index) => (
                                        <Bar
                                            key={month.key}
                                            dataKey={month.shortLabel}
                                            fill={index === 0 ? '#2196F3' : index === 1 ? '#F44336' : '#FF9800'}
                                            name={month.label}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Box>
                ))}

                {/* Department Details */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Department Breakdown
                    </Typography>
                    <Stack spacing={2}>
                        {departments.map((dept) => {
                            const deptData = getChartData([dept])[0];
                            if (!deptData) return null;

                            return (
                                <Paper key={dept.id} sx={{ p: 2, backgroundColor: '#F8F9FA' }}>
                                    <Stack direction="row" spacing={3} alignItems="center">
                                        <Typography variant="subtitle1" fontWeight="600" sx={{ minWidth: 150 }}>
                                            {dept.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                                            {dept.resourceCount} resources
                                        </Typography>
                                        {months.map((month) => (
                                            <Box key={month.key} sx={{ textAlign: 'center', minWidth: 80 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {month.shortLabel}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight="600"
                                                    color={
                                                        selectedView === 'utilization' && (deptData[month.shortLabel] as number) > 100
                                                            ? 'error.main'
                                                            : 'text.primary'
                                                    }
                                                >
                                                    {selectedView === 'utilization'
                                                        ? `${deptData[month.shortLabel]}%`
                                                        : `${deptData[month.shortLabel]}h`}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default CapacityUtilizationChart;

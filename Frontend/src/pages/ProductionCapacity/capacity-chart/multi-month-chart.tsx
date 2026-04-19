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
    Card,
    CardContent,
    Grid,
    Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import { getCapacityDataByDateRange, departmentForPoductionCapacity } from 'services/production-capacity';
import type { IDepartment, IProjectHour, IProjects, IProjectConsumedHour } from '../interface';

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
    [key: string]: string | number;
}

const DepartmentCard = styled(Card)(({ theme }) => ({
    borderRadius: 12,
    border: '1px solid #E0E0E0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        transform: 'translateY(-2px)'
    }
}));

const UtilizationText = styled(Typography)<{ utilization: number }>(({ theme, utilization }) => ({
    fontWeight: 700,
    fontSize: '1.1rem',
    color: utilization > 100 ? '#E65100' : utilization > 80 ? '#F57C00' : '#2E7D32'
}));

const SummaryBox = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    textAlign: 'center',
    borderRadius: 16,
    border: '2px solid #E3F2FD',
    background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
    boxShadow: '0 4px 20px rgba(33, 150, 243, 0.15)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(33, 150, 243, 0.25)',
        borderColor: '#2196F3'
    }
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

const MultiMonthChart = () => {
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
                const [rangeRes, departmentsRes]: any = await Promise.all([
                    getCapacityDataByDateRange(months[0].key, months[2].key),
                    departmentForPoductionCapacity()
                ]);

                const fetchedProjects: IProjects[] = rangeRes.projects;
                const fetchedAllocatedCapacityData: Record<string, number> = rangeRes.allocatedCapacityData;

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
    }, [months]);

    // Calculate utilization data for chart
    const getChartData = (departmentGroup: Department[]): ChartData[] => {
        return departmentGroup.map((dept) => {
            const chartItem: ChartData = {
                department: dept.name
            };

            months.forEach((month) => {
                let totalAllocatedHours = 0;
                projects.forEach((project) => {
                    const key = `${project.id}_${dept.id}_${month.key}`;
                    totalAllocatedHours += capacityData[key] || 0;
                });

                const [year, monthNum] = month.key.split('-').map(Number);
                const workingDays = getWorkingDaysInMonth(year, monthNum - 1);
                const departmentCapacity = dept.resourceCount * 8 * workingDays;

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

    // Calculate department utilization for breakdown cards
    const getDepartmentUtilization = (dept: Department, monthKey: string) => {
        let totalAllocatedHours = 0;
        projects.forEach((project) => {
            const key = `${project.id}_${dept.id}_${monthKey}`;
            totalAllocatedHours += capacityData[key] || 0;
        });

        const [year, monthNum] = monthKey.split('-').map(Number);
        const workingDays = getWorkingDaysInMonth(year, monthNum - 1);
        const departmentCapacity = dept.resourceCount * 8 * workingDays;

        const utilization = departmentCapacity > 0 ? (totalAllocatedHours / departmentCapacity) * 100 : 0;
        return Number(utilization.toFixed(2));
    };

    // Split departments into groups of 5
    const departmentGroups = [];
    for (let i = 0; i < departments.length; i += 5) {
        departmentGroups.push(departments.slice(i, i + 5));
    }

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{ p: 2, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: 1 }}>
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
                </Box>
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading utilization data...</Typography>
            </Box>
        );
    }

    return (
        <>
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

            {/* Summary Boxes */}
            <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
                {summaryStats.map((stat, index) => (
                    <SummaryBox key={index} elevation={0} sx={{ flex: 1 }}>
                        <Typography variant="h5" fontWeight="700" color="primary" sx={{ mb: 1, fontSize: '1.25rem' }}>
                            {stat.month}
                        </Typography>
                        <Typography
                            variant="h3"
                            fontWeight="800"
                            sx={{
                                my: 2,
                                color: '#1976D2',
                                textShadow: '0 2px 4px rgba(25, 118, 210, 0.2)'
                            }}
                        >
                            {stat.utilization.toFixed(1)}%
                        </Typography>
                        <Box
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                borderRadius: 2,
                                p: 1.5,
                                mb: 1
                            }}
                        >
                            <Typography variant="body1" fontWeight="600" color="text.primary">
                                {stat.totalAllocated.toLocaleString()}h / {stat.totalCapacity.toLocaleString()}h
                            </Typography>
                        </Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontWeight: 500,
                                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                borderRadius: 1,
                                px: 2,
                                py: 0.5,
                                display: 'inline-block'
                            }}
                        >
                            {stat.departmentsWithData} departments
                        </Typography>
                    </SummaryBox>
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

            {/* Department Breakdown Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                    Department Breakdown
                </Typography>
                <Grid container spacing={2}>
                    {departments.map((dept) => (
                        <Grid item xs={12} key={dept.id}>
                            <DepartmentCard>
                                <CardContent sx={{ py: 2 }}>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 0.5 }}>
                                                {dept.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {dept.resourceCount} resources
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={4} alignItems="center">
                                            {months.map((month) => {
                                                const utilization = getDepartmentUtilization(dept, month.key);
                                                return (
                                                    <Box key={month.key} sx={{ textAlign: 'center', minWidth: '80px' }}>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            {month.shortLabel}
                                                        </Typography>
                                                        <UtilizationText utilization={utilization}>
                                                            {utilization.toFixed(2)}%
                                                        </UtilizationText>
                                                    </Box>
                                                );
                                            })}
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </DepartmentCard>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </>
    );
};

export default MultiMonthChart;

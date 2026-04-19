import type React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const SummaryHeaderCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: '12px 8px',
    textAlign: 'center',
    minWidth: '100px',
    color: '#FFFFFF',
    borderRight: '1px solid rgba(255, 255, 255, 0.2)'
}));

const SummaryLabelCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: '12px 16px',
    textAlign: 'left',
    minWidth: '200px',
    color: '#FFFFFF',
    borderRight: '1px solid rgba(255, 255, 255, 0.2)'
}));

const SummaryDataCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: '12px 8px',
    textAlign: 'center',
    color: '#FFFFFF',
    borderRight: '1px solid rgba(255, 255, 255, 0.2)'
}));

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
}

interface Month {
    key: string;
    label: string;
}

interface ResourceSummaryProps {
    projects: Project[];
    departments: Department[];
    months: Month[];
    getCurrentValue: (projectId: string, department: string, month: string) => number;
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

function ResourceSummary({ projects, departments, months, getCurrentValue }: ResourceSummaryProps) {
    // Calculate total allocated hours for each department per month
    const getTotalAllocatedHours = (departmentId: string, monthKey: string) => {
        let total = 0;
        projects.forEach((project) => {
            total += getCurrentValue(project.id, departmentId, monthKey);
        });
        return total;
    };

    // Calculate current resources capacity (resources * 8 hours * working days in month)
    const getCurrentResourcesCapacity = (department: Department, monthKey: string) => {
        const [year, month] = monthKey.split('-').map(Number);
        const actualWorkingDays = getWorkingDaysInMonth(year, month - 1); // month - 1 because Date month is 0-indexed
        return department.resourceCount * 8 * actualWorkingDays;
    };

    // Calculate current resource required (difference between allocated and capacity, in resources)
    const getCurrentResourceRequired = (department: Department, monthKey: string) => {
        const allocated = getTotalAllocatedHours(department.id, monthKey);
        const capacity = getCurrentResourcesCapacity(department, monthKey);
        const [year, month] = monthKey.split('-').map(Number);
        const actualWorkingDays = getWorkingDaysInMonth(year, month - 1);
        return Math.ceil((allocated - capacity) / (8 * actualWorkingDays)); // Convert back to number of resources needed
    };

    // Calculate utilization percentage
    const getUtilization = (department: Department, monthKey: string) => {
        const allocated = getTotalAllocatedHours(department.id, monthKey);
        const capacity = getCurrentResourcesCapacity(department, monthKey);
        return capacity > 0 ? ((allocated / capacity) * 100).toFixed(1) : '0.0';
    };

    const getRequiredResourcesHours = (departmentId: string, monthKey: string) => {
        const allocated = getTotalAllocatedHours(departmentId, monthKey);
        const department = departments.find((d) => d.id === departmentId);
        const capacity = department ? getCurrentResourcesCapacity(department, monthKey) : 0;
        return allocated - capacity; // Calculate difference
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                Resource Capacity Overview
            </Typography>
            <TableContainer component={Paper} elevation={1}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <SummaryHeaderCell sx={{ backgroundColor: '#6e529e' }}>Metrics</SummaryHeaderCell>
                            {months.map((month) => (
                                <SummaryHeaderCell key={month.key} sx={{ backgroundColor: '#6e529e' }}>
                                    {month.label}
                                </SummaryHeaderCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Total Allocated Hours (Demand) - This is the "Resource Capacity Hours" from user's formula numerator */}
                        <TableRow>
                            <SummaryLabelCell sx={{ backgroundColor: '#8B4513' }}>Resource Capacity Hours</SummaryLabelCell>
                            {months.map((month) => {
                                const totalAllocatedHours = departments.reduce(
                                    (sum, dept) => sum + getTotalAllocatedHours(dept.id, month.key),
                                    0
                                );
                                return (
                                    <SummaryDataCell key={month.key} sx={{ backgroundColor: '#8B4513' }}>
                                        {totalAllocatedHours.toLocaleString()}
                                    </SummaryDataCell>
                                );
                            })}
                        </TableRow>

                        {/* Total Available Capacity (Hours) - This is the "Current Resources Capacity" from user's formula denominator */}
                        <TableRow>
                            <SummaryLabelCell sx={{ backgroundColor: '#4CAF50' }}>Current Resources Capacity</SummaryLabelCell>
                            {months.map((month) => {
                                const totalAvailableCapacityHours = departments.reduce(
                                    (sum, dept) => sum + getCurrentResourcesCapacity(dept, month.key),
                                    0
                                );
                                return (
                                    <SummaryDataCell key={month.key} sx={{ backgroundColor: '#4CAF50' }}>
                                        {totalAvailableCapacityHours.toLocaleString()}
                                    </SummaryDataCell>
                                );
                            })}
                        </TableRow>

                        {/* Net Capacity (Hours) - This is the "Required Resources Hours" from user's second formula */}
                        <TableRow>
                            <SummaryLabelCell sx={{ backgroundColor: '#F44336' }}>Required Resources Hours</SummaryLabelCell>
                            {months.map((month) => {
                                const totalAvailableCapacityHours = departments.reduce(
                                    (sum, dept) => sum + getCurrentResourcesCapacity(dept, month.key),
                                    0
                                );
                                const totalAllocatedHours = departments.reduce(
                                    (sum, dept) => sum + getTotalAllocatedHours(dept.id, month.key),
                                    0
                                );
                                const netCapacityHours = totalAllocatedHours - totalAvailableCapacityHours;
                                return (
                                    <SummaryDataCell key={month.key} sx={{ backgroundColor: '#F44336' }}>
                                        {netCapacityHours > 0 ? `+${netCapacityHours.toLocaleString()}` : netCapacityHours.toLocaleString()}
                                    </SummaryDataCell>
                                );
                            })}
                        </TableRow>

                        {/* Net Resources Needed/Free (in resources) */}
                        <TableRow>
                            <SummaryLabelCell sx={{ backgroundColor: '#FF8A80' }}>Current Resource Required</SummaryLabelCell>
                            {months.map((month) => {
                                const totalResourcesNeeded = departments.reduce(
                                    (sum, dept) => sum + getCurrentResourceRequired(dept, month.key),
                                    0
                                );
                                return (
                                    <SummaryDataCell key={month.key} sx={{ backgroundColor: '#FF8A80' }}>
                                        {totalResourcesNeeded > 0 ? `+${totalResourcesNeeded}` : totalResourcesNeeded}
                                    </SummaryDataCell>
                                );
                            })}
                        </TableRow>

                        {/* Utilization Percentage */}
                        <TableRow>
                            <SummaryLabelCell sx={{ backgroundColor: '#E91E63' }}>Resources Utilization</SummaryLabelCell>
                            {months.map((month) => {
                                const totalAvailableCapacityHours = departments.reduce(
                                    (sum, dept) => sum + getCurrentResourcesCapacity(dept, month.key),
                                    0
                                );
                                const totalAllocatedHours = departments.reduce(
                                    (sum, dept) => sum + getTotalAllocatedHours(dept.id, month.key),
                                    0
                                );
                                const utilization =
                                    totalAvailableCapacityHours > 0
                                        ? ((totalAllocatedHours / totalAvailableCapacityHours) * 100).toFixed(1)
                                        : '0.0';
                                return (
                                    <SummaryDataCell key={month.key} sx={{ backgroundColor: '#E91E63' }}>
                                        {utilization}%
                                    </SummaryDataCell>
                                );
                            })}
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Department-wise breakdown */}
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Department-wise Resource Status
                </Typography>
                <TableContainer component={Paper} elevation={1}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <SummaryHeaderCell sx={{ backgroundColor: '#6e529e', textAlign: 'left' }}>Department</SummaryHeaderCell>
                                <SummaryHeaderCell sx={{ backgroundColor: '#6e529e' }}>Resources</SummaryHeaderCell>
                                {months.map((month) => (
                                    <SummaryHeaderCell key={month.key} sx={{ backgroundColor: '#6e529e' }}>
                                        {month.label}
                                    </SummaryHeaderCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {departments.map((dept) => (
                                <TableRow key={dept.id}>
                                    <TableCell sx={{ fontWeight: 600, backgroundColor: '#F5F5F5' }}>{dept.name}</TableCell>
                                    <TableCell sx={{ textAlign: 'center', backgroundColor: '#F5F5F5', fontWeight: 600 }}>
                                        {dept.resourceCount}
                                    </TableCell>
                                    {months.map((month) => {
                                        const capacity = getCurrentResourcesCapacity(dept, month.key);
                                        const allocated = getTotalAllocatedHours(dept.id, month.key);
                                        const resourcesNeeded = getCurrentResourceRequired(dept, month.key);
                                        const utilization = getUtilization(dept, month.key);

                                        const isOverCapacity = allocated > capacity;
                                        const cellColor = isOverCapacity ? '#FFEBEE' : '#E8F5E8';
                                        const textColor = isOverCapacity ? '#F44336' : '#4CAF50';

                                        return (
                                            <TableCell
                                                key={month.key}
                                                sx={{
                                                    textAlign: 'center',
                                                    backgroundColor: cellColor,
                                                    color: textColor,
                                                    fontWeight: 600
                                                }}
                                            >
                                                <Box>
                                                    <Typography variant="caption" display="block">
                                                        {allocated}h / {capacity}h
                                                    </Typography>
                                                    <Typography variant="caption" display="block">
                                                        {utilization}%
                                                    </Typography>
                                                    {resourcesNeeded !== 0 && (
                                                        <Typography variant="caption" display="block" sx={{ fontWeight: 700 }}>
                                                            {resourcesNeeded > 0
                                                                ? `Need +${resourcesNeeded}`
                                                                : `Free ${Math.abs(resourcesNeeded)}`}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}

export default ResourceSummary;

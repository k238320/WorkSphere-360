import type React from 'react';
import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Typography,
    Box,
    Chip,
    IconButton,
    Collapse,
    Stack,
    TablePagination
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 600,
    backgroundColor: '#6e529e', // Updated purple color
    color: '#FFFFFF !important', // Force white text with !important
    fontSize: '0.875rem',
    padding: '12px 8px',
    textAlign: 'center',
    minWidth: '100px',
    borderRight: '1px solid rgba(255, 255, 255, 0.2)',
    '& *': {
        color: '#FFFFFF !important'
    }
}));

const ProjectTableCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: '#FFFFFF',
    fontWeight: 500,
    padding: '12px 16px',
    borderRight: `1px solid ${theme.palette.grey[200]}`,
    borderBottom: `1px solid ${theme.palette.grey[200]}`
}));

const EditableCell = styled(TableCell)(({ theme }) => ({
    padding: '4px',
    textAlign: 'center',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    '&:hover': {
        backgroundColor: '#F8F9FA'
    },
    borderRight: `1px solid ${theme.palette.grey[200]}`
}));

// Define the Project and Department interfaces used internally
interface Project {
    id: string;
    name: string;
    type: string;
    pm: string;
    projectHours: Record<string, number>; // This is the LIMIT for the project per department
    consumedHours: Record<string, number>; // NEW: Consumed hours per department
}

interface Department {
    id: string;
    name: string;
    color: string;
    resourceCount: number;
}

interface Month {
    key: string;
    label: string;
}

interface CapacityTableProps {
    projects: Project[];
    departments: Department[];
    months: Month[];
    getCurrentValue: (projectId: string, department: string, month: string) => number;
    onCapacityChange: (projectId: string, department: string, month: string, hours: number) => void;
    userRole: 'super_admin' | 'team_lead';
    totalProjectsCount: number; // For pagination
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

// Super Admin Expandable Row Component
const SuperAdminProjectRow: React.FC<{
    project: Project;
    departments: Department[];
    months: Month[];
    getCurrentValue: (projectId: string, department: string, month: string) => number;
    onCapacityChange: (projectId: string, department: string, month: string, hours: number) => void;
}> = ({ project, departments, months, getCurrentValue, onCapacityChange }) => {
    const [open, setOpen] = useState(false);

    const getTotalHours = (projectId: string, department: string) => {
        let total = 0;
        months.forEach((month) => {
            total += getCurrentValue(projectId, department, month.key);
        });
        return total;
    };

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <ProjectTableCell>
                    <Stack spacing={1}>
                        <Typography variant="subtitle2" fontWeight="600">
                            {project.name}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label={project.type} size="small" color="primary" variant="outlined" />
                            <Typography variant="caption" color="text.secondary">
                                PM: {project.pm}
                            </Typography>
                        </Stack>
                    </Stack>
                </ProjectTableCell>
                {departments.map((dept) => {
                    const totalAllocatedHours = getTotalHours(project.id, dept.id);
                    const maxHours = project.projectHours[dept.id] || 0;
                    const consumedHours = project.consumedHours[dept.id] || 0;
                    const hasError = totalAllocatedHours + consumedHours > maxHours;

                    return (
                        <EditableCell key={dept.id}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                Limit: {maxHours}h
                            </Typography>
                            <Typography variant="body2" color="error" sx={{ mb: 0.5 }}>
                                Consumed: {consumedHours}h
                            </Typography>
                            <Typography variant="caption" color={hasError ? 'error' : 'success.main'} sx={{ fontWeight: 600 }}>
                                Total Allocated: {totalAllocatedHours}h
                            </Typography>
                            {hasError && (
                                <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                                    Exceeds limit!
                                </Typography>
                            )}
                        </EditableCell>
                    );
                })}
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={departments.length + 2}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ mb: 2 }}>
                                Monthly Capacity Allocation
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell
                                            sx={{ textAlign: 'left', backgroundColor: '#6e529e', color: '#FFFFFF !important' }}
                                        >
                                            Month
                                        </StyledTableCell>
                                        {departments.map((dept) => (
                                            <StyledTableCell key={dept.id} sx={{ backgroundColor: '#6e529e', color: '#FFFFFF !important' }}>
                                                {dept.name}
                                            </StyledTableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {months.map((month) => (
                                        <TableRow key={month.key}>
                                            <TableCell sx={{ fontWeight: 500 }}>{month.label}</TableCell>
                                            {departments.map((dept) => {
                                                const currentValue = getCurrentValue(project.id, dept.id, month.key);
                                                const maxHours = project.projectHours[dept.id] || 0;
                                                const consumedHours = project.consumedHours[dept.id] || 0;
                                                const hasError = currentValue + consumedHours > maxHours;

                                                return (
                                                    <EditableCell key={dept.id}>
                                                        <TextField
                                                            type="number"
                                                            value={currentValue}
                                                            onChange={(e) => {
                                                                const hours = Number.parseInt(e.target.value) || 0;
                                                                onCapacityChange(project.id, dept.id, month.key, hours);
                                                            }}
                                                            size="small"
                                                            inputProps={{
                                                                min: 0,
                                                                max: Math.max(0, maxHours - consumedHours),
                                                                style: { textAlign: 'center' }
                                                            }}
                                                            sx={{
                                                                width: '100px',
                                                                '& .MuiOutlinedInput-root': {
                                                                    '& fieldset': {
                                                                        borderColor: hasError ? '#F44336' : 'divider',
                                                                        borderWidth: hasError ? '2px' : '1px'
                                                                    },
                                                                    backgroundColor: hasError ? '#FFEBEE' : 'transparent'
                                                                }
                                                            }}
                                                            error={hasError}
                                                        />
                                                        {hasError && (
                                                            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                                                Exceeds limit ({maxHours}h)
                                                            </Typography>
                                                        )}
                                                    </EditableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

// Team Lead Flat Table Component
const TeamLeadTable: React.FC<{
    project: Project;
    departments: Department[];
    months: Month[];
    getCurrentValue: (projectId: string, department: string, month: string) => number;
    onCapacityChange: (projectId: string, department: string, month: string, hours: number) => void;
}> = ({ project, departments, months, getCurrentValue, onCapacityChange }) => {
    const getTotalHours = (projectId: string, department: string) => {
        let total = 0;
        months.forEach((month) => {
            total += getCurrentValue(projectId, department, month.key);
        });
        return total;
    };

    return (
        <TableRow key={project.id}>
            <ProjectTableCell>
                <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight="600">
                        {project.name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={project.type} size="small" color="primary" variant="outlined" />
                        <Typography variant="caption" color="text.secondary">
                            PM: {project.pm}
                        </Typography>
                    </Stack>
                    {/* Show department totals and consumed hours */}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {departments.map((dept) => {
                            const totalAllocatedHours = getTotalHours(project.id, dept.id);
                            const maxHours = project.projectHours[dept.id] || 0;
                            const consumedHours = project.consumedHours[dept.id] || 0;
                            const remainingHours = Math.max(0, maxHours - consumedHours);
                            const hasError = totalAllocatedHours > remainingHours;

                            return (
                                <Typography
                                    key={dept.id}
                                    variant="caption"
                                    color={hasError ? 'error' : 'success.main'}
                                    sx={{ fontWeight: 600 }}
                                >
                                    {dept.name}: {totalAllocatedHours} / {remainingHours}h (
                                    <Typography component="span" variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        Total: {maxHours}h
                                    </Typography>
                                    ,{' '}
                                    <Typography component="span" variant="caption" color="error" sx={{ fontWeight: 600 }}>
                                        Consumed: {consumedHours}h
                                    </Typography>
                                    ){' '}
                                </Typography>
                            );
                        })}
                    </Stack>
                </Stack>
            </ProjectTableCell>
            {months.map((month) => (
                <EditableCell key={month.key}>
                    <Stack spacing={1}>
                        {departments.map((dept) => {
                            const currentValue = getCurrentValue(project.id, dept.id, month.key);
                            const maxHours = project.projectHours[dept.id] || 0;
                            const consumedHours = project.consumedHours[dept.id] || 0;
                            const remainingHours = Math.max(0, maxHours - consumedHours);
                            const hasError = currentValue > remainingHours;

                            return (
                                <Box key={dept.id} sx={{ mb: 1 }}>
                                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                                        {dept.name}
                                    </Typography>
                                    <TextField
                                        type="number"
                                        value={currentValue}
                                        onChange={(e) => {
                                            const hours = Number.parseInt(e.target.value) || 0;
                                            onCapacityChange(project.id, dept.id, month.key, hours);
                                        }}
                                        size="small"
                                        inputProps={{
                                            min: 0,
                                            max: remainingHours,
                                            style: { textAlign: 'center' }
                                        }}
                                        sx={{
                                            width: '100px',
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: hasError ? '#F44336' : 'divider',
                                                    borderWidth: hasError ? '2px' : '1px'
                                                },
                                                backgroundColor: hasError ? '#FFEBEE' : 'transparent'
                                            }
                                        }}
                                        error={hasError}
                                    />
                                </Box>
                            );
                        })}
                    </Stack>
                </EditableCell>
            ))}
        </TableRow>
    );
};

function CapacityTable({
    projects,
    departments,
    months,
    getCurrentValue,
    onCapacityChange,
    userRole,
    totalProjectsCount
}: CapacityTableProps) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Default rows per page

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(Number.parseInt(event.target.value, 10));
        setPage(0); // Reset to first page when rows per page changes
    };

    const displayedProjects = projects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Helper function for summary calculations
    const getOverallMonthlyAllocatedHours = (departmentId: string, monthKey: string) => {
        let total = 0;
        projects.forEach((project) => {
            total += getCurrentValue(project.id, departmentId, monthKey);
        });
        return total;
    };

    const getOverallMonthlyCapacity = (department: Department, monthKey: string) => {
        const [year, month] = monthKey.split('-').map(Number);
        const actualWorkingDays = getWorkingDaysInMonth(year, month - 1);
        return department.resourceCount * 8 * actualWorkingDays;
    };

    const getOverallMonthlyResourceRequired = (department: Department, allocatedHours: number, monthKey: string) => {
        const capacity = getOverallMonthlyCapacity(department, monthKey);
        const [year, month] = monthKey.split('-').map(Number);
        const actualWorkingDays = getWorkingDaysInMonth(year, month - 1);
        const difference = allocatedHours - capacity;
        return Math.ceil(difference / (8 * actualWorkingDays)); // Convert back to number of resources needed
    };

    const getOverallMonthlyUtilization = (department: Department, allocatedHours: number, monthKey: string) => {
        const capacity = getOverallMonthlyCapacity(department, monthKey);
        return capacity > 0 ? ((allocatedHours / capacity) * 100).toFixed(1) : '0.0';
    };

    const renderSummaryRows = () => {
        // colSpan for the label cell:
        // Super Admin: 1 (expand/collapse) + 1 (Project Details) = 2
        // Team Lead: 1 (Project Details)
        const colSpanForProjectDetails = userRole === 'super_admin' ? 2 : 1;

        return (
            <>
                {/* Resource Capacity Hours (Total Allocated Hours) */}
                <TableRow>
                    <StyledTableCell
                        colSpan={colSpanForProjectDetails}
                        sx={{ backgroundColor: '#8B4513', color: '#FFFFFF !important', textAlign: 'left' }}
                    >
                        Resource Capacity Hours
                    </StyledTableCell>
                    {userRole === 'super_admin' &&
                        departments.map((dept) => {
                            const totalAllocatedForDept = months.reduce(
                                (sum, month) => sum + getOverallMonthlyAllocatedHours(dept.id, month.key),
                                0
                            );
                            return (
                                <StyledTableCell key={dept.id} sx={{ backgroundColor: '#8B4513', color: '#FFFFFF !important' }}>
                                    {totalAllocatedForDept.toLocaleString()}
                                </StyledTableCell>
                            );
                        })}
                    {months.map((month) => {
                        const totalAllocatedForMonth = departments.reduce(
                            (sum, dept) => sum + getOverallMonthlyAllocatedHours(dept.id, month.key),
                            0
                        );
                        return (
                            <StyledTableCell key={month.key} sx={{ backgroundColor: '#8B4513', color: '#FFFFFF !important' }}>
                                {totalAllocatedForMonth.toLocaleString()}
                            </StyledTableCell>
                        );
                    })}
                </TableRow>

                {/* Current Resources Capacity (Total Available Capacity) */}
                <TableRow>
                    <StyledTableCell
                        colSpan={colSpanForProjectDetails}
                        sx={{ backgroundColor: '#4CAF50', color: '#FFFFFF !important', textAlign: 'left' }}
                    >
                        Current Resources Capacity
                    </StyledTableCell>
                    {userRole === 'super_admin' &&
                        departments.map((dept) => {
                            const totalCapacityForDept = months.reduce((sum, month) => sum + getOverallMonthlyCapacity(dept, month.key), 0);
                            return (
                                <StyledTableCell key={dept.id} sx={{ backgroundColor: '#4CAF50', color: '#FFFFFF !important' }}>
                                    {totalCapacityForDept.toLocaleString()}
                                </StyledTableCell>
                            );
                        })}
                    {months.map((month) => {
                        const totalCapacityForMonth = departments.reduce(
                            (sum, dept) => sum + getOverallMonthlyCapacity(dept, month.key),
                            0
                        );
                        return (
                            <StyledTableCell key={month.key} sx={{ backgroundColor: '#4CAF50', color: '#FFFFFF !important' }}>
                                {totalCapacityForMonth.toLocaleString()}
                            </StyledTableCell>
                        );
                    })}
                </TableRow>

                {/* Required Resources Hours (Net Capacity Hours) */}
                <TableRow>
                    <StyledTableCell
                        colSpan={colSpanForProjectDetails}
                        sx={{ backgroundColor: '#F44336', color: '#FFFFFF !important', textAlign: 'left' }}
                    >
                        Required Resources Hours
                    </StyledTableCell>
                    {userRole === 'super_admin' &&
                        departments.map((dept) => {
                            const totalAllocatedForDept = months.reduce(
                                (sum, month) => sum + getOverallMonthlyAllocatedHours(dept.id, month.key),
                                0
                            );
                            const totalCapacityForDept = months.reduce((sum, month) => sum + getOverallMonthlyCapacity(dept, month.key), 0);
                            const netCapacityHoursDept = totalAllocatedForDept - totalCapacityForDept;
                            return (
                                <StyledTableCell key={dept.id} sx={{ backgroundColor: '#F44336', color: '#FFFFFF !important' }}>
                                    {netCapacityHoursDept > 0
                                        ? `+${netCapacityHoursDept.toLocaleString()}`
                                        : netCapacityHoursDept.toLocaleString()}
                                </StyledTableCell>
                            );
                        })}
                    {months.map((month) => {
                        const totalAllocatedForMonth = departments.reduce(
                            (sum, dept) => sum + getOverallMonthlyAllocatedHours(dept.id, month.key),
                            0
                        );
                        const totalCapacityForMonth = departments.reduce(
                            (sum, dept) => sum + getOverallMonthlyCapacity(dept, month.key),
                            0
                        );
                        const netCapacityHours = totalAllocatedForMonth - totalCapacityForMonth;
                        return (
                            <StyledTableCell key={month.key} sx={{ backgroundColor: '#F44336', color: '#FFFFFF !important' }}>
                                {netCapacityHours > 0 ? `+${netCapacityHours.toLocaleString()}` : netCapacityHours.toLocaleString()}
                            </StyledTableCell>
                        );
                    })}
                </TableRow>

                {/* Current Resource Required (Net Resources Needed/Free) */}
                <TableRow>
                    <StyledTableCell
                        colSpan={colSpanForProjectDetails}
                        sx={{ backgroundColor: '#FF8A80', color: '#FFFFFF !important', textAlign: 'left' }}
                    >
                        Current Resource Required
                    </StyledTableCell>
                    {userRole === 'super_admin' &&
                        departments.map((dept) => {
                            const totalAllocatedForDept = months.reduce(
                                (sum, month) => sum + getOverallMonthlyAllocatedHours(dept.id, month.key),
                                0
                            );
                            const resourcesNeeded = getOverallMonthlyResourceRequired(dept, totalAllocatedForDept, months[0].key); // Pass a monthKey for calculation
                            return (
                                <StyledTableCell key={dept.id} sx={{ backgroundColor: '#FF8A80', color: '#FFFFFF !important' }}>
                                    {resourcesNeeded > 0 ? `+${resourcesNeeded}` : resourcesNeeded}
                                </StyledTableCell>
                            );
                        })}
                    {months.map((month) => {
                        const totalResourcesNeededForMonth = departments.reduce(
                            (sum, dept) =>
                                sum +
                                getOverallMonthlyResourceRequired(dept, getOverallMonthlyAllocatedHours(dept.id, month.key), month.key),
                            0
                        );
                        return (
                            <StyledTableCell key={month.key} sx={{ backgroundColor: '#FF8A80', color: '#FFFFFF !important' }}>
                                {totalResourcesNeededForMonth > 0 ? `+${totalResourcesNeededForMonth}` : totalResourcesNeededForMonth}
                            </StyledTableCell>
                        );
                    })}
                </TableRow>

                {/* Resources Utilization */}
                <TableRow>
                    <StyledTableCell
                        colSpan={colSpanForProjectDetails}
                        sx={{ backgroundColor: '#E91E63', color: '#FFFFFF !important', textAlign: 'left' }}
                    >
                        Resources Utilization
                    </StyledTableCell>
                    {userRole === 'super_admin' &&
                        departments.map((dept) => {
                            const totalAllocatedForDept = months.reduce(
                                (sum, month) => sum + getOverallMonthlyAllocatedHours(dept.id, month.key),
                                0
                            );
                            const utilization = getOverallMonthlyUtilization(dept, totalAllocatedForDept, months[0].key); // Pass a monthKey for calculation
                            return (
                                <StyledTableCell key={dept.id} sx={{ backgroundColor: '#E91E63', color: '#FFFFFF !important' }}>
                                    {utilization}%
                                </StyledTableCell>
                            );
                        })}
                    {months.map((month) => {
                        const totalAllocatedForMonth = departments.reduce(
                            (sum, dept) => sum + getOverallMonthlyAllocatedHours(dept.id, month.key),
                            0
                        );
                        const totalCapacityForMonth = departments.reduce(
                            (sum, dept) => sum + getOverallMonthlyCapacity(dept, month.key),
                            0
                        );
                        const utilization =
                            totalCapacityForMonth > 0 ? ((totalAllocatedForMonth / totalCapacityForMonth) * 100).toFixed(1) : '0.0';
                        return (
                            <StyledTableCell key={month.key} sx={{ backgroundColor: '#E91E63', color: '#FFFFFF !important' }}>
                                {utilization}%
                            </StyledTableCell>
                        );
                    })}
                </TableRow>
            </>
        );
    };

    return (
        <TableContainer component={Paper} elevation={1}>
            <Table>
                <TableHead>
                    <TableRow>
                        {userRole === 'super_admin' && <StyledTableCell />} {/* Empty cell for expand/collapse */}
                        <StyledTableCell
                            sx={{ minWidth: '250px', textAlign: 'left', backgroundColor: '#6e529e', color: '#FFFFFF !important' }}
                        >
                            Project Details
                        </StyledTableCell>
                        {userRole === 'super_admin' &&
                            departments.map((dept) => (
                                <StyledTableCell key={dept.id} sx={{ backgroundColor: '#6e529e', color: '#FFFFFF !important' }}>
                                    {dept.name}
                                    <Typography
                                        variant="caption"
                                        display="block"
                                        sx={{ opacity: 0.9, fontWeight: 400, color: '#FFFFFF !important' }}
                                    >
                                        Project Hours
                                    </Typography>
                                </StyledTableCell>
                            ))}
                        {months.map((month) => (
                            <StyledTableCell key={month.key} sx={{ backgroundColor: '#6e529e', color: '#FFFFFF !important' }}>
                                {month.label}
                            </StyledTableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {displayedProjects.map((project) =>
                        userRole === 'super_admin' ? (
                            <SuperAdminProjectRow
                                key={project.id}
                                project={project}
                                departments={departments}
                                months={months}
                                getCurrentValue={getCurrentValue}
                                onCapacityChange={onCapacityChange}
                            />
                        ) : (
                            <TeamLeadTable
                                key={project.id}
                                project={project} // Pass single project for TeamLeadTable to render its row
                                departments={departments}
                                months={months}
                                getCurrentValue={getCurrentValue}
                                onCapacityChange={onCapacityChange}
                            />
                        )
                    )}
                    {renderSummaryRows()}
                </TableBody>
            </Table>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={totalProjectsCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </TableContainer>
    );
}

export default CapacityTable;

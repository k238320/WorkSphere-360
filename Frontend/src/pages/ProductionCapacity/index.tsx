import { useState, useEffect, useMemo } from 'react'; // Import useMemo
import CapacityTable from './capacity-table';
import SaveConfirmationDialog from './save-confirmation-dialog';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Stack,
    Button,
    Alert,
    CircularProgress,
    TextField, // Import TextField for search
    FormControl, // Import FormControl for Select
    InputLabel, // Import InputLabel for Select
    Select, // Import Select for dropdowns
    MenuItem // Import MenuItem for Select options
} from '@mui/material';
import { Save, Refresh, Search } from '@mui/icons-material'; // Import Search and Warning icons
import { toast } from 'react-toastify'; // Changed to react-hot-toast
import { departmentForPoductionCapacity, productionCapacity, updateProjectHours } from 'services/production-capacity';
import type { IDepartment, IProjectHour, IProjects, IProjectConsumedHour } from './interface'; // Import IProjectConsumedHour
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import type { UpdateProjectHourItemDto, UpdateProjectHoursDto } from './dto/update-project-hour.dto';
import useAuth from 'hooks/useAuth';

interface User {
    role: 'super_admin' | 'team_lead';
    department?: string;
}

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

interface ValidationIssue {
    projectId: string;
    projectName: string;
    departmentId: string;
    departmentName: string;
    totalAllocated: number;
    consumedHours: number;
    projectLimit: number;
    type: 'hard_limit' | 'consumed_conflict';
}

const ProductionCapacity = () => {
    const { user } = useAuth();
    const [userRole] = useState<User>({
        role: user?.role?.name == 'Super Admin' ? 'super_admin' : 'team_lead',
        department: user?.resource?.department_id
    });
    const [projects, setProjects] = useState<Project[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [capacityData, setCapacityData] = useState<any>({}); // Saved data (allocated hours)
    const [pendingChanges, setPendingChanges] = useState<any>({}); // Unsaved changes
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [hasErrors, setHasErrors] = useState(false);
    const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]); // NEW: Track validation issues
    const [loading, setLoading] = useState(true);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPm, setSelectedPm] = useState('');
    const [selectedContractType, setSelectedContractType] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');

    // Generate next 6 months from current month
    const generateMonths = () => {
        const months = [];
        const currentDate = new Date();

        for (let i = 0; i < 6; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
            months.push({
                key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
                label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            });
        }
        return months;
    };

    const [months] = useState(generateMonths());

    // State to hold all original projects fetched from API
    const [allProjects, setAllProjects] = useState<IProjects[]>([]);

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

                    // NEW: Process consumed hours
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
                        consumedHours: consumedHoursMap // NEW
                    };
                });
                setAllProjects(fetchedProjects); // Store original fetched projects
                setProjects(mappedProjects); // Set projects for display (will be filtered later)
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

    // Filter options derived from allProjects
    const uniquePms = useMemo(() => {
        const pms = new Set<string>();
        allProjects.forEach((p) => {
            if (p.project_manager_details?.[0]?.name) {
                pms.add(p.project_manager_details[0].name);
            }
        });
        return Array.from(pms).sort();
    }, [allProjects]);

    const uniqueContractTypes = useMemo(() => {
        const types = new Set<string>();
        allProjects.forEach((p) => {
            if (p.project_contract_type?.name) {
                types.add(p.project_contract_type.name);
            }
        });
        return Array.from(types).sort();
    }, [allProjects]);

    const uniqueDepartments = useMemo(() => {
        return departments.map((d) => d.name).sort();
    }, [departments]);

    // Filter projects based on search and dropdowns
    const filteredProjects = useMemo(() => {
        let currentFilteredProjects = projects;

        if (searchTerm) {
            currentFilteredProjects = currentFilteredProjects.filter(
                (project) =>
                    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    project.pm.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedPm) {
            currentFilteredProjects = currentFilteredProjects.filter((project) => project.pm === selectedPm);
        }

        if (selectedContractType) {
            currentFilteredProjects = currentFilteredProjects.filter((project) => project.type === selectedContractType);
        }

        if (selectedDepartment) {
            // Filter by department requires checking if the project has any allocated hours for that department
            // or if the project's limits include that department.
            // For simplicity, we'll check if the project has a limit defined for the selected department.
            const selectedDeptId = departments.find((d) => d.name === selectedDepartment)?.id;
            if (selectedDeptId) {
                currentFilteredProjects = currentFilteredProjects.filter((project) =>
                    Object.keys(project.projectHours).includes(selectedDeptId)
                );
            }
        }

        return currentFilteredProjects;
    }, [projects, searchTerm, selectedPm, selectedContractType, selectedDepartment, departments]);

    // Filter departments based on user role
    const getVisibleDepartments = () => {
        if (userRole.role === 'super_admin') {
            return departments;
        }
        return departments.filter((dept) => dept.id === userRole.department);
    };

    // Check if there are unsaved changes
    const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;

    // NEW: Enhanced validation with detailed issue tracking
    const validateChanges = () => {
        return validateChangesWithData(pendingChanges);
    };

    const handleCapacityChange = (projectId: string, departmentId: string, month: string, hours: number) => {
        const key = `${projectId}_${departmentId}_${month}`;
        const newPendingChanges = { ...pendingChanges };

        // Always store the value, including 0
        newPendingChanges[key] = hours;

        const project = projects.find((p) => p.id === projectId);
        const department = departments.find((d) => d.id === departmentId);
        if (project && department) {
            const projectHoursLimit = project.projectHours[departmentId] || 0;
            const consumedHoursForDept = project.consumedHours[departmentId] || 0;

            let totalHoursAcrossMonths = 0;
            months.forEach((m) => {
                const monthKey = `${projectId}_${departmentId}_${m.key}`;
                const monthHours = newPendingChanges[monthKey] !== undefined ? newPendingChanges[monthKey] : capacityData[monthKey] || 0;
                totalHoursAcrossMonths += monthHours;
            });

            // Enhanced validation messages
            if (consumedHoursForDept > projectHoursLimit) {
                toast.error(
                    `⚠️ CRITICAL: Consumed hours (${consumedHoursForDept}h) already exceed project limit (${projectHoursLimit}h) for ${
                        project.name
                    } - ${department.name.toUpperCase()}. Please update project limits or review consumed hours.`
                );
            } else if (totalHoursAcrossMonths + consumedHoursForDept > projectHoursLimit) {
                const remainingHours = Math.max(0, projectHoursLimit - consumedHoursForDept);
                toast.error(
                    `Total allocated (${totalHoursAcrossMonths}h) + consumed (${consumedHoursForDept}h) = ${
                        totalHoursAcrossMonths + consumedHoursForDept
                    }h exceeds project limit (${projectHoursLimit}h) for ${
                        project.name
                    } - ${department.name.toUpperCase()}. Maximum allocatable: ${remainingHours}h`
                );
            } else if (hours === 0) {
                toast.success(`✅ Set ${project.name} - ${department.name.toUpperCase()} to 0 hours for ${month}`);
            }
        }

        // Update pending changes first
        setPendingChanges(newPendingChanges);

        // Run validation immediately after state update
        setTimeout(() => {
            const hasValidationErrors = validateChangesWithData(newPendingChanges);
            if (!hasValidationErrors) {
                toast.success('✅ All validation issues resolved! You can now save your changes.');
            }
        }, 100);
    };

    // NEW: Enhanced validation with detailed issue tracking that accepts pending changes
    const validateChangesWithData = (pendingChangesData: any) => {
        let errors = false;
        const issues: ValidationIssue[] = [];

        projects.forEach((project) => {
            getVisibleDepartments().forEach((dept) => {
                let totalHoursAllocatedForProjectDept = 0;
                months.forEach((month) => {
                    const monthKey = `${project.id}_${dept.id}_${month.key}`;
                    const monthHours =
                        pendingChangesData[monthKey] !== undefined ? pendingChangesData[monthKey] : capacityData[monthKey] || 0;
                    totalHoursAllocatedForProjectDept += monthHours;
                });

                const projectLimit = project.projectHours[dept.id] || 0;
                const consumedHoursForDept = project.consumedHours[dept.id] || 0;

                // Check if consumed hours alone exceed the project limit
                if (consumedHoursForDept > projectLimit) {
                    issues.push({
                        projectId: project.id,
                        projectName: project.name,
                        departmentId: dept.id,
                        departmentName: dept.name,
                        totalAllocated: totalHoursAllocatedForProjectDept,
                        consumedHours: consumedHoursForDept,
                        projectLimit: projectLimit,
                        type: 'consumed_conflict'
                    });
                    // CHANGED: Don't block saving for consumed_conflict - this requires backend changes
                    // errors = true
                }
                // Check if total (allocated + consumed) exceeds project limit
                else if (totalHoursAllocatedForProjectDept + consumedHoursForDept > projectLimit) {
                    issues.push({
                        projectId: project.id,
                        projectName: project.name,
                        departmentId: dept.id,
                        departmentName: dept.name,
                        totalAllocated: totalHoursAllocatedForProjectDept,
                        consumedHours: consumedHoursForDept,
                        projectLimit: projectLimit,
                        type: 'hard_limit'
                    });
                    errors = true; // Only block saving for hard_limit errors
                }
            });
        });

        setValidationIssues(issues);
        setHasErrors(errors);
        return errors;
    };

    const handleSave = () => {
        const hasValidationErrors = validateChanges();
        if (hasValidationErrors) {
            toast.error('Please fix validation errors before saving');
            return;
        }
        setShowSaveDialog(true);
    };

    const handleSaveConfirm = async () => {
        try {
            const updatesToSend: UpdateProjectHourItemDto[] = Object.entries(pendingChanges).map(([key, hours]) => {
                const [projectId, departmentId, monthKey] = key.split('_');
                return {
                    projectId,
                    departmentId,
                    monthKey,
                    hours: hours as number
                };
            });

            const updateDto: UpdateProjectHoursDto = { updates: updatesToSend };
            await updateProjectHours(updateDto);

            const newCapacityData = { ...capacityData, ...pendingChanges };
            setCapacityData(newCapacityData);
            setPendingChanges({});
            setShowSaveDialog(false);
            setHasErrors(false);
            setValidationIssues([]); // Clear validation issues
            toast.success(`Successfully saved ${Object.keys(pendingChanges).length} capacity changes!`);
        } catch (error) {
            console.error('Failed to save changes:', error);
            toast.error('Failed to save changes. Please try again.');
        }
    };

    const handleSaveCancel = () => {
        setShowSaveDialog(false);
    };

    const handleDiscardChanges = () => {
        setPendingChanges({});
        setHasErrors(false);
        setValidationIssues([]); // Clear validation issues
        toast.info('All unsaved changes have been discarded');
    };

    const getCurrentValue = (projectId: string, department: string, month: string) => {
        const key = `${projectId}_${department}_${month}`;
        return pendingChanges[key] !== undefined ? pendingChanges[key] : capacityData[key] || 0;
    };

    return (
        <Box>
            <Paper elevation={2} sx={{ mt: 3, p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="h5" component="h2" fontWeight="600">
                            Resource Capacity Planning
                        </Typography>
                        <Chip label={userRole.role === 'super_admin' ? 'Super Admin' : 'Team Lead'} color="primary" size="small" />
                    </Stack>

                    {hasUnsavedChanges && (
                        <Stack direction="row" spacing={2}>
                            <Button variant="outlined" startIcon={<Refresh />} onClick={handleDiscardChanges} color="secondary">
                                Discard Changes
                            </Button>
                            <Button variant="contained" startIcon={<Save />} onClick={handleSave} color="primary" disabled={hasErrors}>
                                Save Changes ({Object.keys(pendingChanges).length})
                            </Button>
                        </Stack>
                    )}
                </Stack>

                {/* NEW: Enhanced validation alerts */}
                {hasUnsavedChanges && (
                    <Alert severity={hasErrors ? 'error' : validationIssues.length > 0 ? 'warning' : 'info'} sx={{ mb: 3 }}>
                        {hasErrors ? (
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Validation Issues Found (Blocking Save):</strong>
                                </Typography>
                                {validationIssues
                                    .filter((issue) => issue.type === 'hard_limit')
                                    .map((issue, index) => (
                                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                                            •{' '}
                                            <strong>
                                                {issue.projectName} - {issue.departmentName}:
                                            </strong>{' '}
                                            Total allocated ({issue.totalAllocated}h) + consumed ({issue.consumedHours}h) ={' '}
                                            {issue.totalAllocated + issue.consumedHours}h exceeds limit ({issue.projectLimit}h)
                                        </Typography>
                                    ))}
                            </Box>
                        ) : validationIssues.length > 0 ? (
                            <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>⚠️ Warning - Consumed Hours Issues (Can still save):</strong>
                                </Typography>
                                {validationIssues
                                    .filter((issue) => issue.type === 'consumed_conflict')
                                    .map((issue, index) => (
                                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                                            •{' '}
                                            <strong>
                                                {issue.projectName} - {issue.departmentName}:
                                            </strong>{' '}
                                            Consumed hours ({issue.consumedHours}h) exceed project limit ({issue.projectLimit}h) - requires
                                            project limit update
                                        </Typography>
                                    ))}
                                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                    These issues require updating project limits or consumed hours in the system, but you can still save
                                    capacity allocations.
                                </Typography>
                            </Box>
                        ) : (
                            `You have ${Object.keys(pendingChanges).length} unsaved changes. Don't forget to save your work!`
                        )}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Loading data...</Typography>
                    </Box>
                ) : (
                    <Box sx={{ mt: 3 }}>
                        {/* Filter Section */}
                        <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
                            <TextField
                                label="Search Project"
                                variant="outlined"
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search sx={{ mr: 1 }} />
                                }}
                                sx={{ minWidth: 200 }}
                            />
                            {/* <FormControl size="small" sx={{ minWidth: 180 }}>
                                <InputLabel>Project Manager</InputLabel>
                                <Select value={selectedPm} label="Project Manager" onChange={(e) => setSelectedPm(e.target.value)}>
                                    <MenuItem value="">
                                        <em>All</em>
                                    </MenuItem>
                                    {uniquePms.map((pm) => (
                                        <MenuItem key={pm} value={pm}>
                                            {pm}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 180 }}>
                                <InputLabel>Contract Type</InputLabel>
                                <Select
                                    value={selectedContractType}
                                    label="Contract Type"
                                    onChange={(e) => setSelectedContractType(e.target.value)}
                                >
                                    <MenuItem value="">
                                        <em>All</em>
                                    </MenuItem>
                                    {uniqueContractTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 180 }}>
                                <InputLabel>Department</InputLabel>
                                <Select
                                    value={selectedDepartment}
                                    label="Department"
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                >
                                    <MenuItem value="">
                                        <em>All</em>
                                    </MenuItem>
                                    {uniqueDepartments.map((dept) => (
                                        <MenuItem key={dept} value={dept}>
                                            {dept}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl> */}
                        </Stack>

                        <CapacityTable
                            projects={filteredProjects} // Pass filtered projects
                            departments={getVisibleDepartments()}
                            months={months}
                            getCurrentValue={getCurrentValue}
                            onCapacityChange={handleCapacityChange}
                            userRole={userRole.role}
                            totalProjectsCount={filteredProjects.length} // Pass count of filtered projects for pagination
                        />
                    </Box>
                )}
            </Paper>

            <SaveConfirmationDialog
                open={showSaveDialog}
                onConfirm={handleSaveConfirm}
                onCancel={handleSaveCancel}
                changesCount={Object.keys(pendingChanges).length}
                changes={pendingChanges}
                projects={projects}
                departments={departments}
                validationIssues={validationIssues}
            />
        </Box>
    );
};

export default ProductionCapacity;

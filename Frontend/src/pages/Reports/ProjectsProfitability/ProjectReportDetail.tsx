import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { toast } from 'react-toastify';
import { getProjectDetails } from 'services/projectService';

interface Project {
    id: string;
    name: string;
}

interface Resource {
    id: string;
    name: string;
}

interface Allocation {
    id: string;
    startDate: string;
    endDate: string;
    taskHours: number;
    isCompleted: boolean;
    resource: Resource;
    department?: string;
    perDateAllocation: PerDateAllocation[];
}

interface PerDateAllocation {
    date: string;
    taskHours?: number;
    isLeave?: boolean;
    isHoliday?: boolean;
}

interface ITask {
    id: string;
    name: string;
    status: string;
    completionDate: string;
    actualCompletionDate?: string;
    description: string;
    allocations: Allocation[];
}

interface DepartmentWiseTasks {
    [departmentName: string]: ITask[];
}

interface IProjectReportDetailResponse {
    project: Project;
    departmentWiseTasks: DepartmentWiseTasks;
}

const ProjectReportDetail = () => {
    const { id } = useParams();
    const [projectDetails, setProjectDetails] = useState<IProjectReportDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const dispatch = useDispatch();

    const fetchProjectDetails = async (projectId: string) => {
        dispatch(spinLoaderShow(true));

        try {
            const response: any = await getProjectDetails(projectId);

            setProjectDetails(response);
        } catch (err) {
            toast.error('Something went wrong while fetching the project details.');
            setError('Failed to load project details.');
        } finally {
            dispatch(spinLoaderShow(false));
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProjectDetails(id);
        }
    }, [id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Project Report: {projectDetails?.project?.name || 'N/A'}
            </Typography>

            {projectDetails?.departmentWiseTasks &&
                Object.entries(projectDetails.departmentWiseTasks).map(([departmentName, tasks]) => (
                    <Accordion key={departmentName}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">{departmentName || 'Unassigned'}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {tasks?.map((task) => (
                                <Box key={task.id} mb={3}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Task: {task.name || 'No Name'}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Status: {task.status || 'Unknown'}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Completion Date: {task.completionDate ? new Date(task.completionDate).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        dangerouslySetInnerHTML={{
                                            __html: `Description: ${task.description || 'No Description'}`
                                        }}
                                    />

                                    {task.allocations?.length > 0 && (
                                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Resource</TableCell>
                                                        <TableCell>Start Date</TableCell>
                                                        <TableCell>End Date</TableCell>
                                                        <TableCell>Hours</TableCell>
                                                        <TableCell>Status</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {task.allocations.map((alloc) => (
                                                        <TableRow key={alloc.id}>
                                                            <TableCell>{alloc.resource?.name || 'Unassigned'}</TableCell>
                                                            <TableCell>
                                                                {alloc.startDate ? new Date(alloc.startDate).toLocaleDateString() : 'N/A'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {alloc.endDate ? new Date(alloc.endDate).toLocaleDateString() : 'N/A'}
                                                            </TableCell>
                                                            <TableCell>{alloc.taskHours || 0}</TableCell>
                                                            <TableCell>{alloc.isCompleted ? 'Completed' : 'In Progress'}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </Box>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                ))}
        </Box>
    );
};

export default ProjectReportDetail;

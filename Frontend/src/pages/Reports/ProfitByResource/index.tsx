import React, { useState, useEffect } from 'react';
import { IconChevronRight } from '@tabler/icons';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { TextField, FormControl, InputLabel, Select, MenuItem, Box, Button } from '@mui/material';
import SubCard from 'ui-component/cards/SubCard';
import ResourceTable from './ResourceTable';
import { Resource, ProposedHours, APIResourceEntry } from './types';
import './ProfitByResource.css';
import { getProfitByResource } from 'services/production-capacity';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { useDispatch } from 'react-redux';
import { getDepartmentCategory } from 'services/categoryService';
import { toast } from 'react-toastify';
import { getDepartmentWise } from 'services/resource';

const DEFAULT_DEPT_ID = '64eda63d56fd245f8b3b4c26';

const getCurrentMonthDates = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const toLocalDate = (date: Date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    return { startDate: toLocalDate(start), endDate: toLocalDate(end) };
};

const ProfitByResource: React.FC = () => {
    const { startDate: defaultStart, endDate: defaultEnd } = getCurrentMonthDates();

    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    const [startDate, setStartDate] = useState<string>(defaultStart);
    const [endDate, setEndDate] = useState<string>(defaultEnd);
    const [resourceFilter, setResourceFilter] = useState<string>('');
    const [departmentFilter, setDepartmentFilter] = useState<string>('');
    const [departmentData, setDepartmentData] = useState<any>([]);
    const [resourcesDropdown, setResourcesDropdown] = useState<Resource[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [proposed, setProposed] = useState<ProposedHours>({} as ProposedHours);

    const dispatch = useDispatch();

    const getDepartmentData = async () => {
        dispatch(spinLoaderShow(true));
        getDepartmentCategory()
            .then((res: any) => {
                setDepartmentData(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const handleChangeDepartment = (dept: any) => {
        if (dept) {
            dispatch(spinLoaderShow(true));
            getDepartmentWise(dept?.id)
                .then((res: any) => {
                    setResourcesDropdown(res);
                })
                .catch((err) => {
                    toast.error(err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        } else {
            setResourcesDropdown([]);
        }
    };

    const handleSearch = async () => {
        const departmentId = departmentFilter || DEFAULT_DEPT_ID;

        try {
            dispatch(spinLoaderShow(true));
            const res: any = await getProfitByResource(startDate, endDate, departmentId, resourceFilter);

            const apiResources: Resource[] = res.map((r: APIResourceEntry) => ({
                name: r.resourceName,
                rate: r.rate,
                department: r.departmentId,
                projects: Object.fromEntries(Object.entries(r.projects).map(([proj, val]) => [proj, val]))
            }));

            setResources(apiResources);

            const apiProposed: ProposedHours = {};
            if (res.length > 0) {
                const sampleProjects = Object.keys(res[0].projects);
                sampleProjects.forEach((proj) => {
                    apiProposed[proj] = res.reduce((sum: any, r: any) => sum + (r.projects[proj]?.proposedHours || 0), 0);
                });
            }
            setProposed(apiProposed);
        } catch (err) {
            console.error(err);
        } finally {
            dispatch(spinLoaderShow(false));
        }
    };

    useEffect(() => {
        getDepartmentData();
        setDepartmentFilter(DEFAULT_DEPT_ID);
        handleChangeDepartment({ id: DEFAULT_DEPT_ID });
    }, []);

    useEffect(() => {
        if (departmentFilter) {
            handleSearch();
        }
    }, [departmentFilter]);

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading="Resource productivity & profitability Report" icon title rightAlign />

            <SubCard>
                <Box className="filtersContainer" sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        label="Start Date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="medium"
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="medium"
                    />
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel id="department-label">Department</InputLabel>
                        <Select
                            labelId="department-label"
                            value={departmentFilter || DEFAULT_DEPT_ID}
                            onChange={(e) => {
                                setDepartmentFilter(e.target.value);
                                const selectedDept = departmentData.find((d: any) => d.id === e.target.value);
                                handleChangeDepartment(selectedDept);
                            }}
                            size="medium"
                        >
                            {departmentData.map((dept: any) => (
                                <MenuItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel id="resource-label">Resource</InputLabel>
                        <Select
                            labelId="resource-label"
                            value={resourceFilter}
                            onChange={(e) => setResourceFilter(e.target.value)}
                            size="medium"
                            disabled={!resourcesDropdown.length}
                        >
                            <MenuItem value="">All Resources</MenuItem>
                            {resourcesDropdown.map((res: any) => (
                                <MenuItem key={res.id} value={res.id}>
                                    {res.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleSearch()}
                        disabled={!departmentFilter}
                        sx={{ height: 40 }}
                    >
                        Search
                    </Button>
                </Box>
            </SubCard>

            <SubCard>
                <ResourceTable
                    resources={resources}
                    proposed={proposed}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    setPage={setPage}
                    setRowsPerPage={setRowsPerPage}
                />
            </SubCard>
        </>
    );
};

export default ProfitByResource;

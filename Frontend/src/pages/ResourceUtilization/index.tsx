import React, { useEffect, useState } from 'react';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import SubCard from 'ui-component/cards/SubCard';
import { IconChevronRight } from '@tabler/icons';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Grid,
    Button,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { AutoCompleteField } from 'ui-component/formsField/FormFields';
import { useForm } from 'react-hook-form';
import { getDepartmentCategory } from 'services/categoryService';
import useAuth from 'hooks/useAuth';
import { getDepartmentWise, resourceUtilization } from 'services/resource';
import { EmpLefe, ResourceUtilzation, ResourceUtilzationRes } from './interface';
import './style.css';

const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
];

const columns = [
    { id: 'emp_code', label: 'E. Code', minWidth: 10 },
    { id: 'name', label: 'Name', minWidth: 50 },
    { id: 'department', label: 'Department', minWidth: 50 },
    { id: 'No. of Leaves Availed', label: 'No. of Leaves Availed', minWidth: 50 },
    { id: 'monthly_hour', label: 'Monthly Hour', minWidth: 50 },
    { id: 'Allocation', label: 'Allocation', minWidth: 50 },
    { id: 'Utilization %', label: 'Utilization %', minWidth: 50 }
];

const ResourceUtilization = () => {
    const {
        control,
        register,
        reset,
        setError,
        formState: { errors },
        setValue,
        getValues,
        handleSubmit,
        watch
    }: any = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange'
    });
    const currentMonth: number = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [selectedStartMonth, setStartSelectedMonth] = useState(currentMonth);
    const [selectedEndMonth, setEndSelectedMonth] = useState(currentMonth);
    const [departmentData, setDepartmentData] = useState<any>([]);
    const [resources, setResources] = useState<any>([]);
    const [state, setState] = useState<ResourceUtilzation>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedDepartment, setSelectedDepartment] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();
    const dispatch = useDispatch();

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const getDepartmentData = async () => {
        dispatch(spinLoaderShow(true));
        getDepartmentCategory()
            .then((res: any) => {
                let selectedDeptId = '';
                if (['Associate Creative Director'].includes(user?.role?.name)) {
                    const filterdata = res?.filter((x: any) => x.id === user?.resource?.department_id);
                    setValue('department_id', user?.resource?.department_id);
                    handleChangeDepartment({ id: user?.resource?.department_id });
                    setDepartmentData(filterdata);
                } else {
                    selectedDeptId = '64eda63d56fd245f8b3b4c26';
                    setDepartmentData(res);
                }

                if (['Team Lead', 'Resource'].includes(user?.role?.name)) {
                    setValue('department_id', user?.resource?.department_id);
                    handleChangeDepartment({ id: user?.resource?.department_id });
                }

                if (['Resource'].includes(user?.role?.name)) {
                    setValue('resource_id', user?.resource?.id);
                }

                if (selectedDeptId) {
                    setValue('department_id', selectedDeptId);
                    onSearch();
                }

                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const handleChangeDepartment = (e: any) => {
        if (e) {
            dispatch(spinLoaderShow(true));

            getDepartmentWise(e?.id)
                .then((res: any) => {
                    setResources(res);
                })
                .catch((err) => {
                    toast.error(err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        } else {
            setResources([]);
        }
    };

    const selectedDepartmentId = watch('department_id');

    useEffect(() => {
        if (selectedDepartmentId && departmentData.length > 0) {
            const dept = departmentData.find((d: any) => d.id === selectedDepartmentId);
            if (dept) {
                setSelectedDepartment(dept);
            }
        }
    }, [selectedDepartmentId, departmentData]);

    const onSearch = () => {
        const getValue = getValues();

        const { department_id } = getValues();
        if (!department_id) {
            toast.warning('Please select a department before searching.');
            return;
        }

        const obj = {
            ...getValue,
            startmonth: selectedStartMonth,
            endtmonth: selectedEndMonth
        };

        // dispatch(spinLoaderShow(true));

        setLoading(true);

        resourceUtilization(obj)
            .then((res: any) => {
                let usersData = res?.users;

                usersData = usersData?.filter((x: ResourceUtilzationRes) => {
                    const email = x?.email;
                    return !(email && email.includes('+'));
                });

                setPage(0);
                setState(usersData as ResourceUtilzation);
            })
            .catch((err) => {
                toast.error(err);
            })
            .finally(() => {
                // dispatch(spinLoaderShow(false));
                setLoading(false);
            });
    };

    useEffect(() => {
        getDepartmentData();
    }, []);

    return (
        <React.Fragment>
            <Breadcrumbs separator={IconChevronRight} heading={'Resource Utilization'} icon title rightAlign />

            <SubCard>
                <Grid container display={'flex'} alignItems={'center'}>
                    <Grid container display={'flex'} alignItems={'center'} spacing={0}>
                        <Grid item xs={9} md={9} sm={9}>
                            <Grid container display={'flex'} alignItems={'center'}>
                                <Grid item xs={2} md={2} sm={2} sx={{ marginRight: '10px', marginTop: '10px' }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Start Month</InputLabel>
                                        <Select
                                            value={selectedStartMonth}
                                            onChange={(e) => setStartSelectedMonth(e.target.value as number)}
                                            label="Month"
                                        >
                                            {months.map((month) => (
                                                <MenuItem key={month.value} value={month.value}>
                                                    {month.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={2} md={2} sm={2} sx={{ marginRight: '10px', marginTop: '10px' }}>
                                    <FormControl fullWidth>
                                        <InputLabel>End Month</InputLabel>
                                        <Select
                                            value={selectedEndMonth}
                                            onChange={(e) => setEndSelectedMonth(e.target.value as number)}
                                            label="Month"
                                        >
                                            {months.map((month) => (
                                                <MenuItem key={month.value} value={month.value}>
                                                    {month.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {!['Team Lead', 'Resource'].includes(user?.role?.name) && (
                                    <Grid item xs={3} md={3} sm={3} sx={{ marginRight: '10px' }}>
                                        <AutoCompleteField
                                            errors={!!errors?.department_id}
                                            fieldName="department_id"
                                            autoComplete="off"
                                            label="Department Name *"
                                            control={control}
                                            setValue={setValue}
                                            options={departmentData}
                                            returnObject={false}
                                            iProps={{
                                                onChange: handleChangeDepartment
                                            }}
                                            isLoading={true}
                                            optionKey="id"
                                            optionValue="name"
                                            helperText={errors?.department_id && errors?.department_id?.message}
                                            valueGot={selectedDepartment}
                                        />
                                    </Grid>
                                )}

                                {!['Resource'].includes(user?.role?.name) && (
                                    <Grid item xs={3} md={3} sm={3} sx={{ marginRight: '10px' }}>
                                        <AutoCompleteField
                                            errors={!!errors?.resource_id}
                                            fieldName="resource_id"
                                            autoComplete="off"
                                            label="Resource Name *"
                                            control={control}
                                            setValue={setValue}
                                            options={resources}
                                            returnObject={false}
                                            isLoading={true}
                                            optionKey="id"
                                            optionValue="name"
                                            helperText={errors?.resource_id && errors?.resource_id?.message}
                                        />
                                    </Grid>
                                )}
                            </Grid>
                        </Grid>
                        <Grid item xs={2} md={2} sm={2} gap={2} display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
                            <Button onClick={onSearch} variant="contained">
                                Search
                            </Button>
                            {/* {state && (
                            <Button onClick={() => generatePDF(state)} variant="contained">
                                Download PDF
                            </Button>
                        )} */}
                        </Grid>
                    </Grid>
                </Grid>

                <TableContainer component={Paper} className="custom__table">
                    <Table>
                        <TableHead>
                            <TableRow style={{ background: '#6e529e' }}>
                                {columns?.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        style={{
                                            minWidth: column.minWidth,
                                            border: '1px solid #fff',
                                            color: '#fff',
                                            textAlign: 'center',
                                            fontSize: '12px',
                                            padding: '8px 16px'
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {state &&
                                state?.length > 0 &&
                                state?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row) => (
                                    <TableRow className={(+row.resourceUtilization || 0) < 80 ? 'low-utilization-row' : ''} key={row.id}>
                                        <TableCell align="center" style={{ width: '80px' }}>
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.employement_code}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.resource?.department?.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                <span>{row?.emp_leaves_count}</span>
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                <span>{row.workingHours}</span>
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                <span>{row?.per_date_allocation_count}</span>
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                <span>{row?.resourceUtilization}%</span>
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}

                            {loading ? (
                                <Typography>Loading...</Typography>
                            ) : (
                                state?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center">
                                            No data found.
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[rowsPerPage]}
                        component="animate"
                        count={state?.length ?? 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>
            </SubCard>
        </React.Fragment>
    );
};

export default ResourceUtilization;

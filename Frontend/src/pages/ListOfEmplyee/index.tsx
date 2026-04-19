import React, { useEffect, useState } from 'react';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import SubCard from 'ui-component/cards/SubCard';
import { IconChevronRight } from '@tabler/icons';
import { toast } from 'react-toastify';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { AutoCompleteField } from 'ui-component/formsField/FormFields';
import { useForm } from 'react-hook-form';

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
    TextField,
    Button,
    Typography,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
// import { getAttendance } from 'services/attendance';

import moment from 'moment';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getUserListingByAdmin } from 'services/userService';
import { getDepartmentCategory } from 'services/categoryService';

const columns = [
    // { id: 'image', label: 'Picture', minWidth: 25 },
    { id: 'emp_code', label: 'Name of Employee', minWidth: 25 },
    { id: 'email', label: 'Email', minWidth: 25 },
    { id: 'name', label: 'Department', minWidth: 25 },
    { id: 'department', label: 'Joining', minWidth: 25 },
    { id: 'dob', label: 'Date of Birth', minWidth: 25 },
    { id: 'checkin_time', label: 'Status', minWidth: 25 },
    { id: 'action', label: 'Action', minWidth: 25 }
];

const Index = () => {
    const {
        control,
        register,
        reset,
        setError,
        formState: { errors },
        setValue,
        getValues,
        handleSubmit
    }: any = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange'
    });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [state, setState] = useState<any>([]);
    const [name, setName] = useState('');
    const [department, setDepartment] = React.useState<any>(null);
    const [departmentData, setDepartmentData] = useState<any>([]);
    const [originalData, setOriginalData] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState('active');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const handleChangeDepartment = (e: any) => {
        if (e) {
            setDepartment(e?.id);
        } else {
            setDepartment(null);
        }
    };

    const onSearch = () => {
        debugger
        getEmployeData(department, name);
    };

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

    const getEmployeData = (department?: string, name?: string) => {
        dispatch(spinLoaderShow(true));
        getUserListingByAdmin(department, name)
            .then((res: any) => {
                let temp = res?.rows?.filter((x: any) => {
                    const email = x?.email;
                    if (email && email.includes('+')) {
                        return false; // Remove the data from the array
                    }
                    return true; // Keep the data in the array
                });

                setOriginalData(temp);
                filterData(temp, statusFilter);
            })
            .catch((err) => {
                toast.error('Some thing Went Wrong');
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const filterData = (data: any[], status: string) => {
        let filtered = [...data];

        if (status === 'active') {
            filtered = filtered.filter((x) => !x?.user_details?.[0]?.resignation_status);
        } else if (status === 'inactive') {
            filtered = filtered.filter((x) => x?.user_details?.[0]?.resignation_status);
        }

        setState(filtered);
        setPage(0);
    };

    useEffect(() => {
        getDepartmentData();
        dispatch(spinLoaderShow(true));
        getUserListingByAdmin()
            .then((res: any) => {
                let temp = res?.rows?.filter((x: any) => {
                    const email = x?.email;
                    if (email && email.includes('+')) {
                        return false; // Remove the data from the array
                    }
                    return true; // Keep the data in the array
                });

                setOriginalData(temp);
                filterData(temp, statusFilter);
            })
            .catch((err) => {
                toast.error('Some thing Went Wrong');
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    }, []);

    useEffect(() => {
        filterData(originalData, statusFilter);
    }, [statusFilter, name, department]);

    const handleUserId = (id: any) => {
        navigate(`/hr/${id}`);
    };

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'List of Employee'} icon title rightAlign />
            <Grid container display={'flex'}  alignItems={'center'} spacing={3}>
                <Grid item xs={4} md={4} sm={4} sx={{ marginBottom: '6px' }}>
                    <AutoCompleteField
                        // errors={!!errors?.department_id}
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
                    />
                </Grid>

                <Grid item xs={4} md={4} sm={4}>
                    <TextField
                        required
                        id="outlined-required"
                        label="Resource Name"
                        defaultValue=""
                        onChange={(e) => setName(e?.target?.value)}
                        sx={{ width: '100%' }}
                    />
                </Grid>

                <Grid item xs={2} md={2} sm={2}>
                    <FormControl fullWidth>
                        <InputLabel id="status-filter-label">Status</InputLabel>
                        <Select
                            labelId="status-filter-label"
                            id="status-filter"
                            value={statusFilter}
                            label="Status"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={2} md={2} sm={2}>
                    <Button onClick={onSearch} variant="contained">
                        Search
                    </Button>
                </Grid>
                {/* <DatePicker label="End Date" value={endTime} onChange={(newValue: any) => setEndTime(newValue)} /> */}
            </Grid>
            <SubCard>
                <TableContainer component={Paper} className="custom__table" sx={{ maxHeight: '100%' }}>
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
                                            padding: '8px 16px',
                                            fontSize: '12px'
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {state?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row: any) => (
                                <TableRow style={{ textAlign: 'center' }}>
                                    {/* <TableCell>
                                        {row.user_docs[0]?.power_picture && (
                                            <img
                                                // src={row.user_docs[0]?.power_picture}
                                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3lFwmrQJNngZGyYDMCE34RYZPQ7xIfkgN3g&usqp=CAU"
                                                alt={`Image of ${row.name}`}
                                                style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                                            />
                                        )}
                                    </TableCell> */}
                                    <TableCell style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <p
                                            style={{ fontSize: '12px', color: '#808080', lineHeight: 1.2, margin: 0 }}
                                            // textAlign={'center'} variant="paragraph" sx={{ lineHeight: 1.2 }}
                                        >
                                            {row?.name}
                                        </p>
                                        {/* <br /> */}
                                        {/* <span style={{ fontSize: '10px', color: '#808080' }}> */}
                                        <p
                                            style={{ fontSize: '10px', color: '#808080', lineHeight: 1.2, margin: 0 }}
                                            // textAlign={'center'}
                                            // variant="caption"
                                            // sx={{ fontSize: '10px', color: '#808080', lineHeight: 1.2 }}
                                        >
                                            {row?.designation}
                                        </p>
                                        {/* </span> */}
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.email || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.resource?.department?.name ? row?.resource?.department?.name : '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {/* {row?.user_details[0]?.date_of_joining ? row?.user_details[0]?.date_of_joining === "Invalid date"?row?.user_details[0]?.date_of_joining : '-'} */}
                                            {row?.user_details[0]?.date_of_joining
                                                ? row.user_details[0].date_of_joining === 'Invalid date'
                                                    ? '-'
                                                    : // : row.user_details[0].date_of_joining
                                                      // : {moment(row?.user_details[0].date_of_joining)?.format('Do MMM, YYYY')}
                                                      moment(row.user_details[0].date_of_joining)?.format('Do MMM, YYYY')
                                                : '-'}
                                        </Typography>

                                        {/* {console.log(row?.user_details[0]?.date_of_joining, 'row?.user_details?.date_of_joining')} */}
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.user_details[0]?.date_of_birth
                                                ? row?.user_details[0]?.date_of_birth === 'Invalid date'
                                                    ? '-'
                                                    : // : row?.user_details[0]?.date_of_birth
                                                      moment(row?.user_details[0]?.date_of_birth)?.format('Do MMM, YYYY')
                                                : '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        {/* <span>{row?.user_details[0]?.resignation_status ? 'true' : 'false'}</span> */}
                                        <span>
                                            {row?.user_details[0]?.resignation_status ? (
                                                <Typography textAlign={'center'} variant="caption">
                                                    <Chip
                                                        label="In Active"
                                                        sx={{
                                                            color: 'rgb(216, 67, 21);',
                                                            backgroundColor: 'rgb(251, 233, 231)',
                                                            fontSize: '12px'
                                                        }}
                                                    />
                                                </Typography>
                                            ) : (
                                                <Typography textAlign={'center'} variant="caption">
                                                    <Chip
                                                        label="Active"
                                                        sx={{
                                                            color: 'rgb(0, 200, 83)',
                                                            backgroundColor: 'rgba(185, 246, 202, 0.376)',
                                                            fontSize: '12px'
                                                        }}
                                                    />
                                                </Typography>
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <MoreVertIcon sx={{ cursor: 'pointer' }} onClick={() => handleUserId(row?.id)} />
                                    </TableCell>
                                </TableRow>
                            ))}
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
        </>
    );
};

export default Index;

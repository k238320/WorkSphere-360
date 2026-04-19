// import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';
// import { IconChevronRight } from '@tabler/icons';
// import moment from 'moment';
// import React, { useEffect, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { resourceListing } from 'services/resource';
// import SubCard from 'ui-component/cards/SubCard';
// import Breadcrumbs from 'ui-component/extended/Breadcrumbs';

// const columns = [
//     { id: 'emp_name', label: 'Name', minWidth: 25 },
//     { id: 'email', label: 'Email', minWidth: 25 },
//     { id: 'name', label: 'Department', minWidth: 25 },
//     { id: 'department', label: 'Show in Calendar', minWidth: 25 },
//     { id: 'action', label: 'Action', minWidth: 25 }
// ];

// const ManageCalendarResource = () => {
//     const [page, setPage] = useState(0);
//     const [rowsPerPage, setRowsPerPage] = useState(10);
//     const [state, setState] = useState<any>([]);

//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const handleChangePage = (event: any, newPage: any) => {
//         setPage(newPage);
//     };

//     const handleChangeRowsPerPage = (event: any) => {
//         setRowsPerPage(event.target.value);
//         setPage(0);
//     };

//     const getresourceListing = async () => {
//         try {
//             const data = await resourceListing();

//             setState(data);
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     useEffect(() => {
//         getresourceListing();
//     }, []);

//     console.log('state', state);

//     return (
//         <>
//             <Breadcrumbs separator={IconChevronRight} heading={'Manage Calendar Resource'} icon title rightAlign />

//             <SubCard>
//                 <TableContainer component={Paper} className="custom__table" sx={{ maxHeight: '100%' }}>
//                     <Table>
//                         <TableHead>
//                             <TableRow style={{ background: '#6e529e' }}>
//                                 {columns?.map((column, i) => (
//                                     <TableCell
//                                         key={i}
//                                         style={{
//                                             minWidth: column.minWidth,
//                                             border: '1px solid #fff',
//                                             color: '#fff',
//                                             textAlign: 'center',
//                                             padding: '8px 16px',
//                                             fontSize: '12px'
//                                         }}
//                                     >
//                                         {column.label}
//                                     </TableCell>
//                                 ))}
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {state?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row: any, i: number) => (
//                                 <TableRow style={{ textAlign: 'center' }} key={i}>
//                                     <TableCell style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
//                                         <p style={{ fontSize: '12px', color: '#808080', lineHeight: 1.2, margin: 0 }}>{row?.name}</p>
//                                     </TableCell>
//                                     <TableCell style={{ textAlign: 'center' }}>
//                                         <Typography textAlign={'center'} variant="caption">
//                                             {row?.user[0]?.email || '-'}
//                                         </Typography>
//                                     </TableCell>
//                                     <TableCell style={{ textAlign: 'center' }}>
//                                         <Typography textAlign={'center'} variant="caption">
//                                             {row?.department?.name ? row?.department?.name : '-'}
//                                         </Typography>
//                                     </TableCell>
//                                     <TableCell style={{ textAlign: 'center' }}>
//                                         <Typography textAlign={'center'} variant="caption">
//                                             {row?.show_in_calendar ? 'Yes' : 'No'}
//                                         </Typography>
//                                     </TableCell>
//                                     <TableCell style={{ textAlign: 'center' }}>
//                                         <span></span>
//                                     </TableCell>
//                                     {/* <TableCell style={{ textAlign: 'center' }}>
//                                         <MoreVertIcon sx={{ cursor: 'pointer' }} onClick={() => handleUserId(row?.id)} />
//                                     </TableCell> */}
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                     <TablePagination
//                         rowsPerPageOptions={[rowsPerPage]}
//                         component="animate"
//                         count={state?.length ?? 0}
//                         rowsPerPage={rowsPerPage}
//                         page={page}
//                         onPageChange={handleChangePage}
//                         onRowsPerPageChange={handleChangeRowsPerPage}
//                     />
//                 </TableContainer>
//             </SubCard>
//         </>
//     );
// };

// export default ManageCalendarResource;

import {
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    Checkbox,
    FormControlLabel,
    Grid,
    TextField,
    Button
} from '@mui/material';
import { IconChevronRight } from '@tabler/icons';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getDepartmentCategory } from 'services/categoryService';
import { multipleUpdate, resourceListing } from 'services/resource';
import { spinLoaderShow } from 'store/actions/spinLoader';
import SubCard from 'ui-component/cards/SubCard';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { AutoCompleteField } from 'ui-component/formsField/FormFields';

const columns = [
    { id: 'emp_name', label: 'Name', minWidth: 25 },
    { id: 'email', label: 'Email', minWidth: 25 },
    { id: 'name', label: 'Department', minWidth: 25 },
    { id: 'department', label: 'Show in Calendar', minWidth: 25 }
    // { id: 'action', label: 'Action', minWidth: 25 }
];

const ManageCalendarResource = () => {
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
    const [selected, setSelected] = useState<any[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [departmentData, setDepartmentData] = useState<any>([]);
    const [name, setName] = useState('');
    const [department, setDepartment] = React.useState<any>(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
        setSelectAll(false); // Reset select all on page change
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

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setSelectAll(isChecked);

        if (isChecked) {
            const currentPageRows = state.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
            setSelected(currentPageRows.map((row: any) => row.id));
        } else {
            setSelected([]);
        }
    };

    const handleSelect = (event: React.ChangeEvent<HTMLInputElement>, id: any) => {
        const isChecked = event.target.checked;

        if (isChecked) {
            setSelected((prevSelected) => [...prevSelected, id]);
        } else {
            setSelected((prevSelected) => prevSelected.filter((selectedId) => selectedId !== id));
        }
    };

    const getresourceListing = async (departmentId?: any, name?: any) => {
        try {
            dispatch(spinLoaderShow(true));
            const data = await resourceListing(departmentId, name);
            setState(data);
            dispatch(spinLoaderShow(false));
        } catch (error) {
            dispatch(spinLoaderShow(false));
            console.log(error);
        }
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

    const showInCalendar = async () => {
        if (selected?.length > 0) {
            dispatch(spinLoaderShow(true));
            try {
                const body = {
                    ids: selected,
                    show_in_calendar: true
                };

                const res = await multipleUpdate(body);

                dispatch(spinLoaderShow(false));

                if (res) {
                    toast.success('Calendar updated successfully');
                    setSelected([]);
                    setSelectAll(false);
                    getresourceListing(department, name);
                } else {
                    toast.error('Error updating');
                }
            } catch (error) {
                console.error(error);
                dispatch(spinLoaderShow(false));
            }
        } else {
            toast.error('Please select atleast one resource');
        }
    };

    const hideFormCalendar = async () => {
        if (selected?.length > 0) {
            dispatch(spinLoaderShow(true));
            try {
                const body = {
                    ids: selected,
                    show_in_calendar: false
                };

                const res = await multipleUpdate(body);

                dispatch(spinLoaderShow(false));

                if (res) {
                    toast.success('Calendar updated successfully');
                    setSelected([]);
                    setSelectAll(false);
                    getresourceListing(department, name);
                } else {
                    toast.error('Error updating');
                }
            } catch (error) {
                console.error(error);
                dispatch(spinLoaderShow(false));
            }
        } else {
            toast.error('Please select atleast one resource');
        }
    };

    const onSearch = async () => {
        getresourceListing(department, name);
    };

    useEffect(() => {
        getresourceListing();
        getDepartmentData();
    }, []);

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'Manage Calendar Resource'} icon title rightAlign />

            <Grid container display={'flex'} alignItems={'center'} spacing={3}>
                <Grid item xs={3} md={3} sm={3}>
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

                {/* <Grid item xs={5} md={5} sm={5}>
                    <TextField
                        required
                        id="outlined-required"
                        label="Resource Name"
                        defaultValue=""
                        onChange={(e) => setName(e?.target?.value)}
                        sx={{ width: '100%' }}
                    />
                </Grid> */}
                <Grid item xs={2} md={2} sm={2}>
                    <Button onClick={onSearch} variant="contained">
                        Search
                    </Button>
                </Grid>

                <Grid item xs={3} md={3} sm={3}></Grid>

                <Grid item xs={2} md={2} sm={2}>
                    <Button onClick={showInCalendar} variant="contained">
                        Show in Calender
                    </Button>
                </Grid>

                <Grid item xs={2} md={2} sm={2}>
                    <Button onClick={hideFormCalendar} variant="outlined">
                        Hide from Calender
                    </Button>
                </Grid>
            </Grid>

            <SubCard>
                <TableContainer component={Paper} className="custom__table" sx={{ maxHeight: '100%' }}>
                    <Table>
                        <TableHead>
                            <TableRow style={{ background: '#6e529e' }}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selected.length > 0 && selected.length < rowsPerPage}
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                {columns.map((column, i) => (
                                    <TableCell
                                        key={i}
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
                            {state.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: any, i: number) => (
                                <TableRow style={{ textAlign: 'center' }} key={i}>
                                    <TableCell padding="checkbox">
                                        <Checkbox checked={selected.includes(row.id)} onChange={(event) => handleSelect(event, row.id)} />
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <p style={{ fontSize: '12px', color: '#808080', lineHeight: 1.2, margin: 0 }}>{row?.name}</p>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.user[0]?.email || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.department?.name ? row?.department?.name : '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography
                                            textAlign={'center'}
                                            variant="caption"
                                            sx={{ color: row?.show_in_calendar ? 'green' : 'red' }}
                                        >
                                            {row?.show_in_calendar ? 'Yes' : 'No'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <span></span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[rowsPerPage]}
                        component="div"
                        count={state.length ?? 0}
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

export default ManageCalendarResource;

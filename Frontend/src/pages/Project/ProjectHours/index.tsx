import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Grid,
    Typography,
    Button,
    Chip,
    CircularProgress,
    TextField,
    TablePagination
} from '@mui/material';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import SubCard from 'ui-component/cards/SubCard';
import { IconChevronRight } from '@tabler/icons';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import React, { useEffect, useState } from 'react';
import { getResourceCategory } from 'services/Allocation/taskServices';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { AutoCompleteField } from 'ui-component/formsField/FormFields';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { resourceYearlyRecord } from 'services/attendance';
import useAuth from 'hooks/useAuth';
import moment from 'moment';
import { getDepartmentWise } from 'services/resource';
import { getProjectHourListing, getProjects } from 'services/projectService';
import { toast } from 'react-toastify';

const projectHours = () => {
    const {
        control,
        register,
        reset,
        setError,
        formState: { errors },
        setValue,
        getValues,
        handleSubmit
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange'
    });
    const { user } = useAuth();
    const dispatch = useDispatch();

    const [resource, setResource] = useState<any>([]);
    const [project, setProject] = useState<any>([]);
    const [state, setState] = useState<any>([]);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [projectName, setProjectName] = useState('');
    const [projectManagerName, setProjectManagerName] = useState<any>(null);

    const columns = [
        { id: 'Name', label: 'Name', minWidth: 25 },
        { id: 'UI/UX Design', label: 'UI/UX Design', minWidth: 25 },
        { id: 'Development', label: 'Development', minWidth: 25 },
        { id: 'SQA', label: 'SQA', minWidth: 25 },
        { id: 'UI Development', label: 'UI Development', minWidth: 25 },
        { id: 'DevOps', label: 'DevOps', minWidth: 25 },
        { id: 'NetSuite', label: 'NetSuite', minWidth: 25 },
        { id: '.Net', label: '.Net', minWidth: 25 },
        { id: 'Mobile Development', label: 'Mobile Development', minWidth: 25 },
        { id: 'MQL-Theme Based', label: 'MQL-Theme Based', minWidth: 25 },
        { id: 'Total Hours', label: 'Total Hours', minWidth: 25 },
        { id: 'Consumed Hours', label: 'Consumed Hours', minWidth: 25 }
    ];

    const mainApiHit = async () => {
        dispatch(spinLoaderShow(true));
        try {
            if (user?.role?.name == 'PM Lead' || user?.role?.name == 'Super Admin') {
                if (projectManagerName && projectManagerName != '') {
                    setRowsPerPage(100);
                }
                if (!projectManagerName) {
                    setRowsPerPage(25);
                }
                await getProjectHourListing(selectedProject, projectManagerName, page, rowsPerPage)
                    .then((res: any) => {
                        setState(() => res);
                    })
                    .catch((err) => {
                        toast.error('Some thing Went Wrong');
                    })
                    .finally(() => {
                        dispatch(spinLoaderShow(false));
                    });
            } else {
                dispatch(spinLoaderShow(false));
                toast.error('You are not authorized');
            }
        } catch (err: any) {
            toast.error(err);
            dispatch(spinLoaderShow(false));
        } finally {
            dispatch(spinLoaderShow(false));
        }
    };

    const onSearch = () => {
        setPage(0);
        mainApiHit();
    };

    const handleChangeEmployee = (e: any) => {
        if (e) {
            setProjectManagerName(e?.user?.id);
        } else {
            setProjectManagerName(null);
        }
    };
    const handleChangeProject = (e: any) => {
        if (e) {
            setSelectedProject(e.id);
        } else {
            setSelectedProject(null);
        }
    };

    const getDepartWiseData = async () => {
        dispatch(spinLoaderShow(true));
        getDepartmentWise('64eef8334a3912fea3a48ba8')
            .then((res) => {
                setResource(res);
            })
            .catch((err) => {
                toast.error('Error in fetching Departments.');
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };
    const getProjectsData = async () => {
        dispatch(spinLoaderShow(true));
        if (projectManagerName != null || projectManagerName != undefined || projectManagerName != '') {
            getProjects(projectManagerName)
                .then((res) => {
                    setProject(res);
                })
                .catch((err) => {
                    toast.error(err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        } else {
            getProjects(user?.id)
                .then((res) => {
                    setProject(res);
                })
                .catch((err) => {
                    toast.error(err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    useEffect(() => {
        getDepartWiseData();
        getProjectsData();
        // mainApiHit();
    }, []);
    useEffect(() => {
        mainApiHit();
    }, [page]);
    useEffect(() => {
        getProjectsData();
    }, [projectManagerName]);

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'Project Hours'} icon title rightAlign />
            <Grid container display={'flex'} alignItems={'center'} spacing={3} width={'100%'} sx={{ width: '100%' }}>
                <Grid item xs={3} md={3} sm={3} style={{ marginBottom: '7px' }}>
                    <AutoCompleteField
                        errors={!!errors?.resourceId}
                        fieldName="resourceId"
                        autoComplete="off"
                        label="Project Manager"
                        control={control}
                        setValue={setValue}
                        options={resource}
                        returnObject={false}
                        iProps={{
                            onChange: handleChangeEmployee
                        }}
                        isLoading={true}
                        optionKey="id"
                        optionValue="name"
                    />
                </Grid>

                <Grid item xs={3} md={3} sm={3} style={{ marginBottom: '7px' }}>
                    <AutoCompleteField
                        errors={!!errors?.resourceId}
                        fieldName="id"
                        autoComplete="off"
                        label="Project"
                        control={control}
                        setValue={setValue}
                        options={project}
                        returnObject={false}
                        iProps={{
                            onChange: handleChangeProject
                        }}
                        isLoading={true}
                        optionKey="id"
                        optionValue="name"
                    />
                </Grid>
                <Grid item xs={2} md={2} sm={2}>
                    <Button onClick={onSearch} variant="contained">
                        Search
                    </Button>
                </Grid>
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
                            {state?.projects?.map((row: any) => (
                                <TableRow style={{ textAlign: 'center' }}>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        {/* <p style={{ fontSize: '12px', color: '#808080', lineHeight: 1.2, margin: 0 }}>{row?.name}</p> */}
                                        {row?.name}
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.department?.['UI/UX Design']?.hours ||
                                            row?.department?.['UI/UX Design']?.consumed_hours ? (
                                                <>
                                                    <span
                                                        style={{
                                                            fontWeight: row?.department?.['UI/UX Design']?.isLoss ? '800' : 'normal',
                                                            color: row?.department?.['UI/UX Design']?.isLoss ? '#cf1b2d' : ''
                                                        }}
                                                    >
                                                        {row?.department?.['UI/UX Design']?.consumed_hours
                                                            ? row?.department?.['UI/UX Design']?.consumed_hours
                                                            : '0'}
                                                    </span>
                                                    {'/'}

                                                    <span style={{ fontWeight: '800' }}>{row?.department?.['UI/UX Design']?.hours}</span>
                                                </>
                                            ) : (
                                                '---'
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.department?.['Development ']?.hours ||
                                            row?.department?.['Development ']?.consumed_hours ? (
                                                <>
                                                    <span
                                                        style={{
                                                            fontWeight: row?.department?.['Development ']?.isLoss ? '800' : 'normal',
                                                            color: row?.department?.['Development ']?.isLoss ? '#cf1b2d' : ''
                                                        }}
                                                    >
                                                        {row?.department?.['Development ']?.consumed_hours
                                                            ? row?.department?.['Development ']?.consumed_hours
                                                            : '0'}
                                                    </span>
                                                    {'/'}

                                                    <span style={{ fontWeight: '800' }}>{row?.department?.['Development ']?.hours}</span>
                                                </>
                                            ) : (
                                                '---'
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.department?.['SQA']?.hours || row?.department?.['SQA']?.consumed_hours ? (
                                                <>
                                                    <span
                                                        style={{
                                                            fontWeight: row?.department?.['SQA']?.isLoss ? '800' : 'normal',
                                                            color: row?.department?.['SQA']?.isLoss ? '#cf1b2d' : ''
                                                        }}
                                                    >
                                                        {row?.department?.['SQA']?.consumed_hours
                                                            ? row?.department?.['SQA']?.consumed_hours
                                                            : '0'}
                                                    </span>
                                                    {'/'}

                                                    <span style={{ fontWeight: '800' }}>{row?.department?.['SQA']?.hours}</span>
                                                </>
                                            ) : (
                                                '---'
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.department?.['UI Development']?.hours ||
                                            row?.department?.['UI Development']?.consumed_hours ? (
                                                <>
                                                    <span
                                                        style={{
                                                            fontWeight: row?.department?.['UI Development']?.isLoss ? '800' : 'normal',
                                                            color: row?.department?.['UI Development']?.isLoss ? '#cf1b2d' : ''
                                                        }}
                                                    >
                                                        {row?.department?.['UI Development']?.consumed_hours
                                                            ? row?.department?.['UI Development']?.consumed_hours
                                                            : '0'}
                                                    </span>
                                                    {'/'}
                                                    <span style={{ fontWeight: '800' }}>{row?.department?.['UI Development']?.hours}</span>
                                                </>
                                            ) : (
                                                '---'
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.department?.['DevOps']?.hours || row?.department?.['DevOps']?.consumed_hours ? (
                                                <>
                                                    <span
                                                        style={{
                                                            fontWeight: row?.department?.['DevOps']?.isLoss ? '800' : 'normal',
                                                            color: row?.department?.['DevOps']?.isLoss ? '#cf1b2d' : ''
                                                        }}
                                                    >
                                                        {row?.department?.['DevOps']?.consumed_hours
                                                            ? row?.department?.['DevOps']?.consumed_hours
                                                            : '0'}
                                                    </span>
                                                    {'/'}
                                                    <span style={{ fontWeight: '800' }}>{row?.department?.['DevOps']?.hours}</span>
                                                </>
                                            ) : (
                                                '---'
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.department?.['NetSuite']?.hours || row?.department?.['NetSuite']?.consumed_hours ? (
                                                <>
                                                    <span
                                                        style={{
                                                            fontWeight: row?.department?.['NetSuite']?.isLoss ? '800' : 'normal',
                                                            color: row?.department?.['NetSuite']?.isLoss ? '#cf1b2d' : ''
                                                        }}
                                                    >
                                                        {row?.department?.['NetSuite']?.consumed_hours
                                                            ? row?.department?.['NetSuite']?.consumed_hours
                                                            : '0'}
                                                    </span>
                                                    {'/'}
                                                    <span style={{ fontWeight: '800' }}>{row?.department?.['NetSuite']?.hours}</span>
                                                </>
                                            ) : (
                                                '---'
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.department?.['.Net']?.hours || row?.department?.['.Net']?.consumed_hours ? (
                                                <>
                                                    <span
                                                        style={{
                                                            fontWeight: row?.department?.['.Net']?.isLoss ? '800' : 'normal',
                                                            color: row?.department?.['.Net']?.isLoss ? '#cf1b2d' : ''
                                                        }}
                                                    >
                                                        {row?.department?.['.Net']?.consumed_hours
                                                            ? row?.department?.['.Net']?.consumed_hours
                                                            : '0'}
                                                    </span>
                                                    {'/'}
                                                    <span style={{ fontWeight: '800' }}>{row?.department?.['.Net']?.hours}</span>
                                                </>
                                            ) : (
                                                '---'
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.department?.['Mobile Development']?.hours ||
                                            row?.department?.['Mobile Development']?.consumed_hours ? (
                                                <>
                                                    <span
                                                        style={{
                                                            fontWeight: row?.department?.['Mobile Development']?.isLoss ? '800' : 'normal',
                                                            color: row?.department?.['Mobile Development']?.isLoss ? '#cf1b2d' : ''
                                                        }}
                                                    >
                                                        {row?.department?.['Mobile Development']?.consumed_hours
                                                            ? row?.department?.['Mobile Development']?.consumed_hours
                                                            : '0'}
                                                    </span>
                                                    {'/'}
                                                    <span style={{ fontWeight: '800' }}>
                                                        {row?.department?.['Mobile Development']?.hours}
                                                    </span>
                                                </>
                                            ) : (
                                                '---'
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.department?.['MQL-Theme Based']?.hours ||
                                            row?.department?.['MQL-Theme Based']?.consumed_hours ? (
                                                <>
                                                    <span
                                                        style={{
                                                            fontWeight: row?.department?.['MQL-Theme Based']?.isLoss ? '800' : 'normal',
                                                            color: row?.department?.['MQL-Theme Based']?.isLoss ? '#cf1b2d' : ''
                                                        }}
                                                    >
                                                        {row?.department?.['MQL-Theme Based']?.consumed_hours
                                                            ? row?.department?.['MQL-Theme Based']?.consumed_hours
                                                            : '0'}
                                                    </span>
                                                    {'/'}
                                                    <span style={{ fontWeight: '800' }}>{row?.department?.['MQL-Theme Based']?.hours}</span>
                                                </>
                                            ) : (
                                                '---'
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>{row?.project_hours}</TableCell>
                                    <TableCell style={{ textAlign: 'center' }}>{row?.project_consumed_hours}</TableCell>

                                    {/* <TableCell style={{ textAlign: 'center' }}>
                                            <MoreVertIcon sx={{ cursor: 'pointer' }} onClick={() => handleUserId(row?.id)} />
                                        </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[rowsPerPage]}
                        component="animate"
                        count={state?.projectsCount}
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

export default projectHours;

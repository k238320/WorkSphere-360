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
    TextField,
    Button,
    Typography,
    Select,
    MenuItem,
    InputBase,
    InputLabel,
    FormControl,
    Card,
    Theme,
    styled
} from '@mui/material';
import moment from 'moment';
import Chip from '@mui/material/Chip';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from 'react-redux';
import useAuth from 'hooks/useAuth';
import { useForm } from 'react-hook-form';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { overallProfitability } from 'services/projectService';
import { toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import './index.css';
import { useNavigate } from 'react-router-dom';

const columns = [
    { id: 'name', label: 'Project Name', minWidth: 50 },
    { id: 'projectPlannedHours', label: 'Project Planned Hours', minWidth: 50 },
    { id: 'projectConsumedHours', label: 'Project Consumed Hours', minWidth: 40 },
    { id: 'budget', label: 'Budget', minWidth: 50 },
    { id: 'cost', label: 'Cost', minWidth: 50 },
    { id: 'profitOrLoss', label: 'Profit/Loss', minWidth: 50 },
    { id: 'status', label: 'Status', minWidth: 50 },
    { id: 'Action', label: 'Action', minWidth: 50 }
];

const statusOptions = [
    { id: 'All Records', name: 'All Records' },
    { id: 'Profit', name: 'Profit' },
    { id: 'Loss', name: 'Loss' }
];

const ProjectsProfitability = () => {
    const {}: any = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange'
    });

    const CustomInput = styled(InputBase)(({ theme }: { theme: Theme }) => ({
        'label + &': {
            marginTop: theme.spacing(3)
        },
        '& .MuiInputBase-input': {
            borderRadius: 4,
            position: 'relative',
            backgroundColor: '#6e529e',
            border: '1px solid #fff',
            fontSize: 12,
            color: '#fff',
            padding: '8px 26px 8px 12px',
            transition: theme.transitions.create(['border-color', 'box-shadow']),
            '&:focus': {
                borderRadius: 4,
                borderColor: '#fff',
                boxShadow: '0 0 0 0.2rem rgba(255,255,255,.25)'
            }
        }
    }));

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [state, setState] = useState<any>([]);
    const [filterData, setFilterData] = useState<any>([]);
    const [overall, setOverall] = useState({
        totalPlannedHours: 0,
        totalConsumedHours: 0,
        overallBudget: 0,
        overallCost: 0,
        overallProfitOrLoss: 0,
        status: 'Profit'
    });

    const [searchName, setSearchName] = useState('');

    const dispatch = useDispatch();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const handleStatusChange = (event: any) => {
        const selectedStatus = event.target.value;
        if (selectedStatus === 'All Records') {
            setFilterData(state);
            setPage(0);
        } else {
            const filtered = state.filter((item: any) => item.status === selectedStatus);
            setFilterData(filtered);
            setPage(0);
        }
    };

    const overallProfitabilityData = (name?: string) => {
        dispatch(spinLoaderShow(true));

        overallProfitability(name)
            .then((response: any) => {
                let res = response;

                let data = res?.paginatedProjects?.data;

                if (data?.length > 0) {
                    setOverall(res.overall);
                    setState(data);
                    setFilterData(data);
                } else {
                    setState([]);
                    setFilterData([]);
                }
                setPage(0);
            })
            .catch((err: any) => {
                toast.error('Some thing Went Wrong');
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const handleSearch = () => {
        overallProfitabilityData(searchName?.trim());
    };

    const onNavigate = (data: { id: string }) => () => {
        // Navigate to the report page with the provided id
        if (data?.id) {
            navigate(`/report/projects-profitability/${data.id}`);
        } else {
            console.error('ID is missing');
        }
    };

    useEffect(() => {
        overallProfitabilityData(searchName?.trim());
    }, []);

    return (
        <React.Fragment>
            <Breadcrumbs separator={IconChevronRight} heading={'Project productivity & profitability Report'} icon title rightAlign />

            <Grid container spacing={3} sx={{ marginBottom: 4 }}>
                <Grid item xs={12}>
                    <Card
                        sx={{
                            backgroundColor: '#4a148c',
                            color: '#fff',
                            padding: 3,
                            borderRadius: 3,
                            boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.3)'
                        }}
                    >
                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            sx={{ marginBottom: 3, textAlign: 'center', textTransform: 'uppercase' }}
                            color={'white'}
                        >
                            Overall Summary
                        </Typography>
                        <Grid container spacing={3} justifyContent="center">
                            <Grid item xs={6} sm={4} md={2}>
                                <Typography variant="body1" fontWeight="bold" textAlign="center">
                                    Total Planned Hours
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" textAlign="center" sx={{ color: '#FFD700' }}>
                                    {overall?.totalPlannedHours}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2}>
                                <Typography variant="body1" fontWeight="bold" textAlign="center">
                                    Total Consumed Hours
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" textAlign="center" sx={{ color: '#FFD700' }}>
                                    {overall?.totalConsumedHours}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2}>
                                <Typography variant="body1" fontWeight="bold" textAlign="center">
                                    Overall Budget
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" textAlign="center" sx={{ color: '#FFD700' }}>
                                    AED {overall?.overallBudget.toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2}>
                                <Typography variant="body1" fontWeight="bold" textAlign="center">
                                    Overall Cost
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" textAlign="center" sx={{ color: '#FFD700' }}>
                                    AED {overall?.overallCost.toLocaleString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2}>
                                <Typography variant="body1" fontWeight="bold" textAlign="center">
                                    Profit / Loss
                                </Typography>
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    textAlign="center"
                                    sx={{
                                        color: overall?.overallProfitOrLoss >= 0 ? '#00FF00' : '#FF6347'
                                    }}
                                >
                                    <div>AED {Math.abs(overall?.overallProfitOrLoss).toLocaleString()}</div>
                                </Typography>
                            </Grid>
                            <Grid item xs={6} sm={4} md={2} style={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body1" fontWeight="bold" textAlign="center">
                                    Status
                                </Typography>
                                <Chip
                                    label={overall?.status}
                                    color={overall?.status === 'Profit' ? 'success' : 'error'}
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        textAlign: 'center',
                                        borderRadius: '4px',
                                        padding: '4px 12px'
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
            </Grid>

            <SubCard>
                <Grid container display={'flex'} alignItems={'center'}>
                    <Grid container display={'flex'} alignItems={'center'} spacing={0} sx={{ marginBottom: '12px' }}>
                        {/* Input for Name Search */}
                        <Grid item xs={6} md={6} sm={6} sx={{ marginRight: '10px' }}>
                            <TextField
                                fullWidth
                                label="Search by Name"
                                variant="outlined"
                                size="small"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={2.5} md={2.5} sm={2.5} gap={1} display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
                            <Button variant="contained" onClick={handleSearch}>
                                Search
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

                <TableContainer
                    component={Paper}
                    className="custom__table"
                    sx={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}
                >
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ background: '#6e529e', color: '#fff' }}>
                                {columns?.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        sx={{
                                            minWidth: column.minWidth,
                                            border: '1px solid #fff',
                                            color: '#fff !important',
                                            textAlign: 'center',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            padding: '10px 16px',
                                            backgroundColor: '#6e529e',
                                            '&:hover': {
                                                backgroundColor: '#4b3a7d'
                                            }
                                        }}
                                    >
                                        {column.id === 'status' ? (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {column.label}
                                                <Select
                                                    value=""
                                                    onChange={handleStatusChange}
                                                    displayEmpty
                                                    input={<CustomInput />}
                                                    sx={{
                                                        marginLeft: '8px',
                                                        color: '#fff !important',
                                                        backgroundColor: '#6e529e',
                                                        border: '1px solid #fff',
                                                        fontSize: '12px',
                                                        height: '30px',
                                                        '& .MuiSelect-icon': {
                                                            color: '#fff'
                                                        }
                                                    }}
                                                >
                                                    {statusOptions.map((option) => (
                                                        <MenuItem key={option.id} value={option.id}>
                                                            {option.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </div>
                                        ) : (
                                            column.label
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filterData?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">
                                        <Typography variant="subtitle1" color="textSecondary">
                                            No records found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filterData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row: any) => (
                                    <TableRow
                                        key={row.id}
                                        sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                                        onClick={onNavigate({ id: row.id })}
                                    >
                                        <TableCell align="center">
                                            <Typography variant="body2" sx={{ color: '#000' }}>
                                                {row?.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <Typography variant="body2">{row?.projectPlannedHours}</Typography>
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <Typography variant="body2">{row?.projectConsumedHours}</Typography>
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <Typography variant="body2">{row?.budget}</Typography>
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ color: row?.cost > row?.budget ? '#f44336' : '#4caf50' }}>
                                                {row?.cost}
                                            </Typography>
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            sx={{
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ color: row?.profitOrLoss < 0 ? '#f44336' : '#4caf50' }}>
                                                AED {Math.abs(row?.profitOrLoss).toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2">
                                                {row?.status === 'Profit' ? (
                                                    <Chip
                                                        label={row?.status?.slice(0, 1) + row?.status?.slice(1).toLowerCase()}
                                                        sx={{
                                                            color: 'rgb(0, 200, 83)',
                                                            backgroundColor: 'rgba(185, 246, 202, 0.376)',
                                                            fontSize: '12px',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label={row?.status?.slice(0, 1) + row?.status?.slice(1).toLowerCase()}
                                                        sx={{
                                                            color: 'rgb(216, 67, 21)',
                                                            backgroundColor: 'rgb(251, 233, 231)',
                                                            fontSize: '12px',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                )}
                                            </Typography>
                                        </TableCell>
                                        <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                            <MoreVertIcon
                                                dis-able={user?.role !== 'Super Admin'}
                                                sx={{
                                                    cursor: 'pointer',
                                                    '&:hover': { color: '#6e529e' }
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[rowsPerPage]}
                        component="div"
                        count={filterData?.length ?? 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                            '& .MuiTablePagination-selectIcon': {
                                color: '#6e529e'
                            },
                            '& .MuiTablePagination-caption': {
                                fontSize: '14px',
                                color: '#6e529e'
                            }
                        }}
                    />
                </TableContainer>
            </SubCard>
        </React.Fragment>
    );
};

export default ProjectsProfitability;

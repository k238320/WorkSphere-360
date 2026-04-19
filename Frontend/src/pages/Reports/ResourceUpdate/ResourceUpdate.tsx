/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import {
    Grid,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination,
    TableContainer,
    Paper,
    Typography,
    TextField,
    Autocomplete
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { spinLoaderShow } from 'store/actions/spinLoader';

// services
import { getAllDesignations, getAllCapacities, getAllRates, resourceAll, updateResourceCapacityRecord } from 'services/resource';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';

export default function ResourceListWithUpdate() {
    const dispatch = useDispatch();

    const [resources, setResources] = useState<any[]>([]);
    const [filteredResources, setFilteredResources] = useState<any[]>([]);
    const [designationData, setDesignationData] = useState<any[]>([]);
    const [capacityData, setCapacityData] = useState<any[]>([]);
    const [rateData, setRateData] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [searchName, setSearchName] = useState('');
    const [searchDepartment, setSearchDepartment] = useState('');

    const [editedRows, setEditedRows] = useState<Record<string, any>>({});
    const [originalRows, setOriginalRows] = useState<Record<string, any>>({});

    const handleChangePage = (event: any, newPage: any) => setPage(newPage);
    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    useEffect(() => {
        loadResources();
        loadDropdowns();
    }, []);

    useEffect(() => {
        const filtered = resources.filter((res) => {
            const nameMatch = res.name?.toLowerCase().includes(searchName.toLowerCase());
            const deptMatch = res.department?.name?.toLowerCase().includes(searchDepartment.toLowerCase());
            return nameMatch && deptMatch;
        });
        setFilteredResources(filtered);
        setPage(0);
    }, [searchName, searchDepartment, resources]);

    const loadResources = async () => {
        dispatch(spinLoaderShow(true));
        try {
            const res: any = await resourceAll();
            setResources(res);

            // initialize edited + original rows
            const initialEdited: Record<string, any> = {};
            const initialOriginal: Record<string, any> = {};
            res.forEach((r: any) => {
                initialEdited[r.id] = {
                    designation_id: r.designation_id,
                    capacity_id: r.capacity_id,
                    rate_id: r.rate_id
                };
                initialOriginal[r.id] = {
                    designation_id: r.designation_id,
                    capacity_id: r.capacity_id,
                    rate_id: r.rate_id
                };
            });
            setEditedRows(initialEdited);
            setOriginalRows(initialOriginal);
        } catch (err: any) {
            toast.error(err);
        }
        dispatch(spinLoaderShow(false));
    };

    const loadDropdowns = async () => {
        try {
            const [designations, capacities, rates]: any = await Promise.all([getAllDesignations(), getAllCapacities(), getAllRates()]);
            setDesignationData(designations);
            setCapacityData(capacities);
            setRateData(rates);
        } catch (err: any) {
            toast.error(err);
        }
    };

    const handleSave = async (id: string) => {
        const row = editedRows[id];
        if (!row) return;

        const payload = {
            designation_id: row.designation_id,
            capacity_id: row.capacity_id,
            rate_id: row.rate_id
        };

        dispatch(spinLoaderShow(true));
        updateResourceCapacityRecord({ id, ...payload })
            .then(() => {
                toast.success('Resource updated successfully');
                loadResources();
            })
            .catch((err: any) => toast.error(err))
            .finally(() => dispatch(spinLoaderShow(false)));
    };

    const hasChanges = (id: string) => {
        const orig = originalRows[id];
        const edited = editedRows[id];
        if (!orig || !edited) return false;
        return orig.designation_id !== edited.designation_id || orig.capacity_id !== edited.capacity_id || orig.rate_id !== edited.rate_id;
    };

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'Update Resource designation'} icon title rightAlign />

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                    <TextField
                        label="Search by Name"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        fullWidth
                        size="small"
                        autoComplete="off"
                    />
                </Grid>

                <Grid item xs={6}>
                    <TextField
                        select
                        value={searchDepartment}
                        onChange={(e) => setSearchDepartment(e.target.value)}
                        fullWidth
                        size="small"
                        SelectProps={{ native: true }}
                    >
                        <option value="">All Departments</option>
                        {Array.from(new Set(resources.map((r) => r.department?.name).filter(Boolean))).map((deptName) => (
                            <option key={deptName} value={deptName}>
                                {deptName}
                            </option>
                        ))}
                    </TextField>
                </Grid>
            </Grid>

            <TableContainer
                component={Paper}
                className="custom__table"
                sx={{
                    borderRadius: '10px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                }}
            >
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ background: '#6e529e' }}>
                            {['Name', 'Department', 'Designation', 'Capacity', 'Rate', 'Action'].map((col) => (
                                <TableCell
                                    key={col}
                                    sx={{
                                        color: '#fff',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        padding: '10px 16px',
                                        '&:hover': { backgroundColor: '#4b3a7d' }
                                    }}
                                >
                                    {col}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredResources?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="subtitle1" color="textSecondary">
                                        No records found.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredResources?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((res: any) => {
                                return (
                                    <TableRow key={res.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                                        {/* Name */}
                                        <TableCell align="center">{res.name}</TableCell>

                                        {/* Department */}
                                        <TableCell align="center">{res.department?.name}</TableCell>

                                        {/* Designation */}
                                        <TableCell align="center">
                                            <Autocomplete
                                                options={designationData}
                                                value={designationData.find((d) => d.id === editedRows[res.id]?.designation_id) || null}
                                                getOptionLabel={(option) => option?.name || ''}
                                                onChange={(_, val) =>
                                                    setEditedRows((prev: any) => ({
                                                        ...prev,
                                                        [res.id]: { ...prev[res.id], designation_id: val?.id }
                                                    }))
                                                }
                                                renderInput={(params) => <TextField {...params} size="small" />}
                                            />
                                        </TableCell>

                                        {/* Capacity */}
                                        <TableCell align="center">
                                            <Autocomplete
                                                options={capacityData}
                                                value={capacityData.find((c) => c.id === editedRows[res.id]?.capacity_id) || null}
                                                getOptionLabel={(option) => `${option?.value * 100}%`}
                                                onChange={(_, val) =>
                                                    setEditedRows((prev: any) => ({
                                                        ...prev,
                                                        [res.id]: { ...prev[res.id], capacity_id: val?.id }
                                                    }))
                                                }
                                                renderInput={(params) => <TextField {...params} size="small" />}
                                            />
                                        </TableCell>

                                        {/* Rate */}
                                        <TableCell align="center">
                                            <Autocomplete
                                                options={rateData}
                                                value={rateData.find((r) => r.id === editedRows[res.id]?.rate_id) || null}
                                                getOptionLabel={(option) => `AED ${option?.value}`}
                                                onChange={(_, val) =>
                                                    setEditedRows((prev: any) => ({
                                                        ...prev,
                                                        [res.id]: { ...prev[res.id], rate_id: val?.id }
                                                    }))
                                                }
                                                renderInput={(params) => <TextField {...params} size="small" />}
                                            />
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell align="center">
                                            {hasChanges(res.id) && (
                                                <>
                                                    <Button size="small" color="primary" onClick={() => handleSave(res.id)} sx={{ mr: 1 }}>
                                                        Save
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={() =>
                                                            setEditedRows((prev: any) => ({
                                                                ...prev,
                                                                [res.id]: { ...originalRows[res.id] } // reset to original values
                                                            }))
                                                        }
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[rowsPerPage]}
                    component="div"
                    count={filteredResources?.length ?? 0}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                        '& .MuiTablePagination-selectIcon': { color: '#6e529e' },
                        '& .MuiTablePagination-caption': { fontSize: '14px', color: '#6e529e' }
                    }}
                />
            </TableContainer>
        </>
    );
}

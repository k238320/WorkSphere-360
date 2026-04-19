import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete
} from '@mui/material';
import { Download as DownloadIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { getResourceCategory } from 'services/Allocation/taskServices';
import { useDispatch } from 'react-redux';
import { createPayslip, deletePayslip, findAll } from 'services/payslip';
import { toast } from 'react-toastify';
import useAuth from 'hooks/useAuth';
import { getFiles, uploadFiles } from 'services/uploadService';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconChevronRight } from '@tabler/icons';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import SubCard from 'ui-component/cards/SubCard';

const months = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
];

const PayslipList = () => {
    // const [payslips, setPayslips] = useState<any[]>([]);
    const [filteredPayslips, setFilteredPayslips] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [form, setForm] = useState({
        user_id: '',
        month: '',
        year: `${new Date().getFullYear()}`,
        file_path: '',
        uploaded_by: ''
    });
    const [file, setFile] = useState<File | null>(null);

    const { user } = useAuth();
    const [searchUser, setSearchUser] = useState(user.id);
    const [fromMonth, setFromMonth] = useState('');
    const [toMonth, setToMonth] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [year, setYear] = useState('');

    const dispatch = useDispatch();

    useEffect(() => {
        paySlipsData(searchUser, fromMonth, toMonth, year);

        getResourceCategoryData();
    }, []);

    const paySlipsData = (userId: string, fromMonth: string, toMonth: string, year: string) => {
        dispatch(spinLoaderShow(true));

        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (fromMonth) params.append('fromMonth', fromMonth);
        if (toMonth) params.append('toMonth', toMonth);
        if (year) params.append('year', year);

        findAll(`?${params.toString()}`)
            .then((data: any) => {
                // setPayslips(data);
                setFilteredPayslips(data);
            })
            .catch((e) => {
                console.log('e', e);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const handleFilter = () => {
        paySlipsData(searchUser, fromMonth, toMonth, year);
    };

    const handleDelete = (payslipId: string) => {
        if (window.confirm('Are you sure you want to delete this payslip?')) {
            dispatch(spinLoaderShow(true));
            deletePayslip(payslipId)
                .then(() => {
                    toast.success('Payslip deleted successfully');
                    paySlipsData(searchUser, fromMonth, toMonth, year);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error('Failed to delete payslip');
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setForm({
            user_id: '',
            month: '',
            year: '',
            file_path: '',
            uploaded_by: ''
        });
        setFile(null);
    };

    const handleFormChange = (e: any) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const uploadedFile = e.target.files[0];
            setFile(uploadedFile);
            setForm((prev) => ({ ...prev, file_path: uploadedFile.name }));
        }
    };

    const handleFormSubmit = () => {
        if (!form.user_id || !form.month || !form.year || !file) {
            alert('Please fill in all required fields and upload a file.');
            return;
        }

        let body = { ...form };

        body.uploaded_by = user.id;

        const formData = new FormData();
        formData.append('file', file);
        dispatch(spinLoaderShow(true));
        uploadFiles(formData)
            .then((res: any) => {
                body.file_path = res;
                createPayslip(body)
                    .then((res) => {
                        toast.success('Payslip upload successfully');
                        paySlipsData(searchUser, fromMonth, toMonth, year);
                        handleCloseModal();
                    })
                    .catch((err) => {
                        // toast.error('Issue from backend');
                    });
            })
            .catch((err) => {
                console.log('errror', err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const getResourceCategoryData = () => {
        dispatch(spinLoaderShow(true));
        getResourceCategory()
            .then((res: any) => {
                setUsers(res);
            })
            .catch((err) => {
                console.log('err', err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const GetFilesS3 = async (key: String) => {
        if (key) {
            dispatch(spinLoaderShow(true));

            getFiles(key)
                .then((res: any) => {
                    window.location.href = res;
                })
                .catch((err) => {
                    console.log('errror', err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        } else {
            toast.error('File is empty');
        }
    };

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'List of Payslips'} icon title rightAlign />

            <SubCard>
                <Box sx={{ p: 4 }}>
                    {/* Show user name and email prominently at the top */}
                    {filteredPayslips?.length > 0 && (user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations') ? (
                        <Box mb={4} textAlign="center">
                            <Typography variant="h4" gutterBottom>
                                {filteredPayslips?.[0]?.user?.name}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                {filteredPayslips?.[0]?.user?.email}
                            </Typography>
                        </Box>
                    ) : (
                        <Box mb={4} textAlign="center">
                            <Typography variant="h4" gutterBottom>
                                {user?.name}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                {user?.email}
                            </Typography>
                        </Box>
                    )}

                    {/* Add Button for Admins */}
                    {(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations') && (
                        <Box display="flex" justifyContent="flex-end" mb={4}>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal}>
                                Add Payslip
                            </Button>
                        </Box>
                    )}

                    {/* Filters Section */}
                    <Box
                        display="flex"
                        gap={2}
                        mb={4}
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        alignItems="center"
                        sx={{
                            backgroundColor: '#f9f9f9',
                            padding: 2,
                            borderRadius: 2,
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        {(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations') && (
                            <Autocomplete
                                options={users}
                                getOptionLabel={(option) => option?.name || ''}
                                value={users.find((u) => u?.user?.[0]?.id === searchUser) || null}
                                onChange={(event, newValue) => setSearchUser(newValue?.user?.[0]?.id || '')}
                                renderInput={(params) => <TextField {...params} label="User" variant="outlined" />}
                                sx={{ flex: 1, maxWidth: 300 }}
                            />
                        )}
                        <TextField
                            label="From Month"
                            select
                            value={fromMonth}
                            onChange={(e) => setFromMonth(e.target.value)}
                            variant="outlined"
                            sx={{ flex: 1, maxWidth: 200 }}
                        >
                            <MenuItem value="">Select Month</MenuItem>
                            {months.map((m) => (
                                <MenuItem key={m.value} value={m.value}>
                                    {m.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="To Month"
                            select
                            value={toMonth}
                            onChange={(e) => setToMonth(e.target.value)}
                            variant="outlined"
                            sx={{ flex: 1, maxWidth: 200 }}
                        >
                            <MenuItem value="">Select Month</MenuItem>
                            {months.map((m) => (
                                <MenuItem key={m.value} value={m.value}>
                                    {m.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Year"
                            select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            variant="outlined"
                            sx={{ flex: 1, maxWidth: 150 }}
                        >
                            <MenuItem value="">Select Year</MenuItem>
                            {[2023, 2024, 2025].map((y) => (
                                <MenuItem key={y} value={y}>
                                    {y}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={handleFilter}
                            sx={{
                                flexShrink: 0,
                                maxWidth: 120,
                                backgroundColor: '#4caf50',
                                ':hover': { backgroundColor: '#388e3c' }
                            }}
                        >
                            Filter
                        </Button>
                    </Box>

                    {/* Payslip Cards */}
                    <Grid container spacing={3}>
                        {filteredPayslips?.map((payslip) => (
                            <Grid item xs={12} sm={6} md={4} key={payslip.id}>
                                <Card
                                    sx={{
                                        border: '1px solid #e0e0e0',
                                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="body2" color="text.secondary">
                                            Month: {months.find((m) => m.value === payslip.month)?.label}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Year: {payslip.year}
                                        </Typography>
                                        <Box mt={2}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<DownloadIcon />}
                                                onClick={() => GetFilesS3(payslip.file_path)}
                                                sx={{ width: '100%' }}
                                            >
                                                Download
                                            </Button>
                                        </Box>
                                    </CardContent>
                                    {(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations') && (
                                        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleDelete(payslip.id)}
                                                sx={{
                                                    borderRadius: '50%',
                                                    minWidth: 40,
                                                    height: 40,
                                                    padding: 0,
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    paddingLeft: '8px'
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Add Payslip Modal */}
                    <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                        <DialogTitle>Add Payslip</DialogTitle>
                        <DialogContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Autocomplete
                                    options={users}
                                    getOptionLabel={(option) => option.name || ''}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Employee ID" variant="outlined" required fullWidth />
                                    )}
                                    onChange={(event, value) =>
                                        handleFormChange({ target: { name: 'user_id', value: value?.user?.[0]?.id || '' } })
                                    }
                                    value={users.find((user) => user?.user?.[0]?.id === form.user_id) || null}
                                />
                                <TextField
                                    label="Month"
                                    name="month"
                                    value={form.month}
                                    onChange={handleFormChange}
                                    select
                                    required
                                    fullWidth
                                    variant="outlined"
                                >
                                    {months.map((m) => (
                                        <MenuItem key={m.value} value={m.value}>
                                            {m.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField label="Year" select name="year" value={form.year} onChange={handleFormChange} variant="outlined">
                                    <MenuItem value="">Select Year</MenuItem>
                                    {["2023", "2024", "2025"].map((y) => (
                                        <MenuItem key={y} value={y}>
                                            {y}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <Button variant="contained" component="label" fullWidth>
                                    Upload File
                                    <input type="file" hidden onChange={handleFileChange} accept=".pdf" />
                                </Button>
                                {file && <Typography variant="body2">Selected File: {file.name}</Typography>}
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseModal}>Cancel</Button>
                            <Button onClick={handleFormSubmit} variant="contained" color="primary">
                                Submit
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </SubCard>
        </>
    );
};

export default PayslipList;

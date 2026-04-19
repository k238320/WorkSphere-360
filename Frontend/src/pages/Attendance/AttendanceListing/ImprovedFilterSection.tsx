import type React from 'react';
import {
    Grid,
    Paper,
    Box,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Divider,
    Stack,
    Chip,
    useTheme,
    alpha,
    BoxProps
} from '@mui/material';
import { LocalizationProvider, DatePicker as DatePicker1 } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DatePicker from 'react-datepicker';
import { AutoCompleteField } from 'ui-component/formsField/FormFields';
import ExcelDownload from './ExcelDownload';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FilterListIcon from '@mui/icons-material/FilterList';
import { styled } from '@mui/material/styles';
import { forwardRef } from 'react';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1.5),
    background: '#ffffff',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    transition: 'all 0.3s ease-in-out',
    width: '100%', // Ensure full width
    '&:hover': {
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transform: 'translateY(-1px)'
    }
}));

const FilterSection = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(1.5),
    width: '100%', // Ensure full width
    '& .MuiFormControl-root': {
        marginBottom: theme.spacing(1),
        width: '100%' // Ensure full width for form controls
    }
}));

const ActionSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    width: '100%', // Ensure full width
    [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
        marginTop: theme.spacing(2)
    }
}));

const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.spacing(1),
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1, 2.5),
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    width: '100%', // Ensure full width
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }
}));

const CustomDatePickerWrapper = styled(FormControl)(({ theme }) => ({
    position: 'relative',
    width: '100%', // Ensure full width
    '& .custom-datepicker': {
        width: '100%',
        padding: theme.spacing(1.5),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        borderRadius: theme.spacing(1),
        fontSize: '14px',
        backgroundColor: '#ffffff',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box', // Ensure proper box sizing
        '&:focus': {
            outline: 'none',
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
        }
    },
    // Fixed calendar positioning
    '& .react-datepicker-popper': {
        zIndex: 9999,
        position: 'fixed !important', // Changed to fixed for better positioning
        transform: 'none !important' // Remove any transforms that cause diagonal positioning
    },
    '& .react-datepicker': {
        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        borderRadius: theme.spacing(1),
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        position: 'relative',
        '& .react-datepicker__header': {
            backgroundColor: theme.palette.primary.main,
            borderBottom: 'none',
            borderRadius: `${theme.spacing(1)} ${theme.spacing(1)} 0 0`
        },
        '& .react-datepicker__current-month': {
            color: '#ffffff',
            fontWeight: 600
        },
        '& .react-datepicker__navigation': {
            '&--previous, &--next': {
                '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.dark, 0.1)
                }
            }
        },
        '& .react-datepicker__month': {
            margin: theme.spacing(1)
        },
        '& .react-datepicker__month-container': {
            width: '100%'
        },
        '& .react-datepicker__month-text': {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4rem',
            height: '2.5rem',
            margin: '0.2rem',
            borderRadius: theme.spacing(0.5),
            '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1)
            },
            '&--selected': {
                backgroundColor: theme.palette.primary.main,
                color: '#ffffff',
                '&:hover': {
                    backgroundColor: theme.palette.primary.dark
                }
            }
        }
    }
}));

const StyledDatePickerInput = forwardRef<HTMLDivElement, BoxProps>(({ children, ...props }, ref) => (
    <Box
        ref={ref}
        {...props}
        sx={{
            width: '100%',
            padding: 1.5,
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            borderRadius: 1,
            fontSize: '14px',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            minHeight: '40px',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box',
            '&:hover': {
                borderColor: (theme) => theme.palette.primary.main
            },
            '&:focus': {
                outline: 'none',
                borderColor: (theme) => theme.palette.primary.main,
                boxShadow: (theme) => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
            }
        }}
    >
        {children}
    </Box>
));

interface ImprovedFilterSectionProps {
    // Date picker props
    name?: string;
    empCode?: string;
    selectedStartMonthState?: Date;
    selectedEndMonthState?: Date;
    startTime?: Date;
    endTime?: Date;
    startTimeOpen?: boolean;
    startEndOpen?: boolean;
    // Form props
    control?: any;
    setValue?: any;
    errors?: any;
    // Options
    departmentData?: any[];
    resource?: any[];
    locationTypeOtions?: any[];
    // User and permissions
    user?: any;
    teamLead?: boolean;
    locationTypeId?: number;
    // Data for downloads
    filterData?: any[];
    statusCounts?: any;
    remainingLeaves?: any;
    isDepartmentPdf?: boolean;
    // Event handlers
    startDateOnChange?: any;
    endDateOnChange?: any;
    hanldeStartTimeChange?: any;
    hanldeEndTimeChange?: any;
    setStartTimeOpen?: (open: boolean) => void;
    setEndTimeOpen?: (open: boolean) => void;
    handleChangeDepartment?: (value: any) => void;
    handleChangeEmployee?: (value: any) => void;
    handleChangeLocationType?: (value: any) => void;
    onSearch?: () => void;
    createPDF?: (data: any[], statusCounts: any) => void;
    renderMonthContent?: (month: any, shortMonth: any, longMonth: any, day: any) => any;
}

const ImprovedFilterSection: React.FC<ImprovedFilterSectionProps> = ({
    name,
    empCode,
    selectedStartMonthState,
    selectedEndMonthState,
    startTime,
    endTime,
    startTimeOpen,
    startEndOpen,
    control,
    setValue,
    errors,
    departmentData,
    resource,
    locationTypeOtions,
    user,
    teamLead,
    locationTypeId,
    filterData,
    statusCounts,
    remainingLeaves,
    isDepartmentPdf,
    startDateOnChange,
    endDateOnChange,
    hanldeStartTimeChange,
    hanldeEndTimeChange,
    setStartTimeOpen,
    setEndTimeOpen,
    handleChangeDepartment,
    handleChangeEmployee,
    handleChangeLocationType,
    onSearch,
    createPDF,
    renderMonthContent
}) => {
    const theme = useTheme();
    const isAdmin =
        user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations';
    const canSelectEmployee = isAdmin || teamLead;

    const formatDisplayDate = (date: Date | null) => {
        if (!date) return 'Select date';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDisplayMonth = (date: Date | null) => {
        if (!date) return 'Select month';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    };

    return (
        <StyledPaper elevation={0}>
            {/* Header */}
            <Box display="flex" alignItems="center" mb={2.5} width="100%">
                <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600} color="primary.main">
                    List of Attendance
                </Typography>
                <Box flexGrow={1} />
                <Chip label={`${filterData?.length || 0} Records`} color="primary" variant="outlined" size="small" />
            </Box>

            <Grid container spacing={2.5} sx={{ width: '100%' }}>
                {/* Filter Section */}
                <Grid item xs={12} lg={9} sx={{ width: '100%' }}>
                    <FilterSection>
                        <Grid container spacing={2} alignItems="flex-end" sx={{ width: '100%' }}>
                            {/* Date Range Section */}
                            <Grid item xs={12} sx={{ width: '100%' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Date Range
                                </Typography>
                            </Grid>
                            {name || empCode ? (
                                <>
                                    <Grid item xs={12} sm={6} md={3} sx={{ width: '100%' }}>
                                        <CustomDatePickerWrapper fullWidth>
                                            <InputLabel
                                                shrink
                                                htmlFor="start-month-picker"
                                                sx={{
                                                    backgroundColor: 'white',
                                                    px: 1,
                                                    color: 'primary.main',
                                                    fontWeight: 500
                                                }}
                                            >
                                                Start Month
                                            </InputLabel>
                                            <DatePicker
                                                selected={selectedStartMonthState}
                                                renderMonthContent={renderMonthContent}
                                                onChange={startDateOnChange}
                                                showMonthYearPicker
                                                dateFormat="MM/yyyy"
                                                className="custom-datepicker"
                                                placeholderText="Select start month"
                                                value={selectedStartMonthState ? formatDisplayMonth(selectedStartMonthState) : ''}
                                                popperPlacement="bottom-start"
                                                popperContainer={({ children }) => (
                                                    <div style={{ zIndex: 9999, position: 'relative' }}>{children}</div>
                                                )}
                                                popperModifiers={[
                                                    {
                                                        name: 'offset',
                                                        options: {
                                                            offset: [0, 8]
                                                        },
                                                        fn: () => ({})
                                                    },

                                                    {
                                                        name: 'preventOverflow',
                                                        options: {
                                                            rootBoundary: 'viewport',
                                                            tether: false,
                                                            altAxis: true
                                                        },
                                                        fn: () => ({})
                                                    }
                                                ]}
                                            />
                                        </CustomDatePickerWrapper>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3} sx={{ width: '100%' }}>
                                        <CustomDatePickerWrapper fullWidth>
                                            <InputLabel
                                                shrink
                                                htmlFor="end-month-picker"
                                                sx={{
                                                    backgroundColor: 'white',
                                                    px: 1,
                                                    color: 'primary.main',
                                                    fontWeight: 500
                                                }}
                                            >
                                                End Month
                                            </InputLabel>
                                            <DatePicker
                                                selected={selectedEndMonthState}
                                                renderMonthContent={renderMonthContent}
                                                onChange={endDateOnChange}
                                                showMonthYearPicker
                                                dateFormat="MM/yyyy"
                                                className="custom-datepicker"
                                                placeholderText="Select end month"
                                                value={selectedEndMonthState ? formatDisplayMonth(selectedEndMonthState) : ''}
                                                popperPlacement="bottom-start"
                                                popperContainer={({ children }) => (
                                                    <div style={{ zIndex: 9999, position: 'relative' }}>{children}</div>
                                                )}
                                                popperModifiers={[
                                                    {
                                                        name: 'offset',
                                                        options: {
                                                            offset: [0, 8]
                                                        },
                                                        fn: () => ({})
                                                    },
                                                    {
                                                        name: 'preventOverflow',
                                                        options: {
                                                            rootBoundary: 'viewport',
                                                            tether: false,
                                                            altAxis: true
                                                        },
                                                        fn: () => ({})
                                                    }
                                                ]}
                                            />
                                        </CustomDatePickerWrapper>
                                    </Grid>
                                </>
                            ) : (
                                <>
                                    <Grid item xs={12} sm={6} md={3} sx={{ width: '100%' }}>
                                        <FormControl fullWidth>
                                            <InputLabel
                                                shrink
                                                sx={{
                                                    backgroundColor: 'white',
                                                    px: 1,
                                                    color: 'primary.main',
                                                    fontWeight: 500
                                                }}
                                            >
                                                Start Date
                                            </InputLabel>
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <DatePicker1
                                                    open={startTimeOpen}
                                                    onOpen={() => setStartTimeOpen?.(true)}
                                                    onClose={() => setStartTimeOpen?.(false)}
                                                    renderInput={(params) => (
                                                        <StyledDatePickerInput
                                                            ref={params.inputRef}
                                                            onClick={() => setStartTimeOpen?.(true)}
                                                        >
                                                            {formatDisplayDate(startTime ?? null)}
                                                        </StyledDatePickerInput>
                                                    )}
                                                    label=""
                                                    value={startTime}
                                                    onChange={hanldeStartTimeChange}
                                                    PopperProps={{
                                                        placement: 'bottom-start',
                                                        modifiers: [
                                                            {
                                                                name: 'offset',
                                                                options: {
                                                                    offset: [0, 8]
                                                                }
                                                            },
                                                            {
                                                                name: 'preventOverflow',
                                                                options: {
                                                                    rootBoundary: 'viewport',
                                                                    tether: false,
                                                                    altAxis: true
                                                                }
                                                            }
                                                        ],
                                                        sx: {
                                                            zIndex: 9999,
                                                            '& .MuiPaper-root': {
                                                                marginTop: '8px !important',
                                                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                                            }
                                                        }
                                                    }}
                                                    PaperProps={{
                                                        sx: {
                                                            '& .MuiCalendarPicker-root': {
                                                                width: 'auto'
                                                            },
                                                            '& .MuiPickersDay-root': {
                                                                '&:hover': {
                                                                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                                                },
                                                                '&.Mui-selected': {
                                                                    backgroundColor: theme.palette.primary.main,
                                                                    '&:hover': {
                                                                        backgroundColor: theme.palette.primary.dark
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3} sx={{ width: '100%' }}>
                                        <FormControl fullWidth>
                                            <InputLabel
                                                shrink
                                                sx={{
                                                    backgroundColor: 'white',
                                                    px: 1,
                                                    color: 'primary.main',
                                                    fontWeight: 500
                                                }}
                                            >
                                                End Date
                                            </InputLabel>
                                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                <DatePicker1
                                                    open={startEndOpen}
                                                    onOpen={() => setEndTimeOpen?.(true)}
                                                    onClose={() => setEndTimeOpen?.(false)}
                                                    renderInput={(params) => (
                                                        <StyledDatePickerInput ref={params.inputRef} onClick={() => setEndTimeOpen?.(true)}>
                                                            {formatDisplayDate(endTime ?? null)}
                                                        </StyledDatePickerInput>
                                                    )}
                                                    label=""
                                                    value={endTime}
                                                    onChange={hanldeEndTimeChange}
                                                    PopperProps={{
                                                        placement: 'bottom-start',
                                                        modifiers: [
                                                            {
                                                                name: 'offset',
                                                                options: {
                                                                    offset: [0, 8]
                                                                }
                                                            },
                                                            {
                                                                name: 'preventOverflow',
                                                                options: {
                                                                    rootBoundary: 'viewport',
                                                                    tether: false,
                                                                    altAxis: true
                                                                }
                                                            }
                                                        ],
                                                        sx: {
                                                            zIndex: 9999,
                                                            '& .MuiPaper-root': {
                                                                marginTop: '8px !important',
                                                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                                            }
                                                        }
                                                    }}
                                                    PaperProps={{
                                                        sx: {
                                                            '& .MuiCalendarPicker-root': {
                                                                width: 'auto'
                                                            },
                                                            '& .MuiPickersDay-root': {
                                                                '&:hover': {
                                                                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                                                },
                                                                '&.Mui-selected': {
                                                                    backgroundColor: theme.palette.primary.main,
                                                                    '&:hover': {
                                                                        backgroundColor: theme.palette.primary.dark
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </LocalizationProvider>
                                        </FormControl>
                                    </Grid>
                                </>
                            )}
                            {/* Filters Section */}
                            {(isAdmin || canSelectEmployee) && (
                                <>
                                    <Grid item xs={12} sx={{ width: '100%' }}>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Filters
                                        </Typography>
                                    </Grid>
                                    {isAdmin && (
                                        <Grid item xs={12} sm={6} md={3} sx={{ width: '100%' }}>
                                            <AutoCompleteField
                                                errors={!!errors?.department_id}
                                                fieldName="department_id"
                                                autoComplete="off"
                                                label="Department"
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
                                    )}
                                    {canSelectEmployee && (
                                        <>
                                            <Grid item xs={12} sm={6} md={3} sx={{ width: '100%' }}>
                                                <AutoCompleteField
                                                    errors={!!errors?.resourceId}
                                                    fieldName="resourceId"
                                                    autoComplete="off"
                                                    label="Employee"
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
                                            <Grid item xs={12} sm={6} md={3} sx={{ width: '100%' }}>
                                                <AutoCompleteField
                                                    errors={!!errors?.location_type_id}
                                                    fieldName="location_type_id"
                                                    autoComplete="off"
                                                    label="Location"
                                                    control={control}
                                                    setValue={setValue}
                                                    options={locationTypeOtions}
                                                    returnObject={false}
                                                    isLoading={true}
                                                    optionKey="id"
                                                    optionValue="name"
                                                    helperText={errors?.location_type_id && errors?.location_type_id?.message}
                                                    iProps={{
                                                        onChange: handleChangeLocationType
                                                    }}
                                                    valueGot={
                                                        locationTypeId && locationTypeOtions?.find(({ id }: any) => id === locationTypeId)
                                                    }
                                                />
                                            </Grid>
                                        </>
                                    )}
                                </>
                            )}
                        </Grid>
                    </FilterSection>
                </Grid>
                {/* Action Section */}
                <Grid item xs={12} lg={3} sx={{ width: '100%' }}>
                    <Box display="flex" flexDirection="column" height="100%" justifyContent="flex-end" width="100%">
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Actions
                        </Typography>
                        <Stack spacing={1.5} width="100%">
                            <StyledButton onClick={onSearch} variant="contained" startIcon={<SearchIcon />} size="large">
                                Search
                            </StyledButton>

                            {filterData && filterData.length > 0 && (
                                <>
                                    <StyledButton
                                        onClick={() => createPDF?.(filterData, statusCounts)}
                                        variant="outlined"
                                        startIcon={<PictureAsPdfIcon />}
                                        sx={{
                                            color: 'error.main',
                                            borderColor: 'error.main',
                                            '&:hover': {
                                                borderColor: 'error.dark',
                                                backgroundColor: alpha(theme.palette.error.main, 0.04)
                                            }
                                        }}
                                    >
                                        PDF
                                    </StyledButton>

                                    {/* Existing Excel download */}
                                    <ExcelDownload
                                        data={filterData}
                                        statusCounts={statusCounts}
                                        remainingLeaves={remainingLeaves}
                                        isDepartmentPdf={isDepartmentPdf}
                                        variant="outlined"
                                        size="large"
                                    />

                                    {/* NEW: Department-wise Excel download */}
                                    <ExcelDownload
                                        data={filterData}
                                        statusCounts={statusCounts}
                                        remainingLeaves={remainingLeaves}
                                        isDepartmentWise={true} // 👈 new prop to differentiate
                                        variant="outlined"
                                        size="large"
                                        departmentData={departmentData}
                                    />
                                </>
                            )}
                        </Stack>
                    </Box>
                </Grid>
            </Grid>
        </StyledPaper>
    );
};

export default ImprovedFilterSection;

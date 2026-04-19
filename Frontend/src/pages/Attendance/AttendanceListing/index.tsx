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
    Modal,
    Box,
    Stack,
    Select,
    MenuItem,
    InputBase,
    FormControl,
    InputLabel
} from '@mui/material';
import { addUserComment, getAttendance, getRemainingLeaves } from 'services/attendance';
import { toast } from 'react-toastify';
import moment from 'moment';
import { LocalizationProvider, DatePicker as DatePicker1 } from '@mui/x-date-pickers';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AutoCompleteField, TextFieldControlled } from 'ui-component/formsField/FormFields';
import { useForm } from 'react-hook-form';
import { getDepartmentCategory } from 'services/categoryService';
import { PDFDocument, rgb } from 'pdf-lib';
import Chip from '@mui/material/Chip';
import useAuth from 'hooks/useAuth';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getDepartmentWise, getResourceByID } from 'services/resource';
import { useNavigate } from 'react-router-dom';
import { commentValidation } from './Validation';
import { yupResolver } from '@hookform/resolvers/yup';
import { getAllResources } from 'services/resource';
import { extraHourRequest } from 'services/resource';
import { getResourceCategory } from 'services/Allocation/taskServices';
import { styled } from '@mui/system';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import './index.css';
import { calculateTimeFromMinutes } from 'utils/helper';
import BreakListing from './BreakListing';
import ExcelDownload from './ExcelDownload';
import ImprovedFilterSection from './ImprovedFilterSection';
import AttendanceCountsDisplay from './AttendanceCountsDisplay';

const locationTypeOtions = [
    {
        id: 1,
        name: 'Karachi'
    },
    {
        id: 2,
        name: 'Dubai'
    }
];

const columns = [
    { id: 'name', label: 'Name', minWidth: 50 },
    { id: 'department', label: 'Department', minWidth: 50 },
    { id: 'checkin_time', label: 'Date', minWidth: 40 },
    { id: 'checkin_time', label: 'Checkin Time', minWidth: 50 },
    { id: 'checkout_time', label: 'Checkout Time', minWidth: 50 },
    { id: 'Worked Hours', label: 'Worked Hours', minWidth: 20 },
    { id: 'Breaks', label: 'Breaks', minWidth: 20 },
    { id: 'hours_worked', label: 'Hours', minWidth: 50 },
    { id: 'status', label: 'Status', minWidth: 50 },
    { id: 'Action', label: 'Action', minWidth: 50 }
];

const statusOptions = [
    { id: 'All Records', name: 'All Records' },
    { id: 'On-Time', name: 'On-Time' },
    { id: 'Late', name: 'Late' },
    { id: 'Half Day', name: 'Half Day' },
    { id: 'Full Day Off', name: 'Full Day Off' },
    { id: 'On-Leave', name: 'On-Leave' },
    { id: 'Work From Home', name: 'Work From Home' },
    { id: 'Holiday', name: 'Holiday' },
    { id: 'Extra Hours', name: 'Extra Hours' }
];

const Attendance = () => {
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
        reValidateMode: 'onChange',
        resolver: yupResolver(commentValidation)
    });

    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4
    };

    const CustomInput = styled(InputBase)(({ theme }: any) => ({
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

    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const newDate = `${year}-${month}`;

    const [open, setOpen] = useState<boolean>(false);
    const [user_comment, setUser_comment] = useState<string>('');
    const [hours, setHours] = useState<string>('');
    const [rowData, setRowData] = useState<any>();
    const [addComment, setAddComment] = useState<boolean>(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [state, setState] = useState<any>([]);
    const [filterData, setFilterData] = useState<any>([]);
    const [startTimeOpen, setStartTimeOpen] = React.useState(false);
    const [startEndOpen, setEndTimeOpen] = React.useState(false);
    const [department, setDepartment] = React.useState<any>(null);
    const [departmentData, setDepartmentData] = useState<any>([]);
    const [name, setName] = useState('');
    const [empCode, setEmpCode] = useState('');
    const [Users, setUsers] = useState([]);
    const [resource, setResource] = useState<any>([]);

    const [selectedStartMonthState, setStartSelectedMonthState] = useState<any>();
    const [selectedEndMonthState, setEndSelectedMonthState] = useState<any>();

    const navigate = useNavigate();
    const [startTime, setStartTime] = useState<any>(today);
    const [endTime, setEndTime] = useState<any>(today);
    const [teamLead, setTeamLead] = useState(false);
    const [remainingLeaves, setRemainingLeaves] = useState<any>({});
    const [isDepartmentPdf, setIsDepartmentPdf] = useState(false);
    const [statusCounts, setStatusCounts] = useState({
        totalPresent: 0,
        totalLate: 0,
        totalOnLeaves: 0,
        totalWorkFromHome: 0,
        totalHalfDay: 0,
        totalFullDay: 0,
        totalEmployee: 0,
        netWorkingHours: 0
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [breakList, setBreakList] = useState<any>([]);

    const dispatch = useDispatch();
    const { user } = useAuth();

    const [locationTypeId, setLocationTypeId] = useState(user?.user_details?.[0]?.location_type_id ?? 1);

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const hanldeStartTimeChange = (e: any) => {
        if (e) {
            setStartTime(e);
        } else {
            setStartTime(null);
        }
    };

    const hanldeEndTimeChange = (e: any) => {
        if (e) {
            setEndTime(e);
        } else {
            setEndTime(null);
        }
    };

    const handleChangeDepartment = (e: any) => {
        if (e) {
            setDepartment(e?.id);
        } else {
            setDepartment(null);
        }
    };

    const handleChangeEmployee = (e: any) => {
        if (e) {
            setName(e?.name);
            setEmpCode(e?.user?.[0]?.employement_code || e?.user?.employement_code);
        } else {
            setName('');
            setEmpCode('');
        }
    };

    const getEmployeLeaveRecords = async (name: string, empCode: string) => {
        try {
            const res = await getRemainingLeaves(name?.trim(), empCode);

            setRemainingLeaves(res);
        } catch (error) {
            console.log('error', error);
        }
    };

    const handleClose = async (data: any) => {
        const newData = { ...data, date: rowData?.date, hours: String(data?.hours), id: rowData?.id };
        delete newData?.department_id;

        await addUserComment(newData)
            .then(() => {
                toast.success('Comment Successfully Added!');
                setOpen(false);
                navigate('/attendance/listing');
                onSearch();
                reset();
            })
            .catch((err) => {
                toast.error(err);
            });

        setOpen(false);
        setAddComment(false);
    };

    const cancelModal = () => {
        setOpen(false);
        setAddComment(false);
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

    const OpenCommentModal = (data: any) => {
        setValue('user_comment', data?.user_comment || '');
        // setValue(hours(data?.hours || null));
        setValue('hours', Number(data?.hours) || null);
        setValue('approve_by', data?.approve_by || null);
        setRowData(data);
        setAddComment(!addComment);
        setOpen(true);
    };

    const onSearch = () => {
        if (name) {
            getEmployeData(selectedStartMonthState, selectedEndMonthState, department, name, empCode);
        } else {
            getEmployeData(startTime, endTime, department);
        }
    };

    const getDepartmentData = async () => {
        // dispatch(spinLoaderShow(true));
        getDepartmentCategory()
            .then((res: any) => {
                setDepartmentData(res);
                // dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                // dispatch(spinLoaderShow(false));
            });
    };

    const getEmployeData = (startTime: any, endTime: any, department_id?: string, name?: string, emp_code?: string) => {
        dispatch(spinLoaderShow(true));

        const location_type_id = locationTypeId;

        getAttendance(startTime, endTime, department_id, name, emp_code, location_type_id)
            .then((response: any) => {
                let res = response.data;

                res?.forEach((element: any) => {
                    element.breakHours = calculateTimeFromMinutes(element?.total_break_minutes);
                });

                setStatusCounts({
                    totalLate: response.totalLate,
                    totalOnLeaves: response.totalOnLeaves,
                    totalWorkFromHome: response.totalWorkFromHome,
                    totalPresent: response.totalPresent,
                    totalHalfDay: response.totalHalfDay,
                    totalFullDay: response.totalFullDay,
                    totalEmployee: response.totalEmployee,
                    netWorkingHours: response.netWorkingHours
                });

                if (res?.length > 0) {
                    setState(res);
                    setFilterData(res);
                } else {
                    setState([]);
                    setFilterData([]);
                    setStatusCounts({
                        totalLate: 0,
                        totalOnLeaves: 0,
                        totalWorkFromHome: 0,
                        totalPresent: 0,
                        totalHalfDay: 0,
                        totalFullDay: 0,
                        totalEmployee: 0,
                        netWorkingHours: 0
                    });
                }
                setIsDepartmentPdf(response?.isDepartmentPdf || false);
                setPage(0);
            })
            .catch((err) => {
                toast.error('Some thing Went Wrong');
            })
            .finally(() => {
                if (name && emp_code) {
                    getEmployeLeaveRecords(name, emp_code);
                } else if (
                    user?.role?.name == 'Super Admin' ||
                    user?.role?.name === 'Human Resource' ||
                    user?.role?.name === 'Human Resource Operations' ||
                    user?.role?.name == 'Team Lead'
                ) {
                    setRemainingLeaves({});
                }
                dispatch(spinLoaderShow(false));
            });
    };

    const getResourceByIDData = () => {
        // dispatch(spinLoaderShow(true));
        getResourceByID(user?.resource_id)
            .then((res: any) => {
                setTeamLead(res?.is_team_lead as boolean);
                if (!res?.is_team_lead) {
                    getEmployeLeaveRecords(res?.name, res?.user?.[0]?.empemployement_code);
                }
            })
            .catch(() => {
                toast.error('Some thing Went Wrong');
            })
            .finally(() => {
                // dispatch(spinLoaderShow(false));
            });
    };

    const generatePDF = async (data: any[], statusCounts: any) => {
        const pdfDoc = await PDFDocument.create();

        // Add the first page separately to avoid an empty first page
        const firstPage = pdfDoc.addPage();

        const { width: firstPageWidth, height: firstPageHeight } = firstPage.getSize();
        firstPage.drawText('This PDF has two attachments', { x: 135, y: 415, size: 25 });

        const margin = 50;
        const marginTop = 15; // Increased margin-top value
        const marginBottom = 20; // Increased margin-bottom value
        // const tableHeight = 20;
        const tableHeight = 30;
        const cellPadding = 5;

        // Increased overall width
        const overallWidthIncrease = 650;
        const columnSpaces = [20, 20, 20, 20, 20, 20, 80, 80, 20, 20, 20, 20];
        // const columnWidths = [350, 220, 140, 100, 100, 100, 100];
        const columnWidths2 = [150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150];
        const columnWidths3 = [150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150];

        const columnWidths = [50, 60, 180, 160, 120, 120, 100, 50, 100, 100, 90];

        const extendedPageWidth = firstPageWidth + overallWidthIncrease + columnSpaces.reduce((acc, space) => acc + space, 0);

        const maxRowsOnFirstPage = 15;

        const drawTable = (
            page: any,
            y: any,
            rowData: any[],
            isHeader: boolean = false,
            tableXPosition: number = 50,
            istable: boolean = false
        ) => {
            let x = tableXPosition; // Use the center-aligned starting point

            const tableBorderColor = rgb(0, 0, 0); // Set the color of the table border

            rowData.forEach((cell, index) => {
                // Draw vertical borders
                page.drawRectangle({
                    x,
                    y,
                    width: istable ? columnWidths2[index] : columnWidths[index] + columnSpaces[index],
                    height: tableHeight,
                    color:
                        cell === 'E. code' ||
                        cell === 'Name' ||
                        cell === 'Department' ||
                        cell === 'Date' ||
                        cell === 'Checkin Time' ||
                        cell === 'Checkout Time' ||
                        cell === 'Hours' ||
                        cell === 'S. No' ||
                        cell === 'Status' ||
                        cell === 'Remaining Leaves' ||
                        cell === 'Availed Leaves' ||
                        cell === 'Availed WFH' ||
                        cell === 'Total Lates' ||
                        cell === 'Full Day off' ||
                        cell === 'Total Hours' ||
                        cell === 'Required Hours' ||
                        cell === 'Worked hours' ||
                        cell === 'Breaks' ||
                        cell === 'Total Employees'
                            ? rgb(75 / 255, 0 / 255, 130 / 255)
                            : cell === 'Uninformed Leaves'
                            ? rgb(176 / 255, 41 / 255, 15 / 255)
                            : cell === 'Leaves'
                            ? rgb(228 / 255, 95 / 255, 70 / 255)
                            : cell === 'On-Time'
                            ? rgb(185 / 255, 246 / 255, 202 / 255)
                            : cell === 'On Time'
                            ? rgb(13 / 255, 176 / 255, 53 / 255)
                            : cell === 'Half Day'
                            ? rgb(251 / 255, 233 / 255, 231 / 255)
                            : cell === 'Half day'
                            ? rgb(176 / 255, 122 / 255, 39 / 255)
                            : cell === 'Full Day Off'
                            ? rgb(251 / 255, 233 / 255, 231 / 255)
                            : cell == 'On-Leave'
                            ? rgb(251 / 255, 233 / 255, 231 / 255)
                            : cell == 'Holiday'
                            ? rgb(255 / 255, 242 / 255, 191 / 255)
                            : cell == 'Late'
                            ? rgb(255 / 255, 242 / 255, 191 / 255)
                            : cell == 'Lates'
                            ? rgb(218 / 255, 156 / 255, 18 / 255)
                            : // : cell == 'Late'
                            // ? rgb(255 / 255, 242 / 255, 191 / 255)
                            cell === 'Work from home'
                            ? rgb(196 / 255, 199 / 255, 77 / 255)
                            : cell == 'Work From Home'
                            ? rgb(255 / 255, 248 / 255, 225 / 255)
                            : rgb(255 / 255, 255 / 255, 255 / 255),
                    borderColor: tableBorderColor,
                    textColor: rgb(75 / 255, 0 / 255, 130 / 255),
                    borderWidth: 1 // Set the border width as per your requirement
                });

                page.drawText(cell?.toString() || 'N/A', {
                    x: x + cellPadding,
                    y: y + cellPadding,
                    size:
                        cell === 'E. code' ||
                        cell === 'Name' ||
                        cell === 'Department' ||
                        cell === 'Date' ||
                        cell === 'Checkin Time' ||
                        cell === 'Checkout Time' ||
                        cell === 'Hours' ||
                        cell === 'Status' ||
                        cell === 'Status' ||
                        cell === 'On Time' ||
                        cell === 'Lates' ||
                        cell === 'Work from home' ||
                        cell === 'Leaves' ||
                        cell === 'S. No' ||
                        cell === 'Remaining Leaves' ||
                        cell === 'Availed Leaves' ||
                        cell === 'Availed WFH' ||
                        cell === 'Total Lates' ||
                        cell === 'Half day' ||
                        cell === 'Full Day off' ||
                        cell === 'Uninformed Leaves' ||
                        cell === 'Total Hours' ||
                        cell === 'Required Hours' ||
                        cell === 'Worked hours' ||
                        cell === 'Breaks' ||
                        cell === 'Total Employees'
                            ? 16
                            : 14, // Adjust the font size as needed
                    color:
                        cell === 'E. code' ||
                        cell === 'Name' ||
                        cell === 'Department' ||
                        cell === 'Date' ||
                        cell === 'Checkin Time' ||
                        cell === 'Checkout Time' ||
                        cell === 'Hours' ||
                        cell === 'Status' ||
                        cell === 'On Time' ||
                        cell === 'Lates' ||
                        cell === 'Work from home' ||
                        cell === 'Leaves' ||
                        cell === 'S. No' ||
                        cell === 'Remaining Leaves' ||
                        cell === 'Availed Leaves' ||
                        cell === 'Availed WFH' ||
                        cell === 'Total Lates' ||
                        cell === 'Half day' ||
                        cell === 'Full Day off' ||
                        cell === 'Uninformed Leaves' ||
                        cell === 'Total Hours' ||
                        cell === 'Required Hours' ||
                        cell === 'Worked hours' ||
                        cell === 'Breaks' ||
                        cell === 'Total Employees'
                            ? rgb(255 / 255, 255 / 255, 255 / 255)
                            : cell === 'On-Time'
                            ? rgb(0 / 255, 200 / 255, 83 / 255)
                            : cell === 'Half Day'
                            ? rgb(216 / 255, 67 / 255, 21 / 255)
                            : cell == 'Full Day Off'
                            ? rgb(216 / 255, 67 / 255, 21 / 255)
                            : cell == 'On-Leave'
                            ? rgb(216 / 255, 67 / 255, 21 / 255)
                            : cell == 'Holiday'
                            ? rgb(255 / 255, 193 / 255, 7 / 255)
                            : cell == 'Late'
                            ? rgb(239 / 255, 84 / 255, 4 / 255)
                            : cell == 'Work From Home'
                            ? rgb(255 / 255, 193 / 255, 7 / 255)
                            : rgb(0 / 255, 0 / 255, 0 / 255)
                });

                x += istable ? columnWidths2[index] : columnWidths[index] + columnSpaces[index];
            });

            // Draw the rightmost vertical border for the last cell
            page.drawRectangle({
                x,
                y,
                width: 1,
                height: tableHeight,
                color: tableBorderColor
            });
        };

        const drawPage = (pageIndex: number, startRowIndex: number) => {
            const page = pdfDoc.addPage([extendedPageWidth, firstPageHeight]);
            let y = firstPageHeight - margin - tableHeight;

            const headerRow = [
                'S. No',
                'E. code',
                'Name',
                'Department',
                'Date',
                'Checkin Time',
                'Checkout Time',
                'Hours',
                'Status',
                'Worked hours',
                'Breaks'
            ];

            if (pageIndex === 0) {
                const headerRow2 = ['On Time', 'Lates', 'Work from home', 'Leaves', 'Half day', 'Uninformed Leaves'];
                const headerRow3 = ['Remaining Leaves', 'Availed Leaves', 'Availed WFH', 'Total Lates'];

                if (!remainingLeaves?.total_leaves && filterData?.length > 0) {
                    headerRow2.unshift('Total Employees');
                }
                if (remainingLeaves?.total_leaves && filterData?.length > 0) {
                    headerRow2.push('Total Hours');
                    headerRow2.push('Required Hours');
                }

                const dataRow = [
                    statusCounts?.totalPresent,
                    statusCounts?.totalLate,
                    statusCounts?.totalWorkFromHome,
                    statusCounts?.totalOnLeaves,
                    statusCounts?.totalHalfDay,
                    statusCounts?.totalFullDay
                ];

                if (remainingLeaves?.total_leaves && filterData?.length > 0) {
                    dataRow.push(
                        remainingLeaves && remainingLeaves?.total_leaves && filterData?.length > 0
                            ? (() => {
                                  const totalMinutes = filterData?.reduce((acc: any, entry: any) => {
                                      const hoursWorked = entry?.totalHoursWorked;
                                      if (hoursWorked && typeof hoursWorked === 'string' && hoursWorked.includes(':')) {
                                          const [hoursStr, minutesStr] = hoursWorked.split(':');
                                          const hours = parseInt(hoursStr, 10);
                                          const minutes = parseInt(minutesStr, 10);
                                          return acc + hours * 60 + minutes;
                                      } else {
                                          return acc;
                                      }
                                  }, 0);

                                  const hours = Math.floor(totalMinutes / 60);
                                  const minutes = totalMinutes % 60;

                                  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                              })()
                            : '00:00'
                    );
                    dataRow.push(
                        remainingLeaves && remainingLeaves?.total_leaves && filterData?.length > 0
                            ? (() => {
                                  const reqHours = filterData?.filter(
                                      (item: any) =>
                                          item?.status !== 'On-Leave' && item?.status !== 'Full Day Off' && item?.status !== 'Holiday'
                                  );
                                  reqHours?.lenght * 9;

                                  //   / Calculate the total required minutes (assuming 9 hours per item)
                                  const totalMinutes = reqHours?.length * 9 * 60;

                                  // Convert the total minutes into hours and minutes
                                  const hours = Math.floor(totalMinutes / 60);
                                  const minutes = totalMinutes % 60;

                                  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                              })()
                            : '00:00'
                    );
                }

                if (!remainingLeaves?.total_leaves && filterData?.length > 0) {
                    dataRow.unshift(
                        // [
                        //     statusCounts?.totalPresent,
                        //     statusCounts?.totalLate,
                        //     statusCounts?.totalWorkFromHome,
                        //     statusCounts?.totalOnLeaves,
                        //     statusCounts?.totalHalfDay,
                        //     statusCounts?.totalFullDay
                        // ].reduce((acc, curr) => acc + curr, 0)
                        statusCounts?.totalEmployee
                    );
                }

                const yearlyRecord = [
                    remainingLeaves?.remaining_leaves,
                    remainingLeaves?.availed_leaves ?? 0,
                    remainingLeaves?.availed_wfh ?? 0,
                    remainingLeaves?.monthly_records?.reduce((acc: any, entry: any) => acc + (entry?.late_count || 0), 0) ?? 0
                ];

                const headingTextSize = 24;
                y -= headingTextSize + 10;

                page.drawText('Current Record', {
                    x: 50,
                    y: y + 10,
                    size: 24,
                    color: rgb(0, 0, 0)
                });
                y -= tableHeight;

                drawTable(page, y, headerRow2, true, 50, true);
                y -= tableHeight;

                drawTable(page, y, dataRow, false, 50, true);
                y -= tableHeight + 20;

                if (remainingLeaves?.total_leaves && filterData?.length > 0) {
                    console.log(tableHeight, 'tableHeight');

                    page.drawText('Yearly Record', {
                        x: 50,
                        y: y + 10,
                        size: 24,
                        color: rgb(0, 0, 0)
                    });
                    y -= tableHeight;

                    drawTable(page, y, headerRow3, true, 50, true);
                    // y -= tableHeight + marginBottom - 10;
                    y -= tableHeight;

                    drawTable(page, y, yearlyRecord, false, 50, true);
                    y -= tableHeight + marginBottom - 10;
                }

                y -= tableHeight + marginBottom - 20;
            }

            drawTable(page, y, headerRow);
            y -= tableHeight;

            const maxRowsPerPage = 15;

            for (let i = startRowIndex; i < startRowIndex + maxRowsPerPage && i < data.length; i++) {
                let hoursMinute;

                if (data[i]?.totalHoursWorked && data[i]?.total_break_minutes !== undefined) {
                    const [hours, minutes] = data[i].totalHoursWorked.split(':').map(Number);
                    const totalWorkedMinutes = hours * 60 + minutes;

                    const workedMinutes = totalWorkedMinutes - data[i].total_break_minutes;

                    const workedHours = Math.floor(workedMinutes / 60);
                    const workedMins = Math.round(workedMinutes % 60);

                    hoursMinute = `${workedHours}:${workedMins.toString().padStart(2, '0')}`;
                }
                const rowData = [
                    i + 1,
                    data[i]?.emp_code || 'N/A',
                    data[i]?.user?.name || 'N/A',
                    data[i]?.user?.resource?.department?.name || 'N/A',
                    moment(data[i]?.date).format('Do MMM, YYYY') || 'N/A',
                    data[i]?.check_in ? moment(data[i]?.check_in).format('LT') : 'N/A',
                    data[i]?.check_out ? moment(data[i]?.check_out).format('LT') : 'N/A',
                    data[i]?.totalHoursWorked || 'N/A',
                    data[i]?.status || 'N/A',
                    hoursMinute,
                    data[i]?.breakHours
                ];

                drawTable(page, y, rowData);
                y -= tableHeight;
            }

            page.drawText(`Page ${pageIndex + 1}`, { x: extendedPageWidth - margin - 50, y: margin, size: 14, color: rgb(0, 0, 0) });
        };

        let pageIndex = 0;
        for (let i = 0; i < data.length; i += maxRowsOnFirstPage) {
            // console.log(first)
            drawPage(pageIndex, i);
            pageIndex += 1;
        }

        pdfDoc.removePage(0);

        const pdfBytes: any = await pdfDoc.save();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(pdfBlob);
        downloadLink.download = 'employee_data.pdf';

        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
    };

    const handleChangeLocationType = (e: any) => {
        if (e) {
            setLocationTypeId(e?.id);
        } else {
            setLocationTypeId(0);
        }
    };
    const genrateDepartPDF = async (data: any[], statusCounts: any) => {
        const pdfDoc = await PDFDocument.create();
        const pageHeight = 842;
        const pageWidth = 1200;
        const margin = 50;
        const tableHeight = 30;
        const cellPadding = 5;
        const maxRowsPerPage = 15;
        let isDrawn = false;

        // Define column widths for the table
        const columnWidths = [50, 60, 180, 160, 120, 110, 100, 50, 100, 120, 90];
        const columnHeaders = [
            'S.No',
            'E.Code',
            'Name',
            'Department',
            'Date',
            'Checkin',
            'Checkout',
            'Hours',
            'Status',
            'Worked hours',
            'Breaks'
        ];

        // background color for cell content
        const getCellBackgroundColor = (cell: string) => {
            switch (cell) {
                case 'E.Code':
                case 'Name':
                case 'Department':
                case 'Date':
                case 'Checkin':
                case 'Checkout':
                case 'Hours':
                case 'Status':
                case 'Department Name':
                case 'Required Hours':
                case 'Total Hours':
                case 'Breaks':
                case 'Worked hours':
                case 'S.No':
                    return rgb(75 / 255, 0 / 255, 130 / 255);
                case 'Worked hours':
                    return rgb(75 / 255, 0 / 255, 130 / 255);
                case 'Breaks':
                    return rgb(75 / 255, 0 / 255, 130 / 255);
                case 'Uninformed Leaves':
                    return rgb(176 / 255, 41 / 255, 15 / 255);
                case 'Leaves':
                    return rgb(228 / 255, 95 / 255, 70 / 255);
                case 'On-Leave':
                    return rgb(251 / 255, 233 / 255, 231 / 255);
                case 'On-Time':
                    return rgb(185 / 255, 246 / 255, 202 / 255);
                case 'On Time':
                    return rgb(13 / 255, 176 / 255, 53 / 255);
                case 'Half Day':
                    return rgb(251 / 255, 233 / 255, 231 / 255);
                case 'Half day':
                    return rgb(176 / 255, 122 / 255, 39 / 255);
                case 'Full Day Off':
                    return rgb(251 / 255, 233 / 255, 231 / 255);
                case 'Work from home':
                    return rgb(196 / 255, 199 / 255, 77 / 255);
                case 'Work From Home':
                    return rgb(255 / 255, 248 / 255, 225 / 255);
                case 'Holiday':
                    return rgb(255 / 255, 242 / 255, 191 / 255);
                case 'Late':
                    return rgb(255 / 255, 242 / 255, 191 / 255);
                case 'Lates':
                    return rgb(218 / 255, 156 / 255, 18 / 255);
                default:
                    return rgb(255 / 255, 255 / 255, 255 / 255); // Default white
            }
        };

        // text color for cell content
        const getCellTextColor = (cell: string) => {
            switch (cell) {
                case 'E.Code':
                case 'Name':
                case 'Department':
                case 'Date':
                case 'Checkin':
                case 'Checkout':
                case 'Hours':
                case 'Status':
                case 'Department Name':
                case 'On Time':
                case 'Lates':
                case 'Work from home':
                case 'Leaves':
                case 'Half day':
                case 'Uninformed Leaves':
                case 'Required Hours':
                case 'Total Hours':
                case 'Worked hours':
                case 'Breaks':
                case 'S.No':
                    return rgb(255 / 255, 255 / 255, 255 / 255);
                case 'Worked hours':
                    return rgb(255 / 255, 255 / 255, 255 / 255);
                case 'Breaks':
                    return rgb(255 / 255, 255 / 255, 255 / 255);
                case 'On-Time':
                    return rgb(0 / 255, 200 / 255, 83 / 255);
                case 'Late':
                    return rgb(239 / 255, 84 / 255, 4 / 255);
                case 'Work From Home':
                    return rgb(255 / 255, 193 / 255, 7 / 255);
                case 'Half Day':
                    return rgb(216 / 255, 67 / 255, 21 / 255);
                case 'Full Day Off':
                    return rgb(216 / 255, 67 / 255, 21 / 255);
                case 'On-Leave':
                    return rgb(216 / 255, 67 / 255, 21 / 255);
                case 'Holiday':
                    return rgb(255 / 255, 193 / 255, 7 / 255);
                case 'Work From Home':
                    return rgb(255 / 255, 193 / 255, 7 / 255);

                default:
                    return rgb(0 / 255, 0 / 255, 0 / 255); // Default black
            }
        };

        // Function to draw a table row
        const drawTableRow = (page: any, y: any, rowData: any, columnWidths: any, isHeader = false) => {
            let x = margin;

            rowData.forEach((cell: any, index: any) => {
                const text = cell != null ? cell.toString() : 'N/A';
                const columnWidth = columnWidths[index] || 50; // Default to 50 if column width is undefined

                // Draw the background color for the cell
                page.drawRectangle({
                    x,
                    y,
                    width: columnWidth,
                    height: tableHeight,
                    color: getCellBackgroundColor(cell),
                    borderColor: rgb(0, 0, 0), // Black border
                    borderWidth: 1
                });

                // Draw the cell text
                page.drawText(text, {
                    x: x + cellPadding,
                    y: y + cellPadding,
                    size: isHeader ? 16 : 12, // Larger font size for headers
                    color: getCellTextColor(cell)
                });

                // Move to the next column position
                x += columnWidth;
            });

            return y - tableHeight; // Return updated Y position
        };

        // Helper function to add a new page and return the page and reset Y position
        const addNewPage = (pdfDoc: any) => {
            const page = pdfDoc.addPage([pageWidth, pageHeight]);
            let y = pageHeight - margin - tableHeight;
            return { page, y };
        };

        // Function to group data by employee
        const groupByEmployeeCode = (data: any) => {
            return data.reduce((result: any, current: any) => {
                if (!result[current.emp_code]) {
                    result[current.emp_code] = [];
                }
                result[current.emp_code].push(current);
                return result;
            }, {});
        };

        // Function to draw a table for each employee
        const drawEmployeeTable = (
            pdfDoc: any,
            employeeData: any,
            employeeIndex: any,
            headerRow2?: any,
            columnWidths2?: any,
            pdfData?: any
        ) => {
            let { page, y } = addNewPage(pdfDoc);
            if (!isDrawn) {
                y = drawTableRow(page, y, topHeaderRow, topHeaderColumnWidths, true);
                y = drawTableRow(page, y, topHeaderRowData, topHeaderColumnWidths, true);
                isDrawn = true;
            }

            let rowsOnCurrentPage = 0;
            const maxRowsPerPage = 15;

            y = drawTableRow(page, y - 20, headerRow2, columnWidths2, true);
            y = drawTableRow(page, y, pdfData, columnWidths2, true);

            y = drawTableRow(page, y - 20, columnHeaders, columnWidths, true);

            // Loop through each employee's data and add it to the table
            employeeData.forEach((record: any, index: any) => {
                if (rowsOnCurrentPage >= maxRowsPerPage || y - tableHeight < margin) {
                    // Add a new page if the current page is full
                    ({ page, y } = addNewPage(pdfDoc));
                    rowsOnCurrentPage = 0;
                    y = drawTableRow(page, y, columnHeaders, columnWidths, true); // Redraw the header on the new page
                }

                let hoursMinute;

                if (record?.totalHoursWorked && record?.total_break_minutes !== undefined) {
                    const [hours, minutes] = record.totalHoursWorked.split(':').map(Number);
                    const totalWorkedMinutes = hours * 60 + minutes;

                    const workedMinutes = totalWorkedMinutes - record.total_break_minutes;

                    const workedHours = Math.floor(workedMinutes / 60);
                    const workedMins = Math.round(workedMinutes % 60);

                    hoursMinute = `${workedHours}:${workedMins.toString().padStart(2, '0')}`;
                }

                const rowData = [
                    index + 1,
                    record.emp_code || 'N/A',
                    record.user?.name || 'N/A',
                    record.user?.resource?.department?.name || 'N/A',
                    moment(record.date).format('Do MMM, YYYY') || 'N/A',
                    record.check_in ? moment(record.check_in).format('LT') : 'N/A',
                    record.check_out ? moment(record.check_out).format('LT') : 'N/A',
                    record.totalHoursWorked || 'N/A',
                    record.status || 'N/A',
                    hoursMinute,
                    record?.breakHours
                ];

                y = drawTableRow(page, y, rowData, columnWidths);
                rowsOnCurrentPage++;
            });
        };

        // Group data by employee
        const groupedData = groupByEmployeeCode(data);
        let DepartlateCount = 0;
        let DepartOntimeCount = 0;
        let DepartWFHCount = 0;
        let DepartfullDayCount = 0;
        let DeparthalfDayCount = 0;
        let DepartleaveCount = 0;
        let departmentName;
        data.map((y: any) => {
            if (y?.user?.resource?.department?.name && y?.user?.resource?.department?.name != '') {
                departmentName = y?.user?.resource?.department?.name;
            }
            if (y.status == 'Late') {
                DepartlateCount++;
            } else if (y.status == 'On-Time') {
                DepartOntimeCount++;
            } else if (y.status == 'Work From Home') {
                DepartWFHCount++;
            } else if (y.status == 'Full Day Off') {
                DepartfullDayCount++;
            } else if (y.status == 'Half Day') {
                DeparthalfDayCount++;
            } else if (y.status == 'On-Leave') {
                DepartleaveCount++;
            }
        });
        const topHeaderRowData = [
            departmentName,
            DepartOntimeCount,
            DepartlateCount,
            DepartWFHCount,
            DepartleaveCount,
            DeparthalfDayCount,
            DepartfullDayCount
        ];
        const topHeaderRow = ['Department Name', 'On Time', 'Lates', 'Work from home', 'Leaves', 'Half day', 'Uninformed Leaves'];
        const topHeaderColumnWidths = [170, 100, 100, 170, 100, 100, 170];

        // Loop for each employee table
        Object.keys(groupedData).forEach((empCode, index) => {
            const employeeData = groupedData[empCode];

            let lateCount = 0;
            let OntimeCount = 0;
            let WFHCount = 0;
            let fullDayCount = 0;
            let halfDayCount = 0;
            let leaveCount = 0;
            let officeHours = 0;
            let officeMinutes = 0;

            employeeData.map((y: any) => {
                if (y.totalHoursWorked && typeof y.totalHoursWorked === 'string' && y.totalHoursWorked.includes(':')) {
                    const [hoursStr, minutesStr] = y?.totalHoursWorked.split(':');

                    const hours = parseInt(hoursStr);
                    const minutes = parseInt(minutesStr);
                    officeHours = officeHours + hours;
                    officeMinutes = officeMinutes + minutes;
                }
                if (y.status == 'Late') {
                    lateCount++;
                } else if (y.status == 'On-Time') {
                    OntimeCount++;
                } else if (y.status == 'Work From Home') {
                    WFHCount++;
                } else if (y.status == 'Full Day Off') {
                    fullDayCount++;
                } else if (y.status == 'Half Day') {
                    halfDayCount++;
                } else if (y.status == 'On-Leave') {
                    leaveCount++;
                }
            });
            officeHours = officeHours + WFHCount * 9 + Math.ceil(officeMinutes / 60);
            const reqHours = (OntimeCount + lateCount + WFHCount + halfDayCount) * 9;
            const name = employeeData?.[0]?.user?.name;
            const pdfData = [name, OntimeCount, lateCount, WFHCount, leaveCount, halfDayCount, fullDayCount, officeHours, reqHours];
            const headerRow2 = [
                'Name',
                'On Time',
                'Lates',
                'Work from home',
                'Leaves',
                'Half day',
                'Uninformed Leaves',
                'Total Hours',
                'Required Hours'
            ];
            const columnWidths2 = [170, 100, 100, 160, 100, 100, 160, 100, 130];
            drawEmployeeTable(pdfDoc, employeeData, index, headerRow2, columnWidths2, pdfData);
        });
        isDrawn = false;

        // Save and download the generated PDF
        const pdfBytes: any = await pdfDoc.save();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(pdfBlob);
        downloadLink.download = 'employee_data.pdf';

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const createPDF = async (data: any[], statusCounts: any) => {
        if (isDepartmentPdf) {
            genrateDepartPDF(data, statusCounts);
        } else {
            generatePDF(data, statusCounts);
        }
    };

    useEffect(() => {
        getDepartmentData();
        getEmployeData(startTime, endTime);

        if (
            user?.role?.name == 'Super Admin' ||
            user?.role?.name === 'Human Resource' ||
            user?.role?.name === 'Human Resource Operations'
        ) {
            return;
        }
        getResourceByIDData();
    }, []);

    useEffect(() => {
        getAllResources()
            .then((result: any) => {
                setUsers(result);
            })
            .catch((error) => {
                // Handle error here
            });
    }, []);

    const handleReject = async () => {
        const newData = { id: rowData?.id, is_approved: 'REJECTED' };
        await extraHourRequest(newData)
            .then((response) => {
                toast.success('Hours Has been Rejected');
                cancelModal();
            })
            .catch((error) => {});
    };
    const handleApprove = async () => {
        const newData = { id: rowData?.id, is_approved: 'APPROVED' };
        await extraHourRequest(newData)
            .then((response) => {
                toast.success('Hours Has been Approved');
                cancelModal();
            })
            .catch((error) => {});
    };

    const getResourceCategoryData = () => {
        dispatch(spinLoaderShow(true));
        getResourceCategory()
            .then((res) => {
                setResource(res);
            })
            .catch((err) => {
                console.log('err', err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };
    const getDepartWiseData = async () => {
        dispatch(spinLoaderShow(true));
        getDepartmentWise(department)
            .then((res) => {
                setResource(res);
            })
            .catch((err) => {
                console.log('err', err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    useEffect(() => {
        if (department) {
            getDepartWiseData();
        } else {
            getResourceCategoryData();
        }
    }, [department]);

    const renderMonthContent = (month: any, shortMonth: any, longMonth: any, day: any) => {
        const fullYear = new Date(day).getFullYear();
        const tooltipText = `Tooltip for month: ${longMonth} ${fullYear}`;
        return <span title={tooltipText}>{shortMonth}</span>;
    };

    const startDateOnChange = (e: any) => {
        const startOfMonth = new Date(e.getFullYear(), e.getMonth(), 1, 5, 0, 0);
        setStartSelectedMonthState(startOfMonth);
    };

    const endDateOnChange = (e: any) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        if (e.getFullYear() === currentYear && e.getMonth() === currentMonth) {
            setEndSelectedMonthState(now);
        } else {
            const firstDayNextMonth = new Date(e.getFullYear(), e.getMonth() + 1, 1);
            const endOfMonth = new Date(firstDayNextMonth.getTime() - 1);
            setEndSelectedMonthState(endOfMonth);
        }
    };

    useEffect(() => {
        const curentDate = new Date();
        const startOfMonth = new Date(curentDate.getFullYear(), curentDate.getMonth(), 1, 5, 0, 0);
        setStartSelectedMonthState(startOfMonth);
        setEndSelectedMonthState(curentDate);
    }, []);

    const handleOpen = (data: any) => () => {
        setBreakList(data);
        setIsModalOpen(true);
    };

    return (
        <>
            {/* <Breadcrumbs separator={IconChevronRight} heading={'List of Attendance'} icon title rightAlign /> */}

            <Grid container display={'flex'} alignItems={'center'}>
                <ImprovedFilterSection
                    name={name}
                    empCode={empCode}
                    selectedStartMonthState={selectedStartMonthState}
                    selectedEndMonthState={selectedEndMonthState}
                    startTime={startTime}
                    endTime={endTime}
                    startTimeOpen={startTimeOpen}
                    startEndOpen={startEndOpen}
                    control={control}
                    setValue={setValue}
                    errors={errors}
                    departmentData={departmentData}
                    resource={resource}
                    locationTypeOtions={locationTypeOtions}
                    user={user}
                    teamLead={teamLead}
                    locationTypeId={locationTypeId}
                    filterData={filterData}
                    statusCounts={statusCounts}
                    remainingLeaves={remainingLeaves}
                    isDepartmentPdf={isDepartmentPdf}
                    startDateOnChange={startDateOnChange}
                    endDateOnChange={endDateOnChange}
                    hanldeStartTimeChange={hanldeStartTimeChange}
                    hanldeEndTimeChange={hanldeEndTimeChange}
                    setStartTimeOpen={setStartTimeOpen}
                    setEndTimeOpen={setEndTimeOpen}
                    handleChangeDepartment={handleChangeDepartment}
                    handleChangeEmployee={handleChangeEmployee}
                    handleChangeLocationType={handleChangeLocationType}
                    onSearch={onSearch}
                    createPDF={createPDF}
                    renderMonthContent={renderMonthContent}
                />
            </Grid>

            <AttendanceCountsDisplay
                filterData={filterData}
                name={name}
                empCode={empCode}
                remainingLeaves={remainingLeaves}
                statusCounts={statusCounts}
            />

            <SubCard>
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
                                        {/* {column.label} */}

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
                                                    style={{
                                                        marginLeft: '8px',
                                                        color: '#fff',
                                                        backgroundColor: '#6e529e',
                                                        border: '1px solid #fff',
                                                        fontSize: '12px',
                                                        boxShadow: 'none !important',
                                                        height: '30px'
                                                    }}
                                                    sx={{
                                                        '& .MuiSelect-icon': {
                                                            color: '#fff !important',
                                                            border: 'none !important',
                                                            padding: 'auto 0px !important',
                                                            boxShadow: 'none !important'
                                                        },
                                                        '& .MuiSelect-select': {
                                                            border: 'none !important',
                                                            boxShadow: 'none !important',
                                                            padding: 'auto 0px !important'
                                                        },
                                                        '& .MuiSelect-root': {
                                                            border: 'none !important',
                                                            padding: 'auto 0px !important',
                                                            boxShadow: 'none !important',
                                                            paddingRight: '12px'
                                                        },
                                                        '& .css-1tkrbbx-MuiSelect-select-MuiInputBase-input.css-1tkrbbx-MuiSelect-select-MuiInputBase-input.css-1tkrbbx-MuiSelect-select-MuiInputBase-input':
                                                            {
                                                                paddingRight: '6px'
                                                            },

                                                        border: 'none !important',
                                                        padding: 'auto 0px !important',
                                                        boxShadow: 'none !important',
                                                        paddingLeft: '12px'
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
                                    <TableRow key={row.id}>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.user?.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.user?.resource?.department?.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {/* <span>{moment(row?.date).format('Do MMM, YYYY')}</span> */}
                                                <span>{moment(row?.punch_date ?? row?.created_at).format('dddd - Do MMM, YYYY')}</span>
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.check_in ? (
                                                    <>
                                                        <span>{moment(row?.check_in).format('LT')}</span>
                                                    </>
                                                ) : (
                                                    <span>-</span>
                                                )}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.check_out ? (
                                                    <>
                                                        <span>{moment(row?.check_out).format('LT')}</span>
                                                    </>
                                                ) : (
                                                    <span>-</span>
                                                )}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Typography textAlign="center" variant="caption" color="black">
                                                {(() => {
                                                    if (row?.totalHoursWorked && row?.total_break_minutes !== undefined) {
                                                        const [hours, minutes] = row.totalHoursWorked.split(':').map(Number);
                                                        const totalWorkedMinutes = hours * 60 + minutes;

                                                        const workedMinutes = totalWorkedMinutes - row.total_break_minutes;

                                                        const workedHours = Math.floor(workedMinutes / 60);
                                                        const workedMins = Math.round(workedMinutes % 60);

                                                        return `${workedHours}:${workedMins.toString().padStart(2, '0')}`;
                                                    }
                                                    return '-';
                                                })()}
                                            </Typography>
                                        </TableCell>

                                        <TableCell
                                            align="center"
                                            style={{ width: '80px', cursor: 'pointer' }}
                                            onClick={handleOpen(row?.breaks)}
                                        >
                                            <Typography
                                                sx={{ textDecoration: 'underline' }}
                                                textAlign="center"
                                                variant="caption"
                                                color={(() => {
                                                    const isFriday = moment(row?.punch_date ?? row?.created_at).format('dddd') === 'Friday';
                                                    const allowedBreakMinutes = isFriday ? 150 : 105; // 2:30 hours for Friday, 1:45 hours otherwise

                                                    if (row?.total_break_minutes === 0) return 'blue';
                                                    if (row?.total_break_minutes <= allowedBreakMinutes) return 'green';
                                                    return 'red';
                                                })()}
                                            >
                                                {row?.breakHours}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.totalHoursWorked ?? '-'}
                                            </Typography>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Typography textAlign={'center'} variant="caption">
                                                {row?.status === 'On-Time' ? (
                                                    <Chip
                                                        label={row?.status}
                                                        sx={{
                                                            color: 'rgb(0, 200, 83)',
                                                            backgroundColor: 'rgba(185, 246, 202, 0.376)',
                                                            fontSize: '11px',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                ) : row?.status === 'Half Day' ? (
                                                    <Chip
                                                        label={row?.status}
                                                        sx={{
                                                            color: 'rgb(216, 67, 21)',
                                                            backgroundColor: 'rgb(251, 233, 231)',
                                                            fontSize: '11px',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                ) : row?.status === 'Full Day Off' ? (
                                                    <Chip
                                                        label={row?.status}
                                                        sx={{
                                                            color: 'rgb(216, 67, 21)',
                                                            backgroundColor: 'rgb(251, 233, 231)',
                                                            fontSize: '11px',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                ) : row?.status === 'On-Leave' ? (
                                                    <Chip
                                                        label={row?.status}
                                                        sx={{
                                                            color: 'rgb(216, 67, 21)',
                                                            backgroundColor: 'rgb(251, 233, 231)',
                                                            fontSize: '11px',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                ) : row?.status === 'Holiday' ? (
                                                    <Chip
                                                        label={row?.status}
                                                        sx={{
                                                            color: 'rgb(255, 193, 7)',
                                                            backgroundColor: 'rgb(255, 242, 191)',
                                                            fontSize: '11px',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                ) : row?.status === 'Late' ? (
                                                    <Chip
                                                        label={row?.status}
                                                        sx={{
                                                            color: 'rgb(239, 84, 4)',
                                                            backgroundColor: 'rgb(249, 187, 155)',
                                                            fontSize: '11px',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                ) : row?.status === 'Work From Home' ? (
                                                    <Chip
                                                        label={row?.status}
                                                        sx={{
                                                            // color: 'rgb(255, 193, 7)',
                                                            color: '#BA8B00',
                                                            backgroundColor: 'rgb(255, 248, 225)',
                                                            fontSize: '11px',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                ) : row?.status === 'Extra Hours' ? (
                                                    <Chip
                                                        label={row?.status}
                                                        sx={{
                                                            color: 'rgb(1, 135, 253)',
                                                            backgroundColor: 'rgb(114, 220, 245)',
                                                            fontSize: '11px',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label={row?.status}
                                                        sx={{
                                                            color: 'rgb(216, 67, 21)',
                                                            backgroundColor: 'rgb(251, 233, 231)',
                                                            fontSize: '11px',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                )}
                                            </Typography>
                                        </TableCell>
                                        <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                            <MoreVertIcon
                                                dis-able={user?.role != 'Super Admin'}
                                                sx={{ cursor: 'pointer' }}
                                                onClick={() => OpenCommentModal(row)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[rowsPerPage]}
                        component="animate"
                        count={filterData?.length ?? 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>
            </SubCard>

            {open && (
                <div>
                    <Modal
                        open={addComment}
                        onClose={cancelModal}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <form onSubmit={handleSubmit(handleClose)}>
                                <Typography id="modal-modal-title" variant="h4" component="h2">
                                    Comment
                                </Typography>
                                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                    {/* <TextField
                                    placeholder="Enter number of extra hours if any... "
                                    multiline={false}
                                    rows={4}
                                    value={hours}
                                    onChange={(e) => handleHoursChange(e)}
                                    style={{ width: '100%' }}
                                /> */}

                                    <TextFieldControlled
                                        placeholder="Enter number of extra hours if any... "
                                        multiline={false}
                                        rows={4}
                                        value={hours}
                                        // onChange={(e: any) => handleHoursChange(e)}
                                        // onChange={handleHoursChange}
                                        style={{ width: '100%' }}
                                        control={control}
                                        errors={!!errors?.hours}
                                        helperText={errors?.hours && errors?.hours?.message}
                                        fieldName="hours"
                                        disabled={user?.role?.name == 'Super Admin'}
                                        // (user?.role?.name == 'Super Admin'
                                    />
                                </Typography>
                                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                    <TextFieldControlled
                                        placeholder="Enter Comment"
                                        multiline={true}
                                        rows={4}
                                        value={user_comment}
                                        // onChange={(e) => handleCommentChange(e)}
                                        style={{ width: '100%', minHeight: '100px' }}
                                        control={control}
                                        errors={!!errors?.user_comment}
                                        helperText={errors?.user_comment && errors?.user_comment?.message}
                                        fieldName="user_comment"
                                        disabled={user?.role?.name == 'Super Admin'}
                                    />
                                </Typography>

                                <AutoCompleteField
                                    // errors={!!errors?.approve_by}
                                    errors={errors?.approve_by && (watch('approve_by') ? false : !!errors?.approve_by)}
                                    fieldName="approve_by"
                                    autoComplete="off"
                                    label="Request Person"
                                    control={control}
                                    setValue={setValue}
                                    options={Users}
                                    returnObject={false}
                                    isLoading={true}
                                    optionKey="id"
                                    optionValue="name"
                                    disabled={user?.role?.name == 'Super Admin'}
                                    // helperText={errors?.approve_by && errors?.approve_by?.message}
                                    helperText={errors?.approve_by && (watch('approve_by') ? false : errors?.approve_by?.message)}
                                    valueGot={
                                        rowData &&
                                        Users?.find(({ id }: any) => {
                                            return id == rowData?.approve_by;
                                        })
                                    }

                                    // valueGot={
                                    //     userInfo &&
                                    //     emplymentOption?.find(({ id }: any) => {
                                    //         return id == userInfo?.userDeatils?.employment_status;
                                    //     })
                                    // }
                                    // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource')}
                                />

                                {user?.role?.name !== 'Super Admin' ? (
                                    <>
                                        <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right' }}>
                                            {' '}
                                            <Button variant="contained" onClick={() => cancelModal()}>
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="contained"
                                                // onClick={() => {
                                                //     handleClose();
                                                // }}
                                                type="submit"
                                            >
                                                Ok
                                            </Button>
                                        </Stack>
                                    </>
                                ) : (
                                    <>
                                        {' '}
                                        {/* <Button variant="contained" onClick={() => cancelModal()}> */}
                                        {rowData?.is_approved == 'APPROVED' || rowData?.is_approved == 'REJECTED' ? (
                                            <>
                                                <Stack
                                                    direction="row"
                                                    spacing={2}
                                                    sx={{ margin: 'auto', mt: 2, float: 'center', textAlign: 'center', width: '100%' }}
                                                >
                                                    <p style={{ fontWeight: '700' }}>Status: {rowData?.is_approved.toLowerCase()}</p>
                                                </Stack>
                                            </>
                                        ) : (
                                            <>
                                                <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right', width: '100%' }}>
                                                    <Button variant="contained" onClick={handleReject}>
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        // onClick={() => {
                                                        //     handleClose();
                                                        // }}
                                                        // type="submit"
                                                        onClick={handleApprove}
                                                    >
                                                        Approve
                                                    </Button>
                                                </Stack>
                                            </>
                                        )}
                                    </>
                                )}
                            </form>
                        </Box>
                    </Modal>
                </div>
            )}

            {isModalOpen && <BreakListing isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} breaks={breakList} />}
        </>
    );
};

export default Attendance;

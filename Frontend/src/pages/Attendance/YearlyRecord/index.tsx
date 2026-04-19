import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Typography,
    Button,
    Chip,
    CircularProgress
} from '@mui/material';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import SubCard from 'ui-component/cards/SubCard';
import { IconChevronRight } from '@tabler/icons';
import React, { useEffect, useState } from 'react';
import { getResourceCategory } from 'services/Allocation/taskServices';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { AutoCompleteField } from 'ui-component/formsField/FormFields';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { resourceYearlyRecord } from 'services/attendance';
// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';

// pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import useAuth from 'hooks/useAuth';
import { getDepartmentResource, getDepartmentWise } from 'services/resource';

interface MonthlyData {
    month: string;
    wfhData: number;
    lateData: number;
    halfdayData: number;
    fulldayData: number;
    leaveData: number;
    totalReqHours: number;
    hours: number;
}

interface Department {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    status: boolean;
}

interface User {
    id: string;
    email: string;
    employement_code: string;
}

interface Employee {
    id: string;
    name: string;
    status: boolean;
    is_team_lead: boolean;
    department_id: string;
    show_in_calendar: boolean;
    created_at: string;
    updated_at: string;
    department: Department;
    user: User[];
}

const years = [
    { id: '2023', name: '2023' },
    { id: '2024', name: '2024' },
    { id: '2025', name: '2025' },
    { id: '2026', name: '2026' },
    { id: '2027', name: '2027' }
];

const defautlFormValues = {
    emp_code: '',
    year: ''
};

const validationSchema = yup.object().shape({
    emp_code: yup.string().optional().nullable(),
    year: yup.string().required('Please select year').nullable()
});

const YearlyRecord = () => {
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
        reValidateMode: 'onChange',
        defaultValues: defautlFormValues,
        resolver: yupResolver(validationSchema)
    });

    const currentYear = new Date().getFullYear().toString();
    const [state, setState] = useState<MonthlyData[]>();
    const [resource, setResource] = useState<any>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>();
    const [selectedYear, setSelectedYear] = useState<string>(currentYear);
    const [selectResource, setSelectResource] = useState<Employee>();
    const [isLoading, setIsloading] = useState(false);

    const { user } = useAuth();

    const dispatch = useDispatch();

    const handleResourceChange = (event: Employee) => {
        console.log(event, 'event');
        const emp_code = event?.user[0]?.employement_code;
        setSelectResource(event);
        setSelectedEmployeeId(emp_code ?? undefined);
    };

    const handleYearChange = (event: any) => {
        setSelectedYear(event.id);
    };

    const getResourceCategoryData = () => {
        dispatch(spinLoaderShow(true));
        if (user?.role.name == 'Super Admin' || user?.role.name == 'Human Resource') {
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
        } else {
            getDepartmentResource(user?.resource?.department_id)
                .then((res: any) => {
                    setResource(res);
                })
                .catch((err) => {
                    console.log('err', err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    const onSearch = (data: any) => {
        setIsloading(true);
        console.log(data, selectedEmployeeId, 'emp_code');
        // resourceYearlyRecord(data.emp_code, data.year)
        if (user?.employement_code) {
            if (user?.role?.name == 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations' || user?.role?.name == 'Team Lead') {
                resourceYearlyRecord(selectedEmployeeId, selectedYear)
                    .then((res: any) => {
                        setState(res);
                    })
                    .catch(() => {
                        console.log('Error in fetching data');
                    })
                    .finally(() => {
                        setIsloading(false);
                    });
            } else {
                resourceYearlyRecord(user?.employement_code, selectedYear)
                    .then((res: any) => {
                        setState(res);
                    })
                    .catch(() => {
                        console.log('Error in fetching data');
                    })
                    .finally(() => {
                        setIsloading(false);
                    });
            }
        } else if (!user?.employement_code) {
            if (user?.role?.name == 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations' || user?.role?.name == 'Team Lead') {
                resourceYearlyRecord(selectedEmployeeId, selectedYear)
                    .then((res: any) => {
                        setState(res);
                    })
                    .catch(() => {
                        console.log('Error in fetching data');
                    })
                    .finally(() => {
                        setIsloading(false);
                    });
            } else {
                resourceYearlyRecord(user?.employement_code, selectedYear)
                    .then((res: any) => {
                        setState(res);
                    })
                    .catch(() => {
                        console.log('Error in fetching data');
                    })
                    .finally(() => {
                        setIsloading(false);
                    });
            }
        }
    };

    const generatePDF = () => {
        const doc: any = new jsPDF('landscape', 'pt', 'a4');
        const title = `${selectResource?.name ?? 'Employee'}`;
        const subHeading = `Yearly Attendance Report`;
        const pageWidth = doc.internal.pageSize.getWidth();
        const titleX = pageWidth / 2;
    
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(title, titleX, 30, { align: 'center' });
        doc.text(subHeading, titleX, 50, { align: 'center' });
    
        // Calculate totals for each column
        const totals = {
            lateCount: 0,
            halfDay: 0,
            uninformedLeave: 0,
            workFromHome: 0,
            availedLeaves: 0,
            requiredHours: 0,
            givenHours: 0,
        };
    
        state?.forEach((record) => {
            totals.lateCount += record.lateData ?? 0;
            totals.halfDay += record.halfdayData ?? 0;
            totals.uninformedLeave += record.fulldayData ?? 0;
            totals.workFromHome += record.wfhData ?? 0;
            totals.availedLeaves += record.leaveData ?? 0;
            totals.requiredHours += record.totalReqHours ?? 0;
            totals.givenHours += record.hours ?? 0;
        });
    
        // Add stylish totals row split into two lines
        const totalsBoxX = 50;
        const totalsBoxY = 70;
        const boxHeight = 30;
        const boxWidth = 150; // Adjusted width
        const boxPadding = 10;
        const boxColors = [
            [66, 135, 245], // Blue
            [66, 245, 179], // Green
            [245, 173, 66], // Orange
            [245, 66, 105], // Red
            [155, 66, 245], // Purple
            [245, 230, 66], // Yellow
            [94, 94, 94],   // Gray
            [0, 200, 83],   // Dark Green
        ];
    
        const totalsText = [
            `Late Count: ${totals.lateCount}`,
            `Half Day: ${totals.halfDay}`,
            `Uninformed Leave: ${totals.uninformedLeave}`,
            `Work From Home: ${totals.workFromHome}`,
            `Availed Leaves: ${totals.availedLeaves}`,
            `Required Hours: ${totals.requiredHours}`,
            `Given Hours: ${totals.givenHours}`,
        ];
    
        let currentX = totalsBoxX;
        let currentY = totalsBoxY;
    
        totalsText.forEach((text, index) => {
            if (index === Math.ceil(totalsText.length / 2)) {
                currentX = totalsBoxX; // Reset to start of line
                currentY += boxHeight + 10; // Move to the second line
            }
            doc.setFillColor(...boxColors[index % boxColors.length]);
            doc.rect(currentX, currentY, boxWidth, boxHeight, 'F'); // Box
            doc.setFontSize(10);
            doc.setTextColor(255, 255, 255);
            doc.text(text, currentX + boxPadding, currentY + 20);
            currentX += boxWidth + 10; // Space between boxes
        });
    
        // Table configuration
        const tableColumn = [
            'Month',
            'Late Count',
            'Half Day',
            'Uninformed Leave',
            'Work From Home',
            'Availed Leaves',
            'Required Hours',
            'Given Hours',
        ];
    
        const tableRows = state?.map((record) => [
            record.month ?? 0,
            record.lateData ?? 0,
            record.halfdayData ?? 0,
            record.fulldayData ?? 0,
            record.wfhData ?? 0,
            record.leaveData ?? 0,
            record.totalReqHours ?? 0,
            record.hours ?? 0,
        ]);
    
        const drawCell = (data: any) => {
            const cell = data.cell;
            const columnIndex = data.column.index;
            const rowIndex = data.row.index;
            const cellValue = cell.raw;
            if (columnIndex === 7) {
                const totalReqHours = tableRows?.[rowIndex]?.[6]; // required hours
                const givenHours = cellValue; // given hours
    
                if (totalReqHours !== undefined && givenHours >= totalReqHours) {
                    cell.styles.fillColor = [185, 246, 202]; // Green
                    cell.styles.textColor = [0, 200, 83];
                } else if (totalReqHours !== undefined && givenHours < totalReqHours) {
                    cell.styles.fillColor = [249, 187, 155]; // Red
                    cell.styles.textColor = [239, 84, 4];
                } else {
                    cell.styles.fillColor = [75, 0, 130]; // Default color
                    cell.styles.textColor = [255, 255, 255];
                }
            }
        };
    
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: currentY + boxHeight + 20,
            styles: { halign: 'center' },
            headStyles: { fillColor: [75, 0, 130], halign: 'center' },
            didParseCell: drawCell,
        });
    
        const filename = `${selectResource?.name?.toLocaleLowerCase()?.replaceAll(' ', '_') ?? 'Employee'}_yearly_attendance_report.pdf`;
        doc.save(filename);
    };
    
    

    // const generatePDF = () => {
    //     const doc: any = new jsPDF('landscape', 'pt', 'a4');
    //     const title = `${selectResource?.name ?? 'Employee'}`;
    //     const subHeading = `Yearly Attendance Report`;
    //     const pageWidth = doc.internal.pageSize.getWidth();
    //     const titleX = pageWidth / 2;

    //     doc.setFontSize(16);
    //     doc.setFont(undefined, 'bold');
    //     doc.text(title, titleX, 30, { align: 'center', fontWeight: 700 }).setFont(undefined, 'bold');
    //     doc.text(subHeading, titleX, 50, { align: 'center', fontWeight: 700 }).setFont(undefined, 'bold');

    //     const tableColumn = [
    //         'Month',
    //         'Late Count',
    //         'Half Day',
    //         'Uninformed Leave',
    //         'Work From Home',
    //         'Availed Leaves',
    //         'Required Hours',
    //         'Given Hours'
    //     ];

    //     const tableRows = state?.map((record) => [
    //         record.month ?? 0,
    //         record.lateData ?? 0,
    //         record.halfdayData ?? 0,
    //         record.fulldayData ?? 0,
    //         record.wfhData ?? 0,
    //         record.leaveData ?? 0,
    //         record.totalReqHours ?? 0,
    //         record.hours ?? 0
    //     ]);

    //     const drawCell = (data: any) => {
    //         const cell = data.cell;
    //         const columnIndex = data.column.index;
    //         const rowIndex = data.row.index;
    //         const cellValue = cell.raw;
    //         if (columnIndex === 7) {
    //             const totalReqHours = tableRows?.[rowIndex]?.[6]; // required hours
    //             const givenHours = cellValue; // given hours

    //             if (totalReqHours !== undefined && givenHours >= totalReqHours) {
    //                 cell.styles.fillColor = [185, 246, 202]; // default color
    //                 cell.styles.textColor = [0, 200, 83];
    //             } else if (totalReqHours !== undefined && givenHours < totalReqHours) {
    //                 cell.styles.fillColor = [249, 187, 155]; // red background for given hours less than required hours
    //                 cell.styles.textColor = [239, 84, 4]; // white text color
    //             } else {
    //                 cell.styles.fillColor = [75, 0, 130]; // default color
    //                 cell.styles.textColor = [255, 255, 255]; // white text color
    //             }
    //         }
    //     };

    //     doc.autoTable({
    //         head: [tableColumn],
    //         body: tableRows,
    //         startY: 70,
    //         styles: { halign: 'center' },
    //         headStyles: { fillColor: [75, 0, 130], halign: 'center' },
    //         didParseCell: drawCell
    //         // willDrawCell: drawCell
    //     });

    //     const filename = `${selectResource?.name?.toLocaleLowerCase()?.replaceAll(' ', '_') ?? 'Employee'}_yearly_attendance_report.pdf`;
    //     doc.save(filename);
    // };

    useEffect(() => {
        getResourceCategoryData();
        setValue('year', currentYear);
        if (user?.employement_code) {
            setIsloading(true);
            resourceYearlyRecord(user?.employement_code, selectedYear)
                .then((res: any) => {
                    setState(res);
                })
                .catch(() => {
                    console.log('Error in fetching data');
                })
                .finally(() => {
                    setIsloading(false);
                });
        }
    }, []);

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'Resource Yearly Record'} icon title rightAlign />

            <SubCard>
                <form onSubmit={handleSubmit(onSearch)}>
                    <Grid container item sm={12} md={12} lg={12} spacing={2}>
                        {(user?.role?.name == 'Super Admin' || user?.role?.name == 'Human Resource' || user?.role?.name == 'Team Lead') && (
                            <Grid item xs={4} md={4} sm={4}>
                                {/* <Typography>Employee</Typography> */}
                                <AutoCompleteField
                                    errors={!!errors?.emp_code}
                                    fieldName="emp_code"
                                    autoComplete="off"
                                    label="Resource *"
                                    control={control}
                                    setValue={setValue}
                                    options={resource}
                                    returnObject={false}
                                    iProps={{
                                        onChange: handleResourceChange
                                    }}
                                    isLoading={true}
                                    optionKey="id"
                                    optionValue="name"
                                    helperText={errors?.emp_code && errors?.emp_code?.message}
                                />
                            </Grid>
                        )}

                        <Grid item xs={4} md={4} sm={4}>
                            {/* <Typography>Year</Typography> */}
                            <AutoCompleteField
                                errors={!!errors?.year}
                                fieldName="year"
                                autoComplete="off"
                                label="Select Year *"
                                control={control}
                                setValue={setValue}
                                options={years}
                                returnObject={false}
                                iProps={{
                                    onChange: handleYearChange
                                }}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.year && errors?.year?.message}
                                valueGot={years?.find((year) => year.id == currentYear)}
                            />
                        </Grid>
                        <Grid
                            item
                            xs={3}
                            md={3}
                            sm={3}
                            gap={2}
                            marginTop={3}
                            display={'flex'}
                            alignItems={'center'}
                            justifyContent={'flex-end'}
                        >
                            {/* <Button onClick={handleSubmit(onSearch)} variant="contained"> */}
                            <Button type="submit" variant="contained" sx={{ width: '75.44px', height: '36.5px' }}>
                                {/* <Button type="submit" variant="contained"> */}
                                {isLoading ? <CircularProgress sx={{ color: '#fff' }} size={14} /> : 'Search'}
                            </Button>

                            {/* <Button variant="contained" type="submit" disabled={isLoading} sx={{ width: '64px', height: '36.5px' }}>
                                {isLoading ? <CircularProgress sx={{ color: '#fff' }} size={14} /> : 'Save'}
                            </Button> */}
                            {state && (
                                <Button variant="contained" onClick={generatePDF}>
                                    Download PDF
                                </Button>
                            )}
                        </Grid>
                    </Grid>
                </form>
            </SubCard>

            <SubCard>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">Month</TableCell>
                                <TableCell align="center">Late Count</TableCell>
                                <TableCell align="center">Half Day</TableCell>
                                <TableCell align="center">Uninformed Leave</TableCell>
                                <TableCell align="center">Work From Home</TableCell>
                                <TableCell align="center">Availed Leavs</TableCell>
                                <TableCell align="center">Required Hours</TableCell>
                                <TableCell align="center">Given Hours</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {state?.map((x) => (
                                <TableRow key={x.month}>
                                    <TableCell align="center">{x.month ?? 0}</TableCell>
                                    <TableCell align="center">{x.lateData ?? 0}</TableCell>
                                    <TableCell align="center">{x.halfdayData ?? 0}</TableCell>
                                    <TableCell align="center">{x.fulldayData ?? 0}</TableCell>
                                    <TableCell align="center">{x.wfhData ?? 0}</TableCell>
                                    <TableCell align="center">{x.leaveData ?? 0}</TableCell>
                                    <TableCell align="center">{x.totalReqHours ?? 0}</TableCell>
                                    <TableCell align="center">
                                        <>
                                            {x.hours >= x.totalReqHours ? (
                                                <Chip
                                                    label={x.hours ?? 0}
                                                    sx={{
                                                        color: 'rgb(0, 200, 83)',
                                                        backgroundColor: 'rgba(185, 246, 202, 0.376)',
                                                        fontSize: '11px',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            ) : (
                                                <Chip
                                                    label={x.hours ?? 0}
                                                    sx={{
                                                        color: 'rgb(239, 84, 4)',
                                                        backgroundColor: 'rgb(249, 187, 155)',
                                                        fontSize: '11px',
                                                        fontWeight: 600
                                                    }}
                                                />
                                            )}
                                        </>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </SubCard>
        </>
    );
};

export default YearlyRecord;

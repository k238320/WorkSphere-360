import type React from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@mui/material';
import moment from 'moment';

import { createDepartmentWiseSheetsExcelJS, formatMinutesToHHMM } from 'utils/helper';

// Function to sanitize Excel sheet names
const sanitizeSheetName = (name: string) => {
    const invalidChars = /[*?:\\/\[\]]/g; // regex for invalid characters
    let sanitized = name.replace(invalidChars, ''); // remove invalid characters
    if (!sanitized) sanitized = 'Sheet'; // fallback if empty
    return sanitized.substring(0, 31); // Excel limit is 31 chars
};

interface ExcelDownloadProps {
    data: any[];
    statusCounts: any;
    remainingLeaves?: any;
    isDepartmentPdf?: boolean;
    variant?: 'contained' | 'outlined' | 'text';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    isDepartmentWise?: boolean;
    departmentData?: any;
}

const ExcelDownload: React.FC<ExcelDownloadProps> = ({
    data,
    statusCounts,
    remainingLeaves,
    isDepartmentPdf = false,
    variant = 'contained',
    size = 'medium',
    disabled = false,
    isDepartmentWise = false,
    departmentData
}) => {
    const generateExcel = async () => {
        if (!data || data.length === 0) {
            alert('No data available to download');
            return;
        }

        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Generate filename with current date
        const filename = `attendance_report_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;

        if (isDepartmentWise) {
            // createDepartmentWiseSheets(data);
            await createDepartmentWiseSheetsExcelJS(data, filename);
        } else {
            // Create Summary Sheet
            createSummarySheet(workbook);

            // Create Attendance Data Sheet
            createAttendanceSheet(workbook);

            // If department-wise data, create department summary
            if (isDepartmentPdf) {
                createDepartmentSummarySheet(workbook);
            }
            XLSX.writeFile(workbook, filename);
        }
    };


    

    // const createDepartmentWiseSheetsExcelJS = async (data: any[], filename: string, orgName: string = 'Digital Gravity - Karachi') => {
    //     const workbook = new ExcelJS.Workbook();

    //     // Group by department
    //     const groupedByDept: Record<string, any[]> = data.reduce((acc, record) => {
    //         const deptName = record?.user?.resource?.department?.name || 'Unknown';
    //         if (!acc[deptName]) acc[deptName] = [];
    //         acc[deptName].push(record);
    //         return acc;
    //     }, {} as Record<string, any[]>);

    //     for (const [deptName, deptData] of Object.entries(groupedByDept)) {
    //         const sheet = workbook.addWorksheet(sanitizeSheetName(deptName), {
    //             views: [{ state: 'frozen', xSplit: 3, ySplit: 7 }]
    //         });

    //         // Calculate month range from data
    //         const dates = deptData.map((d) => moment(d.punch_date || d.created_at));
    //         const startDate = moment.min(dates);
    //         const endDate = moment.max(dates);
    //         const monthName = startDate.format('MMMM');
    //         const year = startDate.format('YYYY');

    //         // Calculate total working days in range (exclude weekends)
    //         let totalWorkingDays = 0;
    //         const current = startDate.clone();
    //         while (current.isSameOrBefore(endDate, 'day')) {
    //             const day = current.day();
    //             if (day !== 0 && day !== 6) totalWorkingDays++; // exclude Sunday(0) and Saturday(6)
    //             current.add(1, 'day');
    //         }

    //         // Header rows
    //         const sheetTitle = `Attendance Sheet - ${monthName}`;
    //         sheet.addRow([orgName]);
    //         sheet.addRow([sheetTitle]);
    //         sheet.addRow([`Department: ${deptName}`]);
    //         sheet.addRow([`From ${startDate.format('DD MMM, YYYY')} to ${endDate.format('DD MMM, YYYY')}`]);
    //         sheet.addRow([`Total Working Days (${monthName}): ${totalWorkingDays}`]);
    //         sheet.addRow([]); // empty row

    //         // Merge & center headers
    //         for (let i = 1; i <= 5; i++) {
    //             sheet.mergeCells(`A${i}:O${i}`);
    //             sheet.getCell(`A${i}`).alignment = { horizontal: 'center', vertical: 'middle' };
    //             sheet.getRow(i).font = { bold: true };
    //         }

    //         // Employee headers
    //         const headers = [
    //             'S. No',
    //             'Employee Code',
    //             'Name',
    //             'Department',
    //             'Designation',
    //             'Total Working Days',
    //             'Present Days (Include Approved Leaves & WFH)',
    //             'Full Days Off/ Unpaid leaves',
    //             'No of Lates',
    //             'No of Half Days',
    //             'No of WFH',
    //             'Deduction Applicable',
    //             'Special Deductions',
    //             'Reimbursements / Arrears',
    //             'Notes'
    //         ];
    //         sheet.addRow(headers);

    //         // Style header
    //         const headerRow = sheet.getRow(7);
    //         headerRow.eachCell((cell) => {
    //             cell.font = { bold: true };
    //             cell.alignment = { vertical: 'middle', horizontal: 'center' };
    //             cell.border = {
    //                 top: { style: 'thin' },
    //                 left: { style: 'thin' },
    //                 bottom: { style: 'thin' },
    //                 right: { style: 'thin' }
    //             };
    //             cell.fill = {
    //                 type: 'pattern',
    //                 pattern: 'solid',
    //                 fgColor: { argb: 'FFDDDDDD' }
    //             };
    //         });

    //         // Build attendance counts per employee
    //         const employeeDayStatus: Record<string, Record<string, string>> = {};
    //         const employeeInfo: Record<string, any> = {};

    //         deptData.forEach((record) => {
    //             const empCode = record.emp_code || 'N/A';
    //             const date = moment(record.punch_date || record.created_at).format('YYYY-MM-DD');

    //             if (!employeeDayStatus[empCode]) employeeDayStatus[empCode] = {};
    //             employeeDayStatus[empCode][date] = record.status;

    //             if (!employeeInfo[empCode]) {
    //                 employeeInfo[empCode] = {
    //                     code: empCode,
    //                     name: record?.user?.name || 'N/A',
    //                     department: record?.user?.resource?.department?.name || 'N/A',
    //                     designation: record?.user?.resource?.designation?.name || 'N/A'
    //                 };
    //             }
    //         });

    //         // Add employee rows
    //         let serialNo = 1;
    //         Object.entries(employeeDayStatus).forEach(([empCode, days]) => {
    //             let totalWorking = Object.keys(days).length;
    //             let presentDays = 0;
    //             let fullDayOff = 0;
    //             let lates = 0;
    //             let halfDays = 0;
    //             let wfh = 0;

    //             Object.values(days).forEach((status) => {
    //                 switch (status) {
    //                     case 'On-Time':
    //                         presentDays++;
    //                         break;
    //                     case 'Late':
    //                         presentDays++;
    //                         lates++;
    //                         break;
    //                     case 'Work From Home':
    //                         presentDays++;
    //                         wfh++;
    //                         break;
    //                     case 'Half Day':
    //                         presentDays++; // count as full present
    //                         halfDays++;
    //                         break;
    //                     case 'Full Day Off':
    //                     case 'On-Leave':
    //                         fullDayOff++;
    //                         break;
    //                 }
    //             });

    //             sheet.addRow([
    //                 serialNo++,
    //                 employeeInfo[empCode].code,
    //                 employeeInfo[empCode].name,
    //                 employeeInfo[empCode].department,
    //                 employeeInfo[empCode].designation,
    //                 totalWorking,
    //                 presentDays,
    //                 fullDayOff,
    //                 lates,
    //                 halfDays,
    //                 wfh,
    //                 '',
    //                 '',
    //                 '',
    //                 ''
    //             ]);
    //         });

    //         // Borders for all cells
    //         sheet.eachRow((row) => {
    //             row.eachCell((cell) => {
    //                 cell.border = {
    //                     top: { style: 'thin' },
    //                     left: { style: 'thin' },
    //                     bottom: { style: 'thin' },
    //                     right: { style: 'thin' }
    //                 };
    //             });
    //         });

    //         // Add auto filter
    //         sheet.autoFilter = { from: 'A7', to: 'O7' };

    //         // Column widths
    //         const colWidths = [8, 15, 25, 20, 20, 20, 30, 25, 15, 15, 15, 20, 20, 25, 20];
    //         colWidths.forEach((w, i) => (sheet.getColumn(i + 1).width = w));
    //     }

    //     // Export for browser
    //     const buffer = await workbook.xlsx.writeBuffer();
    //     const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //     const link = document.createElement('a');
    //     link.href = URL.createObjectURL(blob);
    //     link.download = filename;
    //     link.click();
    //     URL.revokeObjectURL(link.href);
    // };

    const createSummarySheet = (workbook: XLSX.WorkBook) => {
        const summaryData = [];

        // Add title
        summaryData.push(['ATTENDANCE SUMMARY REPORT']);
        summaryData.push(['Generated on:', moment().format('MMMM Do YYYY, h:mm:ss a')]);
        summaryData.push([]); // Empty row

        if (remainingLeaves && remainingLeaves?.total_leaves && data?.length > 0) {
            // Individual employee summary
            summaryData.push(['INDIVIDUAL SUMMARY']);
            summaryData.push(['Metric', 'Value']);
            summaryData.push(['Total Leaves', remainingLeaves?.total_leaves ?? 0]);
            summaryData.push(['Remaining Leaves', remainingLeaves?.remaining_leaves ?? 0]);
            summaryData.push(['Availed Leaves', remainingLeaves?.availed_leaves ?? 0]);
            summaryData.push(['Availed WFH', remainingLeaves?.availed_wfh ?? 0]);
            summaryData.push([
                'Total Lates',
                remainingLeaves?.monthly_records?.reduce((acc: any, entry: any) => acc + (entry?.late_count || 0), 0) ?? 0
            ]);
            summaryData.push([
                'Deduction',
                remainingLeaves?.monthly_records?.reduce((acc: any, entry: any) => acc + (entry?.deduction_leaves || 0), 0) ?? 0
            ]);

            // Calculate total hours
            const totalHours = calculateTotalHours();
            summaryData.push(['Total Hours', totalHours]);
            summaryData.push(['Required Hours', statusCounts.netWorkingHours ?? '00:00']);
            summaryData.push([]); // Empty row
        } else {
            // Department/Overall summary
            summaryData.push(['OVERALL SUMMARY']);
            summaryData.push(['Metric', 'Count']);
            summaryData.push(['Total Employees', statusCounts?.totalEmployee ?? 0]);
            summaryData.push(['On Time', statusCounts?.totalPresent ?? 0]);
            summaryData.push(['Late', statusCounts?.totalLate ?? 0]);
            summaryData.push(['Work From Home', statusCounts?.totalWorkFromHome ?? 0]);
            summaryData.push(['On Leave', statusCounts?.totalOnLeaves ?? 0]);
            summaryData.push(['Half Day', statusCounts?.totalHalfDay ?? 0]);
            summaryData.push(['Uninformed Leaves', statusCounts?.totalFullDay ?? 0]);
            summaryData.push([]); // Empty row
        }

        // Add status breakdown
        summaryData.push(['STATUS BREAKDOWN']);
        summaryData.push(['Status', 'Count', 'Percentage']);
        const totalRecords = data.length;

        const statusBreakdown = data.reduce((acc: any, record: any) => {
            acc[record.status] = (acc[record.status] || 0) + 1;
            return acc;
        }, {});

        Object.entries(statusBreakdown).forEach(([status, count]: [string, any]) => {
            const percentage = ((count / totalRecords) * 100).toFixed(2);
            summaryData.push([status, count, `${percentage}%`]);
        });

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

        // Set column widths
        summarySheet['!cols'] = [{ width: 25 }, { width: 15 }, { width: 15 }];

        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    };

    const createAttendanceSheet = (workbook: XLSX.WorkBook) => {
        const headers = [
            'S.No',
            'Employee Code',
            'Name',
            'Department',
            'Date',
            'Day',
            'Check-in Time',
            'Check-out Time',
            'Total Hours',
            'Worked Hours',
            'Break Hours',
            'Status',
            'Comments'
        ];

        const attendanceData = [headers];

        data.forEach((record: any, index: number) => {
            let workedHours = '-';
            if (record?.totalHoursWorked && record?.total_break_minutes !== undefined) {
                const [hours, minutes] = record.totalHoursWorked.split(':').map(Number);
                const totalWorkedMinutes = hours * 60 + minutes;
                const workedMinutes = totalWorkedMinutes - record.total_break_minutes;
                const workedHrs = Math.floor(workedMinutes / 60);
                const workedMins = Math.round(workedMinutes % 60);
                workedHours = `${workedHrs}:${workedMins.toString().padStart(2, '0')}`;
            }

            const row = [
                index + 1,
                record?.emp_code || 'N/A',
                record?.user?.name || 'N/A',
                record?.user?.resource?.department?.name || 'N/A',
                moment(record?.punch_date ?? record?.created_at).format('DD/MM/YYYY'),
                moment(record?.punch_date ?? record?.created_at).format('dddd'),
                record?.check_in ? moment(record?.check_in).format('HH:mm:ss') : '-',
                record?.check_out ? moment(record?.check_out).format('HH:mm:ss') : '-',
                record?.totalHoursWorked || '-',
                workedHours,
                record?.breakHours || '-',
                record?.status || '-',
                record?.user_comment || '-'
            ];

            attendanceData.push(row);
        });

        const attendanceSheet = XLSX.utils.aoa_to_sheet(attendanceData);

        // Set column widths
        attendanceSheet['!cols'] = [
            { width: 8 }, // S.No
            { width: 15 }, // Employee Code
            { width: 25 }, // Name
            { width: 20 }, // Department
            { width: 12 }, // Date
            { width: 12 }, // Day
            { width: 12 }, // Check-in
            { width: 12 }, // Check-out
            { width: 12 }, // Total Hours
            { width: 12 }, // Worked Hours
            { width: 12 }, // Break Hours
            { width: 15 }, // Status
            { width: 30 } // Comments
        ];

        // Style the header row
        const headerRange = XLSX.utils.decode_range(attendanceSheet['!ref'] || 'A1');
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (!attendanceSheet[cellAddress]) continue;
            attendanceSheet[cellAddress].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: '6e529e' } },
                alignment: { horizontal: 'center' }
            };
        }

        XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Attendance Data');
    };

    const createDepartmentSummarySheet = (workbook: XLSX.WorkBook) => {
        // Group data by employee
        const groupedData = data.reduce((result: any, current: any) => {
            if (!result[current.emp_code]) {
                result[current.emp_code] = [];
            }
            result[current.emp_code].push(current);
            return result;
        }, {});

        const departmentSummaryData = [];

        // Add headers
        departmentSummaryData.push([
            'Employee Code',
            'Name',
            'Department',
            'On Time',
            'Late',
            'Work From Home',
            'Leaves',
            'Half Day',
            'Uninformed Leaves',
            'Total Hours',
            'Required Hours'
        ]);

        // Process each employee
        Object.entries(groupedData).forEach(([empCode, employeeData]: [string, any]) => {
            let lateCount = 0;
            let onTimeCount = 0;
            let wfhCount = 0;
            let fullDayCount = 0;
            let halfDayCount = 0;
            let leaveCount = 0;
            let totalMinutes = 0;

            employeeData.forEach((record: any) => {
                // Count status types
                switch (record.status) {
                    case 'Late':
                        lateCount++;
                        break;
                    case 'On-Time':
                        onTimeCount++;
                        break;
                    case 'Work From Home':
                        wfhCount++;
                        break;
                    case 'Full Day Off':
                        fullDayCount++;
                        break;
                    case 'Half Day':
                        halfDayCount++;
                        break;
                    case 'On-Leave':
                        leaveCount++;
                        break;
                }

                // Calculate total hours
                if (record.totalHoursWorked && typeof record.totalHoursWorked === 'string' && record.totalHoursWorked.includes(':')) {
                    const [hoursStr, minutesStr] = record.totalHoursWorked.split(':');
                    const hours = Number.parseInt(hoursStr);
                    const minutes = Number.parseInt(minutesStr);
                    totalMinutes += hours * 60 + minutes;
                }
            });

            // Add WFH hours (9 hours each)
            totalMinutes += wfhCount * 9 * 60;
            const totalHours = Math.floor(totalMinutes / 60);
            const remainingMinutes = totalMinutes % 60;
            const totalHoursFormatted = `${totalHours}:${remainingMinutes.toString().padStart(2, '0')}`;

            const requiredHours = (onTimeCount + lateCount + wfhCount + halfDayCount) * 9;

            const row = [
                empCode,
                employeeData[0]?.user?.name || 'N/A',
                employeeData[0]?.user?.resource?.department?.name || 'N/A',
                onTimeCount,
                lateCount,
                wfhCount,
                leaveCount,
                halfDayCount,
                fullDayCount,
                totalHoursFormatted,
                requiredHours
            ];

            departmentSummaryData.push(row);
        });

        const departmentSheet = XLSX.utils.aoa_to_sheet(departmentSummaryData);

        // Set column widths
        departmentSheet['!cols'] = [
            { width: 15 }, // Employee Code
            { width: 25 }, // Name
            { width: 20 }, // Department
            { width: 10 }, // On Time
            { width: 10 }, // Late
            { width: 15 }, // Work From Home
            { width: 10 }, // Leaves
            { width: 12 }, // Half Day
            { width: 18 }, // Uninformed Leaves
            { width: 12 }, // Total Hours
            { width: 15 } // Required Hours
        ];

        XLSX.utils.book_append_sheet(workbook, departmentSheet, 'Department Summary');
    };

    const calculateTotalHours = () => {
        if (!remainingLeaves?.total_leaves || !data?.length) return '00:00';

        const totalMinutes = data.reduce((acc: any, entry: any) => {
            const hoursWorked = entry?.totalHoursWorked;
            if (hoursWorked && typeof hoursWorked === 'string' && hoursWorked.includes(':')) {
                const [hoursStr, minutesStr] = hoursWorked.split(':');
                const hours = Number.parseInt(hoursStr, 10);
                const minutes = Number.parseInt(minutesStr, 10);
                return acc + hours * 60 + minutes;
            }
            return acc;
        }, 0);

        // Add WFH hours
        const totalWFH = data.filter((item: any) => item?.status === 'Work From Home').length;
        const wfhMinutes = totalWFH > 0 ? totalWFH * 9 * 60 : 0;
        const totalMinutesWithWFH = totalMinutes + wfhMinutes;

        const hours = Math.floor(totalMinutesWithWFH / 60);
        const minutes = totalMinutesWithWFH % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    return (
        <Button
            onClick={generateExcel}
            variant={variant}
            size={size}
            disabled={disabled || !data || data.length === 0}
            sx={{
                backgroundColor: variant === 'contained' ? '#28a745' : 'transparent',
                color: variant === 'contained' ? 'white' : '#28a745',
                border: variant === 'outlined' ? '1px solid #28a745' : 'none',
                '&:hover': {
                    backgroundColor: variant === 'contained' ? '#218838' : 'rgba(40, 167, 69, 0.1)'
                }
            }}
        >
            {isDepartmentWise ? 'Download Department-wise Excel' : 'Download Excel'}
        </Button>
    );
};

export default ExcelDownload;

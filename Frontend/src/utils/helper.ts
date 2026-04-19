import ExcelJS from 'exceljs';
import moment from 'moment';
import * as fs from 'fs';

export function calculateTimeFromMinutes(totalMinutes: number): string {
    const totalTimeInSeconds = totalMinutes * 60;

    const hours = Math.floor(totalTimeInSeconds / 3600);
    const minutes = Math.floor((totalTimeInSeconds % 3600) / 60);
    const seconds = Math.round(totalTimeInSeconds % 60);

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

// helper: sanitize sheet name
function sanitizeSheetName(name: string) {
    return name.replace(/[\\/?*[\]:]/g, '').substring(0, 31);
}

export function formatMinutesToHHMM(totalMinutes: number) {
    totalMinutes = Math.round(totalMinutes);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}:${m.toString().padStart(2, '0')}`;
}

const ramadanYears = {
    2024: { start: '2024-03-11', end: '2024-04-09' },
    2025: { start: '2025-03-01', end: '2025-03-30' },
    2026: { start: '2026-02-18', end: '2026-03-19' }
};

export const createDepartmentWiseSheetsExcelJS = async (data: any[], filename: string, orgName: string = 'Digital Gravity - Karachi') => {
    const workbook = new ExcelJS.Workbook();

    // Group by department
    const groupedByDept: Record<string, any[]> = data.reduce((acc, record) => {
        const deptName = record?.user?.resource?.department?.name || 'Unknown';
        if (!acc[deptName]) acc[deptName] = [];
        acc[deptName].push(record);
        return acc;
    }, {} as Record<string, any[]>);

    for (const [deptName, deptData] of Object.entries(groupedByDept)) {
        const sheet = workbook.addWorksheet(sanitizeSheetName(deptName), {
            views: [{ state: 'frozen', xSplit: 3, ySplit: 7 }]
        });

        // Calculate month range from data
        const dates = deptData.map((d) => moment(d.punch_date || d.created_at));
        const startDate = moment.min(dates);
        const endDate = moment.max(dates);
        const monthName = startDate.format('MMMM');
        const year = startDate.format('YYYY');

        // Calculate total working days (exclude weekends)
        let totalWorkingDays = 0;
        const current = startDate.clone();
        while (current.isSameOrBefore(endDate, 'day')) {
            const day = current.day();
            if (day !== 0 && day !== 6) totalWorkingDays++;
            current.add(1, 'day');
        }

        // Header rows
        const sheetTitle = `Attendance Sheet - ${monthName}`;
        sheet.addRow([orgName]);
        sheet.addRow([sheetTitle]);
        sheet.addRow([`Department: ${deptName}`]);
        sheet.addRow([`From ${startDate.format('DD MMM, YYYY')} to ${endDate.format('DD MMM, YYYY')}`]);
        sheet.addRow([`Total Working Days (${monthName}): ${totalWorkingDays}`]);
        sheet.addRow([]);

        // Merge & center headers
        for (let i = 1; i <= 5; i++) {
            sheet.mergeCells(`A${i}:Q${i}`);
            sheet.getCell(`A${i}`).alignment = { horizontal: 'center', vertical: 'middle' };
            sheet.getRow(i).font = { bold: true };
        }

        // Headers
        const headers = [
            'S. No',
            'Employee Code',
            'Name',
            'Department',
            'Designation',
            'Total Working Days',
            'Total Days Worked',
            'Approved Leaves',
            'Full Days Off',
            'No of Lates',
            'No of Half Days',
            'No of WFH',
            'Total Working Hours',
            'Break Hours',
            'Average Working Hours',
            'Required Hours',
            'Notes'
        ];
        sheet.addRow(headers);

        const headerRow = sheet.getRow(7);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDDDDDD' }
            };
        });

        // Employee aggregation
        const employeeDayStatus: Record<string, Record<string, string>> = {};
        const employeeInfo: Record<string, any> = {};

        deptData.forEach((record) => {
            const empCode = record.emp_code || 'N/A';
            const date = moment(record.punch_date || record.created_at).format('YYYY-MM-DD');

            if (!employeeDayStatus[empCode]) employeeDayStatus[empCode] = {};
            employeeDayStatus[empCode][date] = record.status;

            if (!employeeInfo[empCode]) {
                employeeInfo[empCode] = {
                    code: empCode,
                    name: record?.user?.name || 'N/A',
                    department: record?.user?.resource?.department?.name || 'N/A',
                    designation: record?.user?.resource?.designation?.name || 'N/A'
                };
            }
        });

        // Add rows
        let serialNo = 1;
        Object.entries(employeeDayStatus).forEach(([empCode, days]) => {
            let presentDays = 0;
            let fullDayOff = 0;
            let lates = 0;
            let halfDays = 0;
            let wfh = 0;
            let approvedLeaves = 0;

            let totalWorkedMinutes = 0;
            let totalBreakMinutes = 0;
            let requiredMinutes = 0;

            Object.entries(days).forEach(([date, status]) => {
                const record = deptData.find(
                    (r) => (r.emp_code || 'N/A') === empCode && moment(r.punch_date || r.created_at).format('YYYY-MM-DD') === date
                );

                const mDate = moment(date);
                const ramadan = Object.values(ramadanYears).find((r) => mDate.isBetween(moment(r.start), moment(r.end), 'day', '[]'));

                const dailyRequired = ramadan ? 6 * 60 : 9 * 60;

                switch (status) {
                    case 'On-Time':
                        presentDays++;
                        requiredMinutes += dailyRequired;
                        break;
                    case 'Late':
                        presentDays++;
                        lates++;
                        requiredMinutes += dailyRequired;
                        break;
                    case 'Work From Home':
                        presentDays++;
                        wfh++;
                        requiredMinutes += dailyRequired;
                        break;
                    case 'Half Day':
                        presentDays++;
                        halfDays++;
                        requiredMinutes += Math.floor(dailyRequired / 2);
                        break;
                    case 'Full Day Off':
                    case 'On-Leave':
                        fullDayOff++;
                        if (status === 'On-Leave') approvedLeaves++;
                        break;
                }

                // Worked time
                if (record?.totalHoursWorked && record?.total_break_minutes !== undefined) {
                    let totalMinutes = 0;

                    if (typeof record.totalHoursWorked === 'string' && record.totalHoursWorked.includes(':')) {
                        const [h, m] = record.totalHoursWorked.split(':').map(Number);
                        totalMinutes = h * 60 + m;
                    } else {
                        const floatHours = parseFloat(record.totalHoursWorked);
                        const h = Math.floor(floatHours);
                        const m = Math.round((floatHours - h) * 60);
                        totalMinutes = h * 60 + m;
                    }

                    const breakMinutes = Math.round(Number(record.total_break_minutes || 0));
                    const workedMinutes = totalMinutes - breakMinutes;

                    totalWorkedMinutes += workedMinutes;
                    totalBreakMinutes += breakMinutes;
                }
            });

            const totalWorkedFormatted = formatMinutesToHHMM(totalWorkedMinutes);
            const avgWorkedFormatted = presentDays > 0 ? formatMinutesToHHMM(Math.floor(totalWorkedMinutes / presentDays)) : '-';
            const breakFormatted = formatMinutesToHHMM(totalBreakMinutes);
            const requiredFormatted = formatMinutesToHHMM(requiredMinutes);

            sheet.addRow([
                serialNo++,
                employeeInfo[empCode].code,
                employeeInfo[empCode].name,
                employeeInfo[empCode].department,
                employeeInfo[empCode].designation,
                Object.keys(days).length,
                presentDays,
                approvedLeaves,
                fullDayOff,
                lates,
                halfDays,
                wfh,
                totalWorkedFormatted,
                breakFormatted,
                avgWorkedFormatted,
                requiredFormatted,
                ''
            ]);
        });

        // Borders
        sheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Auto filter
        sheet.autoFilter = { from: 'A7', to: 'Q7' };

        // Column widths
        const colWidths = [8, 15, 25, 20, 20, 20, 20, 20, 20, 15, 15, 15, 20, 20, 20, 20, 25];
        colWidths.forEach((w, i) => (sheet.getColumn(i + 1).width = w));
    }

    // Export for browser
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};

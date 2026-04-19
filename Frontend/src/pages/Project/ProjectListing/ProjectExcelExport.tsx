import * as XLSX from 'xlsx';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { getProjectListing } from 'services/projectService';
import moment from 'moment';

// Helper functions to match your UI formatting
const formatDate = (date: string | null) => {
    if (!date) return 'No Date';
    return moment(date).format('MMM YYYY');
};

const formatAmount = (amount: number | null) => {
    if (!amount) return '0';
    return `${amount.toLocaleString()} AED`;
};

export const useProjectExcelExport = () => {
    const dispatch = useDispatch();

    const exportToExcel = async (query: string, getData?: any) => {
        dispatch(spinLoaderShow(true));
        try {
            const newQuery = query + '&pdf=true';
            const data: any = await getProjectListing(newQuery);
            const { rows, projectDivisionsWithCount, statusCounts } = data;

            console.log('Raw data from API:', data); // Debug log
            console.log('First project milestones:', rows?.[0]?.project_milestone); // Debug log

            const workbook = XLSX.utils.book_new();

            const headers = [
                'No',
                'Project Name',
                'Status',
                'Project Manager',
                'Project Division',
                'Contract Type',
                'Planned Hours',
                'Consumed Hours',
                'Budget (AED)',
                'Cost (AED)',
                'Profit/Loss (AED)',
                'Profit Status',
                'Client Name',
                'Client Phone',
                'Client Email',
                'Technologies',
                'Categories',
                'Industries',
                'Total Milestones',
                'Completed Milestones',
                'Pending Milestones',
                'Milestone Summary'
            ];

            const projectRows: any[] = [];
            const merges: any[] = [];

            rows?.forEach((row: any, index: number) => {
                const clientDetails = row?.client_details || [];
                const technologies = row?.project_technology?.map((tech: any) => tech.name).join(', ') || '';
                const categories = row?.project_categories?.map((cat: any) => cat.name).join(', ') || '';
                const industries = row?.project_industry?.map((ind: any) => ind.name).join(', ') || '';
                const projectManagers = row?.project_manager_details?.map((pm: any) => pm.name).join(', ') || '';

                const milestones = [...(row?.project_milestone || [])];
                const sorted = milestones.sort((a, b) => Number(a.invoice) - Number(b.invoice));

                const completedMilestones = sorted.filter((milestone) => milestone.invoice).length;
                const pendingMilestones = sorted.length - completedMilestones;

                const baseColumns = [
                    index + 1,
                    row?.name || '',
                    row?.project_status?.[0]?.project_statuses?.name || '',
                    projectManagers,
                    row?.projectDivision?.name || '',
                    row?.project_contract_type?.name || '',
                    row?.projectPlannedHours || 0,
                    row?.projectConsumedHours || 0,
                    row?.budget || 0,
                    row?.cost || 0,
                    row?.profitOrLoss || 0,
                    row?.status || '',
                    clientDetails?.[0]?.name || '',
                    clientDetails?.[0]?.number || '',
                    clientDetails?.[0]?.email || '',
                    technologies,
                    categories,
                    industries,
                    sorted.length,
                    completedMilestones,
                    pendingMilestones
                ];

                if (sorted.length === 0) {
                    // No milestones → 1 row with "No milestones"
                    projectRows.push([...baseColumns, '']);
                } else {
                    const startRowIndex = projectRows.length + 1; // +1 because header is at row 0
                    sorted.forEach((milestone, i) => {
                        const milestoneSummary = `${milestone.invoice ? '✅' : '❌'} ${
                            milestone.milestone_phase?.name || 'Unnamed Phase'
                        } | ${formatDate(milestone.targeted_month)} | ${formatAmount(milestone.milestone_payment)}`;
                        if (i === 0) {
                            projectRows.push([...baseColumns, milestoneSummary]);
                        } else {
                            const emptyCols = new Array(baseColumns.length).fill('');
                            projectRows.push([...emptyCols, milestoneSummary]);
                        }
                    });

                    // Merge vertically for all columns except milestone summary
                    const endRowIndex = startRowIndex + sorted.length - 1;
                    for (let col = 0; col < baseColumns.length; col++) {
                        merges.push({
                            s: { r: startRowIndex, c: col },
                            e: { r: endRowIndex, c: col }
                        });
                    }
                }
            });

            // Summary data with milestone statistics
            const summaryData = [
                ['PROJECT LISTING REPORT'],
                ['Generated on:', moment().format('DD/MM/YYYY HH:mm:ss')],
                [''],
                ['EXECUTIVE SUMMARY'],
                ['Total Projects:', rows?.length || 0],
                ['']
            ];

            const totalBudget = rows?.reduce((sum: number, row: any) => sum + (row?.budget || 0), 0) || 0;
            const totalCost = rows?.reduce((sum: number, row: any) => sum + (row?.cost || 0), 0) || 0;
            const totalProfit = totalBudget - totalCost;
            const totalPlannedHours = rows?.reduce((sum: number, row: any) => sum + (row?.projectPlannedHours || 0), 0) || 0;
            const totalConsumedHours = rows?.reduce((sum: number, row: any) => sum + (row?.projectConsumedHours || 0), 0) || 0;

            // Calculate milestone statistics exactly like your UI
            const totalMilestones =
                rows?.reduce((sum: number, row: any) => {
                    const milestones = [...(row?.project_milestone || [])];
                    return sum + milestones.length;
                }, 0) || 0;

            const totalCompletedMilestones =
                rows?.reduce((sum: number, row: any) => {
                    const milestones = [...(row?.project_milestone || [])];
                    const completed = milestones.filter((milestone) => milestone.invoice).length;
                    return sum + completed;
                }, 0) || 0;

            const totalPendingMilestones = totalMilestones - totalCompletedMilestones;

            summaryData.push(['FINANCIAL OVERVIEW']);
            summaryData.push(['Total Budget (AED):', totalBudget.toLocaleString()]);
            summaryData.push(['Total Cost (AED):', totalCost.toLocaleString()]);
            summaryData.push(['Total Profit/Loss (AED):', totalProfit.toLocaleString()]);
            summaryData.push(['Total Planned Hours:', totalPlannedHours.toLocaleString()]);
            summaryData.push(['Total Consumed Hours:', totalConsumedHours.toLocaleString()]);
            summaryData.push(['']);
            summaryData.push(['MILESTONE OVERVIEW']);
            summaryData.push(['Total Milestones:', totalMilestones]);
            summaryData.push(['Completed Milestones:', totalCompletedMilestones]);
            summaryData.push(['Pending Milestones:', totalPendingMilestones]);
            summaryData.push([
                'Completion Rate:',
                totalMilestones > 0 ? `${Math.round((totalCompletedMilestones / totalMilestones) * 100)}%` : '0%'
            ]);
            summaryData.push(['']);

            summaryData.push(['PROJECT DIVISIONS BREAKDOWN']);
            if (projectDivisionsWithCount) {
                projectDivisionsWithCount.forEach((division: any) => {
                    summaryData.push([division.name, division.count]);
                });
            }

            summaryData.push(['']);
            summaryData.push(['STATUS BREAKDOWN']);
            if (statusCounts) {
                Object.entries(statusCounts).forEach(([status, count]) => {
                    summaryData.push([status.toUpperCase(), count]);
                });
            }

            // Create and style summary sheet
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];

            // Apply summary sheet styling
            const summaryRange = XLSX.utils.decode_range(summarySheet['!ref'] || 'A1');
            for (let row = summaryRange.s.r; row <= summaryRange.e.r; row++) {
                for (let col = summaryRange.s.c; col <= summaryRange.e.c; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                    if (!summarySheet[cellAddress]) continue;

                    const cellValue = summarySheet[cellAddress].v?.toString() || '';

                    if (row === 0) {
                        summarySheet[cellAddress].s = {
                            font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } },
                            fill: { fgColor: { rgb: '1F4E79' } },
                            alignment: { horizontal: 'center', vertical: 'center' },
                            border: {
                                top: { style: 'thick', color: { rgb: '000000' } },
                                bottom: { style: 'thick', color: { rgb: '000000' } },
                                left: { style: 'thick', color: { rgb: '000000' } },
                                right: { style: 'thick', color: { rgb: '000000' } }
                            }
                        };
                    } else if (
                        cellValue.includes('EXECUTIVE') ||
                        cellValue.includes('FINANCIAL') ||
                        cellValue.includes('MILESTONE') ||
                        cellValue.includes('DIVISIONS') ||
                        cellValue.includes('STATUS')
                    ) {
                        summarySheet[cellAddress].s = {
                            font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
                            fill: { fgColor: { rgb: '4472C4' } },
                            alignment: { horizontal: 'center', vertical: 'center' },
                            border: {
                                top: { style: 'thin', color: { rgb: '000000' } },
                                bottom: { style: 'thin', color: { rgb: '000000' } },
                                left: { style: 'thin', color: { rgb: '000000' } },
                                right: { style: 'thin', color: { rgb: '000000' } }
                            }
                        };
                    } else if (cellValue && col === 0 && row > 1) {
                        summarySheet[cellAddress].s = {
                            font: { bold: true, sz: 10 },
                            fill: { fgColor: { rgb: 'E8F4FD' } },
                            alignment: { horizontal: 'left', vertical: 'center' }
                        };
                    } else if (cellValue && col === 1 && row > 1) {
                        summarySheet[cellAddress].s = {
                            font: { sz: 10 },
                            fill: { fgColor: { rgb: 'F8F9FA' } },
                            alignment: { horizontal: 'right', vertical: 'center' }
                        };
                    }
                }
            }

            summarySheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
            XLSX.utils.book_append_sheet(workbook, summarySheet, '📊 Summary');

            // Create main projects sheet
            const mainSheet = XLSX.utils.aoa_to_sheet([headers, ...projectRows]);

            // Set column widths - make milestone summary column extra wide
            const colWidths = [
                { wch: 5 }, // No
                { wch: 25 }, // Project Name
                { wch: 15 }, // Status
                { wch: 20 }, // Project Manager
                { wch: 18 }, // Project Division
                { wch: 15 }, // Contract Type
                { wch: 12 }, // Planned Hours
                { wch: 12 }, // Consumed Hours
                { wch: 15 }, // Budget
                { wch: 15 }, // Cost
                { wch: 15 }, // Profit/Loss
                { wch: 12 }, // Profit Status
                { wch: 20 }, // Client Name
                { wch: 15 }, // Client Phone
                { wch: 25 }, // Client Email
                { wch: 30 }, // Technologies
                { wch: 25 }, // Categories
                { wch: 25 }, // Industries
                { wch: 12 }, // Total Milestones
                { wch: 15 }, // Completed Milestones
                { wch: 15 }, // Pending Milestones
                { wch: 60 } // Milestone Summary - Extra wide for detailed info
            ];

            mainSheet['!cols'] = colWidths;
            mainSheet['!merges'] = merges;

            // Style the main sheet
            const mainRange = XLSX.utils.decode_range(mainSheet['!ref'] || 'A1');
            for (let row = mainRange.s.r; row <= mainRange.e.r; row++) {
                for (let col = mainRange.s.c; col <= mainRange.e.c; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                    if (!mainSheet[cellAddress]) continue;

                    if (row === 0) {
                        // Header styling with special colors for milestone columns
                        let headerColor = '2E7D32'; // Default green
                        if (col >= 18) {
                            headerColor = '7B1FA2'; // Purple for milestone columns
                        }

                        mainSheet[cellAddress].s = {
                            font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
                            fill: { fgColor: { rgb: headerColor } },
                            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                            border: {
                                top: { style: 'thick', color: { rgb: '000000' } },
                                bottom: { style: 'thick', color: { rgb: '000000' } },
                                left: { style: 'thin', color: { rgb: '000000' } },
                                right: { style: 'thin', color: { rgb: '000000' } }
                            }
                        };
                    } else {
                        // Data row styling
                        const cellValue = mainSheet[cellAddress].v;
                        let fillColor = row % 2 === 0 ? 'F8F9FA' : 'FFFFFF';
                        let textColor = '000000';

                        // Special styling for milestone columns
                        if (col === 18) {
                            // Total Milestones
                            const count = Number(cellValue) || 0;
                            if (count > 0) {
                                fillColor = 'E3F2FD';
                                textColor = '1976D2';
                            }
                        } else if (col === 19) {
                            // Completed Milestones
                            const count = Number(cellValue) || 0;
                            if (count > 0) {
                                fillColor = 'E8F5E8';
                                textColor = '2E7D32';
                            }
                        } else if (col === 20) {
                            // Pending Milestones
                            const count = Number(cellValue) || 0;
                            if (count > 0) {
                                fillColor = 'FFF3E0';
                                textColor = 'F57C00';
                            }
                        } else if (col === 21) {
                            // Milestone Summary
                            fillColor = 'F3E5F5';
                            textColor = '7B1FA2';
                        }
                        // Profit/Loss styling
                        else if (col === 10) {
                            const value = Number(cellValue) || 0;
                            textColor = value >= 0 ? '2E7D32' : 'D32F2F';
                            fillColor = value >= 0 ? 'E8F5E8' : 'FFEBEE';
                        } else if (col === 11) {
                            if (cellValue === 'Profit') {
                                textColor = '2E7D32';
                                fillColor = 'E8F5E8';
                            } else {
                                textColor = 'D32F2F';
                                fillColor = 'FFEBEE';
                            }
                        }

                        mainSheet[cellAddress].s = {
                            font: { sz: 9, color: { rgb: textColor } },
                            fill: { fgColor: { rgb: fillColor } },
                            alignment: {
                                horizontal: col === 21 ? 'left' : 'center', // Left align milestone summary
                                vertical: 'top',
                                wrapText: true
                            },
                            border: {
                                top: { style: 'thin', color: { rgb: 'E0E0E0' } },
                                bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
                                left: { style: 'thin', color: { rgb: 'E0E0E0' } },
                                right: { style: 'thin', color: { rgb: 'E0E0E0' } }
                            }
                        };
                    }
                }
            }

            XLSX.utils.book_append_sheet(workbook, mainSheet, '📋 Projects');

            // Create detailed milestones sheet (matching your UI table structure)
            const milestoneHeaders = ['Project Name', 'Milestone Phase', 'Invoice Status', 'Target Month', 'Payment Amount'];

            const milestoneRows: any[] = [];
            rows?.forEach((row: any) => {
                const projectName = row?.name || '';
                const milestones = [...(row?.project_milestone || [])];
                const sorted = milestones.sort((a, b) => Number(a.invoice) - Number(b.invoice));

                if (sorted.length > 0) {
                    sorted.forEach((milestone: any) => {
                        milestoneRows.push([
                            projectName,
                            milestone.milestone_phase?.name || 'Unnamed Phase',
                            milestone.invoice ? '✅ Completed' : '❌ Pending',
                            formatDate(milestone.targeted_month),
                            formatAmount(milestone.milestone_payment)
                        ]);
                    });
                } else {
                    milestoneRows.push([projectName, 'No milestones defined', '', '', '']);
                }
            });

            const milestoneSheet = XLSX.utils.aoa_to_sheet([milestoneHeaders, ...milestoneRows]);
            milestoneSheet['!cols'] = [
                { wch: 30 }, // Project Name
                { wch: 25 }, // Milestone Phase
                { wch: 15 }, // Invoice Status
                { wch: 15 }, // Target Month
                { wch: 20 } // Payment Amount
            ];

            // Style milestone sheet
            const milestoneRange = XLSX.utils.decode_range(milestoneSheet['!ref'] || 'A1');
            for (let row = milestoneRange.s.r; row <= milestoneRange.e.r; row++) {
                for (let col = milestoneRange.s.c; col <= milestoneRange.e.c; col++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                    if (!milestoneSheet[cellAddress]) continue;

                    if (row === 0) {
                        milestoneSheet[cellAddress].s = {
                            font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
                            fill: { fgColor: { rgb: '7B1FA2' } },
                            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                            border: {
                                top: { style: 'thick', color: { rgb: '000000' } },
                                bottom: { style: 'thick', color: { rgb: '000000' } },
                                left: { style: 'thin', color: { rgb: '000000' } },
                                right: { style: 'thin', color: { rgb: '000000' } }
                            }
                        };
                    } else {
                        const cellValue = milestoneSheet[cellAddress].v;
                        let fillColor = row % 2 === 0 ? 'F8F9FA' : 'FFFFFF';
                        let textColor = '000000';

                        // Status column coloring (matches your UI colors)
                        if (col === 2) {
                            if (cellValue && cellValue.includes('✅')) {
                                textColor = '4caf50'; // Green like your UI
                                fillColor = 'E8F5E8';
                            } else if (cellValue && cellValue.includes('❌')) {
                                textColor = 'f44336'; // Red like your UI
                                fillColor = 'FFEBEE';
                            }
                        }

                        milestoneSheet[cellAddress].s = {
                            font: { sz: 9, color: { rgb: textColor } },
                            fill: { fgColor: { rgb: fillColor } },
                            alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
                            border: {
                                top: { style: 'thin', color: { rgb: 'E0E0E0' } },
                                bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
                                left: { style: 'thin', color: { rgb: 'E0E0E0' } },
                                right: { style: 'thin', color: { rgb: 'E0E0E0' } }
                            }
                        };
                    }
                }
            }

            XLSX.utils.book_append_sheet(workbook, milestoneSheet, '🎯 Milestones Detail');

            // Save the file
            const fileName = `Project_Listing_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;
            XLSX.writeFile(workbook, fileName);

            console.log('Excel export completed successfully with milestone data!');
        } catch (error) {
            console.error('Error exporting to Excel:', error);
        } finally {
            dispatch(spinLoaderShow(false));
        }
    };

    return { exportToExcel };
};

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { getProjectListing } from 'services/projectService';
import moment from 'moment';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

function lightenColor(hex: string, percent: number) {
    const color = hex.replace(/^#/, '');
    const r = Number.parseInt(color.substr(0, 2), 16);
    const g = Number.parseInt(color.substr(2, 2), 16);
    const b = Number.parseInt(color.substr(4, 2), 16);

    const newR = Math.min(255, Math.floor(r + (255 - r) * percent));
    const newG = Math.min(255, Math.floor(g + (255 - g) * percent));
    const newB = Math.min(255, Math.floor(b + (255 - b) * percent));

    return [newR, newG, newB];
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
}

export const useProjectPDFExport = () => {
    const dispatch = useDispatch();

    const exportToPDF = async (query: string, getData?: any) => {
        dispatch(spinLoaderShow(true));

        try {
            // Fetch all data for export
            const newQuery = query + '&pdf=true';
            const data: any = await getProjectListing(newQuery);
            const { rows, projectDivisionsWithCount, statusCounts } = data;

            const doc: any = new jsPDF('landscape', 'pt', 'a4');
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;

            // Title
            const title = 'PROJECT LISTING REPORT';
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            const titleWidth = (doc.getStringUnitWidth(title) * doc.internal.getFontSize()) / doc.internal.scaleFactor;
            const titleX = (pageWidth - titleWidth) / 2;
            doc.text(title, titleX, 40);

            // Subtitle
            const subtitle = `Generated on: ${moment().format('DD/MM/YYYY HH:mm:ss')}`;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            const subtitleWidth = (doc.getStringUnitWidth(subtitle) * doc.internal.getFontSize()) / doc.internal.scaleFactor;
            const subtitleX = (pageWidth - subtitleWidth) / 2;
            doc.text(subtitle, subtitleX, 60);

            let currentY = 90;

            // Summary Statistics
            if (projectDivisionsWithCount || statusCounts) {
                const summaryHeaders: string[] = [];
                const summaryValues: any[] = [];

                // Project Divisions
                if (projectDivisionsWithCount) {
                    projectDivisionsWithCount.forEach((division: any) => {
                        summaryHeaders.push(truncateText(division.name, 12));
                        summaryValues.push(division.count);
                    });
                }

                // Status Counts (limited to avoid overflow)
                if (statusCounts) {
                    const statusEntries = Object.entries(statusCounts)
                        .filter(([status]) => status !== 'unassigned')
                        .slice(0, 6); // Limit to 6 statuses to prevent overflow

                    statusEntries.forEach(([status, count]) => {
                        summaryHeaders.push(truncateText(status.toUpperCase(), 10));
                        summaryValues.push(count);
                    });
                }

                if (summaryHeaders.length > 0) {
                    doc.autoTable({
                        head: [summaryHeaders],
                        body: [summaryValues],
                        startY: currentY,
                        margin: { left: 30, right: 30 },
                        styles: {
                            fontSize: 8,
                            halign: 'center',
                            valign: 'middle',
                            lineWidth: 0.1,
                            lineColor: [0, 0, 0],
                            cellPadding: 3
                        },
                        headStyles: {
                            fillColor: [70, 130, 180],
                            textColor: [255, 255, 255],
                            fontStyle: 'bold'
                        },
                        columnStyles: Object.fromEntries(
                            summaryHeaders.map((_, index) => [index, { cellWidth: Math.min(70, (pageWidth - 60) / summaryHeaders.length) }])
                        )
                    });

                    currentY = (doc as any).lastAutoTable.finalY + 25;
                }
            }

            // Financial Summary
            const totalBudget = rows?.reduce((sum: number, row: any) => sum + (row?.budget || 0), 0) || 0;
            const totalCost = rows?.reduce((sum: number, row: any) => sum + (row?.cost || 0), 0) || 0;
            const totalProfit = totalBudget - totalCost;
            const totalPlannedHours = rows?.reduce((sum: number, row: any) => sum + (row?.projectPlannedHours || 0), 0) || 0;
            const totalConsumedHours = rows?.reduce((sum: number, row: any) => sum + (row?.projectConsumedHours || 0), 0) || 0;

            const financialHeaders = ['Total Projects', 'Budget (AED)', 'Cost (AED)', 'Profit/Loss (AED)', 'Planned Hrs', 'Consumed Hrs'];

            const financialValues = [
                rows?.length || 0,
                totalBudget.toLocaleString(),
                totalCost.toLocaleString(),
                totalProfit.toLocaleString(),
                totalPlannedHours.toLocaleString(),
                totalConsumedHours.toLocaleString()
            ];

            doc.autoTable({
                head: [financialHeaders],
                body: [financialValues],
                startY: currentY,
                margin: { left: 30, right: 30 },
                styles: {
                    fontSize: 8,
                    halign: 'center',
                    valign: 'middle',
                    lineWidth: 0.1,
                    lineColor: [0, 0, 0],
                    cellPadding: 3
                },
                headStyles: {
                    fillColor: [34, 139, 34],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 80 },
                    1: { cellWidth: 100 },
                    2: { cellWidth: 100 },
                    3: { cellWidth: 120 },
                    4: { cellWidth: 80 },
                    5: { cellWidth: 80 }
                },
                didParseCell: (data: any) => {
                    const { cell, column } = data;
                    if (data.row.index === 0) {
                        // Color code financial values
                        if (column.index === 3) {
                            // Profit/Loss
                            cell.styles.textColor = totalProfit >= 0 ? [0, 128, 0] : [255, 0, 0];
                            cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });

            currentY = (doc as any).lastAutoTable.finalY + 25;

            // Check if we need a new page
            if (currentY > pageHeight - 300) {
                doc.addPage();
                currentY = 40;
            }

            // Main project data table with optimized columns
            const headers = [
                '#',
                'Project Name',
                'Status',
                'PM',
                'Division',
                'Budget',
                'Cost',
                'Profit/Loss',
                'Hrs P/C',
                'Tech',
                'Category'
            ];

            const projectRows =
                rows?.map((row: any, index: number) => {
                    const technologies = row?.project_technology?.map((tech: any) => tech.name).join(', ') || '';
                    const categories = row?.project_categories?.map((cat: any) => cat.name).join(', ') || '';
                    const projectManagers = row?.project_manager_details?.map((pm: any) => pm.name).join(', ') || '';

                    return [
                        index + 1,
                        truncateText(row?.name || '', 20),
                        truncateText(row?.project_status?.[0]?.project_statuses?.name || '', 12),
                        truncateText(projectManagers, 15),
                        truncateText(row?.projectDivision?.name || '', 12),
                        (row?.budget || 0).toLocaleString(),
                        (row?.cost || 0).toLocaleString(),
                        (row?.profitOrLoss || 0).toLocaleString(),
                        `${row?.projectPlannedHours || 0}/${row?.projectConsumedHours || 0}`,
                        truncateText(technologies, 15),
                        truncateText(categories, 15)
                    ];
                }) || [];

            doc.autoTable({
                head: [headers],
                body: projectRows,
                startY: currentY,
                margin: { left: 15, right: 15 },
                columnStyles: {
                    0: { cellWidth: 25 }, // #
                    1: { cellWidth: 120 }, // Project Name
                    2: { cellWidth: 70 }, // Status
                    3: { cellWidth: 80 }, // PM
                    4: { cellWidth: 70 }, // Division
                    5: { cellWidth: 70 }, // Budget
                    6: { cellWidth: 70 }, // Cost
                    7: { cellWidth: 80 }, // Profit/Loss
                    8: { cellWidth: 60 }, // Hours P/C
                    9: { cellWidth: 90 }, // Tech
                    10: { cellWidth: 90 } // Category
                },
                styles: {
                    fontSize: 7,
                    lineWidth: 0.1,
                    lineColor: [0, 0, 0],
                    cellPadding: 2,
                    valign: 'middle'
                },
                headStyles: {
                    fillColor: [110, 82, 158],
                    textColor: [255, 255, 255],
                    fontSize: 8,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                didParseCell: (data: any) => {
                    const { cell, column, row } = data;

                    if (row.index > 0) {
                        // Skip header row
                        // Alternating row colors
                        if (row.index % 2 === 0) {
                            cell.styles.fillColor = [248, 249, 250];
                        }

                        // Color code profit/loss column
                        if (column.index === 7) {
                            const value = Number.parseFloat(cell.raw.toString().replace(/,/g, ''));
                            cell.styles.textColor = value >= 0 ? [0, 128, 0] : [255, 0, 0];
                            cell.styles.fontStyle = 'bold';
                        }

                        // Color code status column
                        if (column.index === 2) {
                            const status = cell.raw.toString().toLowerCase();
                            if (status.includes('completed')) {
                                cell.styles.textColor = [0, 128, 0];
                            } else if (status.includes('delayed')) {
                                cell.styles.textColor = [255, 0, 0];
                            } else if (status.includes('progress') || status.includes('track')) {
                                cell.styles.textColor = [255, 165, 0];
                            }
                        }

                        // Ensure text wrapping for long content
                        cell.styles.overflow = 'linebreak';
                        cell.styles.cellWidth = 'wrap';
                    }
                }
            });

            // Add milestones on new page if they exist
            if (rows?.some((row: any) => row?.project_milestone?.length > 0)) {
                doc.addPage();

                // Milestones title
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                const milestonesTitle = 'PROJECT MILESTONES';
                const milestonesTitleWidth =
                    (doc.getStringUnitWidth(milestonesTitle) * doc.internal.getFontSize()) / doc.internal.scaleFactor;
                const milestonesTitleX = (pageWidth - milestonesTitleWidth) / 2;
                doc.text(milestonesTitle, milestonesTitleX, 40);

                const milestoneHeaders = ['#', 'Project', 'Milestone', 'Payment (AED)', 'Target Date', 'Invoice', 'Payment'];

                const milestoneRows: any[] = [];
                let milestoneIndex = 1;
                rows?.forEach((project: any) => {
                    project?.project_milestone?.forEach((milestone: any) => {
                        milestoneRows.push([
                            milestoneIndex++,
                            truncateText(project.name, 25),
                            truncateText(milestone.milestone_phase?.name || '', 20),
                            milestone.milestone_payment?.toLocaleString() || '0',
                            milestone.targeted_month ? moment(milestone.targeted_month).format('DD/MM/YY') : '',
                            milestone.invoice ? 'Sent' : 'Pending',
                            milestone.payment_received ? 'Received' : 'Pending'
                        ]);
                    });
                });

                if (milestoneRows.length > 0) {
                    doc.autoTable({
                        head: [milestoneHeaders],
                        body: milestoneRows,
                        startY: 70,
                        margin: { left: 20, right: 20 },
                        columnStyles: {
                            0: { cellWidth: 30 }, // #
                            1: { cellWidth: 150 }, // Project
                            2: { cellWidth: 120 }, // Milestone
                            3: { cellWidth: 80 }, // Payment
                            4: { cellWidth: 70 }, // Target Date
                            5: { cellWidth: 60 }, // Invoice
                            6: { cellWidth: 70 } // Payment
                        },
                        styles: {
                            fontSize: 7,
                            lineWidth: 0.1,
                            lineColor: [0, 0, 0],
                            cellPadding: 2,
                            valign: 'middle'
                        },
                        headStyles: {
                            fillColor: [255, 107, 53],
                            textColor: [255, 255, 255],
                            fontSize: 8,
                            fontStyle: 'bold',
                            halign: 'center'
                        },
                        didParseCell: (data: any) => {
                            const { cell, column, row } = data;

                            if (row.index > 0) {
                                // Alternating row colors
                                if (row.index % 2 === 0) {
                                    cell.styles.fillColor = [255, 248, 225];
                                }

                                // Color code status columns
                                if (column.index === 5 || column.index === 6) {
                                    const cellValue = cell.raw.toString();
                                    if (cellValue === 'Sent' || cellValue === 'Received') {
                                        cell.styles.textColor = [0, 128, 0];
                                        cell.styles.fontStyle = 'bold';
                                    } else {
                                        cell.styles.textColor = [255, 140, 0];
                                        cell.styles.fontStyle = 'bold';
                                    }
                                }
                            }
                        }
                    });
                }
            }

            // Add page numbers
            const pageCount = doc.internal.pages.length - 1;
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth - 80, pageHeight - 15);
                doc.text(`Generated: ${moment().format('DD/MM/YYYY HH:mm')}`, 20, pageHeight - 15);
            }

            // Save the PDF
            const fileName = `Project_Listing_${moment().format('YYYY-MM-DD_HH-mm-ss')}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error('Error exporting to PDF:', error);
        } finally {
            dispatch(spinLoaderShow(false));
        }
    };

    return { exportToPDF };
};

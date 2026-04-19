import { useState, useEffect, useMemo } from 'react';
import SubCard from 'ui-component/cards/SubCard';
import DataGridOData from 'ui-component/DataGridOData';
import { Grid, Typography } from '@mui/material';
import { getPaymentMileStone } from 'services/projectService';
import { GridMoreVertIcon } from '@mui/x-data-grid';
import moment from 'moment';
import { IconChevronRight } from '@tabler/icons';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import BasicPopover from 'components/PopOver/PopOver';
import Chip from '@mui/material/Chip';
import DateFilter from '@inovua/reactdatagrid-community/DateFilter';
import SelectFilter from '@inovua/reactdatagrid-community/SelectFilter';
import { getProjectManagers } from 'services/userService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { PaymentAction } from '../PaymentAction';
import useAuth from 'hooks/useAuth';
import { debounce } from 'lodash';

function lightenColor(hex: any, percent: any) {
    const color = hex.replace(/^#/, '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    const newR = Math.min(255, Math.floor(r + (255 - r) * percent));
    const newG = Math.min(255, Math.floor(g + (255 - g) * percent));
    const newB = Math.min(255, Math.floor(b + (255 - b) * percent));

    return `rgb(${newR}, ${newG}, ${newB})`;
}

const roleBasedColumns: any = {
    superAdmin: [
        'project',
        'project_manager_details',
        'kickoff_date',
        'milestone_phase',
        'milestone_payment',
        'invoice',
        'payment_recieved',
        'targeted_month',
        'delay_time',
        'statusText',
        'is_upsell',
        'is_initial_amount',
        'actions'
    ],
    teamLead: [
        'project',
        'project_manager_details',
        'kickoff_date',
        'milestone_phase',
        'invoice',
        'targeted_month',
        'delay_time',
        'statusText',
        'actions'
    ]
};

const filterColumnsByRole = (columns: any, role: any) => {
    const allowedColumns = roleBasedColumns[role] || [];
    return columns.filter((column: any) => allowedColumns.includes(column.name));
};

const PaymentsMilestone = () => {
    const [projectManager, setProjectManager] = useState();
    const [getData, setGetData] = useState<any>();
    const [query, setQuery] = useState<any>([]);
    const [tableColumns, setTableColumns] = useState([]);

    const dispatch = useDispatch();
    const { user } = useAuth();

    const defaultSortInfo = { name: 'id', dir: -1, type: 'created_at' };

    const defaultFilterValue = [
        { name: 'project', type: 'string', operator: 'contains', value: '' },
        { name: 'invoice', type: 'string', operator: 'contains', value: '' },
        { name: 'payment_recieved', type: 'string', operator: 'contains', value: '' },
        { name: 'milestone_phase', type: 'string', operator: 'contains', value: '' },
        {
            name: 'targeted_month',
            type: 'string',
            operator: 'contains',
            value: user?.role?.name == 'Team Lead' ? moment().format('YYYY-MM-DD') : ''
        },
        { name: 'delay_time', type: 'string', operator: 'contains', value: '' },
        { name: 'project_manager_details', type: 'string', operator: 'contains', value: '' }
    ];

    const INVOICED_STATUS_MAP: any = {
        pending: 'Pending',
        sent: 'Sent'
    };

    const invoiceStatusOptions = Object.keys(INVOICED_STATUS_MAP).map((x) => ({
        id: x,
        label: INVOICED_STATUS_MAP[x]
    }));

    const PAYMENT_STATUS_MAP: any = {
        Pending: 'Pending',
        Received: 'Received'
    };

    const paymentStatusOptions = Object.keys(PAYMENT_STATUS_MAP).map((x) => ({
        id: x,
        label: PAYMENT_STATUS_MAP[x]
    }));

    const columns: any = [
        {
            header: 'Project',
            name: 'project',
            defaultFlex: 1,
            minWidth: 200,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                        <Grid item md={12} sm={12} xs={12}>
                            <span style={{ whiteSpace: 'normal', maxWidth: '100%' }}>{data?.project?.name}</span>
                        </Grid>
                    </Grid>
                );
            }
        },
        {
            header: 'Project Manager',
            name: 'project_manager_details',
            defaultFlex: 1,
            minWidth: 200,
            textAlign: 'center',
            filterEditor: SelectFilter,
            filterEditorProps: {
                placeholder: 'Select PM',
                dataSource: projectManager
            },
            render: ({ data }: any) => {
                return (
                    <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                        {data?.project?.project_manager_details?.map((x: any) => (
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{x?.name}</span>
                            </Grid>
                        ))}
                    </Grid>
                );
            }
        },
        {
            header: 'Kickoff Date',
            name: 'kickoff_date',
            type: 'date',
            groupBy: false,
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>
                                    {data?.project?.kickoff_date !== ''
                                        ? moment(data?.project?.kickoff_date).format('Do MMM, YYYY')
                                        : 'N/A'}
                                </span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Milestone Phase',
            name: 'milestone_phase',
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                        <Grid item md={12} sm={12} xs={12}>
                            <span style={{ whiteSpace: 'normal', maxWidth: '100%' }}>{data?.milestone_phase?.name}</span>
                        </Grid>
                    </Grid>
                );
            }
        },
        {
            header: 'Milestone Payment',
            name: 'milestone_payment',
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                        <Grid item md={12} sm={12} xs={12}>
                            <span>{data?.milestone_payment?.toLocaleString()}</span>
                        </Grid>
                    </Grid>
                );
            }
        },
        {
            header: 'Invoiced Status',
            name: 'invoice',
            defaultFlex: 1,
            minWidth: 150,
            minHeight: 600,
            textAlign: 'center',
            filterEditor: SelectFilter,
            filterEditorProps: {
                placeholder: 'Select invoice',
                dataSource: invoiceStatusOptions
            },
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>
                                    {data?.invoice && data?.invoice_date ? (
                                        <Chip
                                            label={'Sent'}
                                            sx={{
                                                // color: 'rgb(255, 193, 7)',
                                                color: 'rgb(0, 200, 83)',
                                                backgroundColor: 'rgba(185, 246, 202, 0.376)',
                                                fontSize: '11px',
                                                fontWeight: 600
                                            }}
                                        />
                                    ) : (
                                        <Chip
                                            label={'Pending'}
                                            sx={{
                                                color: '#BA8B00',
                                                backgroundColor: 'rgb(255, 248, 225)',
                                                fontSize: '11px',
                                                fontWeight: 600
                                            }}
                                        />
                                    )}
                                </span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Payment Received',
            name: 'payment_recieved',
            defaultFlex: 1,
            minWidth: 150,
            minHeight: 600,
            textAlign: 'center',
            filterEditor: SelectFilter,
            filterEditorProps: {
                placeholder: 'Select payment',
                dataSource: paymentStatusOptions
            },
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                {/* <span>{data?.payment_recieved ? 'Received' : 'Pending'}</span> */}
                                <span>
                                    {data?.payment_recieved && data?.payment_recieved_date ? (
                                        <Chip
                                            label={'Received'}
                                            sx={{
                                                // color: 'rgb(255, 193, 7)',
                                                color: 'rgb(0, 200, 83)',
                                                backgroundColor: 'rgba(185, 246, 202, 0.376)',
                                                fontSize: '11px',
                                                fontWeight: 600
                                            }}
                                        />
                                    ) : (
                                        <Chip
                                            label={'Pending'}
                                            sx={{
                                                color: '#BA8B00',
                                                backgroundColor: 'rgb(255, 248, 225)',
                                                fontSize: '11px',
                                                fontWeight: 600
                                            }}
                                        />
                                    )}
                                </span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Targeted Month',
            name: 'targeted_month',
            defaultFlex: 1,
            minWidth: 130,
            textAlign: 'center',
            filterEditor: DateFilter,
            filterEditorProps: (props: any, { index }: { index: number }) => {
                return {
                    dateFormat: 'YYYY-MM-DD',
                    cancelButton: false,
                    highlightWeekends: false,
                    placeholder: ''
                };
            },
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{data?.targeted_month !== null ? moment(data?.targeted_month).format('Do MMM, YYYY') : 'N/A'}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Delay Month',
            name: 'delay_time',
            defaultFlex: 1,
            minWidth: 130,
            textAlign: 'center',
            filterEditor: DateFilter,
            filterEditorProps: (props: any, { index }: { index: number }) => {
                return {
                    dateFormat: 'YYYY-MM-DD',
                    cancelButton: false,
                    highlightWeekends: false,
                    placeholder: ''
                };
            },
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{data?.delay_time !== null ? moment(data?.delay_time).format('Do MMM, YYYY') : 'N/A'}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Milestone Status',
            name: 'statusText',
            defaultFlex: 1,
            minWidth: 130,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                const milestone = data;
                return (
                    <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                        <Grid item md={12} sm={12} xs={12}>
                            <span style={{ color: milestone.statusColor }}>{milestone.statusText}</span>
                        </Grid>
                    </Grid>
                );
            }
        },
        {
            header: 'Upsell',
            name: 'is_upsell',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                        <Grid item md={12} sm={12} xs={12}>
                            <Chip
                                label={data?.is_upsell ? 'Yes' : 'No'}
                                sx={{
                                    color: data?.is_upsell ? 'rgb(0, 200, 83)' : '#BA8B00',
                                    backgroundColor: data?.is_upsell ? 'rgba(185, 246, 202, 0.376)' : 'rgb(255, 248, 225)',
                                    fontSize: '11px',
                                    fontWeight: 600
                                }}
                            />
                        </Grid>
                    </Grid>
                );
            }
        },
        {
            header: 'Initial Payment',
            name: 'is_initial_amount',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                        <Grid item md={12} sm={12} xs={12}>
                            <Chip
                                label={data?.is_initial_amount ? 'Yes' : 'No'}
                                sx={{
                                    color: data?.is_initial_amount ? 'rgb(0, 200, 83)' : '#BA8B00',
                                    backgroundColor: data?.is_initial_amount ? 'rgba(185, 246, 202, 0.376)' : 'rgb(255, 248, 225)',
                                    fontSize: '11px',
                                    fontWeight: 600
                                }}
                            />
                        </Grid>
                    </Grid>
                );
            }
        },
        {
            name: 'actions',
            header: 'Action',
            defaultFlex: 1,
            minWidth: 100,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                const comments = data?.project?.project_status || [];
                return (
                    <>
                        <Grid>
                            <Grid>
                                <BasicPopover
                                    content={
                                        <PaymentAction
                                            milestone_id={data?.id}
                                            projectId={data?.project?.id}
                                            projectRoute={data?.uuid}
                                            comments={comments}
                                        />
                                    }
                                >
                                    <GridMoreVertIcon style={{ color: '#5e35b1' }} />
                                </BasicPopover>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        }
    ];

    const memoizedColumns = useMemo(() => {
        return columns.map((column: any) => {
            if (column.name === 'project_manager_details') {
                return {
                    ...column,
                    filterEditorProps: {
                        ...column.filterEditorProps,
                        dataSource: projectManager // Use the updated projectManager
                    }
                };
            }
            return column;
        });
    }, [columns, projectManager]);

    useEffect(() => {
        getProjectManagersData();
    }, []);

    useEffect(() => {
        const debouncedUpdateColumns = debounce(() => {
            const role = ['Super Admin', 'Finance', 'PM Lead', 'Project Manager'].includes(user?.role?.name) ? 'superAdmin' : 'teamLead';
            if (role && Array.isArray(memoizedColumns)) {
                const filteredColumns = filterColumnsByRole(memoizedColumns, role);

                if (JSON.stringify(filteredColumns) !== JSON.stringify(tableColumns)) {
                    setTableColumns(filteredColumns);
                }
            } else {
                console.warn('User role or columns are undefined.');
            }
        }, 0);

        debouncedUpdateColumns();

        return () => {
            debouncedUpdateColumns.cancel();
        };
    }, [user?.role?.name, memoizedColumns, tableColumns]);

    const getProjectManagersData = () => {
        getProjectManagers()
            .then((res: any) => {
                res = res?.map((x: any) => ({
                    id: x.id,
                    label: x.name
                }));
                setProjectManager(res);
            })
            .catch((err) => {})
            .finally(() => {});
    };

    const exportToExcel = async () => {
        dispatch(spinLoaderShow(true));
        let newquery = query + '&pdf=true';
        const data: any = await getPaymentMileStone(newquery).finally(() => {
            dispatch(spinLoaderShow(false));
        });
        const { count, milestonePaymentCount, rows } = data;

        const headers = [
            'No',
            'Project',
            'Project Manager',
            'Kickoff Date',
            'Milestone Phase',
            'Milestone Payment',
            'Invoiced Status',
            'Payment Received',
            'Targeted Month',
            'Milestone Status'
        ];

        const pdfRows = rows
            .sort((a: any, b: any) => {
                const dateA = moment(a?.targeted_month);
                const dateB = moment(b?.targeted_month);
                return dateB.isBefore(dateA) ? -1 : 1;
            })
            .map((row: any, i: number) => {
                return [
                    i + 1,
                    row?.project?.name,
                    row?.project?.project_manager_details?.map((x: any) => x?.name).join(', '),
                    row?.project?.kickoff_date ? moment(row?.project?.kickoff_date).format('Do MMM, YYYY') : 'N/A',
                    row?.milestone_phase?.name,
                    row?.milestone_payment,
                    row?.invoice ? 'Sent' : 'Pending',
                    row?.payment_recieved ? 'Received' : 'Pending',
                    row?.targeted_month ? moment(row?.targeted_month).format('Do MMM, YYYY') : 'N/A',
                    row?.statusText
                ];
            });

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...pdfRows]);

        const summaryData = [
            ['Payment Milestones Report'],
            [`Total Records: ${count} | Milestone Payments Count: ${milestonePaymentCount}`]
        ];

        const workbook = XLSX.utils.book_new();

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        workbook.Sheets['Summary'] = summarySheet;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Milestones');

        XLSX.writeFile(workbook, 'PaymentMilestones.xlsx');
    };

    const exportToPdf = async () => {
        dispatch(spinLoaderShow(true));
        let newquery = query + '&pdf=true';
        const data: any = await getPaymentMileStone(newquery).finally(() => {
            dispatch(spinLoaderShow(false));
        });
        const {
            count,
            achieveOnTime,
            milestoneCost,
            inProgress,
            delay,
            rows,
            upsellCount,
            initialPaymentCount,
            paymentRecieved,
            previousDue
        } = data;

        const headers = [
            '',
            'Project',
            'Project Manager',
            'Kickoff Date',
            'Milestone Phase',
            'Payment',
            'Invoiced Status',
            'Payment Received',
            'Targeted Month',
            'Milestone Status'
        ];

        const pdfRows = rows
            ?.sort((a: any, b: any) => {
                const dateA = moment(a?.created_at);
                const dateB = moment(b?.created_at);
                return dateB.isBefore(dateA) ? -1 : 1;
            })
            ?.map((row: any, i: number) => {
                return [
                    i + 1,
                    row?.project?.name,
                    row?.project?.project_manager_details?.map((x: any) => x?.name).join(', '),
                    row?.project?.kickoff_date ? moment(row?.project?.kickoff_date).format('Do MMM, YYYY') : 'N/A',
                    row?.milestone_phase?.name,
                    row?.milestone_payment?.toLocaleString(),
                    row?.invoice ? 'Sent' : 'Pending',
                    row?.payment_recieved ? 'Received' : 'Pending',
                    row?.targeted_month ? moment(row?.targeted_month).format('Do MMM, YYYY') : 'N/A',
                    row?.statusText
                ];
            });

        const doc: any = new jsPDF('landscape', 'pt', 'a4');

        const title = 'Payment Milestones Report';
        doc.setFontSize(18);
        const titleWidth = (doc.getStringUnitWidth(title) * doc.internal.getFontSize()) / doc.internal.scaleFactor;
        const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
        doc.text(title, titleX, 50);

        doc.autoTable({
            head: [
                [
                    'Total No. of Milestone',
                    'Milestone Cost',
                    'Achieved',
                    'Delay',
                    'In Progress',
                    'Upsell',
                    'Initial Payment',
                    'Payment Received',
                    'Previous Due Payments'
                ]
            ],
            body: [
                [
                    count,
                    milestoneCost?.toLocaleString(),
                    achieveOnTime?.toLocaleString(),
                    delay?.toLocaleString(),
                    inProgress?.toLocaleString(),
                    upsellCount?.toLocaleString(),
                    initialPaymentCount?.toLocaleString(),
                    paymentRecieved?.toLocaleString(),
                    previousDue?.toLocaleString()
                ]
            ],
            startY: 80,
            margin: { left: 5, right: 5 },
            columnStyles: {
                0: { cellWidth: 120 },
                1: { cellWidth: 80 },
                2: { cellWidth: 80 },
                3: { cellWidth: 80 },
                4: { cellWidth: 80 },
                5: { cellWidth: 80 },
                6: { cellWidth: 90 }
            },
            styles: {
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fontSize: 8,
                halign: 'center',
                valign: 'middle'
            },
            headStyles: {
                fillColor: [80, 80, 80],
                textColor: [255, 255, 255],
                fontSize: 8,
                fontStyle: 'bold'
            },
            didParseCell: (data: any) => {
                const { cell, row, column } = data;

                const lightColors = stats.map((stat) => lightenColor(stat.color, 0.6));

                if (row.index === 0) {
                    cell.styles.fillColor = lightColors[column.index] || [255, 255, 255];
                    cell.styles.textColor = [0, 0, 0];
                    cell.styles.fontStyle = 'bold';
                } else {
                    cell.styles.fillColor = [255, 255, 255];
                    cell.styles.textColor = [0, 0, 0];
                }
            }
        });

        doc.autoTable({
            head: [headers],
            body: pdfRows,
            startY: 150,
            margin: { left: 5, right: 5 },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 100 },
                2: { cellWidth: 120 },
                3: { cellWidth: 80 },
                4: { cellWidth: 80 },
                5: { cellWidth: 60 },
                6: { cellWidth: 80 },
                7: { cellWidth: 90 },
                8: { cellWidth: 80 },
                9: { cellWidth: 100 }
            },
            styles: {
                lineWidth: 0.1,
                fontSize: 8,
                fontStyle: 'bold',
                lineColor: [0, 0, 0]
            },
            headStyles: {
                fillColor: [110, 82, 158],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold'
            },
            didParseCell: (data: any) => {
                const cell = data.cell;
                const columnIndex = data.column.index;
                const cellValue = cell.raw;
                if (columnIndex === 7) {
                    if (cellValue === 'Received') {
                        cell.styles.textColor = [0, 200, 83];
                    } else if (cellValue === 'Pending') {
                        cell.styles.textColor = [255, 165, 0];
                    }
                }

                if (columnIndex === 6) {
                    if (cellValue === 'Sent') {
                        cell.styles.textColor = [0, 200, 83];
                    } else if (cellValue === 'Pending') {
                        cell.styles.textColor = [255, 165, 0];
                    }
                }

                if (columnIndex === 9) {
                    if (cellValue.includes('Achieved')) {
                        cell.styles.textColor = [46, 204, 113];
                    } else if (cellValue.includes('In Progress')) {
                        cell.styles.textColor = [241, 196, 15];
                    } else if (cellValue.includes('Delayed')) {
                        cell.styles.textColor = [231, 76, 60];
                    }
                }
            }
        });

        doc.save('PaymentMilestones.pdf');
    };

    const stats = [
        { title: 'No. of Milestone', value: getData?.count ?? 0, color: '#FF5733' },
        { title: 'Milestone Cost', value: getData?.milestoneCost?.toLocaleString() ?? 0, color: '#3498DB' },
        { title: 'Achieved', value: getData?.achieveOnTime?.toLocaleString() ?? 0, color: '#2ECC71' },
        { title: 'Delay', value: getData?.delay?.toLocaleString() ?? 0, color: '#E74C3C' },
        { title: 'In Progress', value: getData?.inProgress?.toLocaleString() ?? 0, color: '#F1C40F' },
        { title: 'Upsell', value: `${getData?.upsellCount?.toLocaleString() ?? 0}`, color: '#8E44AD' },
        { title: 'Initial Payment', value: `${getData?.initialPaymentCount?.toLocaleString() ?? 0}`, color: '#1ABC9C' },
        { title: 'Payment Received', value: `${getData?.paymentRecieved?.toLocaleString() ?? 0}`, color: '#2ECC71' },
        { title: 'Previous Due Payments', value: getData?.previousDue?.toLocaleString() ?? 0, color: '#E74C3C' }
    ];

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'List of Payment Milestones'} icon title rightAlign />

            {['Super Admin', 'Finance', 'PM Lead', 'Project Manager'].includes(user?.role?.name) && (
                <SubCard>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '45px', flexWrap: 'wrap' }}>
                        {stats.map((item, index) => (
                            <div key={index} style={{ textAlign: 'center' }}>
                                <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: item.color, fontSize: '0.9rem' }}
                                >
                                    {item.title}
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: item.color, fontSize: '1.2rem' }}>
                                    {item.title === 'No. of Milestone' ? item.value : `AED ${item.value}`}
                                </Typography>
                            </div>
                        ))}
                    </div>
                </SubCard>
            )}

            <SubCard sx={{ marginTop: '15px' }}>
                <DataGridOData
                    dataResolver={getPaymentMileStone}
                    keyName="id"
                    filterValue={defaultFilterValue}
                    columns={tableColumns}
                    defaultSortInfo={defaultSortInfo}
                    disableCheckbox
                    setQuery={setQuery}
                    {...(['Super Admin', 'Finance', 'PM Lead', 'Project Manager'].includes(user?.role?.name) && {
                        showdonwload: true,
                        setGetData: setGetData,
                        exportToXlsx: exportToExcel,
                        exportToPdf: exportToPdf,
                        monthResult: getData?.monthResult
                    })}
                />
            </SubCard>
        </>
    );
};

export default PaymentsMilestone;

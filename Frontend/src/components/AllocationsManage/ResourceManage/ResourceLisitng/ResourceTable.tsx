// ResourceTable.tsx
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Switch,
    Checkbox,
    Typography,
    FormControlLabel,
    Radio,
    IconButton
} from '@mui/material';
import moment, { weekdaysShort } from 'moment';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import { TableData } from './types';
import { useState } from 'react';
import { HoldHistoryModal } from './HoldHistoryModal';
import EditIcon from '@mui/icons-material/Edit';
import { EditResourceModal } from './EditResourceModalProps';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { updateAllocation } from 'services/Allocation/taskServices';

interface ResourceTableProps {
    tableData: TableData[];
    locastorageuser: any;
    currentDateWithoutTime: Date;
    updatedisable: (data: TableData) => void;
    updateIsCompleted: (data: TableData) => void;
    OpenShowReasonModal: (data: TableData) => void;
    OpenShowOnholdReasonModal: (data: TableData) => void;
    userdata: any;
    // refreshData: () => void;
    // getTaskHoursData: () => void;
}

export const ResourceTable = ({
    tableData,
    locastorageuser,
    currentDateWithoutTime,
    updatedisable,
    updateIsCompleted,
    OpenShowReasonModal,
    OpenShowOnholdReasonModal,
    userdata
}: ResourceTableProps) => {
    const [holdHistoryOpen, setHoldHistoryOpen] = useState(false);
    const [selectedHoldHistory, setSelectedHoldHistory] = useState<any>([]);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editRowData, setEditRowData] = useState<TableData | null>(null);

    const dispatch = useDispatch();

    const OpenShowOnholdHistoryModal = (historyData: any) => {
        setSelectedHoldHistory(historyData);
        setHoldHistoryOpen(true);
    };

    const handleEditOpen = (row: TableData) => {
        setEditRowData(row);
        setEditModalOpen(true);
    };

    const handleEditSave = (updatedRow: TableData) => {
        const payload = {
            task_hours: updatedRow.task_hours,
            start_date: updatedRow.start_date,
            end_date: updatedRow.end_date,
            is_overtime: updatedRow.is_overtime,
            overtime_reason: updatedRow.overtime_reason,
            resource_id: updatedRow.resource_id,
            project_id : updatedRow?.task?.project_id,
            department_id : updatedRow?.department_id
        };

        dispatch(spinLoaderShow(true)); // show loader

        updateAllocation(updatedRow.id, payload)
            .then((res: any) => {
                toast.success('Allocation updated successfully');
                window.location.reload();
                // refreshData();
                // getTaskHoursData();
            })
            .catch((error) => {
                toast.error(error?.message ?? 'Update failed');
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));

                
            });
    };

    return (
        <>
            <MainCard content={false}>
                <TableContainer sx={{ overflowX: 'hidden !important', overflowY: 'hidden !important' }}>
                    <Table sx={{ minWidth: 350 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ pl: 3 }}>Resource Name</TableCell>
                                {locastorageuser?.role?.name === 'Project Manager' && <TableCell align="center">Department</TableCell>}
                                <TableCell align="center">Hours</TableCell>
                                <TableCell align="center">Start Time</TableCell>
                                <TableCell align="center">End Time</TableCell>
                                <TableCell align="center">On-Hold Resource</TableCell>
                                <TableCell align="center">Task Completed</TableCell>
                                <TableCell align="center">Overtime Task</TableCell>
                                <TableCell align="center">Edit</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableData?.map((row, index) => (
                                <TableRow hover key={index}>
                                    <TableCell sx={{ pl: 3 }}>{row?.resource?.name}</TableCell>
                                    {locastorageuser?.role?.name === 'Project Manager' && (
                                        <TableCell align="center">{row?.department?.name}</TableCell>
                                    )}
                                    <TableCell align="center">{row.task_hours}</TableCell>
                                    <TableCell align="center">{moment(row.start_date).format('D MMM YY')}</TableCell>
                                    <TableCell align="center">{moment(row.end_date).format('D MMM YY')}</TableCell>
                                    <TableCell align="center">
                                        {locastorageuser?.role?.name !== 'Resource' && (
                                            <Switch
                                                disabled={
                                                    row.is_completed || // If the task is completed
                                                    locastorageuser?.role?.name !== 'Team Lead' || // Only Team Leads can toggle
                                                    new Date(row.end_date) < currentDateWithoutTime || // If the task has ended
                                                    (row.task_hours === 0 && row.allocation_hold_history?.length > 0) // If all allocated hours are on hold
                                                }
                                                checked={
                                                    row.allocation_hold_history?.some(
                                                        (hold: any) =>
                                                            new Date(hold.hold_start_date) <= currentDateWithoutTime &&
                                                            new Date(hold.hold_end_date) >= currentDateWithoutTime
                                                    ) || row.task_hours === 0 // If all hours are held, mark checked
                                                }
                                                onChange={() => updatedisable(row)}
                                            />
                                        )}

                                        {row?.allocation_hold_history?.length > 0 && (
                                            <Typography
                                                variant="body2"
                                                onClick={() => OpenShowOnholdHistoryModal(row.allocation_hold_history)}
                                                style={{ cursor: 'pointer', color: '#1976d2', marginTop: '4px' }}
                                            >
                                                View Hold History
                                            </Typography>
                                        )}

                                        {locastorageuser?.role?.name === 'Resource' && !row.status && (
                                            <Typography
                                                variant="h6"
                                                onClick={() => OpenShowOnholdReasonModal(row)}
                                                style={{ cursor: 'pointer', color: '#0096FF' }}
                                            >
                                                Disabled
                                            </Typography>
                                        )}
                                        {/* {row.status === false && (
                                            <Typography
                                                variant="h6"
                                                onClick={() => OpenShowOnholdReasonModal(row)}
                                                style={{ cursor: 'pointer', color: '#0096FF' }}
                                            >
                                                View Reason
                                            </Typography>
                                        )} */}
                                        {!row.is_completed && (
                                            <FormControlLabel
                                                control={<Radio disabled checked={row.status} sx={{ color: '#FDDA0D' }} />}
                                                label={<span style={{ color: '#FDDA0D' }}>In-Progress</span>}
                                            />
                                        )}
                                        {row.is_completed && (
                                            <FormControlLabel
                                                control={<Radio disabled checked={row.status} sx={{ color: '#32de84' }} />}
                                                label={<span style={{ color: '#32de84' }}>Completed</span>}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Checkbox
                                            checked={row.is_completed}
                                            disabled={
                                                !row.status ||
                                                row.is_completed ||
                                                userdata?.role?.name !== 'Resource' ||
                                                locastorageuser.resource_id !== row.resource_id
                                            }
                                            onChange={() => updateIsCompleted(row)}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {row.is_overtime && (
                                            <>
                                                <Typography variant="h6" color={'#ef5350'}>
                                                    YES
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    onClick={() => OpenShowReasonModal(row)}
                                                    style={{ cursor: 'pointer', color: '#0096FF' }}
                                                >
                                                    View Reason
                                                </Typography>
                                            </>
                                        )}
                                        {!row.is_overtime && <Typography variant="h6">_</Typography>}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton onClick={() => handleEditOpen(row)}>
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </MainCard>

            <HoldHistoryModal open={holdHistoryOpen} onClose={() => setHoldHistoryOpen(false)} historyData={selectedHoldHistory} />

            <EditResourceModal open={editModalOpen} onClose={() => setEditModalOpen(false)} onSave={handleEditSave} rowData={editRowData} />
        </>
    );
};

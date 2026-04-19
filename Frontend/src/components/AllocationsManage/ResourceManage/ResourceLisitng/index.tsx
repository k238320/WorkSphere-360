// ResourceListing.tsx
import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { disableUserAllocation, temporaryDisableUserAllocation, updateCompletion } from 'services/Allocation/taskServices';
import { ResourceListingProps, TableData } from './types';
import { ResourceTable } from './ResourceTable';
import { ResourceModals } from './Modals';
import moment from 'moment';

export default function ResourceListing({
    tableData: initialTableData,
    refreshData,
    task_id,
    userdata,
    getTaskHoursData
}: ResourceListingProps) {
    const [tableData, setTableData] = useState<TableData[]>([]);
    const [openDisableModal, setOpenDisableModal] = useState(false);
    const [openCompletionModal, setOpenCompletionModal] = useState(false);
    const [completionUser, setCompletionUser] = useState<TableData | null>(null);
    const [disableUser, setDisableUser] = useState<TableData | null>(null);
    const [reason, setReason] = useState('');
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [otReason, setOtReason] = useState<TableData | null>(null);
    const [showOnholdReasonModal, setShowOnholdReasonModal] = useState(false);
    const [onholdReason, setOnholdReason] = useState<TableData | null>(null);
    const [startDate, setStartDate] = useState<any | null>(null);
    const [endDate, setEndDate] = useState<any | null>(null);
    const [error, setError] = useState('');

    const currentDate = new Date();
    const currentDateWithoutTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    const dispatch = useDispatch();

    useEffect(() => {
        if (initialTableData) {
            const updatedData = initialTableData.map((item) => ({
                ...item,
                resourcedisable: new Date(item.end_date) >= currentDate
            }));
            setTableData(updatedData);
        }
    }, [initialTableData, currentDate]);

    const handleDisableClick = (user: TableData) => {
        setDisableUser(user);
        setOpenDisableModal(true);
    };

    const handleCompletionClick = (user: TableData) => {
        setCompletionUser(user);
        setOpenCompletionModal(true);
    };

    const handleReasonView = (user: TableData) => {
        setOtReason(user);
        setShowReasonModal(true);
    };

    const handleOnHoldReasonView = (user: TableData) => {
        setOnholdReason(user);
        setShowOnholdReasonModal(true);
    };

    const handleCompletion = async () => {
        if (!completionUser) return;
        setOpenCompletionModal(false);
        dispatch(spinLoaderShow(true));

        try {
            await updateCompletion({ allocation_id: completionUser.id });
            toast.success('Task marked as completed!');
            getTaskHoursData && getTaskHoursData();
            refreshData();
        } catch (error: any) {
            toast.error(error?.message ?? error);
        } finally {
            dispatch(spinLoaderShow(false));
        }
    };

    const handleStartDateChange = (date: string | null) => {
        if (!date) return;

        setStartDate(date);

        if (endDate && new Date(date).getTime() > new Date(endDate).getTime()) {
            setError('End date cannot be earlier than start date.');
        } else {
            setError('');
        }
    };

    const handleEndDateChange = (date: string | null) => {
        if (!date) return;

        setEndDate(date);

        if (startDate && new Date(date).getTime() < new Date(startDate).getTime()) {
            setError('End date cannot be earlier than start date.');
        } else {
            setError('');
        }
    };

    // const handleDisableUser = async () => {
    //     if (!disableUser) return;
    //     if (!reason.trim()) {
    //         toast.error('Reason is required!');
    //         return;
    //     }

    //     const startDate = new Date(disableUser.start_date);
    //     const endDate = new Date(disableUser.end_date);

    //     let workingDays = 0;
    //     const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

    //     for (let i = 0; i <= totalDays; i++) {
    //         const currentDay = moment(startDate).add(i, 'days');
    //         if (currentDay.day() !== 0 && currentDay.day() !== 6) {
    //             workingDays++;
    //         }
    //     }

    //     const dailyHours = disableUser.task_hours / (workingDays || 1);
    //     const elapsedDays = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

    //     let workedDays = 0;
    //     for (let i = 0; i < elapsedDays; i++) {
    //         const currentDay = moment(startDate).add(i, 'days');
    //         if (currentDay.day() !== 0 && currentDay.day() !== 6) {
    //             workedDays++;
    //         }
    //     }

    //     const workedHours = workedDays * dailyHours;
    //     const remainingHours = disableUser.task_hours - workedHours;

    //     const data = {
    //         allocation_id: disableUser.id,
    //         status: false,
    //         lefthours: remainingHours < 0 ? 0 : remainingHours,
    //         workhours: workedHours,
    //         taskid: disableUser.task_id,
    //         departmentid: disableUser.department_id,
    //         reason: reason.trim(),
    //         start_date: currentDate,
    //         end_date: endDate
    //     };

    //     setOpenDisableModal(false);
    //     dispatch(spinLoaderShow(true));

    //     try {
    //         await disableUserAllocation(data);
    //         toast.success('User has been disabled successfully');
    //         getTaskHoursData && getTaskHoursData();
    //         refreshData();
    //     } catch (error: any) {
    //         toast.error(error?.message ?? error);
    //     } finally {
    //         dispatch(spinLoaderShow(false));
    //     }
    // };

    const handleDisableUser = async () => {
        if (!disableUser) return;

        if (!startDate || !endDate) {
            toast.error('Start date and End date are required!');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            toast.error('End date cannot be earlier than Start date!');
            return;
        }

        if (!reason.trim()) {
            toast.error('Reason is required!');
            return;
        }

        const originalStartDate = new Date(disableUser.start_date).toISOString().split('T')[0];
        const originalEndDate = new Date(disableUser.end_date).toISOString().split('T')[0];

        // Ensure start date is NOT before disableUser.start_date (allowing same date)
        if (originalStartDate && new Date(startDate) < new Date(originalStartDate)) {
            toast.error(`Start date cannot be before ${new Date(originalStartDate).toLocaleDateString()}`);
            return;
        }

        // Ensure end date is NOT before disableUser.start_date (allowing same date)
        if (originalStartDate && new Date(endDate) < new Date(originalStartDate)) {
            toast.error(`End date cannot be before ${new Date(originalStartDate).toLocaleDateString()}`);
            return;
        }

        if (originalEndDate && new Date(endDate) > new Date(originalEndDate)) {
            toast.error(`End date cannot be after ${new Date(originalEndDate).toLocaleDateString()}`);
            return;
        }

        // if selected period overlaps with any existing hold period
        if (disableUser.allocation_hold_history?.length) {
            const isOverlapping = disableUser.allocation_hold_history.some((entry: any) => {
                const holdStart = new Date(entry.hold_start_date);
                const holdEnd = new Date(entry.hold_end_date);

                return (
                    (new Date(startDate) >= holdStart && new Date(startDate) <= holdEnd) || // Start date is within an existing hold period
                    (new Date(endDate) >= holdStart && new Date(endDate) <= holdEnd) || // End date is within an existing hold period
                    (new Date(startDate) <= holdStart && new Date(endDate) >= holdEnd) // Selected period fully covers an existing hold period
                );
            });

            if (isOverlapping) {
                toast.error('Selected period is already on hold!');
                return;
            }
        }

        const data = {
            allocation_id: disableUser.id,
            status: false,
            reason: reason.trim(),
            taskid: disableUser.task_id,
            departmentid: disableUser.department_id,
            start_date: startDate,
            end_date: endDate
        };

        setOpenDisableModal(false);
        dispatch(spinLoaderShow(true));

        try {
            await temporaryDisableUserAllocation(data);
            toast.success('User has been disabled successfully');
            getTaskHoursData && getTaskHoursData();
            refreshData();
        } catch (error: any) {
            toast.error(error?.message ?? error);
        } finally {
            dispatch(spinLoaderShow(false));
        }
    };

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <ResourceTable
                    tableData={tableData}
                    locastorageuser={JSON.parse(localStorage.getItem('user') || '{}')}
                    currentDateWithoutTime={currentDateWithoutTime}
                    updatedisable={handleDisableClick}
                    updateIsCompleted={handleCompletionClick}
                    OpenShowReasonModal={handleReasonView}
                    OpenShowOnholdReasonModal={handleOnHoldReasonView}
                    userdata={userdata}
                />
            </Grid>
            <ResourceModals
                disable={openDisableModal}
                handleClose={handleDisableUser}
                cancelModal={() => setOpenDisableModal(false)}
                reason={reason}
                handleReasonChange={(e) => setReason(e.target.value)}
                iscompleted={openCompletionModal}
                handleCompletion={handleCompletion}
                cancelCompletionModal={() => setOpenCompletionModal(false)}
                showReason={showReasonModal}
                OpenshowReason={showReasonModal}
                otReason={otReason}
                closeShowReasonModal={() => setShowReasonModal(false)}
                showOnholdReason={showOnholdReasonModal}
                OpenshowOnholdReason={showOnholdReasonModal}
                onholdReason={onholdReason}
                closeShowOnholdReasonModal={() => setShowOnholdReasonModal(false)}
                startDate={startDate}
                endDate={endDate}
                handleStartDateChange={handleStartDateChange}
                handleEndDateChange={handleEndDateChange}
                error={error}
            />
        </Grid>
    );
}

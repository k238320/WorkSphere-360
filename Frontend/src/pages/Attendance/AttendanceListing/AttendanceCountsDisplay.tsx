import type React from 'react';
import { useEffect, useState } from 'react';
import { Grid, Typography, Divider } from '@mui/material';
import SubCard from 'ui-component/cards/SubCard';

interface AttendanceCountsDisplayProps {
    filterData: any[];
    name: string;
    empCode: string;
    remainingLeaves: any;
    statusCounts: any;
}

interface IndividualCounts {
    totalPresent: number;
    totalLate: number;
    totalOnLeaves: number;
    totalWorkFromHome: number;
    totalHalfDay: number;
    totalFullDay: number;
    totalHoliday: number;
    totalExtraHours: number;
    totalHours: string;
    requiredHours: string;
}

const AttendanceCountsDisplay: React.FC<AttendanceCountsDisplayProps> = ({ filterData, name, empCode, remainingLeaves, statusCounts }) => {
    const [individualCounts, setIndividualCounts] = useState<IndividualCounts>({
        totalPresent: 0,
        totalLate: 0,
        totalOnLeaves: 0,
        totalWorkFromHome: 0,
        totalHalfDay: 0,
        totalFullDay: 0,
        totalHoliday: 0,
        totalExtraHours: 0,
        totalHours: '00:00',
        requiredHours: '00:00'
    });

    // Function to calculate individual employee counts from filterData
    const calculateIndividualCounts = (data: any[]) => {
        if (!data || data.length === 0) {
            setIndividualCounts({
                totalPresent: 0,
                totalLate: 0,
                totalOnLeaves: 0,
                totalWorkFromHome: 0,
                totalHalfDay: 0,
                totalFullDay: 0,
                totalHoliday: 0,
                totalExtraHours: 0,
                totalHours: '00:00',
                requiredHours: '00:00'
            });
            return;
        }

        const counts = {
            totalPresent: 0,
            totalLate: 0,
            totalOnLeaves: 0,
            totalWorkFromHome: 0,
            totalHalfDay: 0,
            totalFullDay: 0,
            totalHoliday: 0,
            totalExtraHours: 0,
            totalHours: '00:00',
            requiredHours: '00:00'
        };

        let totalMinutes = 0;
        let requiredDays = 0;

        data.forEach((record: any) => {
            switch (record.status) {
                case 'On-Time':
                    counts.totalPresent++;
                    requiredDays++;
                    break;
                case 'Late':
                    counts.totalLate++;
                    requiredDays++;
                    break;
                case 'On-Leave':
                    counts.totalOnLeaves++;
                    break;
                case 'Work From Home':
                    counts.totalWorkFromHome++;
                    requiredDays++;
                    // Add 9 hours for WFH days
                    totalMinutes += 9 * 60;
                    break;
                case 'Half Day':
                    counts.totalHalfDay++;
                    requiredDays++;
                    break;
                case 'Full Day Off':
                    counts.totalFullDay++;
                    break;
                case 'Holiday':
                    counts.totalHoliday++;
                    break;
                case 'Extra Hours':
                    counts.totalExtraHours++;
                    requiredDays++;
                    break;
                default:
                    break;
            }

            // Calculate total worked hours (excluding WFH which is already added above)
            if (record.totalHoursWorked && record.status !== 'Work From Home') {
                const [hours, minutes] = record.totalHoursWorked.split(':').map(Number);
                if (!isNaN(hours) && !isNaN(minutes)) {
                    totalMinutes += hours * 60 + minutes;
                }
            }
        });

        // Convert total minutes to hours:minutes format
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        counts.totalHours = `${totalHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;

        // Calculate required hours (9 hours per required day)
        const requiredMinutes = requiredDays * 9 * 60;
        const requiredHours = Math.floor(requiredMinutes / 60);
        const requiredRemainingMinutes = requiredMinutes % 60;
        counts.requiredHours = `${requiredHours.toString().padStart(2, '0')}:${requiredRemainingMinutes.toString().padStart(2, '0')}`;

        setIndividualCounts(counts);
    };

    // Recalculate counts whenever filterData changes
    useEffect(() => {
        if (name && empCode) {
            calculateIndividualCounts(filterData);
        }
    }, [filterData, name, empCode]);

    // Individual Employee Counts Component (Current Period - from filterData)
    const IndividualEmployeeCounts = () => (
        <>
            <Grid item xs={12} md={12} sm={12}>
                <Typography
                    variant="h5"
                    component="h3"
                    style={{ textAlign: 'center', marginBottom: '10px', color: '#6e529e', fontWeight: 'bold' }}
                >
                    Current Period Statistics (From Selected Data)
                </Typography>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: '#4BB543' }}>
                    On Time
                </Typography>
                <h1 style={{ textAlign: 'center', color: '#4BB543' }}>{individualCounts.totalPresent}</h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'purple' }}>
                    Late
                </Typography>
                <h1 style={{ textAlign: 'center', color: 'purple' }}>{individualCounts.totalLate}</h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'blue' }}>
                    Work From Home
                </Typography>
                <h1 style={{ textAlign: 'center', color: 'blue' }}>{individualCounts.totalWorkFromHome}</h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'orange' }}>
                    On Leave
                </Typography>
                <h1 style={{ textAlign: 'center', color: 'orange' }}>{individualCounts.totalOnLeaves}</h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'red' }}>
                    Half Day
                </Typography>
                <h1 style={{ textAlign: 'center', color: 'red' }}>{individualCounts.totalHalfDay}</h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: '#FF6B6B' }}>
                    Full Day Off
                </Typography>
                <h1 style={{ textAlign: 'center', color: '#FF6B6B' }}>{individualCounts.totalFullDay}</h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: '#FFA500' }}>
                    Holiday
                </Typography>
                <h1 style={{ textAlign: 'center', color: '#FFA500' }}>{individualCounts.totalHoliday}</h1>
            </Grid>
            {/* <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'blue' }}>
                    Total Hours
                </Typography>
                <h1 style={{ textAlign: 'center', color: 'blue' }}>{individualCounts.totalHours}</h1>
            </Grid> */}
        </>
    );

    // Yearly/Backend Data Counts Component (Yearly Summary)
    const YearlyDataCounts = () => (
        <>
            <Grid item xs={12} md={12} sm={12}>
                <Divider sx={{ margin: '20px 0' }} />
                <Typography
                    variant="h5"
                    component="h3"
                    style={{ textAlign: 'center', marginBottom: '10px', color: '#6e529e', fontWeight: 'bold' }}
                >
                    Yearly Summary
                </Typography>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: '#000' }}>
                    Total Leaves
                </Typography>
                <h1 style={{ textAlign: 'center', color: '#000' }}>
                    <span>{remainingLeaves?.total_leaves ?? 0}</span>
                </h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: '#4BB543' }}>
                    Remaining Leaves
                </Typography>
                <h1 style={{ textAlign: 'center', color: '#4BB543' }}>{remainingLeaves?.remaining_leaves ?? 0}</h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'purple' }}>
                    Availed Leaves
                </Typography>
                <h1 style={{ textAlign: 'center', color: 'purple' }}>{remainingLeaves?.availed_leaves ?? 0}</h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'blue' }}>
                    Availed WFH
                </Typography>
                <h1 style={{ textAlign: 'center', color: 'blue' }}>{remainingLeaves?.availed_wfh ?? 0}</h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'orange' }}>
                    Total Lates
                </Typography>
                <h1 style={{ textAlign: 'center', color: 'orange' }}>
                    {remainingLeaves?.monthly_records?.reduce((acc: any, entry: any) => acc + (entry?.late_count || 0), 0) ?? 0}
                </h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'red' }}>
                    Deduction
                </Typography>
                <h1 style={{ textAlign: 'center', color: 'red' }}>
                    {remainingLeaves?.monthly_records?.reduce((acc: any, entry: any) => acc + (entry?.deduction_leaves || 0), 0) ?? 0}
                </h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'blue' }}>
                    Period Total Hours
                </Typography>
                <h1 style={{ textAlign: 'center', color: 'blue' }}>
                    {remainingLeaves && remainingLeaves?.total_leaves && filterData?.length > 0
                        ? (() => {
                              const totalMinutes = filterData?.reduce((acc: any, entry: any) => {
                                  const hoursWorked = entry?.totalHoursWorked;
                                  if (hoursWorked && typeof hoursWorked === 'string' && hoursWorked.includes(':')) {
                                      const [hoursStr, minutesStr] = hoursWorked.split(':');
                                      const hours = Number.parseInt(hoursStr, 10);
                                      const minutes = Number.parseInt(minutesStr, 10);
                                      return acc + hours * 60 + minutes;
                                  } else {
                                      return acc;
                                  }
                              }, 0);
                              const totalWFH = filterData?.filter((item: any) => item?.status == 'Work From Home').length;
                              const wfhMinutes = totalWFH > 0 ? totalWFH * 9 * 60 : 0;
                              const totalMinutesWithWFH = totalMinutes + wfhMinutes;
                              const hours = Math.floor(totalMinutesWithWFH / 60);
                              const minutes = totalMinutesWithWFH % 60;
                              return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                          })()
                        : '00:00'}
                </h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'blue' }}>
                    Required Hours
                </Typography>
                <h1 style={{ textAlign: 'center', color: 'blue' }}>{statusCounts.netWorkingHours ?? '00:00'}</h1>
            </Grid>
        </>
    );

    // Overall/Department Counts Component
    const OverallCounts = () => (
        <>
            <Grid item xs={12} md={12} sm={12}>
                <Typography
                    variant="h5"
                    component="h3"
                    style={{ textAlign: 'center', marginBottom: '10px', color: '#6e529e', fontWeight: 'bold' }}
                >
                    Overview
                </Typography>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: '#000' }}>
                    Total Employees
                </Typography>
                <h1 style={{ textAlign: 'center', color: '#000' }}>{statusCounts?.totalEmployee}</h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: '#4BB543' }}>
                    On Time
                </Typography>
                <h1 style={{ textAlign: 'center', color: '#4BB543' }}>{statusCounts?.totalPresent}</h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'purple' }}>
                    Lates
                </Typography>
                <h1 style={{ textAlign: 'center', color: 'purple' }}>{statusCounts?.totalLate}</h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'blue' }}>
                    Work from home
                </Typography>
                <h1 style={{ textAlign: 'center', color: 'blue' }}>{statusCounts?.totalWorkFromHome}</h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'orange' }}>
                    Leaves
                </Typography>
                <h1 style={{ textAlign: 'center', color: 'orange' }}>{statusCounts?.totalOnLeaves}</h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'red' }}>
                    Half day
                </Typography>
                <h1 style={{ textAlign: 'center', color: 'red' }}>{statusCounts?.totalHalfDay}</h1>
            </Grid>
            <Grid item xs={1.5} md={1.5} sm={1.5}>
                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: '#4BB543' }}>
                    Uninformed Leaves
                </Typography>
                <h1 style={{ textAlign: 'center', color: '#4BB543' }}>{statusCounts?.totalFullDay}</h1>
            </Grid>
        </>
    );

    return (
        <SubCard sx={{ margin: '5px 0px' }}>
            <Grid item xs={12} md={12} sm={12} sx={{ mt: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    {/* Show individual employee counts AND yearly data when a specific employee is selected */}
                    {name && empCode ? (
                        <>
                            {/* Current Period Statistics */}
                            <IndividualEmployeeCounts />

                            {/* Yearly Data (if available) */}
                            {remainingLeaves && remainingLeaves?.total_leaves && <YearlyDataCounts />}
                        </>
                    ) : remainingLeaves && remainingLeaves?.total_leaves && filterData?.length > 0 ? (
                        /* Show only yearly data when viewing personal data without specific employee selection */
                        <>
                            <Grid item xs={12} md={12} sm={12}>
                                <Typography
                                    variant="h5"
                                    component="h3"
                                    style={{ textAlign: 'center', marginBottom: '10px', color: '#6e529e', fontWeight: 'bold' }}
                                >
                                    Personal Yearly Summary
                                </Typography>
                            </Grid>
                            <Grid item xs={1.5} md={1.5} sm={1.5}>
                                <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                                    Total Leaves
                                </Typography>
                                <h1 style={{ textAlign: 'center' }}>
                                    <span>{remainingLeaves?.total_leaves ?? 0}</span>
                                </h1>
                            </Grid>
                            <Grid item xs={1.5} md={1.5} sm={1.5}>
                                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: '#4BB543' }}>
                                    Remaining Leaves
                                </Typography>
                                <h1 style={{ textAlign: 'center', color: '#4BB543' }}>{remainingLeaves?.remaining_leaves}</h1>
                            </Grid>
                            <Grid item xs={1.5} md={1.5} sm={1.5}>
                                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'purple' }}>
                                    Availed Leaves
                                </Typography>
                                <h1 style={{ textAlign: 'center', color: 'purple' }}>{remainingLeaves?.availed_leaves ?? 0}</h1>
                            </Grid>
                            <Grid item xs={1.5} md={1.5} sm={1.5}>
                                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'blue' }}>
                                    Availed WFH
                                </Typography>
                                <h1 style={{ textAlign: 'center', color: 'blue' }}>{remainingLeaves?.availed_wfh ?? 0}</h1>
                            </Grid>
                            <Grid item xs={1.5} md={1.5} sm={1.5}>
                                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'orange' }}>
                                    Lates
                                </Typography>
                                <h1 style={{ textAlign: 'center', color: 'orange' }}>
                                    {remainingLeaves?.monthly_records?.reduce(
                                        (acc: any, entry: any) => acc + (entry?.late_count || 0),
                                        0
                                    ) ?? 0}
                                </h1>
                            </Grid>
                            <Grid item xs={1.5} md={1.5} sm={1.5}>
                                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'red' }}>
                                    Deduction
                                </Typography>
                                <h1 style={{ textAlign: 'center', color: 'red' }}>
                                    {remainingLeaves?.monthly_records?.reduce(
                                        (acc: any, entry: any) => acc + (entry?.deduction_leaves || 0),
                                        0
                                    ) ?? 0}
                                </h1>
                            </Grid>
                            <Grid item xs={1.5} md={1.5} sm={1.5}>
                                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'blue' }}>
                                    Total Hours
                                </Typography>
                                <h1 style={{ textAlign: 'center', color: 'blue' }}>
                                    {remainingLeaves && remainingLeaves?.total_leaves && filterData?.length > 0
                                        ? (() => {
                                              const totalMinutes = filterData?.reduce((acc: any, entry: any) => {
                                                  const hoursWorked = entry?.totalHoursWorked;
                                                  if (hoursWorked && typeof hoursWorked === 'string' && hoursWorked.includes(':')) {
                                                      const [hoursStr, minutesStr] = hoursWorked.split(':');
                                                      const hours = Number.parseInt(hoursStr, 10);
                                                      const minutes = Number.parseInt(minutesStr, 10);
                                                      return acc + hours * 60 + minutes;
                                                  } else {
                                                      return acc;
                                                  }
                                              }, 0);
                                              const totalWFH = filterData?.filter((item: any) => item?.status == 'Work From Home').length;
                                              const wfhMinutes = totalWFH > 0 ? totalWFH * 9 * 60 : 0;
                                              const totalMinutesWithWFH = totalMinutes + wfhMinutes;
                                              const hours = Math.floor(totalMinutesWithWFH / 60);
                                              const minutes = totalMinutesWithWFH % 60;
                                              return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                                          })()
                                        : '00:00'}
                                </h1>
                            </Grid>
                            <Grid item xs={1.5} md={1.5} sm={1.5}>
                                <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'blue' }}>
                                    Required Hours
                                </Typography>
                                <h1 style={{ textAlign: 'center', color: 'blue' }}>{statusCounts.netWorkingHours ?? '00:00'}</h1>
                            </Grid>
                        </>
                    ) : (
                        /* Show overall department counts when no specific employee is selected */
                        <OverallCounts />
                    )}
                </Grid>
            </Grid>
        </SubCard>
    );
};

export default AttendanceCountsDisplay;

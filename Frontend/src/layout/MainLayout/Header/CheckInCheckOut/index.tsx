import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, Typography } from '@mui/material';
import axios from 'axios';
import { Checkin, GetCheckinCheckout } from 'services/portal-wft';
import useAuth from 'hooks/useAuth';

interface AttendanceData {
    lastCheckInTime: string | null;
    lastCheckOutTime: string | null;
}

const CheckInCheckOut: React.FC = () => {
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(0);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
    const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
    const [lastCheckOut, setLastCheckOut] = useState<string | null>(null);

    const { user } = useAuth();

    useEffect(() => {
        // Fetch last check-in and check-out times when the component mounts
        fetchAttendanceData();
    }, []);

    // Start timer based on lastCheckInTime if exists
    useEffect(() => {
        if (lastCheckIn && isCheckedIn) {
            debugger
            const lastCheckInTime = new Date(lastCheckIn).getTime();
            const currentTime = new Date().getTime();
            const timeDifference = Math.floor((currentTime - lastCheckInTime) / 1000); // Time difference in seconds
            setTimer(timeDifference); // Set initial timer value
            startTimer(); // Start the timer
        }
    }, [lastCheckIn, isCheckedIn]); // Runs when lastCheckIn or isCheckedIn changes

    const fetchAttendanceData = async (): Promise<void> => {
        try {
            const date = new Date();
            const startTime = date;
            startTime.setHours(0, 0, 0, 0);

            const endTime = date;
            endTime.setHours(23, 59, 59, 999);

            const response: any = await GetCheckinCheckout(startTime, endTime, user?.employement_code, 2);

            const { lastCheckInTime, lastCheckOutTime } = response;
            setLastCheckIn(lastCheckInTime);
            setLastCheckOut(lastCheckOutTime);
            setIsCheckedIn(!!lastCheckInTime); // If lastCheckInTime exists, set checked-in state
            console.log('res', response);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
        }
    };

    const handleCheckIn = async (): Promise<void> => {
        const currentTime = new Date().toISOString();
        const empCode = user?.employement_code; // assuming you have the empCode in the user object
        const location_type_id = 2; // Pass the appropriate location type ID

        try {
            const res = await Checkin(empCode, location_type_id);
            console.log(res);
            setIsCheckedIn(true);
            setLastCheckIn(currentTime); // Set last check-in time
            startTimer(); // Start the timer from the current check-in time
        } catch (error) {
            console.error('Error during check-in:', error);
        }
    };

    const handleCheckOut = async (): Promise<void> => {
        const currentTime = new Date().toISOString();
        try {
            await axios.post('/api/attendance', { action: 'checkout', timestamp: currentTime });
            setIsCheckedIn(false);
            setLastCheckOut(currentTime);
            stopTimer();
        } catch (error) {
            console.error('Error during check-out:', error);
        }
    };

    const startTimer = (): void => {
        // Ensure we don't start multiple timers
        if (intervalId) return;

        const id = setInterval(() => {
            setTimer((prev) => prev + 1); // Increment timer every second
        }, 1000);

        setIntervalId(id); // Save intervalId to clear later
    };

    const stopTimer = (): void => {
        if (intervalId) {
            clearInterval(intervalId); // Clear the interval
            setIntervalId(null); // Reset the intervalId
        }
        setTimer(0); // Reset the timer to 0
    };

    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div>
            <Button variant="contained" onClick={() => setModalIsOpen(true)}>
                Check-In/Check-Out
            </Button>
            <Modal
                open={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
                aria-labelledby="checkin-checkout-modal-title"
                aria-describedby="checkin-checkout-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '10%',
                        left: '50%',
                        transform: 'translate(-50%, 0)',
                        width: '90%',
                        maxWidth: 300,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 2,
                        borderRadius: 4
                    }}
                >
                    <Typography id="checkin-checkout-modal-title" variant="h6" component="h2" textAlign="center">
                        {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                    </Typography>
                    <Typography mt={2} variant="body1" color="text.secondary" textAlign="center">
                        Last Check-In: {formatDate(lastCheckIn)}
                    </Typography>
                    <Typography mt={1} variant="body1" color="text.secondary" textAlign="center">
                        Last Check-Out: {formatDate(lastCheckOut)}
                    </Typography>
                    {isCheckedIn && (
                        <Typography mt={2} variant="body1" color="text.secondary" textAlign="center">
                            Timer: {formatTime(timer)}
                        </Typography>
                    )}
                    <Box mt={2} display="flex" justifyContent="center">
                        {isCheckedIn ? (
                            <Button variant="contained" color="error" onClick={handleCheckOut}>
                                Check Out
                            </Button>
                        ) : (
                            <Button variant="contained" color="primary" onClick={handleCheckIn}>
                                Check In
                            </Button>
                        )}
                    </Box>
                    <Box mt={2} display="flex" justifyContent="center">
                        <Button variant="text" onClick={() => setModalIsOpen(false)}>
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default CheckInCheckOut;

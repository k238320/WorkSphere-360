import React, { useState } from 'react';
import DateFnsUtils from '@date-io/date-fns'; // choose your lib
import { Button } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import moment from 'moment';

function DatePickerComponent({ onChange, date, disabled }: { onChange: any; date: any; disabled?: boolean }) {
    const [isForcePickerOpen, setIsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    return (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
            <LocalizationProvider dateAdapter={DateFnsUtils}>
                <DatePicker
                    open={isForcePickerOpen}
                    onClose={() => setIsOpen(false)}
                    value={date}
                    onChange={(date) => {
                        onChange(date);
                        // handleDateChange(date);
                    }}
                    PopperProps={{
                        placement: 'bottom',
                        anchorEl: anchorEl
                    }}
                    disabled={disabled}
                    renderInput={(x: any) => (
                        <div ref={x.ref} {...x.other}>
                            <input
                                style={{ display: 'none' }}
                                value={x.value} // Ensure selectedDate is not null before calling toString
                                onChange={x.onChange}
                                {...x.inputProps}
                            />
                            <Button
                                color="primary"
                                onClick={(e: any) => {
                                    setIsOpen((isOpen) => !isOpen);
                                    setAnchorEl(e?.currentTarget);
                                }}
                            >
                                <InsertInvitationIcon fontSize="medium" style={{ color: '#2196f3' }} />
                            </Button>
                        </div>
                    )}
                />
            </LocalizationProvider>
            {
                <div style={{ marginLeft: '5px' }}>
                    {date === 'Invalid date' || date == null || date == undefined ? 'N/A' : moment(date).format('Do MMM, YYYY')}
                </div>
            }
        </div>
    );
}

export default DatePickerComponent;

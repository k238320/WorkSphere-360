import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import { Title } from 'components/ProjectManage/ProjectChild/ForFinance/ProjectMileStoneListing';
import moment from 'moment';
import ClickAwayListener from '@mui/material/ClickAwayListener';

interface ICustomTooltip {
    row: any;
    setPropsChanged: any;
    // handleUpdateApi: any;
    disabled: boolean;
}

const CustomTooltip = ({ row, setPropsChanged, disabled }: ICustomTooltip) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleTooltipClose = () => {
        setOpen(false);
    };

    const handleTooltipOpen = () => {
        setOpen((prev) => !prev);
    };

    return (
        <ClickAwayListener onClickAway={handleTooltipClose}>
            <div>
                <Tooltip
                    PopperProps={{
                        disablePortal: true
                    }}
                    onClose={handleTooltipClose}
                    open={open}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    title={
                        <Title
                            date={{
                                date: moment(row?.targeted_month).format(),
                                milestonephase: row?.milestone_phase?.name,
                                id: row?.id,
                                onhold: row?.onhold?.[0]?.permanentlyhold,
                                setPropsChanged: setPropsChanged
                            }}
                            disabled={disabled}
                        />
                    }
                    componentsProps={{
                        tooltip: {
                            sx: {
                                bgcolor: '#ffffff',
                                color: '#000000',
                                padding: 0,
                                borderRadius: '12px',
                                overflow: 'hidden',
                                zIndex: 40,
                                boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px',
                                '&.MuiTooltip-popper': {
                                    zIndex: '40 !important'
                                }
                            }
                        }
                    }}
                >
                    <EditIcon sx={{ fontSize: 18, cursor: 'pointer' }} onClick={handleTooltipOpen} />
                </Tooltip>
            </div>
        </ClickAwayListener>
    );
};

export default CustomTooltip;

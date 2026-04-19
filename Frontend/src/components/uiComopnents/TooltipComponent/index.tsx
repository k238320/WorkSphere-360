import React, { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import EditIcon from '@mui/icons-material/Edit';

interface ICustomTooltipProps {
    children: any;
    content: any;
}

const TooltipComponent: React.FC<ICustomTooltipProps> = ({ content, children, ...props }) => {
    const [open, setOpen] = useState<boolean>(false);

    const handleTooltipOpen = () => {
        setOpen((prev: any) => !prev);
    };

    const handleTooltipClose = () => {
        setOpen(false);
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
                    title={content}
                    onClick={handleTooltipOpen}
                    {...props}
                    componentsProps={{
                        tooltip: {
                            sx: {
                                bgcolor: '#ffffff',
                                color: '#000000',
                                padding: 0,
                                borderRadius: '12px',
                                overflow: 'hidden',
                                zIndex: '4000 !important',
                                boxShadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px',
                                '&.MuiTooltip-popper': {
                                    zIndex: '4000 !important'
                                }
                            }
                        }
                    }}
                >
                    <div>{children}</div>
                </Tooltip>
            </div>
        </ClickAwayListener>
    );
};

export default TooltipComponent;

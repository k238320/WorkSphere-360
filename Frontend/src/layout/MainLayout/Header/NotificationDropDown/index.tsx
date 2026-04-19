import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Box, ClickAwayListener, Menu, MenuItem } from '@mui/material';
import { IconBell } from '@tabler/icons';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { updateNotifications } from 'services/userService';
import { useNavigate } from 'react-router-dom';

interface iProps {
    notifications: [];
    GetNotifications: any;
}

const NotificationDropDown = (props: iProps) => {
    const [data, setdata] = useState<any>([]);
    const [count, setcount] = useState<any>([]);
    const navigate = useNavigate();

    useEffect(() => {
        setdata(props.notifications);
    }, [props.notifications]);

    useMemo(() => {
        setcount(data.filter((notification: any) => notification.read === false).length);
    }, [data, props.notifications]);

    const anchorRef = useRef<any>(null);
    const theme = useTheme();
    const [open, setopen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const handleClose1 = () => {
        setopen(false);
        setAnchorEl(null);
    };
    const handleToggle1 = (event: any) => {
        setopen(!open);
        setAnchorEl(event.currentTarget);
    };
    const handlemarkasread = async (notification: any) => {
        if (notification?.link) {
            navigate(notification?.link);
        }
        setopen(false);

        if (!notification?.read) {
            await updateNotifications(notification?.id);
            props.GetNotifications();
        }
    };

    return (
        <div>
            <Box
                sx={{
                    ml: 2,
                    mr: 3,
                    [theme.breakpoints.down('md')]: {
                        mr: 2
                    }
                }}
            >
                <Avatar
                    className="custom__notification"
                    variant="rounded"
                    sx={{
                        ...theme.typography.commonAvatar,
                        ...theme.typography.mediumAvatar,
                        transition: 'all .2s ease-in-out',
                        background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.secondary.light,
                        color: theme.palette.mode === 'dark' ? theme.palette.warning.dark : theme.palette.secondary.dark,
                        '&[aria-controls="menu-list-grow"],&:hover': {
                            background: theme.palette.mode === 'dark' ? theme.palette.warning.dark : theme.palette.secondary.dark,
                            color: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.secondary.light
                        }
                    }}
                    ref={anchorRef}
                    aria-controls={open ? 'menu-list-grow' : undefined}
                    aria-haspopup="true"
                    onClick={handleToggle1}
                    color="inherit"
                >
                    <IconBell stroke={1.5} size="20px" />
                    <span className="notification__count">{count >= 10 ? '9+' : count}</span>
                </Avatar>
            </Box>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose1}
                className="notification__modal custom__popup"
                // PaperComponent={(props:any) => <Paper {...props} elevation={3} />}
            >
                <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(75vh - 205px)', overflowX: 'hidden' }}>
                    <ClickAwayListener onClickAway={handleClose1}>
                        <>
                            {data.map((notification: any) => (
                                <>
                                    <MenuItem
                                        // onClick={!notification.read ? handlemarkasread(notification.id) : ()}
                                        onClick={() => handlemarkasread(notification)}
                                        className={`${!notification.read ? 'unread__message' : ''} notification__message`}
                                        sx={{
                                            '&:hover': {
                                                background: theme.palette.primary.light
                                            },
                                            width: '100%',
                                            maxWidth: 330,
                                            minWidth: 220,
                                            padding: '15px'
                                        }}
                                    >
                                        <div className="notification__details">
                                            <strong>{notification?.title}</strong>
                                            <p style={{ whiteSpace: 'pre-wrap' }}>{notification?.message}</p>
                                        </div>
                                    </MenuItem>
                                    {/* {!notification.read && (
                                        <MenuItem>
                                            <Button onClick={() => handlemarkasread(notification.id)}>Mark as Read</Button>
                                        </MenuItem>
                                    )} */}
                                </>
                            ))}
                            {data.length === 0 && <MenuItem onClick={handleClose1}>No notifications</MenuItem>}
                        </>
                    </ClickAwayListener>
                </PerfectScrollbar>
            </Menu>
        </div>
    );
};

export default NotificationDropDown;

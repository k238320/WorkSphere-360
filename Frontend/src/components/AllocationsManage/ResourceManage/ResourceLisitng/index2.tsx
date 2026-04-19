// material-ui
import {
    Checkbox,
    Grid,
    IconButton,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Radio,
    FormControlLabel
} from '@mui/material';

// project imports
import { gridSpacing } from 'store/constant';

// assets
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MainCard from 'ui-component/cards/MainCard';
import { useEffect, useState } from 'react';
import { deleteClientDetails } from 'services/clientDetails';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { getAllocations } from 'services/resource';
import moment from 'moment';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { red } from '@mui/material/colors';
import { disableUserAllocation, updateCompletion } from 'services/Allocation/taskServices';
import user from 'store/slices/user';

// =========================|| LATEST ORDER CARD ||========================= //

interface iProps {
    tableData: any;
    refreshData: any;
    task_id: any;
    userdata: any;
    getTaskHoursData?: any;
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4
};

export default function ResourceListing(props: iProps) {
    const [tableData, setTableData] = useState<any>([]);

    const [open, setOpen] = useState<boolean>(false);
    const [openCompletionModal, setOpenCompletionModal] = useState<boolean>(false);
    const [disable, setdisable] = useState<boolean>(false);
    const [completionUser, setcompletionUser] = useState<any>();
    const [iscompleted, setiscompleted] = useState<boolean>(false);
    const [reason, setReason] = useState<string>('');
    const [showReason, setshowReason] = useState<boolean>(false);
    const [OpenshowReason, setOpenshowReason] = useState<boolean>(false);
    const [showOnholdReason, setshowOnholdReason] = useState<boolean>(false);
    const [OpenshowOnholdReason, setOpenshowOnholdReason] = useState<boolean>(false);
    const [onholdReason, setonholdReason] = useState<any>();
    const [otReason, setotReason] = useState<any>();

    const fetchuser: any | null = localStorage.getItem('user');
    const locastorageuser: any = JSON.parse(fetchuser);

    const cancelModal = () => {
        setOpen(false);
        setdisable(false);
    };

    const cancelCompletionModal = () => {
        setOpenCompletionModal(false);
        setiscompleted(false);
    };
    const closeShowReasonModal = () => {
        setshowReason(false);
        setOpenshowReason(false);
        // setiscompleted(false);
    };

    const closeShowOnholdReasonModal = () => {
        setshowOnholdReason(false);
        setOpenshowOnholdReason(false);
        // setiscompleted(false);
    };

    const [disableuser, setdiableuser] = useState<any>();

    const dispatch = useDispatch();
    const date = new Date();
    const currentDateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const handleReasonChange = (event: any) => {
        setReason(event.target.value);
    };

    useEffect(() => {
        if (props?.tableData) {
            props?.tableData?.forEach((x: any) => {
                if (new Date(x?.end_date) >= date) {
                    x.resourcedisable = false;
                } else {
                    x.resourcedisable = true;
                }
            });

            setTableData(props?.tableData);
        }
    }, [props?.tableData]);

    const updatedisable = (data: any) => {
        setdisable(!disable);
        setOpen(true);
        setdiableuser(data);
    };

    const updateIsCompleted = (data: any) => {
        setiscompleted(!iscompleted);
        setOpenCompletionModal(true);
        setcompletionUser(data);
    };

    const OpenShowReasonModal = (data: any) => {
        setshowReason(true);
        setOpenshowReason(true);
        setotReason(data);
    };

    const OpenShowOnholdReasonModal = (data: any) => {
        setshowOnholdReason(true);
        setOpenshowOnholdReason(true);
        setonholdReason(data);
    };

    function deteleButton(index: any, data: any) {
        // dispatch(spinLoaderShow(true));

        // deleteClientDetails(data?.id)
        //     .then((res) => {
        //         props?.refreshData();
        //         toast.success('Client Deleted Successfully!');
        //     })
        //     .catch((err: any) => {
        //         toast.success(err);
        //     })
        //     .finally(() => {
        //         dispatch(spinLoaderShow(false));
        //     });

        console.log(index);
    }

    const handleCompletion = async () => {
        setOpenCompletionModal(false);
        const data = {
            allocation_id: completionUser.id
        };
        dispatch(spinLoaderShow(true));
        await updateCompletion(data)
            .then((res: any) => {
                toast.success('Task marked as completed!');
                props.getTaskHoursData();
                props.refreshData();
            })
            .catch((error) => {
                toast.error(error?.message ?? error);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const handleClose = async () => {
        setOpen(false);
        const startdate = new Date(disableuser.start_date);
        const end_date = new Date(disableuser.end_date);
        let data;
        if (startdate > date) {
            data = {
                allocation_id: disableuser.id,
                status: false,
                lefthours: disableuser.task_hours,
                workhours: 0,
                taskid: disableuser.task_id,
                departmentid: disableuser.department_id,
                reason: reason,
                start_date: startdate,
                end_date: end_date
            };
        } else {
            const timeDifference = end_date.getTime() - startdate.getTime();
            const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

            let workingdays = 0;
            for (let i = 0; i < daysDifference; i++) {
                const currentDate = moment(startdate).add(i, 'days');
                if (currentDate.day() !== 0 && currentDate.day() !== 6) {
                    workingdays++;
                }
            }

            const dayhours = disableuser.task_hours / (workingdays + 1);
            // const daysworked = Math.floor((date.getTime() - startdate.getTime()) / (1000 * 3600 * 24));

            const workDifference = date.getTime() - startdate.getTime();
            const wdaysDifference = Math.floor(workDifference / (1000 * 3600 * 24));
            let daysworked = 0;
            for (let i = 0; i < wdaysDifference; i++) {
                const currentDate = moment(startdate).add(i, 'days');
                if (currentDate.day() !== 0 && currentDate.day() !== 6) {
                    daysworked++;
                }
            }
            const workhours = daysworked * dayhours;

            const lefthours = disableuser.task_hours - workhours;
            data = {
                allocation_id: disableuser.id,
                status: false,
                lefthours: lefthours,
                workhours: workhours,
                taskid: disableuser.task_id,
                departmentid: disableuser.department_id,
                reason: reason,
                start_date: date,
                end_date: end_date
            };
        }
        if (!reason || reason == undefined || reason == '') {
            setdisable(false);
            toast.error('Reason is requierd!');
        } else {
            dispatch(spinLoaderShow(true));
            await disableUserAllocation(data)
                .then((res: any) => {
                    toast.success('User has been disabled successfully');
                    props.getTaskHoursData();
                    props.refreshData();
                })
                .catch((error) => {
                    toast.error(error?.message ?? error);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <MainCard content={false}>
                    <TableContainer sx={{ overflowX: 'hidden !important', overflowY: 'hidden !important' }}>
                        <Table sx={{ minWidth: 350 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ pl: 3 }}>Resource Name</TableCell>
                                    {locastorageuser?.role?.name == 'Project Manager' && <TableCell align="center">Department</TableCell>}
                                    <TableCell align="center">Hours</TableCell>
                                    <TableCell align="center">Start Time</TableCell>
                                    <TableCell align="center">End Time</TableCell>
                                    <TableCell align="center">On-Hold Resource</TableCell>
                                    <TableCell align="center">Task Completed</TableCell>
                                    <TableCell align="center">Overtime Task</TableCell>
                                    {/* <TableCell align="center" sx={{ pr: 3 }}>
                                        Action
                                    </TableCell> */}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* {props?.apiData?.project_clients?.map((row: any, index: any) => ( */}
                                {tableData?.map((row: any, index: any) => (
                                    <TableRow hover key={index}>
                                        <TableCell sx={{ pl: 3 }}>{row?.resource?.name}</TableCell>
                                        {locastorageuser?.role?.name == 'Project Manager' && (
                                            <TableCell align="center">{row?.department?.name}</TableCell>
                                        )}
                                        <TableCell align="center">{row.task_hours}</TableCell>
                                        <TableCell align="center">{moment(row.start_date).format('D MMM YY')}</TableCell>
                                        <TableCell align="center">{moment(row.end_date).format('D MMM YY')}</TableCell>
                                        {/* <TableCell align="center">{row.resourcedisable == false && <Switch onChange={()=> setdisable(!disable)}/>}</TableCell> */}

                                        <TableCell align="center">
                                            {/* {row.resourcedisable == false && ( */}
                                            <>
                                                {locastorageuser?.role?.name != 'Resource' && (
                                                    <>
                                                        <Switch
                                                            disabled={
                                                                !row.status ||
                                                                row.is_completed ||
                                                                locastorageuser?.role?.name != 'Team Lead' ||
                                                                new Date(row.end_date) < currentDateWithoutTime
                                                            }
                                                            checked={!row.status}
                                                            onChange={() => updatedisable(row)}
                                                        />
                                                        <br />
                                                    </>
                                                )}
                                                {locastorageuser?.role?.name == 'Resource' && !row.status && (
                                                    <Typography
                                                        variant="h6"
                                                        component="h6"
                                                        // color={'#697586'}
                                                        onClick={() => OpenShowOnholdReasonModal(row)}
                                                        // style={{ cursor: 'pointer', color: '#0096FF' }}
                                                        marginTop={'5px'}
                                                    >
                                                        Disabled
                                                    </Typography>
                                                )}
                                                {/* <FormControlLabel
                                                        control={
                                                            <Radio
                                                                disabled={true}
                                                                checked={row.status}
                                                                style={{ margin: '-4px 4px -4px 0', padding: '0', color: '#32de84' }}
                                                            />
                                                        }
                                                        label={<span style={{ color: '#32de84' }}>In-Progress</span>}
                                                    /> */}
                                                {row.status == false && (
                                                    <Typography
                                                        variant="h6"
                                                        component="h6"
                                                        color={'#697586'}
                                                        onClick={() => OpenShowOnholdReasonModal(row)}
                                                        style={{ cursor: 'pointer', color: '#0096FF' }}
                                                        marginTop={'5px'}
                                                    >
                                                        View Reason
                                                    </Typography>
                                                )}
                                            </>
                                            {/* )} */}
                                            {!row.is_completed && (
                                                <FormControlLabel
                                                    control={
                                                        <Radio
                                                            disabled={true}
                                                            checked={row.status}
                                                            style={{ margin: '-4px 4px -4px 0', padding: '0', color: '#FDDA0D' }}
                                                        />
                                                    }
                                                    label={<span style={{ color: '#FDDA0D' }}>In-Progress</span>}
                                                />
                                            )}
                                            {row.is_completed && (
                                                <FormControlLabel
                                                    control={
                                                        <Radio
                                                            disabled={true}
                                                            checked={row.status}
                                                            style={{ margin: '-4px 4px -4px 0', padding: '0', color: '#32de84' }}
                                                        />
                                                    }
                                                    label={<span style={{ color: '#32de84' }}>Completed</span>}
                                                />
                                            )}
                                        </TableCell>

                                        <TableCell align="center">
                                            {/* <Checkbox disabled={props.userdata.name != 'Resource'} /> */}
                                            <Checkbox
                                                checked={row.is_completed}
                                                disabled={
                                                    !row.status ||
                                                    row.is_completed == true ||
                                                    props?.userdata?.role?.name != 'Resource' ||
                                                    locastorageuser.resource_id != row.resource_id
                                                }
                                                onChange={() => updateIsCompleted(row)}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {row.is_overtime && (
                                                <>
                                                    <Typography variant="h6" component="h2" color={'#ef5350'}>
                                                        YES
                                                    </Typography>
                                                    <Typography
                                                        variant="h6"
                                                        component="h6"
                                                        color={'#697586'}
                                                        onClick={() => OpenShowReasonModal(row)}
                                                        style={{ cursor: 'pointer', color: '#0096FF' }}
                                                    >
                                                        View Reason
                                                    </Typography>
                                                </>
                                            )}
                                            {!row.is_overtime && (
                                                <Typography variant="h6" component="h2">
                                                    _
                                                </Typography>
                                            )}
                                            {/* <Checkbox checked={row.is_overtime ? true : false} disabled={true} /> */}
                                        </TableCell>
                                        {/* <TableCell align="center"><Switch/></TableCell> */}
                                        {/* <TableCell align="center" sx={{ pr: 3 }}>
                                            <Stack direction="row" justifyContent="center" alignItems="center">
                                                <IconButton
                                                    color="inherit"
                                                    size="large"
                                                    onClick={(e: any) => {
                                                        deteleButton(index, row);
                                                    }}
                                                    style={{ color: 'error' }}
                                                >
                                                    <DeleteOutlineOutlinedIcon />
                                                </IconButton>
                                            </Stack>
                                        </TableCell> */}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </MainCard>
            </Grid>
            {open && (
                <div>
                    <Modal
                        open={disable}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h6" component="h2" color={red}>
                                Are you sure you want to hold this resource.
                            </Typography>
                            {/* <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                <textarea
                                    placeholder="Enter the reason for disabling..."
                                    value={reason}
                                    onChange={(e) => handleReasonChange(e)}
                                    style={{ width: '100%', minHeight: '100px' }}
                                />
                            </Typography> */}
                            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                                <TextField
                                    placeholder="Enter the reason for on-holding this resource..."
                                    multiline={true}
                                    rows={4}
                                    value={reason}
                                    onChange={(e) => handleReasonChange(e)}
                                    style={{ width: '100%', minHeight: '100px' }}
                                />
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right' }}>
                                <Button variant="contained" onClick={() => cancelModal()}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        handleClose();
                                    }}
                                >
                                    Confirm
                                </Button>
                            </Stack>
                        </Box>
                    </Modal>
                </div>
            )}

            {openCompletionModal && (
                <div>
                    <Modal
                        open={iscompleted}
                        onClose={handleCompletion}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h6" component="h2" color={red}>
                                Are you sure you want to mark this task as completed?
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right' }}>
                                <Button variant="contained" onClick={() => cancelCompletionModal()}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        handleCompletion();
                                    }}
                                >
                                    Confirm
                                </Button>
                            </Stack>
                        </Box>
                    </Modal>
                </div>
            )}

            {showReason && (
                <div>
                    <Modal open={OpenshowReason} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                        <Box sx={style}>
                            <Typography
                                id="modal-modal-title"
                                variant="h4"
                                component="h2"
                                sx={{ fontWeight: 'bold', mb: 2, borderBottom: '2px solid #1976D2', paddingBottom: '10px' }}
                            >
                                OverTime Reason
                            </Typography>

                            <Typography id="modal-modal-title" variant="body1" component="div" sx={{ mt: 2, color: '#333' }}>
                                {otReason.overtime_reason}
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right' }}>
                                <Button variant="contained" onClick={() => closeShowReasonModal()}>
                                    Ok
                                </Button>
                            </Stack>
                        </Box>
                    </Modal>
                </div>
            )}

            {showOnholdReason && (
                <div>
                    <Modal open={OpenshowOnholdReason} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                        <Box sx={style}>
                            <Typography
                                id="modal-modal-title"
                                variant="h4"
                                component="h2"
                                sx={{ fontWeight: 'bold', mb: 2, borderBottom: '2px solid #1976D2', paddingBottom: '10px' }}
                            >
                                On-Hold Reason
                            </Typography>

                            <Typography id="modal-modal-title" variant="body1" component="div" sx={{ mt: 2, color: '#333' }}>
                                {onholdReason?.reason}
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right' }}>
                                <Button variant="contained" onClick={() => closeShowOnholdReasonModal()}>
                                    Ok
                                </Button>
                            </Stack>
                        </Box>
                    </Modal>
                </div>
            )}
        </Grid>
    );
}

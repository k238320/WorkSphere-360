// material-ui
import { Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

// project imports
import { gridSpacing } from 'store/constant';

// assets
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import MainCard from 'ui-component/cards/MainCard';
import { useEffect, useState } from 'react';
import { deleteHourDetail, getDepartmentCost, getProjectById, getProjectHourDetail } from 'services/projectService';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { toast } from 'react-toastify';
import DeleteDialogBox from 'components/uiComopnents/DeleteDialogBox/modal';

// =========================|| LATEST ORDER CARD ||========================= //

export default function ProjectManagerHoursListing(props: any) {
    const dispatch = useDispatch();

    const [totalHours, setTotalHours] = useState<any>([]);
    const [totalCost, setTotalCost] = useState<any>([]);
    const [upsel, setUpsel] = useState<any>([]);
    const [upselData, setUpselData] = useState<any>([]);
    const [AditionalCategory, seAdditioonalCategory] = useState<any>([]);
    const [projectHours, setProjectHours] = useState<any>([]);
    const [cost, setCost] = useState(40);
    const [totalWeeks, setTotalWeeks] = useState(0);
    const [apiData, setApiData] = useState<any>([]);
    const [tableData, setTableData] = useState<any>([]);

    const log: any = window.localStorage.getItem('user');
    const localUsers = JSON.parse(log);

    function deteleButton(id: string) {
        dispatch(spinLoaderShow(true));
        deleteHourDetail(id)
            .then((res: any) => {
                getProjectHour();
                toast.success('Record Deleted Successfully');
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    }

    const getProjectHour = () => {
        getProjectHourDetail(props?.projectId)
            .then((res: any) => {
                res?.forEach((element: any) => {
                    element.cost = +element.hours * 40;
                });

                getProjectByIdData(res);

                setProjectHours(res);
            })
            .catch((err) => {
                console.log('err', err);
            });
    };

    const calculateHoursWithConsumed = (consumed: any, projects: any) => {
        for (let consumedItem of consumed) {
            let totalConsumedHours = consumedItem.consumed_hours;
            let departmentId = consumedItem.department?.id;

            let saleHours = 0;
            let upsellHours = 0;
            let additionalHours = 0;

            for (let project of projects) {
                if (project.department?.id === departmentId) {
                    if (project.project_category_hours.name === 'Sale Hours') {
                        saleHours += project.hours;
                    } else if (project.project_category_hours.name === 'Upsell') {
                        upsellHours += project.hours;
                    } else if (project.project_category_hours.name === 'Additional') {
                        additionalHours += project.hours;
                    }
                }
            }

            let remainingHours = totalConsumedHours;

            if (remainingHours <= saleHours) {
                for (let project of projects) {
                    if (project.department?.id === departmentId && project.project_category_hours.name === 'Sale Hours') {
                        project.consumed_hours = Math.min(remainingHours, project.hours);
                        remainingHours -= project.consumed_hours;
                        if (remainingHours <= 0) break;
                    }
                }
            } else {
                for (let project of projects) {
                    if (project.department?.id === departmentId && project.project_category_hours.name === 'Sale Hours') {
                        project.consumed_hours = project.hours;
                        remainingHours -= project.hours;
                    }
                }
            }

            if (remainingHours > 0) {
                if (remainingHours <= upsellHours) {
                    for (let project of projects) {
                        if (project.department?.id === departmentId && project.project_category_hours.name === 'Upsell') {
                            project.consumed_hours = Math.min(remainingHours, project.hours);
                            remainingHours -= project.consumed_hours;
                            if (remainingHours <= 0) break;
                        }
                    }
                } else {
                    for (let project of projects) {
                        if (project.department?.id === departmentId && project.project_category_hours.name === 'Upsell') {
                            project.consumed_hours = project.hours;
                            remainingHours -= project.hours;
                        }
                    }
                }
            }

            if (remainingHours > 0) {
                for (let project of projects) {
                    if (project.department?.id === departmentId && project.project_category_hours.name === 'Additional') {
                        project.consumed_hours = Math.min(remainingHours, project.hours);
                        remainingHours -= project.consumed_hours;
                        if (remainingHours <= 0) break;
                    }
                }
            }
        }

        return projects;
    };

    const getProjectByIdData = (project_hours: any[]) => {
        dispatch(spinLoaderShow(true));
        getProjectById(props?.projectId)
            .then((res: any) => {
                setTotalWeeks(res?.no_of_weeks);
                setApiData(res);

                if (res?.project_consumed_hours?.length > 0) {
                    const updatedProjectHours = calculateHoursWithConsumed(res?.project_consumed_hours, project_hours);
                    setTableData(updatedProjectHours);
                } else {
                    setTableData(project_hours);
                }
            })
            .catch(() => {
                setTotalWeeks(0);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    useEffect(() => {
        let Hours = 0;
        let hours = projectHours?.map((item: any, index: any) => (Hours += item?.hours));

        setTotalHours(Hours);

        let Cost = 0;
        let cost = projectHours?.map((item: any, index: any) => (Cost += item?.cost));

        setTotalCost(Cost);

        //set for upsell================>
        let Upsel = 0;
        let upsaleHours = 0;
        let upsell = projectHours?.filter((e: any) => e?.project_category_hours?.name == 'Upsell');
        let totleUpsell = upsell?.map((item: any, index: any) => (Upsel += item?.hours * 40));
        let totleupsaleHours = upsell?.map((item: any, index: any) => (upsaleHours += item?.hours));

        setUpsel(Upsel);
        setUpselData(upsaleHours);

        //set for additionsl
        let aditional = 0;

        let additional = projectHours?.filter((e: any) => {
            return e?.project_category_hours?.name == 'Additional';
        });
        let totleAdditional = additional?.map((item: any, index: any) => (aditional += item?.hours));

        seAdditioonalCategory(aditional);
    }, [projectHours]);

    useEffect(() => {
        getProjectHour();
    }, [props?.projectId]);

    return (
        <>
            {/* // ================================|| Display Hour Detail||================================ // */}
            <Grid item xs={12} md={12} sm={12} sx={{ mt: 2, mb: 2 }}>
                <Grid container spacing={1}>
                    <Grid item xs={2} md={1} sm={2}></Grid>
                    <Grid item xs={4} md={2} sm={4}>
                        <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                            Total Hours
                        </Typography>
                        <h1 style={{ textAlign: 'center' }}>
                            {totalHours}
                            <span style={{ color: 'red', fontSize: '22px' }}>{` +${AditionalCategory}`}</span>
                            <span style={{ color: 'blue', fontSize: '22px' }}>{` +${upselData}`}</span>
                        </h1>
                    </Grid>
                    <Grid item xs={4} md={2} sm={4}>
                        <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                            Consumed Hours
                        </Typography>
                        <h2 style={{ textAlign: 'center' }}>
                            <span>
                                {apiData && apiData.project_consumed_hours?.length > 0
                                    ? apiData.project_consumed_hours.reduce((accumulator: any, current: any) => {
                                          return accumulator + current.consumed_hours;
                                      }, 0)
                                    : 0}
                            </span>
                        </h2>
                    </Grid>
                    <Grid item xs={4} md={2} sm={4}>
                        <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                            Total Cost
                        </Typography>
                        <h1 style={{ textAlign: 'center' }}>{totalCost}</h1>
                    </Grid>
                    <Grid item xs={4} md={2} sm={4}>
                        <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                            Total Week
                        </Typography>
                        <h1 style={{ textAlign: 'center' }}>{totalWeeks ?? 0}</h1>
                    </Grid>
                    <Grid item xs={4} md={2} sm={4}>
                        <Typography variant="h3" component="h2" style={{ textAlign: 'center', color: 'blue' }}>
                            Upsell
                        </Typography>
                        <h1 style={{ textAlign: 'center', color: 'blue' }}>{Math.round(upsel)}</h1>
                    </Grid>
                    <Grid item xs={4} md={3} sm={4}></Grid>
                </Grid>
            </Grid>

            {/* // ================================|| Display Hour Detail||================================ // */}
            <Grid container spacing={gridSpacing} sx={{ marginTop: 2 }}>
                <Grid item xs={12}>
                    <MainCard content={false}>
                        <TableContainer>
                            <Table sx={{ minWidth: 350 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ pl: 3 }}>Date</TableCell>
                                        <TableCell align="center">Department Name</TableCell>
                                        <TableCell align="center">Category</TableCell>
                                        <TableCell align="center">Number of Resource</TableCell>
                                        <TableCell align="center">Hours</TableCell>
                                        <TableCell align="center">Consumed Hours</TableCell>
                                        <TableCell align="center">Total Amount</TableCell>

                                        {localUsers?.super && (
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                Action
                                            </TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tableData?.map((row: any, index: any) => (
                                        <TableRow hover key={index}>
                                            <TableCell
                                                sx={{
                                                    color:
                                                        row.project_category_hours?.name == 'Additional'
                                                            ? 'red'
                                                            : row.project_category_hours?.name == 'Upsell'
                                                            ? 'blue'
                                                            : '',
                                                    pl: 3
                                                }}
                                            >
                                                {row.modified_date}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    color:
                                                        row.project_category_hours?.name == 'Additional'
                                                            ? 'red'
                                                            : row.project_category_hours?.name == 'Upsell'
                                                            ? 'blue'
                                                            : ''
                                                }}
                                                align="center"
                                            >
                                                {row.department?.name}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    color:
                                                        row.project_category_hours?.name == 'Additional'
                                                            ? 'red'
                                                            : row.project_category_hours?.name == 'Upsell'
                                                            ? 'blue'
                                                            : ''
                                                }}
                                                align="center"
                                            >
                                                {row.project_category_hours?.name}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    color:
                                                        row.project_category_hours?.name == 'Additional'
                                                            ? 'red'
                                                            : row.project_category_hours?.name == 'Upsell'
                                                            ? 'blue'
                                                            : ''
                                                }}
                                                align="center"
                                            >
                                                {row.no_of_resources}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    color:
                                                        row.project_category_hours?.name == 'Additional'
                                                            ? 'red'
                                                            : row.project_category_hours?.name == 'Upsell'
                                                            ? 'blue'
                                                            : ''
                                                }}
                                                align="center"
                                            >
                                                {row.hours}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    color:
                                                        row?.project_catgory_hours_id?.name == 'Additional'
                                                            ? 'red'
                                                            : row?.project_catgory_hours_id?.name == 'Upsell'
                                                            ? 'blue'
                                                            : ''
                                                }}
                                                align="center"
                                            >
                                                {row?.consumed_hours ?? 0}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    color:
                                                        row.project_category_hours?.name == 'Additional'
                                                            ? 'red'
                                                            : row.project_category_hours?.name == 'Upsell'
                                                            ? 'blue'
                                                            : ''
                                                }}
                                                align="center"
                                            >
                                                {row?.cost}
                                            </TableCell>
                                            {localUsers?.super && (
                                                <TableCell align="center" sx={{ pr: 3 }}>
                                                    <Stack direction="row" justifyContent="center" alignItems="center">
                                                        <IconButton color="inherit" size="large" style={{ color: 'error' }}>
                                                            <DeleteDialogBox delete={() => deteleButton(row?.id)} />
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </MainCard>
                </Grid>
            </Grid>
        </>
    );
}

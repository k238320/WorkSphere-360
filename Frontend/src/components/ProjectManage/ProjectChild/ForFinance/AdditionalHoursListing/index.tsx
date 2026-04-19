// material-ui
import {
    Button,
    CardActions,
    CardMedia,
    Grid,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';

// project imports
import Chip from 'ui-component/extended/Chip';
import { gridSpacing } from 'store/constant';

// assets
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MainCard from 'ui-component/cards/MainCard';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { toast } from 'react-toastify';
import { deleteHourDetail, getProjectHourDetail } from 'services/projectService';
import DeleteDialogBox from 'components/uiComopnents/DeleteDialogBox/modal';

// table data

// =========================|| LATEST ORDER CARD ||========================= //

export default function AdditionalHoursListing(props: any) {
    const dispatch = useDispatch();

    const log: any = window.localStorage.getItem('user');
    const user = JSON.parse(log);

    const [tableData, setTableData] = useState<any>([]);

    const DeteleRow = (id: string) => () => {
        dispatch(spinLoaderShow(true));
        deleteHourDetail(id)
            .then((res: any) => {
                props?.refreshData();
                toast.success('Record Deleted Successfully');
                dispatch(spinLoaderShow(false));
            })
            .catch((err: any) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    useEffect(() => {
        if (props?.project_consumed_hours?.length > 0) {
            const updatedProjectHours = calculateHoursWithConsumed(props?.project_consumed_hours, props.apiData);
            setTableData(updatedProjectHours);
        } else {
            setTableData(props.apiData);
        }
    }, [props.apiData]);

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

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <MainCard content={false}>
                    <TableContainer>
                        <Table sx={{ minWidth: 350 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ pl: 3 }}>Modified Date</TableCell>
                                    <TableCell align="center">Department</TableCell>
                                    <TableCell align="center">Category</TableCell>
                                    <TableCell align="center">Actual Hours</TableCell>
                                    <TableCell align="center">Consumed Hours</TableCell>
                                    <TableCell align="center">Cost</TableCell>
                                    <TableCell align="center">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tableData?.map((row: any, index: any) => (
                                    <TableRow hover key={index}>
                                        <TableCell
                                            sx={{
                                                color:
                                                    row?.project_category_hours?.name == 'Additional'
                                                        ? 'red'
                                                        : row?.project_category_hours?.name == 'Upsell'
                                                        ? 'blue'
                                                        : '',
                                                pl: 3
                                            }}
                                        >
                                            {moment(row?.updatedAt).format('Do MMM YY')}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                color:
                                                    row?.project_category_hours?.name == 'Additional'
                                                        ? 'red'
                                                        : row?.project_category_hours?.name == 'Upsell'
                                                        ? 'blue'
                                                        : ''
                                            }}
                                            align="center"
                                        >
                                            {row?.department?.name}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                color:
                                                    row?.project_category_hours?.name == 'Additional'
                                                        ? 'red'
                                                        : row?.project_category_hours?.name == 'Upsell'
                                                        ? 'blue'
                                                        : ''
                                            }}
                                            align="center"
                                        >
                                            {row?.project_category_hours?.name}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                color:
                                                    row?.project_category_hours?.name == 'Additional'
                                                        ? 'red'
                                                        : row?.project_category_hours?.name == 'Upsell'
                                                        ? 'blue'
                                                        : ''
                                            }}
                                            align="center"
                                        >
                                            {row?.hours}
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
                                                    row?.project_category_hours?.name == 'Additional'
                                                        ? 'red'
                                                        : row?.project_category_hours?.name == 'Upsell'
                                                        ? 'blue'
                                                        : ''
                                            }}
                                            align="center"
                                        >
                                            {row?.cost}
                                        </TableCell>
                                        <TableCell align="center" sx={{ pr: 3 }}>
                                            {(user?.role_id === row?.role_id || user?.super) && (
                                                <Stack direction="row" justifyContent="center" alignItems="center">
                                                    <DeleteDialogBox delete={DeteleRow(row?.id)} />
                                                </Stack>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </MainCard>
            </Grid>
        </Grid>
    );
}

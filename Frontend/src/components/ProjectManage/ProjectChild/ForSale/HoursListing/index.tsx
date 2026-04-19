// material-ui
import {
    Grid,
    IconButton,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MainCard from 'ui-component/cards/MainCard';
import { useEffect, useState } from 'react';
import moment from 'moment';
import useAuth from 'hooks/useAuth';
import EditModal from '../EditProjectHours';

// =========================|| LATEST ORDER CARD ||========================= //

export default function HoursListing(props: any) {
    const [tableData, setTableData] = useState<any>([]);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState({});

    const { projectHorusListing, setProjectHoursListing, setProjectHours, refreshData, projectId } = props;
    const [loading, setLoading] = useState<any>(false);
    const { user } = useAuth();

    const handleDelete = (index: number) => () => {
        let cloneData: any = JSON.parse(JSON.stringify(tableData));

        cloneData.splice(index, 1);

        setTableData(cloneData);
        setProjectHoursListing(cloneData);
        setProjectHours(cloneData);
    };

    const handleEdit = (rowData: any) => () => {
        setSelectedRowData(rowData);
        setOpenEditModal(true);
    };

    useEffect(() => {
        if (props?.projectHorusListing) {
            props?.projectHorusListing?.forEach((x: any) => {
                x.cost = x.hours * 40;
            });

            if (props?.project_consumed_hours?.length > 0) {
                const updatedProjectHours = calculateHoursWithConsumed(props?.project_consumed_hours, projectHorusListing);
                setTableData(updatedProjectHours);
            } else {
                setTableData(projectHorusListing);
            }
        }
    }, [props?.projectHorusListing]);

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
        <>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <MainCard content={false}>
                        <TableContainer>
                            {loading ? (
                                <Grid item xs={12}>
                                    <Skeleton variant="rounded" width={1420} height={250} />
                                </Grid>
                            ) : (
                                <Table sx={{ minWidth: 350 }} aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Modified Date</TableCell>
                                            <TableCell align="center">Departments</TableCell>
                                            <TableCell align="center">Category</TableCell>
                                            <TableCell align="center">Number of Resource</TableCell>
                                            <TableCell align="center">Hours</TableCell>
                                            <TableCell align="center">Consumed Hours</TableCell>
                                            <TableCell align="center">Cost</TableCell>
                                            <TableCell align="center" sx={{ pr: 3 }}>
                                                Action
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {tableData?.map((row: any, index: any) => (
                                            <TableRow hover key={index}>
                                                <TableCell
                                                    sx={{
                                                        color:
                                                            row?.project_catgory_hours_id?.name == 'Additional'
                                                                ? 'red'
                                                                : row?.project_catgory_hours_id?.name == 'Upsell'
                                                                ? 'blue'
                                                                : ''
                                                    }}
                                                >
                                                    {moment(row.modified_date).format('YYYY-MM-DD')}
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
                                                    {row.department_id?.name}
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
                                                    {row.project_catgory_hours_id?.name}
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
                                                    {row.no_of_resources}
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
                                                            row?.project_catgory_hours_id?.name == 'Additional'
                                                                ? 'red'
                                                                : row?.project_catgory_hours_id?.name == 'Upsell'
                                                                ? 'blue'
                                                                : ''
                                                    }}
                                                    align="center"
                                                >
                                                    {row?.cost}
                                                </TableCell>
                                                <TableCell align="center" sx={{ pr: 3 }}>
                                                    {(user?.role_id == row?.role_id || user?.super || user?.role?.name == 'PM Lead') && (
                                                        <Stack direction="row" justifyContent="center" alignItems="scenter">
                                                            {projectId && (
                                                                <IconButton onClick={handleEdit(row)} color="inherit" size="large">
                                                                    <EditOutlinedIcon />
                                                                </IconButton>
                                                            )}
                                                            <IconButton
                                                                onClick={handleDelete(index)}
                                                                color="inherit"
                                                                size="large"
                                                                style={{ color: 'red' }}
                                                            >
                                                                <DeleteOutlineOutlinedIcon />
                                                            </IconButton>
                                                        </Stack>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </TableContainer>
                    </MainCard>
                </Grid>
            </Grid>

            <EditModal
                open={openEditModal}
                handleClose={() => setOpenEditModal(false)}
                // handleSave={handleSave}
                refreshData={refreshData}
                rowData={selectedRowData}
            />
        </>
    );
}

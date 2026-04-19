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
import { gridSpacing } from 'store/constant';

// assets
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MainCard from 'ui-component/cards/MainCard';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { deleteProjectStatusDetails } from 'services/projectService';
import { toast } from 'react-toastify';

// =========================|| LATEST ORDER CARD ||========================= //

export default function ProjectStatusListing(props: any) {
    const [listData, setListData] = useState<any>();
    const dispatch = useDispatch();

    useEffect(() => {
        if (props?.tableData) {
            setListData(props?.tableData);
        }
    }, [props?.tableData]);

    const DeteleRow = (id: string) => () => {
        dispatch(spinLoaderShow(true));
        deleteProjectStatusDetails(id)
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

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <MainCard content={false}>
                    <TableContainer>
                        <Table sx={{ minWidth: 350 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Modify Date</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Comment</TableCell>
                                    <TableCell>Delay Days</TableCell>
                                    <TableCell align="center" sx={{ pr: 3 }}>
                                        Action
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {listData?.map((item: any, index: any) => (
                                    <TableRow hover key={index}>
                                        <TableCell>{moment(item.created_at).format('Do MMM YY')}</TableCell>
                                        <TableCell>{item.project_status_category?.name}</TableCell>
                                        <TableCell>{item.project_statuses?.name}</TableCell>
                                        <TableCell>
                                            <div
                                                style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}
                                                dangerouslySetInnerHTML={{ __html: item.comment }}
                                            />
                                        </TableCell>
                                        <TableCell>{item.days_delayed ? item.days_delayed : '_'}</TableCell>
                                        <TableCell align="center" sx={{ pr: 3 }}>
                                            <Stack direction="row" justifyContent="center" alignItems="center">
                                                <IconButton color="inherit" size="large" style={{ color: 'red' }}>
                                                    <DeleteOutlineOutlinedIcon onClick={DeteleRow(item?.id)} />
                                                </IconButton>
                                            </Stack>
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

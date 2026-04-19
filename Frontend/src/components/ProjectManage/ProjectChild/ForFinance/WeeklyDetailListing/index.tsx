// material-ui
import { Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

// project imports
import { gridSpacing } from 'store/constant';

// assets
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MainCard from 'ui-component/cards/MainCard';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { deleteFinanceWeeklystatus } from 'services/projectService';
import DeleteDialogBox from 'components/uiComopnents/DeleteDialogBox/modal';

// =========================|| LATEST ORDER CARD ||========================= //

export default function WeeklyDetailListing(props: any) {
    const dispatch = useDispatch();
    const [TableData, setTableData] = useState<any>([]);

    const deleteComments = (id: string) => () => {
        dispatch(spinLoaderShow(true));
        deleteFinanceWeeklystatus(id)
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
        if (props?.apiData) setTableData(props?.apiData);
    }, [props]);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <MainCard content={false}>
                    <TableContainer>
                        <Table sx={{ minWidth: 300 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ pl: 3 }} align="left" justify-content="space-between">
                                        Date
                                    </TableCell>
                                    <TableCell align="left" justify-content="space-between">
                                        Comments
                                    </TableCell>
                                    <TableCell align="left" justify-content="space-between">
                                        Action
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {TableData?.map((row: any, index: any) => (
                                    <TableRow hover key={index}>
                                        <TableCell sx={{ pl: 3 }} align="left" justify-content="space-between">
                                            {moment(row?.date).format('Do MMM YY')}
                                        </TableCell>
                                        <TableCell align="left" justify-content="space-between">
                                            {row?.commet}
                                        </TableCell>
                                        <TableCell align="left" justify-content="space-between">
                                            <Stack direction="row">
                                                <DeleteDialogBox delete={deleteComments(row?.id)} />
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

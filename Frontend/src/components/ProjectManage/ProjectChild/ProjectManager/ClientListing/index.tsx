// material-ui
import { Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

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

// =========================|| LATEST ORDER CARD ||========================= //

export default function ClientListing(props: any) {
    const [tableData, setTableData] = useState<any>([]);

    const dispatch = useDispatch();

    useEffect(() => {
        if (props?.tableData) {
            setTableData(props?.tableData);
        }
    }, [props]);

    function deteleButton(index: any, data: any) {
        dispatch(spinLoaderShow(true));

        deleteClientDetails(data?.id)
            .then((res) => {
                props?.refreshData();
                toast.success('Client Deleted Successfully!');
            })
            .catch((err: any) => {
                toast.success(err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <MainCard content={false}>
                    <TableContainer>
                        <Table sx={{ minWidth: 350 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ pl: 3 }}>Client Name</TableCell>
                                    <TableCell align="center">Designation</TableCell>
                                    <TableCell align="center">Client Number</TableCell>
                                    <TableCell align="center">Client Email</TableCell>
                                    <TableCell align="center" sx={{ pr: 3 }}>
                                        Action
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* {props?.apiData?.project_clients?.map((row: any, index: any) => ( */}
                                {tableData?.map((row: any, index: any) => (
                                    <TableRow hover key={index}>
                                        <TableCell sx={{ pl: 3 }}>{row.name}</TableCell>
                                        <TableCell align="center">{row.designation}</TableCell>
                                        <TableCell align="center">{row.number}</TableCell>
                                        <TableCell align="center">{row.email}</TableCell>
                                        <TableCell align="center" sx={{ pr: 3 }}>
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

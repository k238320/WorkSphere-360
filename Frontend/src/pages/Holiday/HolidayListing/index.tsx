/*eslint-disable */
import * as React from 'react';
import SubCard from 'ui-component/cards/SubCard';
import DataGridOData from 'ui-component/DataGridOData';
import { Box, Button, Chip, Grid, Modal, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { GridMoreVertIcon } from '@mui/x-data-grid';
import { getFiles } from 'services/uploadService';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { toast } from 'react-toastify';
import deleteIcon from '../../../../src/assets/images/icons/delete.png';
import DeleteIcon from '@mui/icons-material/Delete';

// project imports

// assets
import moment from 'moment';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import { deleteHoliday, getHolidayListing } from 'services/holidayService';
import { Stack } from '@mui/system';

const HolidayListing = (props: any) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [open, setOpen] = React.useState<boolean>(false);
    const [deleteModal, setDeleteModal] = React.useState<boolean>(false);
    const [holidayId, setHolidayId] = React.useState<string>('');

    const defaultSortInfo = { name: 'id', dir: -1, type: 'number' };
    const defaultFilterValue = [{ name: 'title', type: 'string', operator: 'contains', value: '' }];

    // const ondelete = (id: string) => {

    // };

    const handleClose = () => {
        setOpen(false);
        setDeleteModal(false);
        setHolidayId('');
    };

    const onDelete = (id: string) => {
        setDeleteModal(!deleteModal);
        setOpen(true);
        setHolidayId(id);
    };

    const cancelModal = () => {
        setOpen(false);
        setDeleteModal(false);
        setHolidayId('');
    };

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

    const onDeleteConfirm = (id: string) => {
        dispatch(spinLoaderShow(true));
        deleteHoliday(id)
            .then((res: any) => {
                if (res?.error) {
                    toast.error(res?.error);
                } else {
                    toast.success(res?.message);
                    navigate('/holiday/listing');
                }
            })
            .catch((err) => {
                toast.error(err?.message ?? err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
                setOpen(false);
                setDeleteModal(false);
            });
    };
    // };
    const columns: any = [
        {
            header: 'Title',
            name: 'title',
            // defaultFlex: 1,
            minWidth: 390,
            textAlign: 'center'
            // render: ({ data }: { data: any }) => {
            //     return (
            //         <>
            //             <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
            //                 <Grid item md={12} sm={12} xs={12}>
            //                     <span>{data?.department_id}</span>
            //                 </Grid>
            //             </Grid>
            //         </>
            //     );
            // }
        },

        {
            header: 'Date',
            // defaultFlex: 1,
            minWidth: 390,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{moment(data?.date).format('Do MMM, YYYY')}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            name: 'delete',
            header: 'Action',
            // defaultFlex: 1,
            minWidth: 390,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <Grid container spacing={1} alignItems="center" justifyContent="space-between">
                        <Grid item md={12} sm={12} xs={12}>
                            <Stack
                                gap={'10px'}
                                style={{ cursor: 'pointer', color: '#fc0005' }}
                                onClick={() => onDelete(data?.id)}
                                direction="row"
                                justifyContent="center"
                                alignItems="center"
                            >
                                {/* <img src={deleteIcon} alt="edit" width={25} height={25} /> */}
                                <DeleteIcon />
                                <Typography style={{ cursor: 'pointer', color: '#fc0005' }}></Typography>
                            </Stack>
                        </Grid>
                    </Grid>
                );
            }
        }
    ];

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'List of Holidays'} icon title rightAlign />
            <SubCard>
                <DataGridOData
                    // showAddButton={true}
                    dataResolver={getHolidayListing} // api function
                    // exportCSV={exportCSV}
                    keyName="id"
                    // addRoute="/dashboard/promotion/add"
                    filterValue={defaultFilterValue}
                    columns={columns}
                    // dataSource={projectListing}
                    defaultSortInfo={defaultSortInfo}
                    disableCheckbox
                />
            </SubCard>

            {open && (
                <div>
                    <Modal
                        open={deleteModal}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <Typography id="modal-modal-title" variant="h4" component="h2">
                                Are you sure you want to delete.
                            </Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 2, float: 'right' }}>
                                <Button variant="contained" onClick={() => cancelModal()}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        onDeleteConfirm(holidayId);
                                    }}
                                >
                                    Delete
                                </Button>
                            </Stack>
                        </Box>
                    </Modal>
                </div>
            )}
        </>
    );
};

export default HolidayListing;

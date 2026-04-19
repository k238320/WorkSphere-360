/*eslint-disable */
import * as React from 'react';
import SubCard from 'ui-component/cards/SubCard';
import DataGridOData from 'ui-component/DataGridOData';
import { Chip, Grid, Typography, Modal, Box, Button } from '@mui/material';
import { getFiles } from 'services/uploadService';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { toast } from 'react-toastify';

import moment from 'moment';
import { CloudDownload } from '@mui/icons-material';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import { getEventListing } from 'services/eventService';
import DeleteIcon from '@mui/icons-material/Delete';
import { Stack } from '@mui/system';
import { deleteEvent } from 'services/eventService';

const PmoDocumentListing = (props: any) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [open, setOpen] = React.useState<boolean>(false);
    const [deleteModal, setDeleteModal] = React.useState<boolean>(false);
    const [holidayId, setHolidayId] = React.useState<string>('');

    const defaultSortInfo = { name: 'id', dir: -1, type: 'number' };
    const defaultFilterValue = [{ name: 'title', type: 'string', operator: 'contains', value: '' }];
    // const defaultFilterValue = [{}];

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
        deleteEvent(id)
            .then((res: any) => {
                if (res?.error) {
                    toast.error(res?.error);
                } else {
                    toast.success(res?.message);
                    navigate('/event/event-listing');
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

    const columns: any = [
        {
            header: 'Title',
            name: 'title',
            defaultFlex: 1,
            minWidth: 210,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{data?.title}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },

        {
            header: 'Working hours',
            defaultFlex: 1,
            minWidth: 210,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{data?.working_hours}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Start date',
            defaultFlex: 1,
            minWidth: 210,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{moment(data?.start_date).format('Do MMM, YYYY')}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'End date',
            defaultFlex: 1,
            minWidth: 210,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{moment(data?.end_date).format('Do MMM, YYYY')}</span>
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
        // {
        //     name: 'documents',
        //     header: 'Document',
        //     defaultFlex: 1,
        //     minWidth: 520,
        //     textAlign: 'center',
        //     render: ({ data }: { data: any }) => {
        //         return (
        //             <Grid container spacing={1} alignItems="center" justifyContent="space-between">
        //                 <Grid item md={12} sm={12} xs={12}>
        //                     <CloudDownload onClick={() => GetFilesS3(data?.document_url)} style={{ color: '#5e35b1' }} />
        //                 </Grid>
        //             </Grid>
        //         );
        //     }
        // }
    ];

    // const GetFilesS3 = async (key: String) => {
    //     if (key) {
    //         dispatch(spinLoaderShow(true));

    //         // let temp = await PagesImage(formData)

    //         getFiles(key)
    //             .then((res: any) => {
    //                 // console.log('res', res);
    //                 window.location.href = res;
    //             })
    //             .catch((err) => {
    //                 console.log('errror', err);
    //             })
    //             .finally(() => {
    //                 dispatch(spinLoaderShow(false));
    //             });
    //     } else {
    //         toast.error('File is empty');
    //     }
    // };
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'Event of Listing'} icon title rightAlign />
            <SubCard>
                <DataGridOData
                    // showAddButton={true}
                    dataResolver={getEventListing} // api function
                    // dataResolver={'No Record'} // api function
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

export default PmoDocumentListing;

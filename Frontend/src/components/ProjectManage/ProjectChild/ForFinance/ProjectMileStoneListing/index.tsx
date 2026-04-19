// material-ui
import { Box, Button, Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useForm } from 'react-hook-form';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { deleteProjectMileStone, updateProjectMileStone } from 'services/projectService';
import { toast } from 'react-toastify';
import { CheckboxFieldSecondary, SwitchFieldDefault } from 'ui-component/formsField/FormFields';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { useDispatch } from 'react-redux';
import DatePickerComponent from '../DatePicker';
import DeleteDialogBox from 'components/uiComopnents/DeleteDialogBox/modal';
import useAuth from 'hooks/useAuth';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import GenericModal from 'components/uiComopnents/GenericModal/GenericModal';
import MileStoneModal from 'components/Model.tsx/MilestoneChildren';
import Switch from '@mui/material/Switch';
import OnHoldModel from 'components/OnHoldModel';
import ViewOnHoldModel from 'components/ViewOnHoldModel/ViewOnHoldModel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ReactNode } from 'react';
import CustomTooltip from 'components/Tooltip/Tooltip';
import HandleViewMilestone from 'components/HandleViewMilestone/HandleViewMilestone';
import SwitchComponent from 'components/Switch/Switch';
import { getFiles, uploadFiles } from 'services/uploadService';
import { DescriptionOutlined } from '@mui/icons-material';
import EditMilestonePaymentModal from './EditMilestonePaymentModal';
// =========================|| LATEST ORDER CARD ||========================= //

interface TitleProps {
    date: any;
    disabled: boolean;
}

export const Title: React.FC<TitleProps> = ({ date, disabled }) => {
    const [open, setOpen] = useState(false);
    const [modalChildren, setModalChildren] = useState<ReactNode | undefined>(undefined);

    const handleOpen = () => {
        if (!disabled) {
            setModalChildren(() => undefined);
            setOpen(true);
            setModalChildren(() => (
                <MileStoneModal
                    date={date}
                    closingModal={handleClose}
                    setPropsChanged={date?.setPropsChanged}
                    // handleUpdateApi={date?.handleUpdateApi}
                />
            ));
        }
    };

    const viewMilestone = () => {
        setModalChildren(() => undefined);
        setOpen(true);
        setModalChildren(() => <HandleViewMilestone date={date} />);
    };

    const handleClose = () => {
        setOpen(false);
        setModalChildren(() => undefined);
    };

    const commonDivStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        cursor: 'pointer',
        backgroundColor: '#ffffff'
    };

    return (
        <div>
            <GenericModal isOpen={open} onClose={handleClose} children={modalChildren} />
            <div
                onClick={date?.onhold ? undefined : handleOpen}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    cursor: date?.onhold ? 'not-allowed' : 'pointer'
                }}
            >
                <EditIcon sx={{ color: '#673AB7', fontSize: 18, pointer: 'cursor' }} />
                <p style={{ color: '#757575', fontSize: '14px', margin: 0 }}>Update Milestone</p>
            </div>
            <div style={commonDivStyle} onClick={viewMilestone}>
                <EditIcon sx={{ color: '#673AB7', fontSize: 18, pointer: 'cursor' }} />
                <p style={{ color: '#757575', fontSize: '14px', margin: 0 }}>View All Milestone</p>
            </div>
        </div>
    );
};

let currentId: any = null;

export default function MilestoneListing(props: any) {
    const {
        control,
        register,
        reset,
        setError,
        formState: { errors },
        setValue,
        getValues,
        handleSubmit
    } = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange'
    });
    let currentId: any = null;

    const clearButtonStyle: any = {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#FF5733', // Stylish red color
        fontSize: '12px',
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '12px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease-in-out'
    };

    clearButtonStyle[':hover'] = {
        color: '#fff',
        backgroundColor: '#FF5733' // Hover effect with red background
    };

    const [tableData, setTableData] = useState<any>([]);
    const dispatch = useDispatch();
    const [openMOdel, setOpenModel] = useState(false);
    const [modalChildren, setModalChildren] = useState<ReactNode | undefined>(undefined);
    const [file, setFile] = useState({
        id: null,
        name: null
    });
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const { user } = useAuth();

    useEffect(() => {
        props?.apiData?.forEach((x: any) => {
            if (x?.invoice && x?.invoice_date) {
                x.disable_invoice = true;
                x.disable_invoice_date = true;
            }

            if (x?.payment_recieved && x?.payment_recieved_date) {
                x.disable_payment_recieved_date = true;
                x.disable_payment_recieved = true;
            }
        });
        setTableData(props?.apiData);
    }, [props]);

    useEffect(() => {
        uploadDocument();
    }, [file?.name]);

    const uploadDocument = () => {
        if (file?.name) {
            const body = {
                document: file.name
            };
            dispatch(spinLoaderShow(true));
            updateProjectMileStone(file?.id, body)
                .then((res) => {
                    props?.refreshData();
                    toast.success('Updated Successfully');
                    setFile({
                        id: null,
                        name: null
                    });
                    dispatch(spinLoaderShow(false));
                })
                .catch((err) => {
                    toast.error('Some thing Went wrong');
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    const handleFileUpload = (event: any) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        dispatch(spinLoaderShow(true));
        uploadFiles(formData)
            .then((res: any) => {
                setFile({
                    name: res,
                    id: currentId
                });
            })
            .catch((err) => {
                console.log('errror', err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const handleFileDownload = (fileName: string) => () => {
        getFiles(fileName)
            .then((res: any) => {
                window.location.href = res;
            })
            .catch((err) => {
                console.log('errror', err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const handleClose = () => {
        setOpenModel(false);
        setModalChildren(() => undefined);
    };

    const PaymentRecieve = (event: any) => {
        let clone = JSON.parse(JSON.stringify(tableData));
        const index = clone?.findIndex((x: any) => x.id === event.target.value);
        clone[index].payment_recieved = !clone[index].payment_recieved;

        if (!clone[index].payment_recieved) {
            clone[index].payment_recieved_date = null;
        }

        setTableData(clone);
    };

    const handlePaymentReciveDate = (id: string) => (data: any) => {
        let clone = JSON.parse(JSON.stringify(tableData));
        const index = clone?.findIndex((x: any) => x.id === id);
        clone[index].payment_recieved_date = data;
        setTableData(clone);
    };

    const handleInvoice = (event: any) => {
        let clone = JSON.parse(JSON.stringify(tableData));
        const index = clone?.findIndex((x: any) => x.id === event.target.value);
        clone[index].invoice = !clone[index].invoice;

        if (!clone[index].invoice) {
            clone[index].invoice_date = null;
        }
        setTableData(clone);
    };

    const handleInvoiceDate = (id: string) => (data: any) => {
        let clone = JSON.parse(JSON.stringify(tableData));
        const index = clone?.findIndex((x: any) => x.id === id);
        clone[index].invoice_date = data;
        setTableData(clone);
    };

    const handleDelayDate = (id: string) => (data: any) => {
        let clone = JSON.parse(JSON.stringify(tableData));
        const index = clone?.findIndex((x: any) => x.id === id);
        clone[index].delay_time = data;
        setTableData(clone);
    };

    const deteleButton = (id: string) => () => {
        dispatch(spinLoaderShow(true));

        deleteProjectMileStone(id)
            .then(() => {
                props?.refreshData();
                toast.success('Deleted Successfully!');
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const onUpdate = (data: any) => () => {
        if (data?.invoice === true && (data?.invoice_date === null || data?.invoice_date === 'Invalid date')) {
            toast.error('Add Invoice Date');
        } else if (
            (data?.invoice === false || data?.invoice === null) &&
            data?.invoice_date !== null &&
            data?.invoice_date !== 'Invalid date'
        ) {
            toast.error('Add invoice check');
        } else if (
            data?.payment_recieved === true &&
            (data?.payment_recieved_date === null || data?.payment_recieved_date === 'Invalid date')
        ) {
            toast.error('Add Payment Received Date');
        } else if (
            (data?.payment_recieved === false || data?.payment_recieved === null) &&
            data?.payment_recieved_date !== null &&
            data?.payment_recieved_date !== 'Invalid date'
        ) {
            toast.error('Add receive payment');
        } else {
            // toast.success('Updated Successfully');
            const body = {
                milestone_phase_id: data?.milestone_phase?.id,
                milestone_payment: +data?.milestone_payment,
                targeted_month: data?.targeted_month ? moment(data?.targeted_month).format('YYYY-MM-DD') : null,
                invoice: data?.invoice ?? false,
                invoice_date: data?.invoice_date ? moment(data?.invoice_date).format('YYYY-MM-DD') : null,
                delay_time: data?.delay_time ? moment(data?.delay_time).format('YYYY-MM-DD') : null,
                payment_recieved: data?.payment_recieved ?? false,
                payment_recieved_date: moment(data?.payment_recieved_date).format('YYYY-MM-DD') ?? null,
                document: file?.id == data?.id && file.name ? data?.document : null,
                is_upsell: data?.is_upsell,
                is_initial_amount: data?.is_initial_amount
            };
            dispatch(spinLoaderShow(true));
            updateProjectMileStone(data?.id, body)
                .then((res) => {
                    props?.refreshData();
                    toast.success('Updated Successfully');
                    setFile({
                        id: null,
                        name: null
                    });
                    dispatch(spinLoaderShow(false));
                })
                .catch((err) => {
                    toast.error('Some thing Went wrong');
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    const handleToggleUpsell = (event: any, id: number) => {
        const isChecked = event;

        setTableData((prevData: any) => prevData.map((item: any) => (item.id === id ? { ...item, is_upsell: isChecked } : item)));
    };

    const handleToggleInitialPayment = (event: any, id: number) => {
        const isChecked = event;

        setTableData((prevData: any) => prevData.map((item: any) => (item.id === id ? { ...item, is_initial_amount: isChecked } : item)));
    };

    const handleUpdateMilestonePayment = (id: any, newMilestonePayment: any) => {
        const updatedData = tableData.map((row: any) => (row.id === id ? { ...row, milestone_payment: newMilestonePayment } : row));
        setTableData(updatedData);
    };

    const handleOpenEditModal = (row: any) => {
        setSelectedRow(row);
        setEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditModalOpen(false);
    };

    const handleClearDate = (id: any) => {
        setTableData((prevData: any) => {
            return prevData.map((row: any) => (row.id === id ? { ...row, delay_time: null } : row));
        });
    };

    return (
        <>
            <GenericModal isOpen={openMOdel} onClose={handleClose} children={modalChildren} />
            <form>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12}>
                        <MainCard content={false}>
                            <TableContainer
                                sx={{
                                    overflowX: 'auto',
                                    maxWidth: '100%',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    '&::-webkit-scrollbar': {
                                        width: '8px',
                                        height: '4px'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: '#888',
                                        borderRadius: '10px'
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: '#f1f1f1'
                                    }
                                }}
                            >
                                <Table sx={{ minWidth: 1200 }} aria-label="scrollable table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ pl: 3, minWidth: 200, textAlign: 'left' }}>Milestone Phase</TableCell>
                                            <TableCell sx={{ minWidth: 180, textAlign: 'left' }}>Milestone Payment</TableCell>
                                            <TableCell sx={{ minWidth: 180, textAlign: 'left' }}>Targeted Month</TableCell>
                                            <TableCell sx={{ minWidth: 240, textAlign: 'left' }}>Delay Date</TableCell>
                                            <TableCell sx={{ minWidth: 240, textAlign: 'center' }}>Invoiced</TableCell>
                                            <TableCell sx={{ minWidth: 240, textAlign: 'center' }}>Payment Received</TableCell>
                                            <TableCell sx={{ minWidth: 150, textAlign: 'center' }}>On Hold</TableCell>
                                            <TableCell sx={{ minWidth: 150, textAlign: 'center' }}>Upsell</TableCell>
                                            <TableCell sx={{ minWidth: 150, textAlign: 'center' }}>Project Initial Payment</TableCell>
                                            <TableCell sx={{ minWidth: 200, textAlign: 'center' }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tableData?.map((row: any, index: any) => (
                                            <TableRow hover key={index}>
                                                <TableCell sx={{ pl: 3 }}>{row?.milestone_phase?.name}</TableCell>

                                                <TableCell align="center">
                                                    {row?.milestone_payment}
                                                    <IconButton onClick={() => handleOpenEditModal(row)}>
                                                        <EditIcon sx={{ color: '#673AB7', fontSize: 18 }} />
                                                    </IconButton>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Box>
                                                        <Grid container justifyContent="center">
                                                            <Grid
                                                                item
                                                                xs={10}
                                                                md={10}
                                                                sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                                            >
                                                                <p>
                                                                    {row?.targeted_month
                                                                        ? moment(row?.targeted_month).format('Do MMM, YYYY')
                                                                        : 'N/A'}
                                                                </p>
                                                                <CustomTooltip
                                                                    row={row}
                                                                    setPropsChanged={props}
                                                                    disabled={props?.disabled}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <DatePickerComponent
                                                        date={row?.delay_time}
                                                        onChange={handleDelayDate(row.id)}
                                                        disabled={row?.onhold?.[0]?.permanentlyhold}
                                                    />
                                                    {row?.delay_time && !row?.onhold?.[0]?.permanentlyhold && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleClearDate(row.id)}
                                                            style={clearButtonStyle}
                                                        >
                                                            ✖ Clear
                                                        </button>
                                                    )}
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Box sx={{ gap: 2 }}>
                                                        <CheckboxFieldSecondary
                                                            control={control}
                                                            setValue={setValue}
                                                            fieldName={`checkedInvoice.${index}`}
                                                            valueGot={row?.id}
                                                            checked={row?.invoice}
                                                            iProps={{ onChange: handleInvoice }}
                                                            disabled={
                                                                !(user?.role?.name === 'Super Admin' || user?.role?.name === 'Finance') &&
                                                                (row?.disable_invoice ||
                                                                    props?.disabled ||
                                                                    row?.onhold?.[0]?.permanentlyhold)
                                                            }
                                                        />
                                                        <DatePickerComponent
                                                            date={row?.invoice_date}
                                                            onChange={handleInvoiceDate(row.id)}
                                                            disabled={row?.onhold?.[0]?.permanentlyhold}
                                                        />
                                                    </Box>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Box sx={{ gap: 2 }}>
                                                        <CheckboxFieldSecondary
                                                            control={control}
                                                            setValue={setValue}
                                                            fieldName={`checked.${index}`}
                                                            valueGot={row?.id}
                                                            checked={row?.payment_recieved}
                                                            iProps={{ onChange: PaymentRecieve }}
                                                            disabled={
                                                                !(user?.role?.name === 'Super Admin' || user?.role?.name === 'Finance') &&
                                                                (props?.disabled ||
                                                                    row?.disable_payment_recieved ||
                                                                    row?.onhold?.[0]?.permanentlyhold)
                                                            }
                                                        />
                                                        <DatePickerComponent
                                                            date={row?.payment_recieved_date}
                                                            onChange={handlePaymentReciveDate(row.id)}
                                                            disabled={row?.onhold?.[0]?.permanentlyhold}
                                                        />
                                                    </Box>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <SwitchComponent data={row} setPropsChanged={props} disabled={props?.disabled} />
                                                </TableCell>

                                                {/* Upsell Switch */}
                                                <TableCell align="center">
                                                    <SwitchFieldDefault
                                                        fieldName={`upsell.${index}`}
                                                        control={control}
                                                        setValue={setValue}
                                                        valueGot={row?.is_upsell}
                                                        label=""
                                                        iProps={{
                                                            onChange: (checked: boolean) => handleToggleUpsell(checked, row.id)
                                                        }}
                                                        disabled={props?.disabled}
                                                    />
                                                </TableCell>

                                                {/* Project Initial Payment Switch */}
                                                <TableCell align="center">
                                                    <SwitchFieldDefault
                                                        fieldName={`initialPayment.${index}`}
                                                        control={control}
                                                        setValue={setValue}
                                                        valueGot={row?.is_initial_amount}
                                                        label=""
                                                        iProps={{
                                                            onChange: (checked: boolean) => handleToggleInitialPayment(checked, row.id)
                                                        }}
                                                        disabled={props?.disabled}
                                                    />
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Stack direction="row" justifyContent="center" alignItems="center">
                                                        {row?.document ? (
                                                            <Tooltip title="Download">
                                                                <IconButton onClick={handleFileDownload(row?.document)}>
                                                                    <DescriptionOutlined />
                                                                </IconButton>
                                                            </Tooltip>
                                                        ) : (
                                                            <Tooltip title="File not available">
                                                                <IconButton>
                                                                    <DescriptionOutlined />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                        {row?.id && (
                                                            <>
                                                                <label htmlFor={`file-upload-${index}`}>
                                                                    <IconButton component="span">
                                                                        <CloudUploadIcon />
                                                                    </IconButton>
                                                                </label>
                                                                <input
                                                                    id={`file-upload-${index}`}
                                                                    type="file"
                                                                    style={{ display: 'none' }}
                                                                    onChange={(e) => {
                                                                        currentId = row.id;
                                                                        handleFileUpload(e);
                                                                    }}
                                                                />
                                                            </>
                                                        )}
                                                        {(user?.super || user?.role?.name == 'Finance') && (
                                                            <DeleteDialogBox delete={deteleButton(row?.id)} />
                                                        )}
                                                        <Button
                                                            variant="contained"
                                                            onClick={handleSubmit(onUpdate(row))}
                                                            disabled={row?.onhold?.[0]?.permanentlyhold || props?.disabled}
                                                        >
                                                            Save
                                                        </Button>
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
            </form>

            <EditMilestonePaymentModal
                open={editModalOpen}
                handleClose={handleCloseEditModal}
                row={selectedRow}
                handleUpdate={handleUpdateMilestonePayment}
            />
        </>
    );
}

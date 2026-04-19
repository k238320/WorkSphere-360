import React, { useEffect, useState } from 'react';
import SubCard from 'ui-component/cards/SubCard';
import { toast } from 'react-toastify';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { AutoCompleteField } from 'ui-component/formsField/FormFields';
import { useForm } from 'react-hook-form';
import completeIcon from '../../../assets/images/icons/complete.svg';
import onTrackIcon from '../../../assets/images/icons//onTrack.svg';
import { PDFDocument, rgb } from 'pdf-lib';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Grid,
    TextField,
    Button,
    Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import moment from 'moment';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getDepartmentCategory } from 'services/categoryService';
import { getAllAssetCategory } from 'services/assetCategoryService';
import { getAllVendors } from 'services/vendorService';
import { getAssetListing } from 'services/assetService';

const columns = [
    { id: 'model_number', label: 'Model Number', minWidth: '150px' },
    { id: 'emp_code', label: 'Status', minWidth: '150px' },
    { id: 'email', label: 'Asset ID#', minWidth: '150px' },
    { id: 'name', label: 'Asset Category', minWidth: '150px' },
    { id: 'department', label: 'Brand Name', minWidth: '150px' },
    { id: 'dob', label: 'Assigned To', minWidth: '150px' },
    { id: 'checkin_time', label: 'Creation Date', minWidth: '150px' },
    { id: 'purchasedate', label: 'Purchase Date', minWidth: '150px' },
    { id: 'vender', label: 'Vender', minWidth: '150px' },
    { id: 'cost', label: 'Cost', minWidth: '150px' },
    { id: 'location', label: 'Location', minWidth: '150px' },
    { id: 'action', label: 'Action', minWidth: 25 }
];

const locationOption = [
    { name: 'Karachi, Pakistan', label: 'KHI' },
    { name: 'Dubai, UAE', label: 'DXB' }
];

const index = () => {
    const {
        control,
        formState: { errors },
        setValue
    }: any = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange'
    });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [state, setState] = useState<any>([]);
    const [brandName, setBrandName] = useState('');
    const [startTimeOpen, setStartTimeOpen] = React.useState(false);
    const [startEndOpen, setEndTimeOpen] = React.useState(false);
    const [location, setLocation] = React.useState<any>(null);
    const [asset, setAsset] = React.useState<any>(null);
    const [departmentData, setDepartmentData] = useState<any>([]);
    const [assetData, setAssetData] = useState<any>([]);
    const [venderData, setVenderData] = useState<any>([]);
    const [vender, setVender] = React.useState<any>(null);
    const [startTime, setStartTime] = useState<any>(null);
    const [endTime, setEndTime] = useState<any>(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const handleChangelocation = (e: any) => {
        if (e) {
            setLocation(e?.label);
        } else {
            setLocation('');
        }
    };

    const handleChangeAsset = (e: any) => {
        console.log(e);
        if (e) {
            setAsset(e?.id);
        } else {
            setAsset(null);
        }
    };

    const hanldeStartTimeChange = (e: any) => {
        if (e) {
            setStartTime(e);
        } else {
            setStartTime(null);
        }
    };

    const hanldeEndTimeChange = (e: any) => {
        if (e) {
            setEndTime(e);
        } else {
            setEndTime(null);
        }
    };

    const handleChangeVender = (e: any) => {
        if (e) {
            setVender(e?.id);
        } else {
            setVender(null);
        }
    };

    // PDF Download
    const generatePDF = async (data: any[]) => {
        console.log(data, 'coming from pdf');
        const pdfDoc = await PDFDocument.create();

        // Add the first page separately to avoid an empty first page
        const firstPage = pdfDoc.addPage();
        const { width: firstPageWidth, height: firstPageHeight } = firstPage.getSize();

        const margin = 50;
        const marginTop = 15; // Increased margin-top value
        const marginBottom = 20; // Increased margin-bottom value
        const tableHeight = 30;
        const cellPadding = 5;

        // Increased overall width
        const overallWidthIncrease = 650;
        const columnSpaces = [20, 20, 20, 80, 80, 20, 20, 20, 20, 20];
        const columnWidths = [100, 200, 100, 100, 100, 100, 100, 100, 100, 100];

        console.log('Before calculation:', firstPageWidth, overallWidthIncrease, columnSpaces);
        const extendedPageWidth = Math.floor(
            Math.floor(firstPageWidth) + overallWidthIncrease + columnSpaces.reduce((acc, space) => acc + space, 0)
        );
        console.log('After calculation:', extendedPageWidth);

        const maxRowsOnFirstPage = 20;

        const drawTable = (page: any, y: any, rowData: any[], isHeader: boolean = false) => {
            let x = 50; // Adjust the starting point

            const tableBorderColor = rgb(0, 0, 0); // Set the color of the table border

            rowData.forEach((cell, index) => {
                page.drawRectangle({
                    x,
                    y,
                    width: columnWidths[index] + columnSpaces[index],
                    height: tableHeight,
                    color:
                        cell === 'Status' ||
                        cell === 'Asset ID#' ||
                        cell === 'Asset Category' ||
                        cell === 'Brand Name' ||
                        cell === 'Assigned To' ||
                        cell === 'Purchase Date' ||
                        cell === 'Vender' ||
                        cell === 'Cost' ||
                        cell === 'Location' ||
                        cell === 'Creation Date'
                            ? rgb(75 / 255, 0 / 255, 130 / 255)
                            : cell === 'On-Time'
                            ? rgb(185 / 255, 246 / 255, 202 / 255)
                            : cell === 'Half Day'
                            ? rgb(251 / 255, 233 / 255, 231 / 255)
                            : rgb(255 / 255, 255 / 255, 255 / 255),
                    borderColor: tableBorderColor,
                    textColor: rgb(75 / 255, 0 / 255, 130 / 255),
                    borderWidth: 1 // Set the border width as per your requirement
                });

                page.drawText(cell?.toString() || 'N/A', {
                    x: x + cellPadding,
                    y: y + cellPadding,
                    size:
                        cell === 'Status' ||
                        cell === 'Asset ID#' ||
                        cell === 'Asset Category' ||
                        cell === 'Brand Name' ||
                        cell === 'Assigned To' ||
                        cell === 'Purchase Date' ||
                        cell === 'Vender' ||
                        cell === 'Cost' ||
                        cell === 'Location' ||
                        cell === 'Creation Date'
                            ? 16
                            : 14, // Adjust the font size as needed
                    color:
                        cell === 'Status' ||
                        cell === 'Asset ID#' ||
                        cell === 'Asset Category' ||
                        cell === 'Brand Name' ||
                        cell === 'Assigned To' ||
                        cell === 'Purchase Date' ||
                        cell === 'Vender' ||
                        cell === 'Cost' ||
                        cell === 'Location' ||
                        cell === 'Creation Date'
                            ? rgb(255 / 255, 255 / 255, 255 / 255)
                            : cell === 'On-Time'
                            ? rgb(0 / 255, 200 / 255, 83 / 255)
                            : cell === 'Half Day'
                            ? rgb(216 / 255, 67 / 255, 21 / 255)
                            : rgb(0 / 255, 0 / 255, 0 / 255)
                });

                x += columnWidths[index] + columnSpaces[index];
            });

            // Draw the rightmost vertical border for the last cell
            page.drawRectangle({
                x,
                y,
                width: 1,
                height: tableHeight,
                color: tableBorderColor
            });
        };

        const drawPage = (pageIndex: number, startRowIndex: number) => {
            console.log('Adding page with width:', extendedPageWidth, 'and height:', firstPageHeight);
            const page = pdfDoc.addPage([extendedPageWidth, firstPageHeight]);
            let y = firstPageHeight - margin - tableHeight;
            const headerRow = [
                'Status',
                'Asset ID#',
                'Asset Category',
                'Brand Name',
                'Assigned To',
                'Creation Date',
                'Purchase Date',
                'Vender',
                'Cost',
                'Location'
            ];

            // Draw the header row with consistent spacing
            drawTable(page, y, headerRow);
            y -= tableHeight;

            const maxRowsPerPage = 20;

            for (let i = startRowIndex; i < startRowIndex + maxRowsPerPage && i < data.length; i++) {
                const rowData = [
                    'N/A',
                    data[i]?.asset_id || 'N/A',
                    data[i]?.asset_category?.name || 'N/A',
                    data[i]?.brand || 'N/A',
                    data[i]?.assigned_asset?.[0]?.user?.name || 'N/A',
                    moment(data[i]?.updated_at).format('Do MMM, YYYY') || 'N/A',
                    moment(data[i]?.purchased_date).format('Do MMM, YYYY') || 'N/A',
                    data[i]?.vendor?.name || 'N/A',
                    data[i]?.cost || 'N/A',
                    data[i]?.location || 'N/A'
                ];

                // Draw each row with consistent spacing
                drawTable(page, y, rowData);

                // Add margin-top to the y coordinate for the next row
                y -= tableHeight;
            }

            // Add pagination info
            page.drawText(`Page ${pageIndex + 1}`, { x: extendedPageWidth - margin - 50, y: margin, size: 14, color: rgb(0, 0, 0) });
        };

        let pageIndex = 0;
        for (let i = 0; i < data.length; i += maxRowsOnFirstPage) {
            drawPage(pageIndex, i);
            pageIndex += 1;
        }

        pdfDoc.removePage(0);

        const pdfBytes = await pdfDoc.save();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(pdfBlob);
        downloadLink.download = 'list_of_asset.pdf';

        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
    };

    const getDepartmentData = async () => {
        dispatch(spinLoaderShow(true));
        getDepartmentCategory()
            .then((res: any) => {
                setDepartmentData(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const getAssetCategoryOption = async () => {
        dispatch(spinLoaderShow(true));
        getAllAssetCategory()
            .then((res: any) => {
                setAssetData(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const getVenderOption = async () => {
        dispatch(spinLoaderShow(true));
        getAllVendors()
            .then((res: any) => {
                setVenderData(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const onSearch = () => {
        getAssetListingData(location, asset, startTime, endTime, brandName, vender);
    };

    const getAssetListingData = (location?: string, asset?: string, startDate?: string, endDate?: any, brand?: string, vender?: string) => {
        dispatch(spinLoaderShow(true));
        getAssetListing(location, asset, startDate, endDate, brand, vender)
            .then((res: any) => {
                setState(res);
                setPage(0);
            })
            .catch((err) => {
                toast.error('Some thing Went Wrong');
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    useEffect(() => {
        getDepartmentData();
        getVenderOption();
        getAssetCategoryOption();
        dispatch(spinLoaderShow(true));
        getAssetListing()
            .then((res: any) => {
                setState(res);
                setPage(0);
            })
            .catch((err) => {
                toast.error('Some thing Went Wrong');
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    }, []);

    const handleAssetId = async (id: any) => {
        await navigate(`/asset/create?uuid=${id}`);
    };

    const totalCost = state?.rows?.reduce((sum: any, item: any) => sum + item.cost, 0);

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'List of Asset'} icon title rightAlign />
            <Grid container sx={{ display: 'flex', alignItems: 'center' }} spacing={2}>
                <Grid item xs={9}>
                    <Grid container display={'flex'} justifyContent={'space-between'} alignItems={'center'} spacing={2}>
                        <Grid item xs={2} md={2} sm={2} sx={{ marginBottom: '6px' }}>
                            <AutoCompleteField
                                fieldName="location"
                                autoComplete="off"
                                label="Location"
                                control={control}
                                setValue={setValue}
                                options={locationOption}
                                returnObject={false}
                                iProps={{
                                    onChange: handleChangelocation
                                }}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.location && errors?.location?.message}
                            />
                        </Grid>
                        <Grid item xs={2} md={2} sm={2} sx={{ marginBottom: '6px' }}>
                            <AutoCompleteField
                                fieldName="asset"
                                autoComplete="off"
                                label="Assets"
                                control={control}
                                setValue={setValue}
                                options={assetData}
                                returnObject={false}
                                iProps={{
                                    onChange: handleChangeAsset
                                }}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                            />
                        </Grid>
                        <Grid item xs={2} md={2} sm={2}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    open={startTimeOpen}
                                    onOpen={() => setStartTimeOpen(true)}
                                    onClose={() => setStartTimeOpen(false)}
                                    renderInput={(props: any) => (
                                        <TextField fullWidth {...props} helperText="" onClick={(e) => setStartTimeOpen(true)} />
                                    )}
                                    label="Start Time"
                                    value={startTime}
                                    onChange={hanldeStartTimeChange}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={2} md={2} sm={2}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    open={startEndOpen}
                                    onOpen={() => setEndTimeOpen(true)}
                                    onClose={() => setEndTimeOpen(false)}
                                    renderInput={(props: any) => (
                                        <TextField fullWidth {...props} helperText="" onClick={(e) => setEndTimeOpen(true)} />
                                    )}
                                    label="End Time"
                                    value={endTime}
                                    onChange={hanldeEndTimeChange}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={2} md={2} sm={2}>
                            <TextField
                                required
                                id="outlined-required"
                                label="Brand"
                                defaultValue=""
                                onChange={(e) => setBrandName(e?.target?.value)}
                                sx={{ width: '100%' }}
                            />
                        </Grid>
                        <Grid item xs={2} md={2} sm={2} sx={{ marginBottom: '6px' }}>
                            <AutoCompleteField
                                fieldName="department_id"
                                autoComplete="off"
                                label="Vendor"
                                control={control}
                                setValue={setValue}
                                options={venderData}
                                returnObject={false}
                                iProps={{
                                    onChange: handleChangeVender
                                }}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.department_id && errors?.department_id?.message}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={3} display={'flex'} justifyContent={'flex-start'} alignItems={'center'} gap={2}>
                    <Button onClick={onSearch} variant="contained">
                        Search
                    </Button>
                    {state && (
                        <Button onClick={() => generatePDF(state?.rows)} variant="contained">
                            Download PDF
                        </Button>
                    )}
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={12} sx={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '48px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2>Total Number of Item</h2>
                        <h2 style={{ textAlign: 'center' }}>{state?.count}</h2>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        {' '}
                        <h2>Total Cost</h2>
                        <h2 style={{ textAlign: 'center' }}>{totalCost?.toLocaleString()}</h2>
                    </div>
                </Grid>
            </Grid>
            <SubCard>
                <TableContainer component={Paper} className="custom__table" sx={{ maxHeight: '100%' }}>
                    <Table>
                        <TableHead>
                            <TableRow style={{ background: '#6e529e' }}>
                                {columns?.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        style={{
                                            minWidth: column.minWidth,
                                            border: '1px solid #fff',
                                            color: '#fff',
                                            textAlign: 'center',
                                            padding: '8px 16px',
                                            fontSize: '12px'
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {state?.rows?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row: any) => (
                                <TableRow>
                                    <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.model_number}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            <div
                                                style={{
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '4px',
                                                    backgroundColor: row?.assigned_confirmed
                                                        ? 'rgba(185, 246, 202, 0.376)'
                                                        : 'rgb(255, 248, 225)',
                                                    borderRadius: '16px',
                                                    padding: '4px 0'
                                                }}
                                            >
                                                <img src={row?.assigned_confirmed ? completeIcon : onTrackIcon} alt="" />
                                                {row?.assigned_confirmed ? 'Confirmed' : 'Unconfirmed'}
                                            </div>
                                        </Typography>
                                        {/* {row?.assigned == true ? completeIcon : onTrackIcon} Status */}
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.asset_id}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.asset_category?.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.brand?.slice(0, 1).toUpperCase() + row?.brand?.slice(1).toLowerCase()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.assigned_asset?.[0]?.user?.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {moment(row?.created_at).format('Do MMM, YYYY')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {moment(row?.purchased_date).format('Do MMM, YYYY')}{' '}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.vendor?.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.cost?.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                        <Typography textAlign={'center'} variant="caption">
                                            {row?.location}
                                        </Typography>
                                    </TableCell>
                                    <TableCell style={{ textAlign: 'center', padding: '8px 16px' }}>
                                        <MoreVertIcon sx={{ cursor: 'pointer' }} onClick={() => handleAssetId(row?.id)} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[rowsPerPage]}
                        component="animate"
                        count={state?.count}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>
            </SubCard>
        </>
    );
};

export default index;

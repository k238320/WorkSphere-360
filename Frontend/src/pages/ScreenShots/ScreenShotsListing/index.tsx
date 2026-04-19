import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import React, { ReactNode, useEffect, useState } from 'react';
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
    Chip,
    Typography,
    InputBase,
    MenuItem,
    Select,
    ImageList,
    ImageListItem,
    Modal,
    Box,
    CircularProgress
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import SubCard from 'ui-component/cards/SubCard';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { useDispatch } from 'react-redux';
import { getResourceCategory } from 'services/Allocation/taskServices';
import { AutoCompleteField } from 'ui-component/formsField/FormFields';
import { useForm } from 'react-hook-form';
import { styled } from '@mui/system';
import { getScreenShots } from 'services/screenShots';

const ScreenShotsList = () => {
    const {
        control,
        register,
        reset,
        setError,
        formState: { errors },
        setValue,
        getValues,
        handleSubmit
    }: any = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange'
    });

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

    const CustomInput = styled(InputBase)(({ theme }: any) => ({
        'label + &': {
            marginTop: theme.spacing(3)
        },
        '& .MuiInputBase-input': {
            borderRadius: 4,
            position: 'relative',
            backgroundColor: '#6e529e',
            border: '1px solid #fff',
            fontSize: 12,
            color: '#fff',
            padding: '8px 26px 8px 12px',
            transition: theme.transitions.create(['border-color', 'box-shadow']),
            '&:focus': {
                borderRadius: 4,
                borderColor: '#fff',
                boxShadow: '0 0 0 0.2rem rgba(255,255,255,.25)'
            }
        }
    }));

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [state, setState] = useState<any>([]);
    const [resource, setResource] = useState<any>([]);
    const [selectedResouce, setSelectedResource] = useState<any>({});
    const [open, setOpen] = useState(false);
    const [currentImg, setCurrentImg] = useState('');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const currentDate = new Date();
    const localUser: any = localStorage.getItem('user');
    const user: any = JSON.parse(localUser);

    const [startTime, setStartTime] = useState<any>(currentDate.toLocaleString('en-US', { timeZone: 'Asia/Karachi' }).slice(0, -3));

    const [startTimeOpen, setStartTimeOpen] = React.useState(false);

    const dispatch = useDispatch();

    const hanldeStartTimeChange = (e: any) => {
        if (e) {
            setStartTime(e);
        } else {
            setStartTime(null);
        }
    };

    const handleOpen = (url: string) => {
        setCurrentImg(url);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const onSearch = () => {
        getResourceScreenShots();
        setIsLoaded(false);
    };

    const handleResouceChange = (e: any) => {
        if (e) {
            setSelectedResource(e?.user?.[0]?.employement_code);
        } else {
            setSelectedResource(null);
        }
    };

    const getResourceCategoryData = () => {
        dispatch(spinLoaderShow(true));
        getResourceCategory()
            .then((res) => {
                setResource(res);
            })
            .catch((err) => {
                console.log('err', err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const getResourceScreenShots = () => {
        dispatch(spinLoaderShow(true));
        const data = {
            employement_code: selectedResouce,
            dateFilter: new Date(new Date(startTime).setHours(6, 0, 0, 0)).toISOString().split('T')[0]
        };
        getScreenShots(data)
            .then((res) => {
                setState(res);
            })
            .catch((err) => {
                console.log('err', err);
            })
            .finally(() => {
                dispatch(spinLoaderShow(false));
            });
    };

    const handleImageLoad = () => {
        setIsLoaded(true);
    };

    useEffect(() => {
        getResourceCategoryData();
    }, []);

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'Leave Records'} icon title rightAlign />
            <SubCard>
                <Grid container display={'flex'} alignItems={'center'}>
                    <Grid item xs={2} md={2} sm={2} sx={{ marginRight: '10px' }}>
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
                    {user?.role?.name == 'Super Admin' && (
                        <Grid item xs={3} md={3} sm={3} sx={{ paddingBottom: '10px', marginRight: '10px' }}>
                            <AutoCompleteField
                                errors={!!errors?.resourceId}
                                fieldName="resourceId"
                                autoComplete="off"
                                label="Resource *"
                                control={control}
                                setValue={setValue}
                                options={resource}
                                returnObject={false}
                                iProps={{
                                    onChange: handleResouceChange
                                }}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.resourceId && errors?.resourceId?.message}
                            />
                        </Grid>
                    )}

                    <Grid item xs={2} md={2} sm={2} sx={{ marginRight: '10px' }}>
                        <Button onClick={onSearch} variant="contained">
                            Search
                        </Button>
                    </Grid>
                </Grid>
                <Grid container display={'flex'} alignItems={'top'}>
                    <Grid sx={{ width: '100%' }}>
                        <ImageList cols={3} style={{ placeItems: 'center' }}>
                            {state.map((item: any, index: number) => (
                                <ImageListItem
                                    key={index}
                                    sx={{ padding: '10px', cursor: 'pointer', position: 'relative' }}
                                    onClick={() => handleOpen(item.url)}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    {!isLoaded && <CircularProgress />}
                                    <img
                                        srcSet={`${item.url}`}
                                        src={`${item.url}`}
                                        alt={item.Key}
                                        loading="lazy"
                                        onLoad={handleImageLoad}
                                        onClick={() => handleOpen(item.url)}
                                        style={{ width: '100%', height: 'auto', display: 'block' }}
                                    />
                                    {hoveredIndex === index && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                                borderRadius: '5px',
                                                transition: 'opacity 0.3s',
                                                opacity: hoveredIndex === index ? 1 : 0
                                            }}
                                        >
                                            <VisibilityIcon sx={{ color: 'white' }} />
                                        </Box>
                                    )}
                                </ImageListItem>
                            ))}
                        </ImageList>
                    </Grid>
                </Grid>
            </SubCard>
            <Modal open={open} onClose={handleClose} aria-labelledby="image-preview" aria-describedby="image-preview-modal">
                <Box
                    sx={{
                        position: 'absolute',
                        top: '4%',
                        left: '15%',
                        // transform: 'translate(-50%, -50%)',
                        width: '70%',
                        maxWidth: '80%',
                        height: '70%',
                        maxHeight: '80%',
                        outline: 'none'
                    }}
                >
                    <img src={currentImg} alt="Preview" style={{ width: '100%', height: 'auto', borderRadius: '10px' }} />
                </Box>
            </Modal>
        </>
    );
};

export default ScreenShotsList;

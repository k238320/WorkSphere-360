/* eslint-disable no-useless-rename */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
// ================================|| Core Import  ||================================ //

import { Button, Grid, Stack, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import { DropzoneComponent } from 'ui-component/Dropzone';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { AutoCompleteField, AutoCompleteMultipleField, TextFieldControlled } from 'ui-component/formsField/FormFields';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { HourDetailComponent } from './HourDetail';
import { DiscountPriceComponent } from './DiscountPrice';
import { yupResolver } from '@hookform/resolvers/yup';
import { createSalesValidation } from './Validation';
import { useNavigate } from 'react-router-dom';
import { createProjects, getProjectForSale, updateForSale } from 'services/projectService';
import { uploadFiles } from 'services/uploadService';
import { getIndustry } from 'services/industryService';
import { getTechnology } from 'services/technologyService';
import moment from 'moment';
import { getDepartmentCategory, getHoursCategory, getProjectCategory } from 'services/categoryService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import useAuth from 'hooks/useAuth';
import { ClientDetailComponentForSale } from './ClientDetails';
import { GetAllProjectDivisions } from 'services/project-divisions';
import { GetAllProjectContractTypes } from 'services/project-contract-types';

// ================================|| Sales Component ||================================ //

export function SalesComponent(props: any) {
    const dispatch = useDispatch();
    const { apiData, refreshData, projectId } = props;
    const [categories, setCategories] = useState<any>([]); // project Category
    const [technology, setTechnology] = useState<any>([]); // project Technology
    const [industry, setIndustry] = useState<any>([]); // project Industry
    const [timeline, setTimeline] = useState<any>([]);
    const [projectWinDate, setProjectWinDate] = useState<any>();
    const [hoursCategory, setHoursCategory] = useState<any>([]); // Hours Category
    const [departmentCategory, setDepartmentCategory] = useState<any>([]); // Department Category
    const [selectedCategory, setSelectedCategory] = useState<any>([]);
    const [selectedTechnology, setSelectedTechnology] = useState<any>([]);
    const [selectedIndustry, setSelectedIndustry] = useState<any>([]);
    const [projectHours, setProjectHours] = useState<any>([]);
    const [forSale, setForSale] = useState<any>({});
    const [SaleData, setSaleData] = useState<any>({});
    const [clientDetails, setClientDetails] = useState<any>([]);

    const [open, setOpen] = React.useState(false);
    const [projectWinDateOpen, setProjectWinDateOpen] = useState<any>(false);
    const [documentData, setDocumentData] = useState({
        po_singed_documents: '',
        commercial_documents: '',
        technical_documents: '',
        status_report: '',
        mou_document: ''
    });

    const [permission, setPermission] = useState({
        modules: {},
        permission: {
            id: '',
            name: ''
        }
    });
    const [projectDivisions, setProjectDivisions] = useState([]);
    const [projectContractTypes, setProjectContractTypes] = useState([]);

    const discountedPriceRef = React.useRef<any>(null);

    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth();

    const defautlFormValues = {
        status: true
    };

    // ================================||use Hook Form ||================================ //

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
        reValidateMode: 'onChange',
        defaultValues: defautlFormValues,
        resolver: yupResolver(createSalesValidation)
    });

    const GetAllProjectDivisionsData = () => {
        GetAllProjectDivisions()
            .then((res: any) => {
                setProjectDivisions(res);
            })
            .catch((err) => {
                console.log('err', err);
            });
    };

    const GetAllProjectContractTypesData = () => {
        GetAllProjectContractTypes()
            .then((res: any) => {
                setProjectContractTypes(res);
            })
            .catch((err) => {
                console.log('err', err);
            });
    };

    useEffect(() => {
        const rolePermission: any = user?.role_mapping?.find((x: any) => x?.modules?.name == 'For Sales');
        setPermission(rolePermission);
    }, [props?.projectId]);

    const GetForSale = () => {
        dispatch(spinLoaderShow(true));
        getProjectForSale(projectId)
            .then((res: any) => {
                res?.project_hours?.forEach((x: any) => {
                    x.department_id = x.department;
                    x.project_catgory_hours_id = x.project_category_hours;
                });
                setSaleData(res);

                setClientDetails(res?.client_details);

                setValue('project_name', res?.name);
                setSelectedCategory(res?.project_categories);
                setSelectedTechnology(res?.project_technology);
                setSelectedIndustry(res?.project_industry);
                setValue('no_of_week', res?.no_of_weeks);
                setValue('commitment', res?.brief_commitments);
                setValue('additional_document_url', res?.additional_documents);
                setValue('po_singed_documents', res?.signed_document);
                setDocumentData({
                    po_singed_documents: res?.signed_document,
                    commercial_documents: res?.commercial_proposal,
                    technical_documents: res?.technical_proposal,
                    status_report: res?.status_report,
                    mou_document: res?.mou_document
                });
                setValue('mou_document', res?.mou_document);
                setValue('commercial_documents', res?.commercial_proposal);
                setValue('technical_documents', res?.technical_proposal);
                setValue('status_report', res?.status_report);
                setValue('specific_timeline', moment(res?.specific_timeline, 'YYYY-MM-DD'));
                setValue('project_win_date', res?.project_win_date);
                setValue('projectDivisionId', res?.projectDivisionId);
                setValue('project_contract_type_id', res?.project_contract_type_id);

                setProjectHours(res?.project_hours);
                setTimeline(moment(res?.specific_timeline, 'YYYY-MM-DD'));
                setProjectWinDate(res?.project_win_date);
                setForSale(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                console.log('err', err);
                dispatch(spinLoaderShow(false));
            });
    };

    // ================================|| Onsubmit ||================================ //

    useEffect(() => {
        if (!projectId) {
            setTimeline(null);
            setProjectWinDate(null);
            setSelectedIndustry([]);
            setSelectedTechnology([]);
            setSelectedCategory([]);
            setForSale({});
        }
    }, [projectId]);

    useEffect(() => {
        if (projectId) {
            GetForSale();
        } else {
            reset();
            setProjectHours([]);
            setClientDetails([]);
        }

        getCategoryData();
        getIndustryData();
        getTechnologyData();
        GetAllProjectDivisionsData();
        GetAllProjectContractTypesData();
    }, [projectId]);

    const getCategoryData = async () => {
        dispatch(spinLoaderShow(true));
        getProjectCategory()
            .then((res: any) => {
                setCategories(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const getIndustryData = async () => {
        dispatch(spinLoaderShow(true));
        getIndustry()
            .then((res: any) => {
                setIndustry(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const getTechnologyData = async () => {
        dispatch(spinLoaderShow(true));
        getTechnology()
            .then((res: any) => {
                setTechnology(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    useEffect(() => {
        getHourCategoryData();
        getDepartmentData();
    }, []);

    //Project get Hour Category Data =============>

    const getHourCategoryData = async () => {
        dispatch(spinLoaderShow(true));
        getHoursCategory()
            .then((res: any) => {
                setHoursCategory(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };
    //Project get DepartmentData =============>
    const getDepartmentData = async () => {
        dispatch(spinLoaderShow(true));
        getDepartmentCategory()
            .then((res: any) => {
                setDepartmentCategory(res);
                dispatch(spinLoaderShow(false));
            })
            .catch((err) => {
                toast.error(err);
                dispatch(spinLoaderShow(false));
            });
    };

    const onSubmit = (data: any) => {
        let discountedValue = discountedPriceRef?.current?.priceOnSubmit();

        const clone = JSON.parse(JSON.stringify(projectHours));

        if (clientDetails?.length === 0) {
            toast.error('Please enter client details');
            return;
        }

        if (clone?.length === 0) {
            toast.error('Please enter hours details');
            return;
        }

        clone?.forEach((element: any) => {
            element.department_id = element.department_id.id;
            element.project_catgory_hours_id = element.project_catgory_hours_id.id;
        });

        if (+discountedValue?.discount_cost === 0) {
            toast.error('Please enter final cost');
            return;
        }

        const body: any = {
            name: data?.project_name,
            project_categories: data?.category_id?.map((item: any) => ({ id: item?.id, name: item.name })),
            project_technology: data?.technology_id?.map((item: any) => ({ id: item?.id, name: item.name })),
            project_industry: data?.industry_id?.map((item: any) => ({ id: item?.id, name: item.name })),
            signed_document: data?.po_singed_documents,
            commercial_proposal: data?.commercial_documents,
            no_of_weeks: +data?.no_of_week,
            specific_timeline: moment(data?.specific_timeline).format('YYYY-MM-DD'),
            technical_proposal: data?.technical_documents ?? '',
            mou_document: data?.mou_document ?? '',
            additional_documents: data?.additional_document_url ?? '',
            brief_commitments: data?.commitment,
            project_hours: clone,
            dicsounted_cost: +discountedValue?.discount_cost,
            reason: discountedValue?.reason,
            client_details: clientDetails,
            user_id: user?.id,
            project_win_date: data?.project_win_date,
            status_report: data?.status_report,
            projectDivisionId: data.projectDivisionId ?? null,
            project_contract_type_id: data?.project_contract_type_id ?? null
        };

        dispatch(spinLoaderShow(true));

        if (projectId) {
            body.project_id = projectId;
            updateForSale(body)
                .then((res) => {
                    toast.success('Project Updated Successfully');
                    GetForSale();
                    dispatch(spinLoaderShow(false));
                })
                .catch((err) => {
                    dispatch(spinLoaderShow(false));
                    console.log('err', err);
                });
        } else {
            createProjects(body)
                .then((res: any) => {
                    if (res?.id) {
                        toast.success('Project Created Successfully');
                    }
                    navigate('/project/listing');
                    dispatch(spinLoaderShow(false));
                })
                .catch((err) => {
                    toast.error(err);
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    // ================================|| Singed Document HandleSave ||================================ //

    const SingedDocumentHandleSave = async (files: String) => {
        // dispatch(spinLoaderShow(true));
        if (files[0]) {
            const formData = new FormData();
            formData.append('file', files[0]);
            // let temp = await PagesImage(formData)
            uploadFiles(formData)
                .then((res: any) => {
                    setValue('po_singed_documents', res);
                })
                .catch((err) => {
                    console.log('errror', err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };
    // ================================|| Commercial Proposal HandleSave ||================================ //

    const CommercialProposalHandleSave = async (files: String) => {
        // dispatch(spinLoaderShow(true));
        if (files[0]) {
            const formData = new FormData();
            formData.append('file', files[0]);
            // let temp = await PagesImage(formData)

            uploadFiles(formData)
                .then((res: any) => {
                    setValue('commercial_documents', res);
                })
                .catch((err) => {
                    console.log('errror', err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };
    // ================================|| Technical Proposal HandleSave ||================================ //

    const TechnicalProposalHandleSave = async (files: String) => {
        // dispatch(spinLoaderShow(true));
        if (files[0]) {
            const formData = new FormData();
            formData.append('file', files[0]);
            // let temp = await PagesImage(formData)

            uploadFiles(formData)
                .then((res: any) => {
                    setValue('technical_documents', res);
                })
                .catch((err) => {
                    console.log('errror', err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    const MOUDocumentHandleSave = async (files: String) => {
        // dispatch(spinLoaderShow(true));
        if (files[0]) {
            const formData = new FormData();
            formData.append('file', files[0]);
            // let temp = await PagesImage(formData)

            uploadFiles(formData)
                .then((res: any) => {
                    setValue('mou_document', res);
                })
                .catch((err) => {
                    console.log('errror', err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    // ================================||  Timeline onChange ||================================ //

    const onTimelineChange = (e: any) => {
        if (e) {
            setTimeline(e);
            setValue('specific_timeline', e);
        } else {
            setTimeline(null);
            setValue('specific_timeline', null);
        }
    };

    const onProjectWinDateChange = (e: any) => {
        if (e) {
            setProjectWinDate(e);
            setValue('project_win_date', e);
        } else {
            setProjectWinDate(null);
            setValue('project_win_date', null);
        }
    };

    const onCategoryChange = (data: any) => {
        if (data) {
            setSelectedCategory(data);
        }
    };
    const onTechnologyChange = (data: any) => {
        if (data) {
            setSelectedTechnology(data);
        }
    };
    const onIndustryChange = (data: any) => {
        if (data) {
            setSelectedIndustry(data);
        }
    };

    const onNumber = (e: any) => {
        setSaleData((prev: any) => ({
            ...prev,
            no_of_weeks: e.target.value
        }));
    };
    // == ==============================||  Return ||================================ //

    return (
        <>
            <SubCard title="For Sales">
                <form>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={3} md={6} sm={3}>
                            <TextFieldControlled
                                errors={!!errors?.project_name}
                                fullWidth={true}
                                fieldName="project_name"
                                type="text"
                                autoComplete="off"
                                label="Project/Brand Name *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.project_name && errors?.project_name?.message}
                                iProps={{
                                    disabled: permission?.permission?.name == 'read' ? true : false
                                }}
                            />
                        </Grid>

                        <Grid item xs={3} md={6} sm={3}>
                            <AutoCompleteField
                                errors={!!errors?.projectDivisionId}
                                fieldName="projectDivisionId"
                                autoComplete="off"
                                label="Project Division *"
                                control={control}
                                setValue={setValue}
                                options={Array.isArray(projectDivisions) ? projectDivisions : []}
                                returnObject={false}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.projectDivisionId && errors?.projectDivisionId?.message}
                                iProps={{
                                    // onChange: onCategoryChange,
                                    disabled: permission?.permission?.name == 'read' ? true : false
                                }}
                                valueGot={(forSale && projectDivisions?.find(({ id }) => id == forSale?.projectDivisionId)) || null}
                            />
                        </Grid>

                        <Grid item xs={3} md={6} sm={3}>
                            <AutoCompleteField
                                errors={!!errors?.project_contract_type_id}
                                fieldName="project_contract_type_id"
                                autoComplete="off"
                                label="Contract type"
                                control={control}
                                setValue={setValue}
                                options={Array.isArray(projectContractTypes) ? projectContractTypes : []}
                                returnObject={false}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.project_contract_type_id && errors?.project_contract_type_id?.message}
                                iProps={{
                                    // onChange: onCategoryChange,
                                    disabled: permission?.permission?.name == 'read' ? true : false
                                }}
                                valueGot={
                                    (forSale && projectContractTypes?.find(({ id }) => id == forSale?.project_contract_type_id)) || null
                                }
                            />
                        </Grid>

                        <Grid item xs={3} md={6} sm={3}>
                            <AutoCompleteMultipleField
                                errors={!!errors?.category_id}
                                fieldName="category_id"
                                autoComplete="off"
                                label="Projects/Services Category *"
                                control={control}
                                setValue={setValue}
                                iProps={{
                                    onChange: onCategoryChange,
                                    disabled: permission?.permission?.name == 'read' ? true : false
                                }}
                                options={categories || []}
                                returnObject={false}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.category_id && errors?.category_id?.message}
                                valueGot={selectedCategory}
                            />
                        </Grid>

                        

                        <Grid item xs={3} md={6} sm={3}>
                            <AutoCompleteMultipleField
                                errors={!!errors?.technology_id}
                                fieldName="technology_id"
                                autoComplete="off"
                                label="Project Technology *"
                                control={control}
                                setValue={setValue}
                                options={technology || []}
                                iProps={{
                                    onChange: onTechnologyChange,
                                    disabled: permission?.permission?.name == 'read' ? true : false
                                }}
                                returnObject={false}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.technology_id && errors?.technology_id?.message}
                                valueGot={selectedTechnology}
                            />
                        </Grid>
                        <Grid item xs={3} md={6} sm={3}>
                            <AutoCompleteMultipleField
                                errors={!!errors?.industry_id}
                                fieldName="industry_id"
                                autoComplete="off"
                                label="Project Industry *"
                                control={control}
                                setValue={setValue}
                                options={industry || []}
                                returnObject={false}
                                iProps={{
                                    onChange: onIndustryChange,
                                    disabled: permission?.permission?.name == 'read' ? true : false
                                }}
                                isLoading={true}
                                optionKey="id"
                                optionValue="name"
                                helperText={errors?.industry_id && errors?.industry_id?.message}
                                valueGot={selectedIndustry}
                            />
                        </Grid>
                        <Grid item xs={6} md={12} sm={6}>
                            <SubCard title="Add PO / Signed Documents *">
                                {projectId ? (
                                    <>
                                        <DropzoneComponent
                                            handleSave={SingedDocumentHandleSave}
                                            message={'Available Document is'}
                                            documentData={documentData?.po_singed_documents}
                                        />
                                    </>
                                ) : (
                                    <DropzoneComponent handleSave={SingedDocumentHandleSave} message={false} />
                                )}
                                <input {...register('po_singed_documents')} hidden />
                                <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                                    {errors?.po_singed_documents && errors?.po_singed_documents?.message}
                                </p>
                            </SubCard>
                        </Grid>
                        <Grid item xs={6} md={12} sm={6}>
                            <SubCard title="Add Commercial Proposal">
                                {projectId ? (
                                    <DropzoneComponent
                                        handleSave={CommercialProposalHandleSave}
                                        message={'Available Document is'}
                                        documentData={documentData?.commercial_documents}
                                    />
                                ) : (
                                    <DropzoneComponent handleSave={CommercialProposalHandleSave} message={false} />
                                )}

                                <input {...register('commercial_documents')} hidden />
                                <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                                    {errors?.commercial_documents && errors?.commercial_documents?.message}
                                </p>
                            </SubCard>
                        </Grid>
                        <Grid item xs={6} md={12} sm={6}>
                            <SubCard title="Add Technical Proposal">
                                {projectId ? (
                                    <DropzoneComponent
                                        handleSave={TechnicalProposalHandleSave}
                                        message={'Available Document is'}
                                        documentData={documentData?.technical_documents}
                                    />
                                ) : (
                                    <DropzoneComponent handleSave={TechnicalProposalHandleSave} message={false} />
                                )}

                                <input {...register('technical_documents')} hidden />
                                <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                                    {errors?.technical_documents && errors?.technical_documents?.message}
                                </p>
                            </SubCard>
                        </Grid>

                        <Grid item xs={6} md={12} sm={6}>
                            <SubCard title="Add MOU Document">
                                {projectId ? (
                                    <DropzoneComponent
                                        handleSave={MOUDocumentHandleSave}
                                        message={'Available Document is'}
                                        documentData={documentData?.mou_document}
                                    />
                                ) : (
                                    <DropzoneComponent handleSave={MOUDocumentHandleSave} message={false} />
                                )}

                                <input {...register('mou_document')} hidden />
                                <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                                    {errors?.mou_document && errors?.mou_document?.message}
                                </p>
                            </SubCard>
                        </Grid>

                        <Grid item xs={6} md={6} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.no_of_week}
                                fullWidth={true}
                                fieldName="no_of_week"
                                type="text"
                                autoComplete="off"
                                label="No of Weeks"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.no_of_week && errors?.no_of_week?.message}
                                iProps={{
                                    onChange: onNumber,
                                    disabled: permission?.permission?.name == 'read' ? true : false
                                }}
                            />
                        </Grid>
                        <Grid item xs={3} md={3} sm={3} sx={{ mt: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    open={open}
                                    onOpen={() => setOpen(true)}
                                    onClose={() => setOpen(false)}
                                    renderInput={(props: any) => (
                                        <TextField fullWidth {...props} helperText="" onClick={(e) => setOpen(true)} />
                                    )}
                                    label="Expected timeline/End Date"
                                    value={timeline}
                                    // setValue={}
                                    disabled={permission?.permission?.name == 'read' ? true : false}
                                    onChange={onTimelineChange}
                                />
                            </LocalizationProvider>
                            <input {...register('specific_timeline')} hidden />
                            <p style={{ color: 'red' }}>{errors?.specific_timeline && errors?.specific_timeline?.message}</p>
                        </Grid>
                        <Grid item xs={3} md={3} sm={3} sx={{ mt: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    open={projectWinDateOpen}
                                    onOpen={() => setProjectWinDateOpen(true)}
                                    onClose={() => setProjectWinDateOpen(false)}
                                    renderInput={(props: any) => (
                                        <TextField fullWidth {...props} helperText="" onClick={(e) => setProjectWinDateOpen(true)} />
                                    )}
                                    label="Win Date/Start Date"
                                    value={projectWinDate}
                                    // setValue={}
                                    disabled={permission?.permission?.name == 'read' ? true : false}
                                    onChange={onProjectWinDateChange}
                                />
                            </LocalizationProvider>
                            <input {...register('project_win_date')} hidden />
                            <p style={{ color: 'red' }}>{errors?.project_win_date && errors?.project_win_date?.message}</p>
                        </Grid>
                        <Grid item xs={6} md={12} sm={6}>
                            <TextFieldControlled
                                errors={!!errors?.additional_document_url}
                                fullWidth={true}
                                fieldName="additional_document_url"
                                type="text"
                                autoComplete="off"
                                label="Additional Documents "
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.additional_document_url && errors?.additional_document_url?.message}
                                iProps={{
                                    disabled: permission?.permission?.name == 'read' ? true : false
                                }}
                            />
                            <span style={{ color: '#bcbcbc', marginLeft: '10px' }}>Place here the main Folder URL</span>
                        </Grid>
                        <Grid item xs={6} md={12} sm={6} sx={{ mb: 3 }}>
                            <TextFieldControlled
                                errors={!!errors?.commitment}
                                fullWidth={true}
                                fieldName="commitment"
                                type="text"
                                autoComplete="off"
                                label="Please provide descriptions of the business objectives, client target audience, and a client brief. *"
                                control={control}
                                multiline
                                rows={6}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.commitment && errors?.commitment?.message}
                                iProps={{
                                    disabled: permission?.permission?.name == 'read' ? true : false
                                }}
                            />
                        </Grid>
                        {permission?.permission?.name !== 'read' && (
                            <>
                                <Grid item xs={12} md={12} sm={12} direction="row" justifyContent="center" alignItems="center">
                                    <ClientDetailComponentForSale
                                        clientDetails={clientDetails}
                                        setClientDetails={setClientDetails}
                                        projectId={projectId}
                                    />
                                </Grid>

                                {/* // ================================|| Hours Details||================================ // */}

                                <Grid item xs={12} md={12} sm={12} direction="row" justifyContent="center" alignItems="center">
                                    <HourDetailComponent
                                        apiData={apiData}
                                        hoursCategory={hoursCategory}
                                        departmentCategory={departmentCategory}
                                        refreshData={GetForSale}
                                        setProjectHours={setProjectHours}
                                        projectHours={projectHours}
                                        SaleData={SaleData}
                                        projectId={projectId}
                                    />
                                </Grid>

                                {/* // ================================|| Hours Details||================================ // */}

                                {/* // ================================|| Discount Price||================================ // */}

                                <DiscountPriceComponent
                                    projectHours={projectHours}
                                    refreshData={refreshData}
                                    ref={discountedPriceRef}
                                    apiData={forSale}
                                    projectId={projectId}
                                />

                                {/* // ================================|| Discount Price||================================ // */}

                                <Grid sx={{ mb: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                                    <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                        <Stack direction="row">
                                            <AnimateButton>
                                                <Button
                                                    variant="contained"
                                                    type="submit"
                                                    sx={{ m: 3 }}
                                                    className={'red'}
                                                    onClick={handleSubmit(onSubmit)}
                                                >
                                                    save
                                                </Button>
                                            </AnimateButton>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </form>
            </SubCard>
        </>
    );
}

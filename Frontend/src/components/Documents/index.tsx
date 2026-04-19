import React, { useState, useEffect } from 'react';
import { Typography, Grid, Stack, Button } from '@mui/material';
import { DropzoneComponent } from 'ui-component/Dropzone';
import SubCard from 'ui-component/cards/SubCard';
import { useForm } from 'react-hook-form';
import { createDocumentValidation } from './Validation';
import { yupResolver } from '@hookform/resolvers/yup';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { dispatch } from 'store';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { uploadFiles, uploadImage } from 'services/uploadService';
import { useParams } from 'react-router-dom';
import { createUserDocuments } from 'services/employmentService';
import CircularProgress from '@mui/material/CircularProgress';
import { getEmployeeDetail } from 'services/employmentService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { DropzoneImgComponent } from 'ui-component/DropzoneImg';
import useAuth from 'hooks/useAuth';
import MultiDropzoneComponent from 'ui-component/Dropzone/DropzoneMultiple';

const defautlFormValues = {
    experience_letter: '',
    resignation_letter: '',
    educational_document: '',
    pay_slip: '',
    cnic: '',
    updated_resume: '',
    power_picture: ''
};

const Index = () => {
    const params = useParams();
    const [isLoading, setIsloading] = useState(false);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [imageUrl, setImageUrl] = useState<any>('');
    const [fileUrls, setFileUrls] = useState<string[]>([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    const {
        control,
        register,
        formState: { errors },
        setValue,
        handleSubmit
    }: any = useForm<any>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defautlFormValues,
        resolver: yupResolver(createDocumentValidation)
    });

    // Note: You were missing the 'async' keyword for the function
    const SingedDocumentHandleSave = async (files: File[], filekey: any) => {
        if (files[0]) {
            dispatch(spinLoaderShow(true));

            const formData = new FormData();
            formData.append('file', files[0]);
            await uploadFiles(formData)
                .then((res: any) => {
                    setValue(filekey, res);
                })
                .catch((err) => {
                    console.log('errror', err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };
    const SingedImageHandleSave = async (files: File[], filekey: any) => {
        if (files[0]) {
            dispatch(spinLoaderShow(true));

            const formData = new FormData();
            formData.append('file', files[0]);
            uploadImage(formData)
                .then((res: any) => {
                    setValue(filekey, res?.name);
                    setImageUrl(res?.url);
                })
                .catch((err) => {
                    console.log('errror', err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };

    const onSubmit = (data: any) => {
        const fileData = data;

        debugger;
        fileData.educational_documents = fileUrls ?? [];
        fileData.user_id = params?.id;
        delete fileData.educational_document;
        setIsloading(true);
        createUserDocuments(fileData)
            .then((res: any) => {
                toast.success('Documents added successfully');
                // navigate('/hr/listing');
            })
            .catch((err: any) => {
                toast.error('Something went wrong');
            })
            .finally(() => {
                setIsloading(false);
            });
    };

    const handleFilesChange = (urls: string[]) => {
        setFileUrls(urls);
        setValue('educational_document', JSON.stringify(urls));
    };

    useEffect(() => {
        getEmployeeDetail(params?.id)
            .then((res: any) => {
                setUserInfo(res);
                setValue('experience_letter', res?.userDocuments?.experience_letter || '');
                setValue('resignation_letter', res?.userDocuments?.resignation_letter || '');
                setValue('educational_document', res?.userDocuments?.educational_documents ?? []);
                setFileUrls(res?.userDocuments?.educational_documents ?? []);
                setValue('pay_slip', res?.userDocuments?.pay_slip || '');
                setValue('cnic', res?.userDocuments?.cnic || '');
                setValue('updated_resume', res?.userDocuments?.updated_resume || '');
                setValue('power_picture', res?.userDocuments?.power_picture || '');
            })
            .catch((err) => {});
    }, []);

    return (
        <div>
            <Typography
                variant="body2"
                sx={{
                    marginBottom: '24px',
                    padding: '12px',
                    fontWeight: 500,
                    width: '100%',
                    border: '1px solid #F3E9F3',
                    backgroundColor: '#fff',
                    borderRadius: '12px 12px 0 0'
                }}
                gutterBottom
            >
                Documents Details
            </Typography>
            <Grid item xs={6} md={12} sm={6}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <SubCard title="Add Experience Letter" sx={{ marginBottom: '51px' }}>
                        <DropzoneComponent
                            handleSave={(files: File[]) => SingedDocumentHandleSave(files, 'experience_letter')}
                            documentData={userInfo?.userDocuments?.experience_letter}
                            message={
                                user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations'
                                    ? "Drag 'n' drop some files here, or click to select files"
                                    : "Drag 'n' drop some files here, or click to select files"
                            }
                            // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations')}
                            acceptedFiles={['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx']}
                        />

                        <input {...register('experience_letter')} hidden disabled />
                        <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                            {errors?.experience_letter && errors?.experience_letter?.message}
                        </p>
                    </SubCard>
                    <SubCard title="Add Resignation Letter" sx={{ marginBottom: '51px' }}>
                        <DropzoneComponent
                            handleSave={(files: File[]) => SingedDocumentHandleSave(files, 'resignation_letter')}
                            documentData={userInfo?.userDocuments?.resignation_letter}
                            message={
                                user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations'
                                    ? "Drag 'n' drop some files here, or click to select files"
                                    : "Drag 'n' drop some files here, or click to select files"
                            }
                            // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations')}
                        />
                        <input {...register('resignation_letter')} hidden />
                        <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                            {errors?.resignation_letter && errors?.resignation_letter?.message}
                        </p>
                    </SubCard>
                    <SubCard title="Add Educational Documents" sx={{ marginBottom: '51px' }}>
                        {/* <DropzoneComponent
                            handleSave={(files: File[]) => SingedDocumentHandleSave(files, 'educational_document')}
                            documentData={ userInfo?.userDocuments?.educational_documents?.[0]}
                            message={
                                user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations'
                                    ? "Drag 'n' drop some files here, or click to select files"
                                    : "Drag 'n' drop some files here, or click to select files"
                            }
                            // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations')}
                        />
                        <input {...register('educational_document')} hidden />
                        <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                            {errors?.educational_document && errors?.educational_document?.message}
                        </p> */}

                        <MultiDropzoneComponent
                            acceptedFiles={['.pdf', '.jpg', '.png']}
                            onFilesChange={handleFilesChange}
                            files={fileUrls}
                        />

                        <input {...register('educational_document')} hidden />
                        <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                            {errors?.educational_document && errors?.educational_document?.message}
                        </p>
                    </SubCard>
                    <SubCard title="Add Pay Slip" sx={{ marginBottom: '51px' }}>
                        <DropzoneComponent
                            handleSave={(files: File[]) => SingedDocumentHandleSave(files, 'pay_slip')}
                            documentData={userInfo?.userDocuments?.pay_slip}
                            message={
                                user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations'
                                    ? "Drag 'n' drop some files here, or click to select files"
                                    : "Drag 'n' drop some files here, or click to select files"
                            }
                            // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations')}
                        />
                        <input {...register('pay_slip')} hidden />
                        <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                            {errors?.pay_slip && errors?.pay_slip?.message}
                        </p>
                    </SubCard>
                    <SubCard title="Add C.N.I.C*" sx={{ marginBottom: '51px' }}>
                        <DropzoneComponent
                            handleSave={(files: File[]) => SingedDocumentHandleSave(files, 'cnic')}
                            documentData={userInfo?.userDocuments?.cnic}
                            message={
                                user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations'
                                    ? "Drag 'n' drop some files here, or click to select files"
                                    : "Drag 'n' drop some files here, or click to select files"
                            }
                            // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations')}
                        />
                        <input {...register('cnic')} hidden />
                        <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                            {errors?.cnic && errors?.cnic?.message}
                        </p>
                    </SubCard>
                    {/* <SubCard title="Add Power Picture*" sx={{ marginBottom: '51px' }}>
                        <DropzoneComponent
                            handleSave={(files: File[]) => SingedImageHandleSave(files, 'power_picture')}
                            documentData={ userInfo?.userDocuments?.power_picture}
                            message={"Drag 'n' drop some files here, or click to select files"}
                        />
                        <input {...register('power_picture')} hidden />
                        <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                            {errors?.power_picture && errors?.power_picture?.message}
                        </p>
                    </SubCard> */}

                    <SubCard title="Add Employee Updated Resume *" sx={{ marginBottom: '51px' }}>
                        <DropzoneComponent
                            handleSave={(files: File[]) => SingedDocumentHandleSave(files, 'updated_resume')}
                            documentData={userInfo?.userDocuments?.updated_resume}
                            message={
                                user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations'
                                    ? "Drag 'n' drop some files here, or click to select files"
                                    : "Drag 'n' drop some files here, or click to select files"
                            }
                            // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations')}
                        />
                        <input {...register('updated_resume')} hidden />
                        <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                            {errors?.updated_resume && errors?.updated_resume?.message}
                        </p>
                    </SubCard>
                    <SubCard title="Add Power Picture*" sx={{ marginBottom: '51px' }}>
                        <DropzoneImgComponent
                            handleSave={(files: File[]) => SingedDocumentHandleSave(files, 'power_picture')}
                            documentData={userInfo?.userDocuments?.power_picture}
                            message={
                                user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations'
                                    ? "Drag 'n' drop some files here, or click to select files"
                                    : "Drag 'n' drop some files here, or click to select files"
                            }
                            // disabled={!(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource' || user?.role?.name === 'Human Resource Operations')}
                        />
                        <input {...register('power_picture')} style={{ display: 'none' }} />
                        <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                            {errors?.power_picture && errors?.power_picture?.message}
                        </p>
                    </SubCard>

                    {/* {(user?.role?.name === 'Super Admin' || user?.role?.name === 'Human Resource') && ( */}
                    <>
                        <Grid sx={{ mb: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
                            <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
                                <Stack direction="row">
                                    <AnimateButton>
                                        <Button
                                            variant="contained"
                                            type="submit"
                                            sx={{ m: 3, mr: 0, width: '64px', height: '36.5px' }}
                                            className={'red'}
                                            onClick={handleSubmit(onSubmit)}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <CircularProgress sx={{ color: '#fff' }} size={14} /> : 'Save'}
                                        </Button>
                                    </AnimateButton>
                                </Stack>
                            </Grid>
                        </Grid>
                    </>
                    {/* )} */}
                </form>
            </Grid>
        </div>
    );
};

export default Index;

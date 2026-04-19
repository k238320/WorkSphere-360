/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/*eslint-Disable */
/**
 *
 * ProjectManage
 *
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { Button, Grid, Stack } from '@mui/material';

// assets
import { useForm } from 'react-hook-form';
import SubCard from 'ui-component/cards/SubCard';
import { SwitchFieldDefault, TextFieldControlled } from 'ui-component/formsField/FormFields';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { DropzoneComponent } from 'ui-component/Dropzone';

import { uploadFiles } from 'services/uploadService';
import { createPmoDocument } from 'services/pmoDocumentService';
import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

const validation = yup.object().shape({
    name: yup.string().required('Please enter file name').nullable(),
    pmo_documents: yup.string().required('Please select file').nullable()
});

export function PmoDocumentManage(props: any) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [documentData, setdocumentData] = useState<any>('');

    const defautlFormValues = {
        status: true
    };
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
        //Validations=================>
        defaultValues: defautlFormValues,
        resolver: yupResolver(validation)
    });

    // create onsubmit data
    const createonSubmit = (data: any) => {
        dispatch(spinLoaderShow(true));
        const apidata = {
            name: data?.name,
            document_url: data?.pmo_documents
        };

        createPmoDocument(apidata)
            .then((res: any) => {
                toast.success('Record inserted Successfully');
                dispatch(spinLoaderShow(false));
                navigate('/pmo-document/listing');
            })
            .catch((err: any) => {
                dispatch(spinLoaderShow(false));
                toast.error(err);
            });
    };
    const onSubmit = (data: any) => {
        createonSubmit(data);
    };

    const PmoDocumentHandleSave = async (files: String) => {
        if (files[0]) {
            dispatch(spinLoaderShow(true));

            const formData = new FormData();
            formData.append('file', files[0]);
            uploadFiles(formData)
                .then((res: any) => {
                    setValue('pmo_documents', res);
                })
                .catch((err) => {
                    console.log('errror', err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        }
    };
    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <SubCard>
                    <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                        <Grid item xs={12} md={12} sm={12}>
                            <TextFieldControlled
                                errors={!!errors?.name}
                                fullWidth={true}
                                fieldName="name"
                                type="text"
                                autoComplete="off"
                                label="Name *"
                                control={control}
                                valueGot={''}
                                setValue={setValue}
                                helperText={errors?.name && errors?.name?.message}
                            />
                        </Grid>

                        <Grid item xs={12} md={12} sm={12}>
                            <SubCard title="Add PMO Document *">
                                <>
                                    <DropzoneComponent
                                        handleSave={PmoDocumentHandleSave}
                                        documentData={documentData}
                                        acceptedFiles={['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx']}
                                    />
                                </>
                                {/* ) : (
                                    <DropzoneComponent handleSave={PmoDocumentHandleSave} message={false} />
                                )} */}
                                <input {...register('pmo_documents')} hidden />
                                <p style={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>
                                    {errors?.pmo_documents && errors?.pmo_documents?.message}
                                </p>
                            </SubCard>
                        </Grid>

                        <Grid sx={{ mb: 1, mt: 3 }} container spacing={3} direction="row" justifyContent="flex-end" alignItems="center">
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
                                            Submit
                                        </Button>
                                    </AnimateButton>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Grid>
                </SubCard>
            </form>
        </>
    );
}

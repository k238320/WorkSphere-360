/*eslint-disable */
/**
 *
 * DropzoneComponent
 *
 */
import React, { memo, useEffect, useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PanoramaIcon from '@mui/icons-material/Panorama';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
//  import styled from 'styled-components/macro';

// import { DropzoneAreaBase } from "material-ui-dropzone";
import { Box } from '@mui/system';
import { Accept, useDropzone } from 'react-dropzone';
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';
import { Button, Grid, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { getFiles } from 'services/uploadService';

const getColor = (props: any) => {
    if (props.isDragAccept) {
        return '#00e676';
    }
    if (props.isDragReject) {
        return '#ff1744';
    }
    if (props.isFocused) {
        return '#2196f3';
    }
    return '#eeeeee';
};
const useStyles = makeStyles({
    baseStyle: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        borderWidth: 2,
        borderRadius: 2,
        borderColor: '#eeeeee',
        borderStyle: 'dashed',
        backgroundColor: `${(props: any) => getColor(props)}`,
        color: '#bdbdbd',
        outline: 'none',
        transition: 'border .24s ease-in-out'
    }
    // baseStyle: (props: any) => ({
    //     flex: 1,
    //     display: 'flex',
    //     flexDirection: 'column',
    //     alignItems: 'center',
    //     padding: '20px',
    //     borderWidth: 2,
    //     borderRadius: 2,
    //     borderColor: '#eeeeee',
    //     borderStyle: 'dashed',
    //     backgroundColor: `${(props: any) => getColor(props)}`,
    //     color: '#bdbdbd',
    //     outline: 'none',
    //     transition: 'border .24s ease-in-out',
    //     pointerEvents: `${(props: any) => (props?.disabled ? 'none' : '')}`
    // })
});

interface Props {
    handleSave?: any | null;
    filesLimit?: any | null;
    video?: any | null;
    message?: any | null;
    setImage?: any | null;
    acceptedFiles?: any | null;
    disabled?: any | null;
}

export const DropzoneComponent = (props: any) => {
    const dispatch = useDispatch();
    const classes = useStyles();
    const [fileObjects, setFileObjects] = useState<any>([]);

    const customAccept: Accept = {
        document: props?.acceptedFiles ?? ['.pdf']
    };

    const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
        accept: customAccept,
        disabled: props?.disabled,
        onDrop: (acceptedFiles) => {
            props?.handleSave(acceptedFiles);
            setFileObjects(acceptedFiles);
        },

        onDropRejected: (rejectedFiles) =>
            toast.error(
                props?.acceptedFiles ? `Please select correct format of file ${props?.acceptedFiles?.toString()}` : 'Please Select PDF File'
            )
    });
    useEffect(() => {
        if (props?.documentData) {
            const selectedFile = [];
            let obj = {
                name: props?.documentData
            };

            selectedFile?.push(obj);

            setFileObjects(selectedFile);
        } else {
            setFileObjects([]);
        }
    }, [props?.documentData]);

    const GetFilesS3 = async (key: String) => {
        dispatch(spinLoaderShow(true));

        getFiles(key)
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

    return (
        <Grid container rowSpacing={1} justifyContent={'space-between'}>
            <div
                className={classes.baseStyle}
                {...getRootProps({ isFocused, isDragAccept, isDragReject })}
                style={{ pointerEvents: props?.disabled || false }}
            >
                <input {...getInputProps()} type="file" id="pdfFile" name="pdfFile" accept=".pdf" />
                {props?.message ? (
                    <Typography variant="h5" color={'grey'} sx={{ p: 0.5, Width: 250, alignItems: 'center' }}>
                        {props?.message}
                    </Typography>
                ) : (
                    <p>Drag 'n' drop some files here, or click to select files</p>
                )}

                {fileObjects.length > 0 && (
                    <>
                        <ul>
                            {fileObjects?.map((fileObject: any, index: number) => (
                                <Typography variant="h4" color={'grey'} key={index}>
                                    {fileObject.name}
                                </Typography>
                            ))}
                        </ul>
                        <CloudUploadIcon sx={{ p: 0.5, minWidth: 200, alignItems: 'center', fontSize: 80 }} />
                    </>
                )}
            </div>
            {fileObjects.length > 0 && (
                <div style={{ width: '80px', marginTop: '70px' }}>
                    <Button variant="text" size="large" color="inherit">
                        <CloudDownloadIcon
                            sx={{ p: 0.5, minWidth: 80, textAlign: 'center', fontSize: 45 }}
                            onClick={() => GetFilesS3(fileObjects[0]?.name)}
                        />
                    </Button>
                </div>
            )}
        </Grid>
    );
};

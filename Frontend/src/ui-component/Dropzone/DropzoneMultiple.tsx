import React, { useEffect, useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { Grid, Typography, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { Accept, useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { getFiles, uploadFiles } from 'services/uploadService';

interface props {
    name: string;
    url?: string;
}

const MultiDropzoneComponent = ({ acceptedFiles = ['.pdf', '.jpg', '.png'], disabled = false, onFilesChange, files }: any) => {
    const [fileObjects, setFileObjects] = useState<props[]>([]);
    const dispatch = useDispatch();

    const customAccept: Accept = {
        document: acceptedFiles
    };

    const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
        accept: customAccept,
        disabled,
        onDrop: async (acceptedFiles) => {
            dispatch(spinLoaderShow(true));

            try {
                const uploadedFiles = await Promise.all(
                    acceptedFiles.map(async (file) => {
                        const formData = new FormData();
                        formData.append('file', file);

                        const response = await uploadFiles(formData); // API call
                        return {
                            name: file.name,
                            url: response // Assuming the API response returns the file URL
                        };
                    })
                );

                const newFiles: any = [...fileObjects, ...uploadedFiles];
                setFileObjects(newFiles);
                onFilesChange?.(newFiles.map((file: props) => file.url)); // Return only URLs
            } catch (error) {
                console.error('Error uploading files:', error);
                toast.error('Error uploading files. Please try again.');
            } finally {
                dispatch(spinLoaderShow(false));
            }
        },
        onDropRejected: () =>
            toast.error(acceptedFiles ? `Please select a correct file format: ${acceptedFiles.toString()}` : 'Please select a valid file')
    });

    const handleDeleteFile = (index: number) => {
        const updatedFiles = [...fileObjects];
        updatedFiles.splice(index, 1);
        setFileObjects(updatedFiles);
        onFilesChange?.(updatedFiles.map((file) => file.url)); // Update parent with new URLs
    };

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

    useEffect(() => {
        if (files && files.length > 0) {
            const fileNew = files?.map((file: string) => ({
                name: file,
                url: file
            }));

            setFileObjects(fileNew);
        }
    }, [files]);

    return (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <div
                    {...getRootProps({ isFocused, isDragAccept, isDragReject })}
                    style={{
                        border: '2px dashed #eeeeee',
                        padding: '20px',
                        textAlign: 'center',
                        backgroundColor: '#fafafa',
                        cursor: disabled ? 'not-allowed' : 'pointer'
                    }}
                >
                    <input {...getInputProps()} />
                    <Typography variant="h6" color="grey">
                        Drag and drop files here, or click to select files
                    </Typography>
                    <CloudUploadIcon sx={{ fontSize: 40, marginTop: 1 }} />
                </div>
            </Grid>

            {fileObjects.length > 0 && (
                <Grid item>
                    <Typography variant="h6">Uploaded Files:</Typography>
                    <List>
                        {fileObjects.map((file, index) => (
                            <ListItem
                                key={index}
                                secondaryAction={
                                    <IconButton edge="end" onClick={() => handleDeleteFile(index)}>
                                        <DeleteIcon color="error" />
                                    </IconButton>
                                }
                            >
                                <ListItemText
                                    primary={file.name}
                                    secondary={
                                        file.url ? (
                                            <a
                                                onClick={() => GetFilesS3(file?.url || '')}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ textDecoration: 'none', color: 'blue', cursor: 'pointer' }}
                                            >
                                                View File
                                            </a>
                                        ) : (
                                            <span style={{ color: 'gray' }}>Uploading...</span>
                                        )
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Grid>
            )}
        </Grid>
    );
};

export default MultiDropzoneComponent;

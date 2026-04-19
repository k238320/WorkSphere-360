/*eslint-disable */
import * as React from 'react';
import SubCard from 'ui-component/cards/SubCard';
import DataGridOData from 'ui-component/DataGridOData';
import { getHourDetails } from 'services/Allocation/taskServices';
import { Chip, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { GridMoreVertIcon } from '@mui/x-data-grid';
import { getFiles } from 'services/uploadService';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { toast } from 'react-toastify';

// project imports

// assets
import moment from 'moment';
import { getPmoDocumentListing } from 'services/pmoDocumentService';
import { Visibility } from '@mui/icons-material';
import { CloudDownload } from '@mui/icons-material';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
// import { AdminManage } from 'components/AdminManage';

const PmoDocumentListing = (props: any) => {
    const dispatch = useDispatch();

    const defaultSortInfo = { name: 'id', dir: -1, type: 'number' };
    const defaultFilterValue = [{ name: 'name', type: 'string', operator: 'contains', value: '' }];

    const columns: any = [
        {
            header: 'Name',
            name: 'name',
            defaultFlex: 1,
            minWidth: 400,
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
            header: 'Creation Date',
            defaultFlex: 1,
            minWidth: 400,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{moment(data?.created_at).format('Do MMM, YYYY')}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            name: 'documents',
            header: 'Document',
            defaultFlex: 1,
            minWidth: 400,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <Grid container spacing={1} alignItems="center" justifyContent="space-between">
                        <Grid item md={12} sm={12} xs={12}>
                            <CloudDownload onClick={() => GetFilesS3(data?.document_url)} style={{ color: '#5e35b1' }} />
                        </Grid>
                    </Grid>
                );
            }
        }
    ];

    const GetFilesS3 = async (key: String) => {
        if (key) {
            dispatch(spinLoaderShow(true));

            // let temp = await PagesImage(formData)

            getFiles(key)
                .then((res: any) => {
                    // console.log('res', res);
                    window.location.href = res;
                })
                .catch((err) => {
                    console.log('errror', err);
                })
                .finally(() => {
                    dispatch(spinLoaderShow(false));
                });
        } else {
            toast.error('File is empty');
        }
    };
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'List of PMO Documents'} icon title rightAlign />
            <SubCard>
                <DataGridOData
                    // showAddButton={true}
                    dataResolver={getPmoDocumentListing} // api function
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
        </>
    );
};

export default PmoDocumentListing;

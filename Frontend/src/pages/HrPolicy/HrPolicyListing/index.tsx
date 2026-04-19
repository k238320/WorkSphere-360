/*eslint-disable */
import * as React from 'react';
import SubCard from 'ui-component/cards/SubCard';
import DataGridOData from 'ui-component/DataGridOData';
import { Chip, Grid } from '@mui/material';
import { getFiles } from 'services/uploadService';
import { useDispatch } from 'react-redux';
import { spinLoaderShow } from 'store/actions/spinLoader';
import { toast } from 'react-toastify';

import moment from 'moment';
import { CloudDownload } from '@mui/icons-material';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight, IconDotsVertical } from '@tabler/icons';
import { getHrPolicyListing } from 'services/hrPolicyService';
import useAuth from 'hooks/useAuth';
import { EditStatusModal } from './EditStatusModal';

const PmoDocumentListing = (props: any) => {
    const dispatch = useDispatch();

    const { user } = useAuth();

    const canEdit = ['Super Admin', 'Human Resource', 'Human Resource Operations'].includes(user?.role?.name);
    

    const [selectedPolicy, setSelectedPolicy] = React.useState<any>(null);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [refreshKey, setRefreshKey] =React. useState(0);

    const handleThreeDotsClick = (policy: any) => {
        setSelectedPolicy(policy);
        setModalOpen(true);
    };

    const defaultSortInfo = { name: 'id', dir: -1, type: 'number' };
    const defaultFilterValue = [{ name: 'name', type: 'string', operator: 'contains', value: '' }];

    const columns: any = [
        {
            header: 'Name',
            name: 'name',
            defaultFlex: 1,
            minWidth: 600,
            textAlign: 'center'
        },

        {
            header: 'Creation Date',
            defaultFlex: 1,
            minWidth: 200,
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
            minWidth: 200,
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
        },
        {
            header: 'Actions',
            defaultFlex: 1,
            minWidth: 200,
            textAlign: 'center',
            render: ({ data }: any) =>
                canEdit ? <IconDotsVertical style={{ cursor: 'pointer' }} onClick={() => handleThreeDotsClick(data)} /> : null
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
            <Breadcrumbs separator={IconChevronRight} heading={'List of HR Policies'} icon title rightAlign />
            <SubCard>
                <DataGridOData
                    // showAddButton={true}
                    dataResolver={getHrPolicyListing} // api function
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


            {selectedPolicy && (
                <EditStatusModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    data={selectedPolicy}
                    onUpdate={() => setRefreshKey(prev => prev + 1)}
                />
            )}
        </>
    );
};

export default PmoDocumentListing;

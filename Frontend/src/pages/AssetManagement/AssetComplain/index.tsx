/*eslint-disable */
import React, { ReactNode } from 'react';
import { Box, Chip, Grid, LinearProgress, LinearProgressProps, Typography } from '@mui/material';
import { toast } from 'react-toastify';

// assets
import { useState } from 'react';
import SubCard from 'ui-component/cards/SubCard';
import DataGridOData from 'ui-component/DataGridOData';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import { getAllAssetComplain } from 'services/assetService';
import Switch from '@mui/material/Switch';
import { resolveComplaintByIT } from 'services/assetService';
import moment from 'moment';
import GenericModal from 'components/uiComopnents/GenericModal/GenericModal';
import ComplainResolvedModal from 'components/AssetDetails/ComplainResolvedModal';

const ProjectListing = (props: any) => {
    const [open, setOpen] = useState(false);
    const [modalChildren, setModalChildren] = useState<ReactNode | undefined>(undefined);

    const defaultSortInfo = { name: 'created_at', dir: -1, type: 'string' };

    const defaultFilterValue = [
        { name: 'name', type: 'string', operator: 'contains', value: '' },
        { name: 'asset_category', type: 'string', operator: 'contains', value: '' },
        { name: 'description', type: 'string', operator: 'contains', value: '' }
    ];

    const handleApproved = (id: any) => {
        console.log(id, 'id');
        const confrimed = {
            admin_resolved: true
        };
        resolveComplaintByIT(id, confrimed)
            .then((res) => {
                toast.success('Complaint Resolve');
                handleClose();
            })
            .catch((err) => {});
    };
    const handleClose = () => {
        setOpen(false);
        setModalChildren(() => undefined);
    };

    const handleSwitch = (id: any) => {
        setModalChildren(() => undefined);
        setOpen(true);
        setModalChildren(() => <ComplainResolvedModal handleClose={handleClose} id={id} handleApproved={handleApproved} />);
    };

    const columns: any = [
        {
            header: 'Employee Name',
            name: 'name',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid item textAlign={'center'} xs={12}>
                            <Typography textAlign={'center'} variant="caption">
                                {data?.user?.name}
                            </Typography>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Asset Category',
            name: 'asset_category',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid item textAlign={'center'} xs={12}>
                            <Typography textAlign={'center'} variant="caption">
                                {data?.asset?.asset_category?.name}
                            </Typography>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Asset ID#',
            name: '',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid item textAlign={'center'} xs={12}>
                            <Typography textAlign={'center'} variant="caption">
                                {data?.custom_asset_id}
                            </Typography>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Complaint Description',
            name: 'description',
            defaultFlex: 1,
            minWidth: 300,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid item textAlign={'center'} xs={12}>
                            <Typography textAlign={'center'} variant="caption">
                                {data?.description}
                            </Typography>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Complaint Date',
            name: '',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid item textAlign={'center'} xs={12}>
                            <Typography textAlign={'center'} variant="caption">
                                {data?.created_at == null ? 'N/A' : moment(data?.created_at).format('Do MMM, YYYY')}
                            </Typography>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Resolved Date',
            name: '',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid item textAlign={'center'} xs={12}>
                            <Typography textAlign={'center'} variant="caption">
                                {/* {data?.resolved_date == null ? 'N/A' : moment(data?.resolved_date).format('DD-MM-YYYY')} */}
                                {data?.resolved_date == null ? 'N/A' : moment(data?.resolved_date).format('Do MMM, YYYY')}
                            </Typography>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Resolved Time',
            name: '',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid item textAlign={'center'} xs={12}>
                            <Typography textAlign={'center'} variant="caption">
                                {data?.resolved_date == null ? 'N/A' : moment(data?.resolved_date).format('h:mm:ss a')}
                            </Typography>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Confirmation',
            name: '',
            defaultFlex: 1,
            minWidth: 120,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                console.log(data, 'new data');
                return (
                    <>
                        <Grid item textAlign={'center'} xs={12}>
                            <Switch
                                // defaultChecked={data?.admin_resolved}
                                checked={data?.admin_resolved}
                                // onChange={(e) => (e?.target?.checked ? handleApproved(data?.id) : () => {})}
                                onChange={() => handleSwitch(data?.id)}
                                disabled={data?.admin_resolved}
                            />
                        </Grid>
                    </>
                );
            }
        }
    ];

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'List of Complaints'} icon title rightAlign />
            <GenericModal isOpen={open} onClose={handleClose} children={modalChildren} width={500} />
            <SubCard>
                <DataGridOData
                    dataResolver={getAllAssetComplain} // api function
                    keyName="id"
                    filterValue={defaultFilterValue}
                    columns={columns}
                    defaultSortInfo={defaultSortInfo}
                    disableCheckbox
                />
            </SubCard>
        </>
    );
};

export default ProjectListing;

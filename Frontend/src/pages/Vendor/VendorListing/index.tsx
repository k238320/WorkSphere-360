/*eslint-disable */
import moment from 'moment';

// assets
import SubCard from 'ui-component/cards/SubCard';
import DataGridOData from 'ui-component/DataGridOData';
import { Chip, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { GridMoreVertIcon } from '@mui/x-data-grid';
import { getDepartmentListing } from 'services/departmentService';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import { getAssetCategoryListing } from 'services/assetCategoryService';
import { getVendorListing } from 'services/vendorService';

const VendorListing = (props: any) => {
    const defaultSortInfo = { name: 'id', dir: -1, type: 'string' };

    const defaultFilterValue = [{ name: 'name', type: 'string', operator: 'contains', value: '' }];

    const columns: any = [
        {
            header: 'Name',
            name: 'name',
            defaultFlex: 1,
            minWidth: 200,
            textAlign: 'center'
        },
        {
            header: 'Number',
            defaultFlex: 1,
            minWidth: 200,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{data?.phone_number}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Address',
            defaultFlex: 1,
            minWidth: 200,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{data?.address}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'CNIC No.',
            defaultFlex: 1,
            minWidth: 200,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{data?.CNIC}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Acc No.',
            defaultFlex: 1,
            minWidth: 200,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                {/* <span>{moment(data?.created_at).format('Do MMM, YYYY')}</span> */}
                                <span>{data?.account_number}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            name: 'actions',
            header: 'Action',
            defaultFlex: 1,
            minWidth: 200,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <Grid>
                        <Grid>
                            <Link to={'/vendor/create?uuid=' + data?.uuid}>
                                <GridMoreVertIcon style={{ color: '#5e35b1' }} />
                            </Link>
                        </Grid>
                    </Grid>
                );
            }
        }
    ];

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'List of Vendors'} icon title rightAlign />
            <SubCard>
                <DataGridOData
                    dataResolver={getVendorListing} // api function
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

export default VendorListing;

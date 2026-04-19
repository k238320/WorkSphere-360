/*eslint-disable */
import * as React from 'react';
import SubCard from 'ui-component/cards/SubCard';
import DataGridOData from 'ui-component/DataGridOData';
import { getHourDetails } from 'services/Allocation/taskServices';
import { Chip, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { GridMoreVertIcon } from '@mui/x-data-grid';

// project imports

// assets
import moment from 'moment';
import { getUserListing } from 'services/userService';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';

const UserListing = (props: any) => {
    const defaultSortInfo = { name: 'updated_at', dir: -1, type: 'string' };
    const defaultFilterValue = [
        { name: 'name', type: 'string', operator: 'contains', value: '' },
        { name: 'email', type: 'string', operator: 'contains', value: '' },
        { name: 'role', type: 'string', operator: 'contains', value: '' }
    ];

    const columns: any = [
        {
            header: 'Name',
            name: 'name',
            defaultFlex: 1,
            minWidth: 250,
            textAlign: 'center'
        },
        {
            header: 'Email',
            name: 'email',
            defaultFlex: 1,
            minWidth: 250,
            textAlign: 'center'
        },
        {
            header: 'Role',
            name: 'role',
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',
            justifyContent: 'space-between',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <span>{data?.role?.name}</span>
                    </>
                );
            }
        },

        {
            header: 'Resource',
            name: 'resource',
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                {data?.resource?.status ? (
                                    <Chip
                                        className="custom__chip --green-chip"
                                        label={data?.resource ? 'True' : 'False'}
                                        color="success"
                                        variant="filled"
                                    />
                                ) : (
                                    <Chip
                                        className="custom__chip --red-chip"
                                        label={data?.resource ? 'True' : 'False'}
                                        color="error"
                                        variant="filled"
                                    />
                                )}
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Status',
            name: 'status',
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                {data?.status ? (
                                    <Chip
                                        className="custom__chip --green-chip"
                                        label={data?.status ? 'Active' : 'Inactive'}
                                        color="success"
                                        variant="filled"
                                    />
                                ) : (
                                    <Chip
                                        className="custom__chip --red-chip"
                                        label={data?.status ? 'Active' : 'Inactive'}
                                        color="error"
                                        variant="filled"
                                    />
                                )}
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Start Date',
            defaultFlex: 1,
            minWidth: 150,
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
            header: 'End Date',
            defaultFlex: 1,
            minWidth: 150,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{moment(data?.updated_at).format('Do MMM, YYYY')}</span>
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
            minWidth: 100,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <Grid>
                        <Grid>
                            <Link to={'/user/update?uuid=' + data?.uuid}>
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
            <Breadcrumbs separator={IconChevronRight} heading={'List of User'} icon title rightAlign />
            <SubCard>
                <DataGridOData
                    // showAddButton={true}
                    dataResolver={getUserListing} // api function
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

export default UserListing;

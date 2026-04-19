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
import { getResource } from 'services/resource';
import moment from 'moment';
import { IconChevronRight } from '@tabler/icons';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
// import { AdminManage } from 'components/AdminManage';

const ResourceListing = (props: any) => {
    const defaultSortInfo = { name: 'id', dir: -1, type: 'number' };
    const defaultFilterValue = [
        { name: 'name', type: 'string', operator: 'contains', value: '' },
        { name: 'department', type: 'string', operator: 'contains', value: '' }
    ];

    const columns: any = [
        {
            header: 'Name',
            name: 'name',
            defaultFlex: 1,
            minWidth: 200,
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
            header: 'Department Name',
            name: 'department',
            defaultFlex: 1,
            minWidth: 200,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <span>{data?.department?.name}</span>
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        //  {
        //     header: 'Designation Name',
        //     name: 'designation',
        //     defaultFlex: 1,
        //     minWidth: 200,
        //     textAlign: 'center',
        //     render: ({ data }: { data: any }) => {
        //         return (
        //             <>
        //                 <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
        //                     <Grid item md={12} sm={12} xs={12}>
        //                         <span>{data?.designation?.name}</span>
        //                     </Grid>
        //                 </Grid>
        //             </>
        //         );
        //     }
        // },
        {
            header: 'Team Lead',
            name: 'is_team_lead',
            defaultFlex: 1,
            minWidth: 200,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <Grid container spacing={0.5} alignItems="center" justifyContent="space-between">
                            <Grid item md={12} sm={12} xs={12}>
                                <Chip
                                    className="custom__chip --purple-chip"
                                    label={data?.is_team_lead ? 'True' : 'false'}
                                    color="success"
                                    variant="filled"
                                />
                            </Grid>
                        </Grid>
                    </>
                );
            }
        },
        {
            header: 'Start Date',
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
            header: 'End Date',
            defaultFlex: 1,
            minWidth: 200,
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
            minWidth: 200,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <Grid>
                        <Grid>
                            <Link to={'/resource/create?uuid=' + data?.uuid}>
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
            <Breadcrumbs separator={IconChevronRight} heading={'List of Resources'} icon title rightAlign />
            <SubCard>
                <DataGridOData
                    // showAddButton={true}
                    dataResolver={getResource} // api function
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

export default ResourceListing;

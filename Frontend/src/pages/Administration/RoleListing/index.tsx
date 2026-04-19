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
import { getRoleListing } from 'services/rolesService';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';

const RoleListing = (props: any) => {
    const defaultSortInfo = { name: 'id', dir: -1, type: 'number' };
    const defaultFilterValue = [{ name: 'name', type: 'string', operator: 'contains', value: '' }];

    const columns: any = [
        {
            header: 'Name',
            name: 'name',
            defaultFlex: 1,
            minWidth: 250,
            textAlign: 'center'
        },
        {
            header: 'Status',
            name: 'status',
            defaultFlex: 1,
            minWidth: 250,
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
            header: 'Module',
            name: 'role_mapping',
            defaultFlex: 1,
            minWidth: 350,
            textAlign: 'center',
            justifyContent: 'space-between',
            render: ({ data }: { data: any }) => {
                let modules: any[] = [];

                data?.role_mapping?.map((x: any) => {
                    const find = modules.find((y) => y?.modules?.name == x?.modules?.name);
                    if (!find) {
                        modules.push(x);
                    }
                });

                return (
                    <>
                        <div className="chip__wrapper">
                            {modules?.map((x: any) => (
                                <>
                                    {x?.modules?.name && (
                                        <Chip
                                            className="custom__chip --purple-chip"
                                            key={x?.id}
                                            label={x?.modules?.name}
                                            color="secondary"
                                            variant="filled"
                                        />
                                    )}
                                </>
                            ))}
                        </div>
                    </>
                );
            }
        },
        {
            header: 'Screens',
            name: 'screens',
            defaultFlex: 1,
            minWidth: 300,
            textAlign: 'center',
            justifyContent: 'space-between',
            render: ({ data }: { data: any }) => {
                return (
                    <>
                        <div>
                            {data?.screens?.map((x: any) => (
                                <>
                                    <div className="chip__wrapper --screens__wrapper">
                                        <Chip
                                            className="custom__chip --brown-chip"
                                            key={x?.id}
                                            label={x?.name}
                                            color="success"
                                            variant="filled"
                                        />

                                        <div>
                                            {x?.routes.map((y: any, index: number) => (
                                                <Chip
                                                    className="custom__chip --blue-chip"
                                                    key={index}
                                                    label={y?.name}
                                                    color="info"
                                                    variant="filled"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ))}
                        </div>
                    </>
                );
            }
        },
        {
            header: 'Start Date',
            defaultFlex: 1,
            minWidth: 250,
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
            minWidth: 250,
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
                            <Link to={'/role/create?uuid=' + data?.uuid}>
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
            <Breadcrumbs separator={IconChevronRight} heading={'List of Roles'} icon title rightAlign />
            <SubCard>
                <DataGridOData
                    // showAddButton={true}
                    dataResolver={getRoleListing} // api function
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

export default RoleListing;

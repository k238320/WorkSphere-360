/*eslint-disable */
import * as React from 'react';
import SubCard from 'ui-component/cards/SubCard';
import DataGridOData from 'ui-component/DataGridOData';
import { Chip, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { GridMoreVertIcon } from '@mui/x-data-grid';

// assets
import moment from 'moment';
import { getTaskCategoryListing } from 'services/taskCategoryService';
import { IconChevronRight } from '@tabler/icons';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';

const TaskCategoryListing = (props: any) => {
    const defaultSortInfo = { name: 'id', dir: -1, type: 'number' };
    const defaultFilterValue = [{ name: 'name', type: 'string', operator: 'contains', value: '' }];

    const columns: any = [
        {
            header: 'Name',
            name: 'name',
            defaultFlex: 1,
            minWidth: 240,
            textAlign: 'center'
        },
        {
            header: 'Status',
            name: 'status',
            defaultFlex: 1,
            minWidth: 240,
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
            minWidth: 240,
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
            minWidth: 240,
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
            minWidth: 240,
            textAlign: 'center',
            render: ({ data }: { data: any }) => {
                return (
                    <Grid>
                        <Grid>
                            <Link to={'/task-category/create?uuid=' + data?.uuid}>
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
            <Breadcrumbs separator={IconChevronRight} heading={'List of Task Categories'} icon title rightAlign />
            <SubCard>
                <DataGridOData
                    dataResolver={getTaskCategoryListing} // api function
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

export default TaskCategoryListing;

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

const DepartmentListing = (props: any) => {
    const defaultSortInfo = { name: 'id', dir: -1, type: 'string' };

    const defaultFilterValue = [{ name: 'name', type: 'string', operator: 'contains', value: '' }];

    const columns: any = [
        {
            header: 'Department',
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
                                <span>{moment(data?.start_date).format('Do MMM, YYYY')}</span>
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
                                <span>{moment(data?.end_date).format('Do MMM, YYYY')}</span>
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
                            <Link to={'/department/create?uuid=' + data?.uuid}>
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
            <Breadcrumbs separator={IconChevronRight} heading={'List of Departments'} icon title rightAlign />
            <SubCard>
                <DataGridOData
                    dataResolver={getDepartmentListing} // api function
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

export default DepartmentListing;

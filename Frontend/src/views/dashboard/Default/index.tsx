// material-ui
import { Grid } from '@mui/material';

// project importsa
import AllocationCard from './AllocationsCard';
import ResourceCard from './ResourceCard';
import MilstonegraphPaymentWise from './milstonegraphPaymentWise';
import useAuth from 'hooks/useAuth';
import MilstonegraphInvoiceWise from './MilstonegraphInvoiceWise';
import TargetSales from '../TargetSales';
import AttendanceCount from './Attendance';
import ResourceUtilizationChart from './ResourceUtilizationChart';

// ==============================|| DEFAULT DASHBOARD ||============================== //

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <Grid container>
            <Grid item xs={12}>
                <Grid container spacing={2}>
                    <Grid item lg={6} md={6} sm={6} xs={12}>
                        <AllocationCard />
                    </Grid>
                    <Grid item lg={6} md={6} sm={6} xs={12}>
                        <ResourceCard />
                    </Grid>
                    {/* {['Super Admin', 'Finance', 'PM Lead'].includes(user?.role?.name) && (
                        <>
                            <Grid item lg={12} md={12} sm={12} xs={12}>
                                <MilstonegraphInvoiceWise />
                            </Grid>

                            <Grid item lg={12} md={12} sm={12} xs={12}>
                                <MilstonegraphPaymentWise />
                            </Grid>
                        </>
                    )}

                    {['Super Admin', 'Finance', 'PM Lead'].includes(user?.role?.name) && (
                        <>
                            <Grid item lg={12} md={12} xs={12}>
                                <TargetSales />
                            </Grid>
                        </>
                    )} */}

                    {/* {['Super Admin', 'Human Resource', 'Human Resource Operations', 'PM Lead'].includes(user?.role?.name) && (
                        <>
                            <Grid item lg={12} md={12} xs={12}>
                                <ResourceUtilizationChart />
                            </Grid>
                        </>
                    )} */}

                    {/* {['6548c8ec1a21e5fecc0d40bb', '64c763015a488350a2c2ec52'].includes(user?.id) && (
                        <>
                            <Grid item lg={12} md={12} xs={12}>
                                <ResourceUtilizationChart />
                            </Grid>
                        </>
                    )}

                    <>
                        <Grid item lg={12} md={12} xs={12}>
                            <AttendanceCount />
                        </Grid>
                    </> */}
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Dashboard;

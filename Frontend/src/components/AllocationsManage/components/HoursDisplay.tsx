import { Grid, Typography } from '@mui/material';

interface IHoursDisplay {
    // SaleHour: number;
    // AdditionalHour: number;
    // UpsellHour: number;
    // RemainingHour: number | null;

    hoursData: any;
}

const HoursDisplay = ({ hoursData }: IHoursDisplay) => {
    return (
        <Grid item xs={12} md={12} sm={12} sx={{ mt: 2, mb: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={2} md={2} sm={2}></Grid>
                <Grid item xs={4} md={2} sm={4}>
                    <Typography variant="h3" component="h2" style={{ textAlign: 'center' }}>
                        Total Hours
                    </Typography>
                    <h1 style={{ textAlign: 'center' }}>
                        <span>{hoursData?.SaleHour}</span>
                        <span style={{ color: 'red', fontSize: '23px' }}>{` +${hoursData?.AdditionalHour} `}</span>
                        <span style={{ color: 'blue', fontSize: '23px' }}>{` +${hoursData.UpsellHour} `}</span>
                    </h1>
                </Grid>
                <Grid item xs={3} md={3} sm={3}>
                    <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: '#4BB543' }}>
                        Remaining Hours
                    </Typography>
                    <h1 style={{ textAlign: 'center', color: '#4BB543' }}>{hoursData?.RemainingHour ? hoursData?.RemainingHour : '0'}</h1>
                </Grid>
                <Grid item xs={1.5} md={1.5} sm={1.5}>
                    <Typography variant="h4" component="h2" style={{ textAlign: 'center', color: 'red' }}>
                        Consumed Hours
                    </Typography>
                    <h1 style={{ textAlign: 'center', color: 'red' }}>{hoursData?.ConsumedHours ? hoursData?.ConsumedHours : '0'}</h1>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default HoursDisplay;

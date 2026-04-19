import { Box, Typography } from '@mui/material';

interface ICustomeTabPanel {
    children: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: ICustomeTabPanel) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && (
                <Box sx={{ py: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

export default CustomTabPanel;

import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import EmplyeeDetails from '../../components/EmplyeeDetails';
import Documents from '../../components/Documents';
import FamilyInformation from 'components/FamilyInformation/FamilyInformation';
import AssetDetails from 'components/AssetDetails/AssetDetails';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import { useLocation } from 'react-router-dom';
import ResignationForm from './ResignationForm';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    style?: any;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`
    };
}

export default function BasicTabs() {
    const [value, setValue] = React.useState(0);
    const { search } = useLocation();
    let tab = new URLSearchParams(search).get('tab');

    React.useEffect(() => {
        if (tab && tab != undefined) {
            const newtab = parseInt(tab);
            setValue(newtab);
        }
    }, []);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Breadcrumbs
                separator={IconChevronRight}
                heading={
                    value === 0
                        ? 'Employee Details'
                        : value === 1
                        ? 'Family Information'
                        : value === 2
                        ? 'Documents'
                        : value === 3
                        ? 'Assigned Assets'
                        // : value === 4
                        // ? 'Resignation Form'
                        : ''
                }
                icon
                title
                rightAlign
            />
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Employee Details" {...a11yProps(0)} />
                    <Tab label="Family Information" {...a11yProps(1)} />
                    <Tab label="Documents" {...a11yProps(2)} />
                    <Tab label="Assigned Assets" {...a11yProps(3)} />
                    {/* <Tab label="Resignation Form" {...a11yProps(3)} /> */}
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <EmplyeeDetails />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <FamilyInformation />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <Documents />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3} style={{ background: '#fff', borderRadius: '8px' }}>
                <AssetDetails />
            </CustomTabPanel>

            {/* <CustomTabPanel value={value} index={4} style={{ background: '#fff', borderRadius: '8px' }}>
                <ResignationForm />
            </CustomTabPanel> */}
        </Box>
    );
}

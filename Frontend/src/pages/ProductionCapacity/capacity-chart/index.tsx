'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, TableCell } from '@mui/material';
import { styled } from '@mui/material/styles';
import { IconChevronRight } from '@tabler/icons';
import MultiMonthChart from './multi-month-chart';
import MonthlyDetailedChart from './monthly-detailed-chart';

interface Department {
    id: string;
    name: string;
    color: string;
    resourceCount: number;
}

interface Project {
    id: string;
    name: string;
    type: string;
    pm: string;
    projectHours: Record<string, number>;
    consumedHours: Record<string, number>;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 600,
    textAlign: 'center',
    padding: '8px',
    fontSize: '0.875rem'
}));

const UtilizationCell = styled(TableCell)<{ utilization: number }>(({ theme, utilization }) => ({
    fontWeight: 600,
    textAlign: 'center',
    padding: '8px',
    fontSize: '0.875rem',
    backgroundColor: utilization > 100 ? '#FFE0B2' : '#E8F5E8', // Orange for over-utilized, green for normal
    color: utilization > 100 ? '#E65100' : '#2E7D32'
}));

const ResourceCell = styled(TableCell)<{ required: number }>(({ theme, required }) => ({
    fontWeight: 600,
    textAlign: 'center',
    padding: '8px',
    fontSize: '0.875rem',
    backgroundColor: required > 0 ? '#FFCDD2' : required < 0 ? '#C8E6C9' : '#F5F5F5',
    color: required > 0 ? '#C62828' : required < 0 ? '#388E3C' : '#666666'
}));

const CapacityUtilizationChart = () => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <Box>
            <Paper elevation={2} sx={{ mt: 2, p: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab label="Multi-Month Overview" />
                        <Tab label="Monthly Detailed View" />
                    </Tabs>
                </Box>

                {/* Tab 1: Multi-Month Overview */}
                {activeTab === 0 && <MultiMonthChart />}

                {/* Tab 2: Monthly Detailed View */}
                {activeTab === 1 && <MonthlyDetailedChart />}
            </Paper>
        </Box>
    );
};

export default CapacityUtilizationChart;

import React, { useEffect } from 'react';
import { Box, Card, Grid, Tab, Tabs } from '@mui/material';
import SubCard from 'ui-component/cards/SubCard';
import { SalesComponent } from './ProjectChild/ForSale';
import { FinanceComponent } from './ProjectChild/ForFinance';
import { ProjectManagerComponent } from './ProjectChild/ProjectManager';
import { ProjectStatusComponent } from './ProjectChild/ProjectStatus';
import { useLocation } from 'react-router-dom';

// ================================|| UI TABS  ||================================ //

export function ProjectManage({ projectId }: { projectId: any }) {
    const [value, setValue] = React.useState('');
    const [module, setModule] = React.useState<any>([]);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const pmParam = queryParams.get('pm');

    const log: any = window.localStorage.getItem('user');
    let localUsers = JSON.parse(log);

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    useEffect(() => {
        let modules: any[] = [];

        if (projectId) {
            localUsers = {
                ...localUsers,
                role_mapping: localUsers?.role_mapping?.filter((x: any) => x?.permission?.name !== 'create')
            };
        }

        localUsers?.role_mapping?.map((x: any) => {
            const find = modules.find((y) => y?.modules?.name == x?.modules?.name);
            if (!find) {
                modules.push(x);
            }
        });

        setModule(modules);

        setValue(localUsers?.role_mapping[0]?.modules?.name);
    }, [projectId]);

    const getModules = (key: any) => {
        switch (key) {
            case 'For Sales':
                return <Tab value="For Sales" label="For Sales" />;
            case 'For Finance':
                return projectId && <Tab value="For Finance" label="For Finance" />;
            case 'For Project Manager':
                return projectId && <Tab value="For Project Manager" label="For Project Manager" />;
            case 'Project Status':
                return projectId && <Tab value="Project Status" label="Project Status" />;

            default:
                return <></>;
        }
    };
    useEffect(() => {
        if (pmParam !== null && pmParam) {
            setValue('Project Status');
        }
    }, [pmParam]);

    return (
        <>
            <SubCard>
                <Card>
                    <Grid container spacing={2}>
                        <Grid item md={12}>
                            <Box sx={{ width: '100%' }}>
                                <Tabs
                                    value={value}
                                    onChange={handleChange}
                                    indicatorColor="secondary"
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    aria-label="scrollable auto tabs example"
                                >
                                    {projectId
                                        ? module?.map((x: any) => x?.permission?.name !== 'create' && getModules(x?.modules?.name))
                                        : module?.map((x: any) => x?.permission?.name === 'create' && getModules(x?.modules?.name))}
                                </Tabs>
                            </Box>
                            {value == 'For Sales' && <SalesComponent projectId={projectId} />}
                            {value == 'For Finance' && projectId && <FinanceComponent projectId={projectId} />}
                            {value == 'For Project Manager' && projectId && <ProjectManagerComponent projectId={projectId} />}
                            {value === 'Project Status' && projectId && <ProjectStatusComponent projectId={projectId} />}
                        </Grid>
                    </Grid>
                </Card>
            </SubCard>
        </>
    );
}

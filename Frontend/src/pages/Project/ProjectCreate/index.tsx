// assets
import { ProjectManage } from 'components/ProjectManage';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import { getProjectName } from 'services/projectService';
import { useEffect, useState } from 'react';

const ProjectCreate = (props: any) => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const uuid = searchParams.get('uuid');
    const [project, setProject] = useState<any>('');

    useEffect(() => {
        if (uuid) {
            const fetchData = async () => {
                try {
                    const res = await getProjectName(uuid || '');
                    setProject(res);
                } catch (error) {
                    // Handle errors if needed
                    console.error('Error fetching project name:', error);
                }
            };
            fetchData();
        } else {
            setProject('');
        }
    }, [uuid]);

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? `` : 'Add Project'} name={project?.name} icon title rightAlign />
            <ProjectManage projectId={uuid} />
        </>
    );
};

export default ProjectCreate;

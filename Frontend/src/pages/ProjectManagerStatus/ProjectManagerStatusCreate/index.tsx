// assets
import { ProjectManage } from 'components/ProjectManage';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import { PmStatusComponent } from 'components/PmStatusManage';

const ProjectManagerStatusCreate = (props: any) => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const uuid = searchParams.get('uuid');

    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit PM Status' : 'Add PM Status'} icon title rightAlign />
            {/* <ProjectManage projectId={uuid} /> */}
            <PmStatusComponent />
        </>
    );
};

export default ProjectManagerStatusCreate;

/*eslint-disable */

// project imports

// assets
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ProjectManage } from 'components/ProjectManage';

const ProjectUpdate = (props: any) => {
    const [apiData, setApiData] = useState<any>(null);
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');

    return (
        <>
            <ProjectManage projectId={uuid} />
        </>
    );
};

export default ProjectUpdate;

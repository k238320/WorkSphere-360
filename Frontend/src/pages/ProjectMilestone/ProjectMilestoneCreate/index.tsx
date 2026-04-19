/*eslint-disable */

// assets
import { IconChevronRight } from '@tabler/icons';
import { MilestoneManage } from 'components/MilestoneManage';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
// import { AdminManage } from 'components/AdminManage';

const MilestoneCreate = (props: any) => {
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit Milestones' : 'Add Milestones'} icon title rightAlign />
            <MilestoneManage />
        </>
    );
};

export default MilestoneCreate;

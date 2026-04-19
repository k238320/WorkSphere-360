/*eslint-disable */

// assets
import { IconChevronRight } from '@tabler/icons';
import { CategoryManage } from 'components/CategoryManage';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
// import { AdminManage } from 'components/AdminManage';

const ProjectCategoryCreate = (props: any) => {
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit Category' : 'Add Category'} icon title rightAlign />
            <CategoryManage />
        </>
    );
};

export default ProjectCategoryCreate;

/*eslint-disable */

// assets
import { IconChevronRight } from '@tabler/icons';
import { CategoryStatusManageComponent } from 'components/categoryStatusManage';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
// import { AdminManage } from 'components/AdminManage';

const CategoryStatusCreate = (props: any) => {
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    return (
        <>
            <Breadcrumbs
                separator={IconChevronRight}
                heading={uuid ? 'Edit Category Status' : 'Add Category Status'}
                icon
                title
                rightAlign
            />
            <CategoryStatusManageComponent />
        </>
    );
};

export default CategoryStatusCreate;

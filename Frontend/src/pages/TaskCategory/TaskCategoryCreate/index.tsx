import { IconChevronRight } from '@tabler/icons';
import { TaskCategoryManage } from 'components/TaskCategoryManage';
import React from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';

const TaskCategoryCreate = () => {
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit Task Category' : 'Add Task Category'} icon title rightAlign />
            <TaskCategoryManage />;
        </>
    );
};

export default TaskCategoryCreate;

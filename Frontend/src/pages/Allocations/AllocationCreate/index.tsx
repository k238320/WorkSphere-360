/*eslint-disable */

import { IconChevronRight } from '@tabler/icons';
import { AllocationManage } from 'components/AllocationsManage';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getTaskName } from 'services/Allocation/taskServices';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';

const AllocationCreatePage = (props: any) => {
    const [task, setTask] = useState<any>('');
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');

    useEffect(() => {
        if (uuid) {
            const fetchData = async () => {
                try {
                    const res: any = await getTaskName(uuid || '');
                    const name = res?.project?.name + ' - ' + res?.name;
                    setTask(name);
                } catch (error) {
                    // Handle errors if needed
                    console.error('Error fetching allocation name:', error);
                }
            };
            fetchData();
        } else {
            setTask('');
        }
    }, [uuid]);
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? `${task}` : 'Add Task'} icon title rightAlign />
            <AllocationManage />
        </>
    );
};

export default AllocationCreatePage;

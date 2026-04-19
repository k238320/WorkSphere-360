import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import React from 'react';
import LeaveCreateManage from 'components/LeaveCreateManage';

const AddLeave = () => {
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'Apply Leave'} icon title rightAlign />
            <LeaveCreateManage />
        </>
    );
};

export default AddLeave;

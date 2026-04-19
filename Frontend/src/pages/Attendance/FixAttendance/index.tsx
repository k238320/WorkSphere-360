import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import React from 'react';
import FixAttendanceManage from 'components/FixAttendanceMange';

const FixAttendance = () => {
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'Fix Attendance'} icon title rightAlign />
            <FixAttendanceManage />
        </>
    );
};

export default FixAttendance;

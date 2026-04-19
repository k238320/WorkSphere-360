import { IconChevronRight } from '@tabler/icons';
import React from 'react';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Calendar from 'views/application/calendar';

const AppCalendar = () => {
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={'Calendar View'} icon title rightAlign />
            <Calendar />;
        </>
    );
};

export default AppCalendar;

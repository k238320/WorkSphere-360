import * as React from 'react';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import { useLocation } from 'react-router-dom';
import { HolidayManage } from 'components/HolidayManage';

const HolidayCreatePage = (props: any) => {
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit Holiday ' : 'Add Holiday'} icon title rightAlign />
            <HolidayManage />
        </>
    );
};

export default HolidayCreatePage;

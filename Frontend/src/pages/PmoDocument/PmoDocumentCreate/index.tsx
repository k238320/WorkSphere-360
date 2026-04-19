import { PmoDocumentManage } from 'components/PmoDocumentManage';
import * as React from 'react';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { IconChevronRight } from '@tabler/icons';
import { useLocation } from 'react-router-dom';

const PmoDocumentCreatePage = (props: any) => {
    const { search } = useLocation();
    let uuid = new URLSearchParams(search).get('uuid');
    return (
        <>
            <Breadcrumbs separator={IconChevronRight} heading={uuid ? 'Edit PMO Document ' : 'Add PMO Document'} icon title rightAlign />
            <PmoDocumentManage />
        </>
    );
};

export default PmoDocumentCreatePage;

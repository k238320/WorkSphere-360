import { IconChevronRight } from '@tabler/icons';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import ExtraHourForm from 'components/ExtraHourForm';

const ExtraHour = () => {
    return (
        <>
            {' '}
            <Breadcrumbs separator={IconChevronRight} heading={'Approval For Extra Hour'} icon title rightAlign />
            <ExtraHourForm />
        </>
    );
};

export default ExtraHour;

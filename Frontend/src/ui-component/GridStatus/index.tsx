import completeIcon from '../../assets/images/icons/complete.svg';
import delayedIcon from '../../assets/images/icons/delayed.svg';
import onHoldIcon from '../../assets/images/icons/onHold.svg';
import onTrackIcon from '../../assets/images/icons/onTrack.svg';
import NAIcon from '../../assets/images/icons/NA.png';
import styles from './index.module.scss';

type statusProps = {
    data: any;
};

const GridStatus = ({ data }: statusProps) => {
    const getStatusColor = () => {
        switch (data) {
            case 'Completed':
                return '#e5fceb'; // Green color for Completed
            case 'On Hold':
                return 'rgba(231, 116, 67,0.2)'; // Red color for On Hold
            case 'On Track':
            case 'Assigned':
                return 'rgb(255, 248, 225)';
            case 'Delayed':
                return 'rgba(216, 67, 21,0.2)'; // Orange color for Delayed
            case 'Unassigned':
                return 'rgba(239, 154, 154, 0.376)'; // Grey color for Unassigned
            default:
                return 'rgba(216, 67, 21,0.2)'; // Default grey color
        }
    };

    const statusStyle = {
        backgroundColor: getStatusColor(),
        padding: '8px',
        borderRadius: '16px'
    };

    return (
        <div className={styles.status__wrapper} style={statusStyle}>
            <img
                src={
                    data === 'Completed'
                        ? completeIcon
                        : data === 'On Hold'
                        ? onHoldIcon
                        : data === 'On Track' || data === 'Assigned'
                        ? onTrackIcon
                        : data === 'Delayed'
                        ? delayedIcon
                        : data === 'Unassigned'
                        ? NAIcon
                        : NAIcon
                }
            />
            <span>{data ?? 'N/A'}</span>
        </div>
    );
};

export default GridStatus;

import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import { Link } from 'react-router-dom';

interface ICustomTooltip {
    title: any;
    // children: React.ReactNode;
    children: React.ReactNode;
}

const CustomTooltipCalender: React.FC<ICustomTooltip> = ({ title, children }) => {
    const customTitle = (
        <span style={{ cursor: 'pointer' }}>
            {Array.isArray(title) ? (
                <>
                    {title?.map((item, index) => (
                        <div key={index}>
                            <Link
                                to={`/allocation/create?uuid=${item?.id}`}
                                className="remove-link"
                                style={{
                                    color: '#fff',
                                    border: 'none !important',
                                    textDecoration: 'none !important',
                                    outline: 'none !important'
                                }}
                            >
                                {item?.title}
                            </Link>
                            <br />
                        </div>
                    ))}
                </>
            ) : (
                // <Link to={`/allocation/create?uuid=${title?.id}`} style={{ color: '#fff', border: 'none' }}>
                // <Link to={title?.id ? '' : `/allocation/create?uuid=${title?.id}`} style={{ color: '#fff', border: 'none' }}>
                //     {title?.title}
                // </Link>
                <>
                    {title?.id ? (
                        <Link
                            to={`/allocation/create?uuid=${title.id}`}
                            className="remove-link"
                            style={{
                                color: '#fff',
                                border: 'none !important',
                                textDecoration: 'none !important',
                                outline: 'none !important'
                            }}
                        >
                            {title?.title}
                        </Link>
                    ) : (
                        <span style={{ color: '#fff' }}>{title?.title}</span>
                    )}
                </>
            )}
        </span>
    );
    return (
        <Tooltip placement="top-start" title={customTitle}>
            <div style={{ cursor: 'pointer' }}>{children}</div>
        </Tooltip>
    );
};

export default CustomTooltipCalender;

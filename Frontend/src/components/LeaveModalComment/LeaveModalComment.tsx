// import React from 'react';

// const LeaveModalComment = ({ data }: any) => {
//     return (
//         <div>
//             <h1>Comment</h1>
//             <p>{data?.reason_rejection}</p>
//         </div>
//     );
// };

// export default LeaveModalComment;

import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

const LeaveModalComment = ({ data, handleClose }: any) => {
    const containerStyle: React.CSSProperties = {
        // padding: '20px',
        // backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        // boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        position: 'relative'
    };

    const headingStyle: React.CSSProperties = {
        fontSize: '24px',
        color: '#333',
        marginBottom: '10px'
    };

    const paragraphStyle: React.CSSProperties = {
        fontSize: '16px',
        color: '#666'
    };

    const closeIconStyle: React.CSSProperties = {
        position: 'absolute',
        top: '0px',
        right: '10px',
        transform: 'translate(99%, -131%);',
        cursor: 'pointer',
        fontSize: '18px',
        color: '#666'
    };

    return (
        <div style={containerStyle}>
            <span style={closeIconStyle} onClick={handleClose}>
                <CloseIcon fontSize="small" />
            </span>
            <h1 style={headingStyle}>Comment</h1>
            <p style={paragraphStyle}>{data?.reason_rejection}</p>
        </div>
    );
};

export default LeaveModalComment;

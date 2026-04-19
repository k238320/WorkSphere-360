// import React, { useState } from 'react';
// import { TextField } from '@mui/material';
// import DatePickerComponent from 'components/ProjectManage/ProjectChild/ForFinance/DatePicker';
// import { Button } from '@mui/material';
// import Switch from '@mui/material/Switch';

// const ViewOnHoldModel = () => {
//     const [startDate, setStartNewDate] = useState(' ');
//     const [endDate, setEndDate] = useState(' ');
//     const handleStartDate = (id: string) => (data: any) => {
//         setStartNewDate(data);
//         console.log(data, 'date');
//     };
//     const handleEndDate = (id: string) => (data: any) => {
//         setEndDate(data);
//         console.log(data, 'date');
//     };
//     return (
//         <div>
//             <h3 style={{ color: '#212121', fontWeight: 700, lineHeight: '20px' }}>View On-Hold Detail</h3>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
//                     <div style={{ backgroundColor: '#fafafa', padding: '7px 16px', borderRadius: '12px', marginBottom: '25px', flex: 1 }}>
//                         <DatePickerComponent date={startDate} onChange={handleStartDate('1')} disabled={false} />
//                     </div>{' '}
//                     <div style={{ backgroundColor: '#fafafa', padding: '7px 16px', borderRadius: '12px', marginBottom: '25px', flex: 1 }}>
//                         <DatePickerComponent date={endDate} onChange={handleEndDate('1')} disabled={false} />
//                     </div>
//                 </div>

//                 <div
//                     style={{
//                         padding: '7px 16px',
//                         borderRadius: '12px',
//                         marginBottom: '25px',
//                         flex: 1
//                     }}
//                 >
//                     <Switch defaultChecked />
//                     Permanently hold*
//                 </div>
//             </div>

//             <TextField
//                 fullWidth
//                 id="outlined-multiline-flexible"
//                 label="Reason*"
//                 multiline
//                 rows={3}
//                 defaultValue=""
//                 sx={{ borderRadius: '12px', marginBottom: '27px' }}
//             />
//             <div style={{ textAlign: 'right' }}>
//                 <Button variant="contained">Save</Button>
//             </div>
//         </div>
//     );
// };

// export default ViewOnHoldModel;

// import React from 'react';

// const ViewOnHoldModel = () => {
//     return <div>ViewOnHoldModel</div>;
// };

// export default ViewOnHoldModel;

import { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { getTargetMonthHistry } from 'services/projectService';

function createData(name: any, calories: any, fat: any, carbs: any, protein: any) {
    return { name, calories, fat, carbs, protein };
}

const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9)
];

const ViewOnHoldModel = (date: any) => {
    const [getMilestone, setGetMileStone] = useState<any[]>([]);

    useEffect(() => {
        getTargetMonthHistry(date?.data?.data?.id)
            .then((res: any) => {
                setGetMileStone(res?.onhold || []);
            })
            .catch((err) => {});
    }, []);

    return (
        <>
            <h1 style={{ textAlign: 'center' }}>View Reason </h1>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell align="center">Reason</TableCell>
                            <TableCell align="center">On-Hold</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {getMilestone.length === 0 ? (
                            <p style={{ textAlign: 'center' }}>No data available for the selected date.</p>
                        ) : (
                            <>
                                {getMilestone?.map((row: any) => (
                                    <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {row.datestart}
                                        </TableCell>
                                        <TableCell component="th" scope="row">
                                            {row.dateend}
                                        </TableCell>
                                        <TableCell align="center">{row.reason}</TableCell>
                                        <TableCell align="center">{row.permanentlyhold ? 'permanently Onhold' : '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default ViewOnHoldModel;

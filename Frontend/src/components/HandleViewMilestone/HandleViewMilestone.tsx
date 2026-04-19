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

interface MileStoneModalProps {
    date: string;
}

const HandleViewMilestone: React.FC<MileStoneModalProps> = (date: any) => {
    const [getMilestone, setGetMileStone] = useState<any[]>([]);

    useEffect(() => {
        getTargetMonthHistry(date?.date?.id)
            .then((res: any) => {
                setGetMileStone(res?.milestone || []);
            })
            .catch((err) => {});
    }, []);

    return (
        <>
            <h1 style={{ textAlign: 'center' }}>All Milestone </h1>
            <TableContainer component={Paper} style={{ maxHeight: '300px', overflowX: 'hidden' }}>
                <Table
                    sx={{ minWidth: 650, maxHeight: 300, overflowX: 'hidden' }}
                    style={{ maxHeight: '300px !important', overflowX: 'hidden' }}
                    aria-label="simple table"
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell align="center">Reason</TableCell>
                            <TableCell align="center">Milestone</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* {getMilestone?.map((row: any) => (
                            <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">
                                    {row.date}
                                </TableCell>
                                <TableCell align="right">{row.text}</TableCell>
                                <TableCell align="right">{row.milestonephase}</TableCell>
                            </TableRow>
                        ))} */}
                        {getMilestone.length === 0 ? (
                            <p style={{ textAlign: 'center' }}>No data available for the selected date.</p>
                        ) : (
                            <>
                                {getMilestone?.map((row: any) => (
                                    <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell component="th" scope="row">
                                            {row.date}
                                        </TableCell>
                                        <TableCell align="center">{row.text}</TableCell>
                                        <TableCell align="center">{row.milestonephase}</TableCell>
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

export default HandleViewMilestone;

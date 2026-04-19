import React from 'react';
import { Resource, ProposedHours, ProjectMetrics } from './types';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';
import './ProfitByResource.css';

type Props = {
    resources: Resource[];
    proposed: ProposedHours;
    page: number;
    rowsPerPage: number;
    setPage: (page: number) => void;
    setRowsPerPage: (rows: number) => void;
};

const ResourceTable: React.FC<Props> = ({ resources, page, rowsPerPage, setPage, setRowsPerPage }) => {
    const allProjects = Array.from(new Set([...resources.flatMap((r) => Object.keys(r.projects))]));

    const projectTotals: Record<string, ProjectMetrics> = allProjects.reduce((acc, proj) => {
        acc[proj] = resources.reduce(
            (sum, r) => {
                const p = r.projects[proj];
                if (!p) return sum;
                return {
                    consumedHours: sum.consumedHours + p.consumedHours,
                    cost: sum.cost + p.cost,
                    proposedHours: sum.proposedHours + p.proposedHours,
                    pnlHours: sum.pnlHours + p.pnlHours,
                    pnlCost: sum.pnlCost + p.pnlCost,
                    dicsounted_cost: sum.dicsounted_cost + p.dicsounted_cost || 0
                };
            },
            { consumedHours: 0, cost: 0, proposedHours: 0, pnlHours: 0, pnlCost: 0, dicsounted_cost: 0 }
        );
        return acc;
    }, {} as Record<string, ProjectMetrics>);

    return (
        <TableContainer component={Paper} className="tableContainer">
            <Table>
                <TableHead>
                    <TableRow className="tableHeader">
                        <TableCell className="tableCell" rowSpan={2}>
                            #
                        </TableCell>
                        <TableCell className="tableCell" rowSpan={2}>
                            Resource
                        </TableCell>
                        <TableCell className="tableCell" rowSpan={2}>
                            Rate (per hour)
                        </TableCell>
                        {allProjects.map((proj) => (
                            <TableCell key={proj} className="tableCell" colSpan={2} align="center">
                                {proj}
                            </TableCell>
                        ))}
                    </TableRow>

                    <TableRow className="subHeader">
                        {allProjects.map((proj) => (
                            <React.Fragment key={proj}>
                                <TableCell className="tableCell" align="right">
                                    Hours
                                </TableCell>
                                <TableCell className="tableCell" align="right">
                                    Cost
                                </TableCell>
                            </React.Fragment>
                        ))}
                    </TableRow>
                </TableHead>

                <TableBody>
                    {resources.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((r, idx) => (
                        <TableRow key={idx} className="tableBodyRow">
                            <TableCell className="tableCell">{idx + 1}</TableCell>
                            <TableCell className="tableCell">{r.name}</TableCell>
                            <TableCell className="tableCell">{r.rate}</TableCell>
                            {allProjects.map((proj) => {
                                const p = r.projects[proj] || { consumedHours: 0, cost: 0, proposedHours: 0, pnlHours: 0, pnlCost: 0 };
                                return (
                                    <React.Fragment key={proj}>
                                        <TableCell className="tableCell" align="right">
                                            {p.consumedHours}
                                        </TableCell>
                                        <TableCell className="tableCell" align="right">
                                            {p.cost}
                                        </TableCell>
                                    </React.Fragment>
                                );
                            })}
                        </TableRow>
                    ))}

                    {/* Totals */}
                    <TableRow className="totalRow">
                        <TableCell colSpan={3} className="tableCell">
                            Total Hours & Cost Utilized
                        </TableCell>
                        {allProjects.map((proj) => (
                            <React.Fragment key={proj}>
                                <TableCell className="tableCell" align="right">
                                    {projectTotals[proj]?.consumedHours || 0}
                                </TableCell>
                                <TableCell className="tableCell" align="right">
                                    {projectTotals[proj]?.cost || 0}
                                </TableCell>
                            </React.Fragment>
                        ))}
                    </TableRow>

                    {/* Proposed */}
                    <TableRow className="proposedRow">
                        <TableCell colSpan={3} className="tableCell">
                            Total Hours Proposed
                        </TableCell>
                        {allProjects.map((proj) => (
                            <React.Fragment key={proj}>
                                <TableCell className="tableCell" align="right">
                                    {projectTotals[proj]?.proposedHours || 0}
                                </TableCell>
                                <TableCell className="tableCell" align="right">
                                    {projectTotals[proj]?.dicsounted_cost || 0}
                                </TableCell>
                            </React.Fragment>
                        ))}
                    </TableRow>

                    {/* PnL */}
                    <TableRow className="pnlRow">
                        <TableCell colSpan={3} className="tableCell">
                            PnL
                        </TableCell>
                        {allProjects.map((proj) => {
                            const pnlHours = (projectTotals[proj]?.proposedHours || 0) - (projectTotals[proj]?.consumedHours || 0);
                            const pnlCost = (projectTotals[proj]?.dicsounted_cost || 0) - (projectTotals[proj]?.cost || 0);
                            return (
                                <React.Fragment key={proj}>
                                    <TableCell className="tableCell" align="right">
                                        {pnlHours}
                                    </TableCell>
                                    <TableCell className="tableCell" align="right">
                                        {pnlCost}
                                    </TableCell>
                                </React.Fragment>
                            );
                        })}
                    </TableRow>
                </TableBody>
            </Table>

            <TablePagination
                component="div"
                count={resources.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </TableContainer>
    );
};

export default ResourceTable;

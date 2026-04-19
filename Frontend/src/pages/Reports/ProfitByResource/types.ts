// types.ts
export type ProjectMetrics = {
    consumedHours: number;
    cost: number;
    proposedHours: number;
    pnlHours: number;
    pnlCost: number;
    dicsounted_cost : any
};

export type Resource = {
    name: string;
    rate: number;
    department: string;
    projects: Record<string, ProjectMetrics>;
};

export type ProposedHours = Record<string, number>;

export type APIProjectEntry = {
    consumedHours: number;
    cost: number;
    proposedHours: number;
    pnlHours: number;
    pnlCost: number;
};

export type APIResourceEntry = {
    resourceName: string;
    rate: number;
    departmentId: string;
    projects: Record<string, APIProjectEntry>;
};

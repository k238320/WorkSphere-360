import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExternalService {
  constructor(private prisma: PrismaService) {}

  async getTeams(teamName?: string, email?: string) {
    const departmentFilter: any = {};
    const resourceFilter: any = {};

    // Filter by team name
    if (teamName) {
      departmentFilter.name = teamName;
    }

    // Filter by resource email
    if (email) {
      resourceFilter.user = {
        some: { email },
      };
    }

    const departments = await this.prisma.department.findMany({
      where: {
        ...departmentFilter,
        status: true,
      },
      include: {
        resource: {
          where: {
            status: true,
            ...resourceFilter,
            user: {
              some: {
                user_details: {
                  none: {
                    resignation_status: true,
                  },
                },
              },
            },
          },
          include: {
            user: true,
          },
        },
      },
    });

    const formatted = departments.map((dept) => ({
      teamId: dept.id,
      teamName: dept.name,
      resourceCount: dept.resource.length,
      resources: dept.resource.map((r) => {
        const user = r.user && r.user.length > 0 ? r.user[0] : null;
        return {
          resourceId: r.id,
          name: r.name,
          email: user?.email ?? '',
          designation: user?.designation ?? '-',
          isTeamLead: r.is_team_lead === true,
          isAssistantTeamLead: r.is_atl === true,
        };
      }),
    }));

    return {
      teamCount: formatted.length,
      teams: formatted,
    };
  }

  // async getDashboard(
  //   teamName?: string,
  //   email?: string,
  //   includeDates = false,
  //   startDate?: string,
  //   endDate?: string,
  // ) {
  //   // Default to current year's start and end
  //   const now = new Date();
  //   const year = now.getFullYear();
  //   const start = startDate ? new Date(startDate) : new Date(`${year}-01-01`);
  //   const end = endDate ? new Date(endDate) : new Date(`${year}-12-31`);

  //   // Fetch gazetted holidays within range
  //   const holidays = await this.prisma.holidays.findMany({
  //     where: {
  //       date: {
  //         gte: start,
  //         lte: end,
  //       },
  //     },
  //   });

  //   // Build department filter
  //   const deptFilter: any = { status: true };
  //   if (teamName) deptFilter.name = teamName;

  //   // Build resource filter
  //   const resourceFilter: any = { status: true };
  //   if (email) resourceFilter.user = { some: { email } };

  //   const departments = await this.prisma.department.findMany({
  //     where: deptFilter,
  //     include: {
  //       resource: {
  //         where: resourceFilter,
  //         include: {
  //           user: {
  //             include: {
  //               emp_attendance: {
  //                 where: {
  //                   created_at: {
  //                     gte: start,
  //                     lte: end,
  //                   },
  //                   OR: [
  //                     {
  //                       is_fullday: true,
  //                       is_leave: false
  //                     },
  //                     {
  //                       is_halfday: true,
  //                       is_leave: false
  //                     }
  //                   ]
  //                 }
  //               }
  //             }
  //           },
  //           emp_leaves: true,
  //         },
  //       },
  //     },
  //   });

  //   // Format departments
  //   const formattedTeams = departments.map((dept) => ({
  //     teamId: dept.id,
  //     teamName: dept.name,
  //     resourceCount: dept.resource.length,

  //     resources: dept.resource.map((r) => {
  //       const user = r.user && r.user.length > 0 ? r.user[0] : null;

  //       const formalLeaves = r.emp_leaves
  //         .filter(
  //           (l) =>
  //             l.leave_status === 'APPROVED' &&
  //             l.start_date <= end &&
  //             l.end_date >= start,
  //         )
  //         .map((l) => ({
  //           start: l.start_date.toISOString().split('T')[0],
  //           end: l.end_date.toISOString().split('T')[0],
  //           totalDays: l.leave_count ?? 1,
  //           leaveType: l.leaveTypeId ?? 'N/A',
  //           source: 'formal'
  //         }));

  //       const attendanceLeaves = (user?.emp_attendance || [])
  //         .map((att) => {
  //           let totalDays = 0;
  //           let leaveType = '';
  //           let priority = 0;

  //           // Then check full day
  //            if (att.is_fullday) {
  //             totalDays = 1;
  //             leaveType = 'Full Day Off';
  //             priority = 2;
  //           }
  //           // Then check half day
  //           else if (att.is_halfday) {
  //             totalDays = 0.5;
  //             leaveType = 'Half Day';
  //             priority = 1;
  //           }

  //           return {
  //             start: att.created_at.toISOString().split('T')[0],
  //             end: att.created_at.toISOString().split('T')[0],
  //             totalDays: totalDays,
  //             leaveType: leaveType,
  //             priority: priority,
  //             source: 'attendance'
  //           };
  //         })
  //         .filter(l => l.totalDays > 0);

  //       // Deduplicate by date - keep highest priority entry for each date
  //       const dedupedAttendanceLeaves = Array.from(
  //         attendanceLeaves.reduce((map, leave) => {
  //           const existing = map.get(leave.start);
  //           if (!existing || leave.priority > existing.priority) {
  //             map.set(leave.start, leave);
  //           }
  //           return map;
  //         }, new Map())
  //       ).map(([_, leave]) => {
  //         const { priority, ...leaveWithoutPriority } = leave;  // Remove priority from output
  //         return leaveWithoutPriority;
  //       });

  //       // 3. Merge both sources (availed leaves only - past or current)
  //       const allAvailedLeaves = [
  //         ...formalLeaves.filter(l => new Date(l.start) <= now),
  //         ...dedupedAttendanceLeaves.filter(l => new Date(l.start) <= now)
  //       ];

  //       // 4. Merge planned leaves (future only)
  //       const allPlannedLeaves = [
  //         ...formalLeaves.filter(l => new Date(l.start) > now),
  //         ...dedupedAttendanceLeaves.filter(l => new Date(l.start) > now)
  //       ];

  //       return {
  //         resourceId: r.id,
  //         name: r.name,
  //         email: user?.email ?? '',
  //         designation: user?.designation ?? '-',
  //         isTeamLead: r.is_team_lead === true,
  //         isAssistantTeamLead: r.is_atl === true,
  //         availed: {
  //           count: allAvailedLeaves.reduce((sum, l) => sum + l.totalDays, 0),
  //           dates: allAvailedLeaves,
  //         },
  //         planned: {
  //           count: allPlannedLeaves.reduce((sum, l) => sum + l.totalDays, 0),
  //           dates: allPlannedLeaves,
  //         },
  //       };
  //     }),
  //   }));

  //   return {
  //     startdate: start.toISOString().split('T')[0],
  //     enddate: end.toISOString().split('T')[0],
  //     gazettedholidays: holidays.map((h) => ({
  //       id: h.id,
  //       title: h.title,
  //       date: h.date.toISOString().split('T')[0],
  //     })),
  //     teams: formattedTeams,
  //   };
  // }

  // async getDashboard(
  //   teamName?: string,
  //   email?: string,
  //   includeDates = false,
  //   startDate?: string,
  //   endDate?: string,
  // ) {
  //   const now = new Date();
  //   const year = now.getFullYear();
  //   const start = startDate ? new Date(startDate) : new Date(`${year}-01-01`);
  //   const end = endDate ? new Date(endDate) : new Date(`${year}-12-31`);

  //   // Fetch gazetted holidays
  //   const holidays = await this.prisma.holidays.findMany({
  //     where: { date: { gte: start, lte: end } },
  //   });

  //   // Department filter
  //   const deptFilter: any = { status: true };
  //   if (teamName) deptFilter.name = teamName;

  //   // Resource filter
  //   const resourceFilter: any = { status: true };
  //   if (email) resourceFilter.user = { some: { email } };

  //   const departments = await this.prisma.department.findMany({
  //     where: deptFilter,
  //     include: {
  //       resource: {
  //         where: resourceFilter,
  //         include: {
  //           user: {
  //             include: {
  //               emp_attendance: {
  //                 where: {
  //                   created_at: {
  //                     gte: start,
  //                     lte: end,
  //                   },
  //                   is_leave: false,
  //                   OR: [
  //                     {
  //                       is_fullday: true,
  //                     },
  //                     {
  //                       is_halfday: true,
  //                     },
  //                   ],
  //                 },
  //               },
  //             },
  //           },
  //           emp_leaves: true,
  //         },
  //       },
  //     },
  //   });

  //   console.log('departments :', JSON.stringify(departments, null, 2));

  //   // Format teams & resources
  //   const formattedTeams = departments.map((dept) => ({
  //     teamId: dept.id,
  //     teamName: dept.name,
  //     resourceCount: dept.resource.length,
  //     resources: dept.resource.map((r) => {
  //       const user = r.user?.[0] ?? null;

  //       const formalLeaves = r.emp_leaves
  //         .filter(
  //           (l) =>
  //             l.leave_status === 'APPROVED' &&
  //             l.leaveTypeId &&
  //             l.start_date <= end &&
  //             l.end_date >= start,
  //         )
  //         .map((l) => ({
  //           start: l.start_date.toISOString().split('T')[0],
  //           end: l.end_date.toISOString().split('T')[0],
  //           totalDays: l.leave_count ?? 1,
  //           leaveType: l.leaveTypeId ?? 'N/A',
  //           source: 'formal',
  //         }));
  //       // Get Full Day Off / Half Day from emp_attendance
  //       const attendanceLeaves = (user?.emp_attendance || []).map((att) => ({
  //         start: att.created_at.toISOString().split('T')[0],
  //         end: att.created_at.toISOString().split('T')[0],
  //         totalDays: att.is_fullday ? 1 : 0.5,
  //         leaveType: att.is_fullday ? 'Full Day Off' : 'Half Day',
  //         source: 'attendance',
  //       }));

  //       const allAvailedLeaves = [
  //         ...formalLeaves.filter((l) => new Date(l.start) <= now),
  //         ...attendanceLeaves.filter((l) => new Date(l.start) <= now),
  //       ];
  //       const allPlannedLeaves = [
  //         ...formalLeaves.filter((l) => new Date(l.start) > now),
  //         ...attendanceLeaves.filter((l) => new Date(l.start) > now),
  //       ];
  //       return {
  //         resourceId: r.id,
  //         name: r.name,
  //         email: user?.email ?? '',
  //         designation: user?.designation ?? '-',
  //         isTeamLead: r.is_team_lead === true,
  //         isAssistantTeamLead: r.is_atl === true,
  //         availed: {
  //           count: allAvailedLeaves.reduce((sum, l) => sum + l.totalDays, 0),
  //           dates: allAvailedLeaves,
  //         },
  //         planned: {
  //           count: allPlannedLeaves.reduce((sum, l) => sum + l.totalDays, 0),
  //           dates: allPlannedLeaves,
  //         },
  //       };
  //     }),
  //   }));

  //   return {
  //     startdate: start.toISOString().split('T')[0],
  //     enddate: end.toISOString().split('T')[0],
  //     gazettedholidays: holidays.map((h) => ({
  //       id: h.id,
  //       title: h.title,
  //       date: h.date.toISOString().split('T')[0],
  //     })),
  //     teams: formattedTeams,
  //   };
  // }


  async getDashboard(
    teamName?: string,
    email?: string,
    includeDates = false,
    startDate?: string,
    endDate?: string,
  ) {
    const now = new Date();
    const year = now.getFullYear();
    const start = startDate ? new Date(startDate) : new Date(`${year}-01-01`);
    const end = endDate ? new Date(endDate) : new Date(`${year}-12-31`);
    end.setHours(23, 59, 59, 999); 

    // Fetch gazetted holidays
    const holidays = await this.prisma.holidays.findMany({
      where: { date: { gte: start, lte: end } },
    });
  
    // Department filter
    const deptFilter: any = { status: true };
    if (teamName) deptFilter.name = teamName;
  
    // Resource filter
    const resourceFilter: any = { status: true };
    if (email) resourceFilter.user = { some: { email } };
  
    const departments = await this.prisma.department.findMany({
      where: deptFilter,
      include: {
        resource: {
          where: resourceFilter,
          include: {
            user: true,
            emp_leaves: true,
          },
        },
      },
    });
  
    // Get all employee codes
    const allEmpCodes = departments
      .flatMap((d) => d.resource)
      .flatMap((r) => r.user)
      .map((u) => u?.employement_code)
      .filter(Boolean) as string[];
  
    // Fetch attendance records separately (bypassing broken Prisma relation)
    const attendanceRecords = await this.prisma.emp_attendance.findMany({
      where: {
        emp_code: { in: allEmpCodes },
        created_at: { gte: start, lte: end },
        is_leave: false,
        OR: [{ is_fullday: true }, { is_halfday: true }],
      },
    });


    // Group attendance by emp_code
    const attendanceByEmpCode: Record<string, typeof attendanceRecords> = {};
    for (const att of attendanceRecords) {
      if (!att.emp_code) continue;
      if (!attendanceByEmpCode[att.emp_code]) {
        attendanceByEmpCode[att.emp_code] = [];
      }
      attendanceByEmpCode[att.emp_code].push(att);
    }

    console.log("attendanceByEmpCode", attendanceByEmpCode)

  
    // Format teams & resources
    const formattedTeams = departments.map((dept) => ({
      teamId: dept.id,
      teamName: dept.name,
      resourceCount: dept.resource.length,
      resources: dept.resource.map((r) => {
        const user = r.user?.[0] ?? null;
        const empCode = user?.employement_code ?? '';
  
        // Formal leaves from emp_leaves
        const formalLeaves = r.emp_leaves
          .filter(
            (l) =>
              l.leave_status === 'APPROVED' &&
              l.leaveTypeId &&
              l.start_date <= end &&
              l.end_date >= start,
          )
          .map((l) => ({
            start: l.start_date.toISOString().split('T')[0],
            end: l.end_date.toISOString().split('T')[0],
            totalDays: l.leave_count ?? 1,
            leaveType: l.leaveTypeId ?? 'N/A',
            source: 'formal',
          }));
  
        // Attendance leaves (Full Day Off / Half Day)
        const attendanceLeaves = (attendanceByEmpCode[empCode] || []).map((att) => ({
          start: att.created_at.toISOString().split('T')[0],
          end: att.created_at.toISOString().split('T')[0],
          totalDays: att.is_fullday ? 1 : 0.5,
          leaveType: att.is_fullday ? 'Full Day Off' : 'Half Day',
          source: 'attendance',
        }));
  
        // Merge and split by availed/planned
        const allAvailedLeaves = [
          ...formalLeaves.filter((l) => new Date(l.start) <= now),
          ...attendanceLeaves.filter((l) => new Date(l.start) <= now),
        ];
        const allPlannedLeaves = [
          ...formalLeaves.filter((l) => new Date(l.start) > now),
          ...attendanceLeaves.filter((l) => new Date(l.start) > now),
        ];
  
        return {
          resourceId: r.id,
          name: r.name,
          email: user?.email ?? '',
          designation: user?.designation ?? '-',
          isTeamLead: r.is_team_lead === true,
          isAssistantTeamLead: r.is_atl === true,
          availed: {
            count: allAvailedLeaves.reduce((sum, l) => sum + l.totalDays, 0),
            dates: allAvailedLeaves,
          },
          planned: {
            count: allPlannedLeaves.reduce((sum, l) => sum + l.totalDays, 0),
            dates: allPlannedLeaves,
          },
        };
      }),
    }));
  
    return {
      startdate: start.toISOString().split('T')[0],
      enddate: end.toISOString().split('T')[0],
      gazettedholidays: holidays.map((h) => ({
        id: h.id,
        title: h.title,
        date: h.date.toISOString().split('T')[0],
      })),
      teams: formattedTeams,
    };
  }
}

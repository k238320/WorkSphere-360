import { PrismaService } from './../prisma/prisma.service';
import { Injectable, HttpStatus } from '@nestjs/common';
import { handlePrismaError, handleSuccessResponse } from 'src/utils';
import { parseData } from 'src/utils/parseFilters';
import * as moment from 'moment';

@Injectable()
export class ProjectMilestoneService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    try {
      const projectMilestone = await this.prisma.project_milestone.create({
        data: {
          milestone_phase_id: dto.milestone_phase_id,
          milestone_payment: dto.milestone_payment,
          targeted_month: dto.targeted_month,
          project_id: dto.project_id,
          role_id: dto.role_id,
          user_id: dto.user_id,
          delay_time: dto.delay_time,
          payment_recieved: false,
          invoice: false,
        },
      });
      return handleSuccessResponse(
        'Success',
        HttpStatus.CREATED,
        projectMilestone,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async findOne(projectId: string) {
    try {
      const projectMilestone = await this.prisma.project_milestone.findMany({
        where: { project_id: projectId },
        select: {
          id: true,
          milestone_phase: { select: { id: true, name: true } },
          milestone_payment: true,
          targeted_month: true,
          invoice: true,
          invoice_date: true,
          payment_recieved: true,
          payment_recieved_date: true,
          role_id: true,
          onhold: true,
          document: true,
          delay_time: true,
          is_initial_amount: true,
          is_upsell: true,
        },
      });

      return handleSuccessResponse('', HttpStatus.OK, projectMilestone);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  calculateMilestoneStatus(milestone) {
    const targetedMonth = moment(milestone.targeted_month);
    const currentDate = moment();
    const invoiceSendDate = milestone.invoice_date
      ? moment(milestone.invoice_date)
      : null;

    let statusText = '';
    let statusColor = '';
    let delayDays = 0;

    const isAchievedOnTime =
      invoiceSendDate && targetedMonth.isSameOrAfter(invoiceSendDate, 'month');

    const isDelayed =
      (targetedMonth.isBefore(currentDate, 'month') &&
        invoiceSendDate?.isBefore(currentDate, 'month')) ||
      milestone.delay_time ||
      (targetedMonth.isBefore(currentDate, 'month') && !milestone.invoice) ||
      targetedMonth.isBefore(currentDate, 'month');

    const isInProgress =
      targetedMonth.isSame(currentDate, 'month') ||
      targetedMonth.isAfter(currentDate, 'month');

    if (isDelayed) {
      delayDays = invoiceSendDate
        ? invoiceSendDate.diff(targetedMonth, 'days')
        : currentDate.diff(targetedMonth, 'days');
    }

    if (isAchievedOnTime) {
      statusText = 'Achieved';
      statusColor = '#2ECC71';
    } else if (isInProgress) {
      statusText = 'In Progress';
      statusColor = '#F1C40F';
    } else if (isDelayed) {
      if (isNaN(delayDays)) {
        statusText = `Delayed`;
        statusColor = '#E74C3C';
      } else {
        statusText = `${
          invoiceSendDate ? 'Achieved' : 'Delayed'
        } (${delayDays} days)`;
        statusColor = '#E74C3C';
      }
    } else {
      statusText = 'N/A';
      statusColor = '#B0B0B0';
    }

    return { statusText, statusColor, delayDays };
  }

  calculateMilestoneStatusPaymentWise(milestone) {
    const targetedMonth = moment(milestone.targeted_month);
    const currentDate = moment();
    const paymentReceivedDate = milestone.payment_recieved_date
      ? moment(milestone.payment_recieved_date)
      : null;

    let statusText = '';
    let statusColor = '';
    let delayDays = 0;

    const isAchievedOnTime =
      paymentReceivedDate &&
      targetedMonth.isSameOrAfter(paymentReceivedDate, 'month');

    const isDelayed =
      (targetedMonth.isBefore(currentDate, 'month') &&
        paymentReceivedDate?.isBefore(currentDate, 'month')) ||
      milestone.delay_time ||
      (targetedMonth.isBefore(currentDate, 'month') &&
        !milestone.payment_recieved) ||
      targetedMonth.isBefore(currentDate, 'month');

    const isInProgress =
      targetedMonth.isSame(currentDate, 'month') ||
      targetedMonth.isAfter(currentDate, 'month');

    if (isDelayed) {
      delayDays = paymentReceivedDate
        ? paymentReceivedDate.diff(targetedMonth, 'days')
        : currentDate.diff(targetedMonth, 'days');
    }

    if (isAchievedOnTime) {
      statusText = 'Achieved';
      statusColor = '#2ECC71';
    } else if (isInProgress) {
      statusText = 'In Progress';
      statusColor = '#F1C40F';
    } else if (isDelayed) {
      if (isNaN(delayDays)) {
        statusText = `Delayed`;
        statusColor = '#E74C3C';
      } else {
        statusText = `${
          paymentReceivedDate ? 'Achieved' : 'Delayed'
        } (${delayDays} days)`;
        statusColor = '#E74C3C';
      }
    } else {
      statusText = 'N/A';
      statusColor = '#B0B0B0';
    }

    return { statusText, statusColor, delayDays };
  }
  filterMilestones(milestones) {
    return milestones.filter(
      (milestone) =>
        !milestone.onhold || Object.keys(milestone.onhold).length === 0,
    );
  }

  calculateMilestoneStats(milestones, filterMonth, isMonthlyFilter) {
    const currentDate = moment();
    let milestonesAchievedOnTime = 0;
    let milestonesInProgress = 0;
    let milestonesDelayed = 0;
    let previousDue = 0;

    const filteredMilestones = milestones.filter(
      (milestone) =>
        (milestone.is_upsell !== undefined && milestone.is_upsell) ||
        (milestone.is_initial_amount !== undefined &&
          milestone.is_initial_amount),
    );

    const upsellCount = filteredMilestones?.reduce(
      (total, milestone) =>
        milestone.is_upsell === true && !milestone.delay_month
          ? total + milestone.milestone_payment
          : total,
      0,
    );

    const initialPaymentCount = filteredMilestones?.reduce(
      (total, milestone) =>
        milestone.is_initial_amount === true && !milestone.delay_month
          ? total + milestone.milestone_payment
          : total,
      0,
    );

    const paymentRecieved = milestones?.reduce((total, milestone) => {
      const delayTime = milestone.delay_time
        ? moment(milestone.delay_time)
        : null;
      return milestone.payment_recieved === true &&
        milestone.payment_recieved_date !== '' &&
        !milestone.delay_month &&
        (!delayTime || delayTime.isSameOrAfter(currentDate, 'month'))
        ? total + milestone.milestone_payment
        : total;
    }, 0);

    milestones.forEach((milestone) => {
      if (!milestone.milestone_payment) return;

      const delayTime = milestone.delay_time
        ? moment(milestone.delay_time)
        : null;
      const targetedMonth = moment(milestone.targeted_month);

      const currentMonth =
        filterMonth && moment(filterMonth).isValid()
          ? moment(filterMonth)
          : moment();

      if (
        delayTime &&
        !targetedMonth.isSame(currentMonth, 'month') &&
        !targetedMonth.isSame(delayTime, 'month') &&
        targetedMonth.isBefore(delayTime, 'month') &&
        isMonthlyFilter
      ) {
        previousDue += milestone.milestone_payment;
        return;
      }

      const { statusText } = this.calculateMilestoneStatus(milestone);

      if (statusText.startsWith('Achieved')) {
        milestonesAchievedOnTime += milestone.milestone_payment;
      } else if (statusText.startsWith('Delayed')) {
        milestonesDelayed += milestone.milestone_payment;
      } else if (statusText === 'In Progress') {
        milestonesInProgress += milestone.milestone_payment;
      }
    });

    if (isMonthlyFilter) {
      return {
        milestonesAchievedOnTime,
        milestonesInProgress,
        milestonesDelayed,
        upsellCount,
        initialPaymentCount,
        paymentRecieved,
        previousDue,
      };
    }

    return {
      milestonesAchievedOnTime,
      milestonesInProgress,
      milestonesDelayed,
      upsellCount,
      initialPaymentCount,
      paymentRecieved,
    };
  }

  async findAll(query) {
    try {
      const permissions = await this.prisma.project_permissions.findMany({
        where: { user_id: query?.user_id },
      });

      if (!permissions?.length) {
        return handleSuccessResponse('', HttpStatus.OK, { rows: [], count: 0 });
      }

      const hasSuperPermission = permissions.some(
        (permission) => permission.super,
      );
      const pdf = query?.pdf;
      const obj = [];
      const filter = parseData(query?.$filter, obj);
      let where: any = {};

      let isMonthlyFilter = false;
      let monthFilterValue = null;

      let targetedMonthFilter = null;
      if (filter?.length > 0) {
        filter.forEach((f) => {
          if (f?.columnName === 'invoice') {
            if (f?.value?.contains?.toLowerCase() === 'sent') {
              where = { ...where, invoice: true };
            } else if (f?.value?.contains?.toLowerCase() === 'pending') {
              where = { ...where, OR: [{ invoice: null }, { invoice: false }] };
            }
          } else if (f?.columnName === 'payment_recieved') {
            if (f?.value?.contains?.toLowerCase() === 'received') {
              where = { ...where, payment_recieved: true };
            } else if (f?.value?.contains?.toLowerCase() === 'pending') {
              where = { ...where, payment_recieved: false };
            }
          } else if (f?.columnName === 'targeted_month') {
            const dateValue = f.value?.contains;
            isMonthlyFilter = true;
            if (dateValue) {
              const date = moment(dateValue).utc(false);

              monthFilterValue = {
                gte: date.startOf('month').toISOString(),
                lt: date.endOf('month').toISOString(),
              };

              targetedMonthFilter = {
                gte: moment.utc(date).startOf('month').toISOString(),
                lt: moment.utc(date).endOf('month').toISOString(),
              };
            }
          } else if (f?.columnName === 'delay_time') {
            const dateValue = f.value?.contains;
            if (dateValue) {
              const date = moment(dateValue).utc(false);
              monthFilterValue = {
                gte: date.startOf('month').toISOString(),
                lt: date.endOf('month').toISOString(),
              };

              where = {
                ...where,
                delay_time: {
                  gte: date.startOf('month').toISOString(),
                  lt: date.endOf('month').toISOString(),
                },
              };
            }
          } else if (f.columnName === 'project_manager_details') {
            query.project_manager_details = {
              [f.filter]: f.value.contains,
              mode: f.value.mode,
            };
          } else {
            where = {
              ...where,
              [f?.columnName]: {
                name: { [f?.filter]: f?.value?.contains, mode: 'insensitive' },
              },
            };
          }
        });
      } else {
        const date = moment().utc(false);

        monthFilterValue = {
          gte: date.startOf('year').toISOString(),
          lt: date.endOf('year').toISOString(),
        };
        where = {
          ...where,
          targeted_month: {
            gte: date.startOf('year').toISOString(),
            lt: date.endOf('year').toISOString(),
          },
        };
      }

      if (targetedMonthFilter) {
        where = {
          AND: [
            where,
            {
              OR: [
                { targeted_month: targetedMonthFilter },
                { delay_time: targetedMonthFilter },
              ],
            },
          ],
        };
      }

      let selectedMonth = null;
      if (isMonthlyFilter && monthFilterValue?.gte) {
        selectedMonth = moment(monthFilterValue.gte).format('YYYY-MM');
      }

      let monthResult;
      if (monthFilterValue) {
        const startDate = moment(monthFilterValue.gte);
        const endDate = moment(monthFilterValue.lt).subtract(1, 'day');

        monthResult = `${startDate.format('DD MMMM YYYY')} - ${endDate.format(
          'DD MMMM YYYY',
        )}`;
      }

      const selectFields = {
        id: true,
        milestone_phase: { select: { id: true, name: true } },
        milestone_payment: true,
        targeted_month: true,
        invoice: true,
        invoice_date: true,
        payment_recieved: true,
        payment_recieved_date: true,
        project: {
          select: {
            id: true,
            name: true,
            kickoff_date: true,
            project_hours: true,
            project_consumed_hours: true,
            project_manager_details: true,
            project_status: {
              select: {
                id: true,
                days_delayed: true,
                created_at: true,
                comment: true,
                project_statuses: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              orderBy: {
                created_at: 'desc' as const,
              },
              take: 5,
            },
          },
        },
        document: true,
        created_at: true,
        delay_time: true,
        onhold: true,
        is_initial_amount: true,
        is_upsell: true,
      };

      if (hasSuperPermission) {
        let projectMilestone = await this.prisma.project_milestone.findMany({
          select: selectFields,
          ...(pdf || query?.project_manager_details
            ? {}
            : { take: +query?.$top, skip: +query?.$skip }),
          where,
          orderBy: { created_at: 'desc' },
        });

        projectMilestone = this.filterMilestones(projectMilestone);

        if (!query?.project_manager_details) {
          const milestones = this.filterMilestones(
            await this.prisma.project_milestone.findMany({ where }),
          );
          const {
            milestonesAchievedOnTime,
            milestonesInProgress,
            milestonesDelayed,
            upsellCount,
            initialPaymentCount,
            paymentRecieved,
            previousDue,
          } = this.calculateMilestoneStats(
            milestones,
            selectedMonth,
            isMonthlyFilter,
          );

          const milestonesWithStatus = projectMilestone.map((milestone) => {
            const { statusText, statusColor, delayDays } =
              this.calculateMilestoneStatus(milestone);
            return {
              ...milestone,
              statusText,
              statusColor,
              delayDays,
            };
          });

          return handleSuccessResponse('Success', HttpStatus.OK, {
            rows: milestonesWithStatus,
            count: milestones.length,
            milestonePaymentCount: milestones.length,
            milestoneCost:
              milestonesInProgress +
              milestonesDelayed +
              milestonesAchievedOnTime,
            inProgress: milestonesInProgress,
            delay: milestonesDelayed,
            achieveOnTime: milestonesAchievedOnTime,
            upsellCount,
            initialPaymentCount,
            paymentRecieved,
            monthResult,
            previousDue,
          });
        }

        if (query?.project_manager_details) {
          const filteredProjects = projectMilestone?.filter((milestone) => {
            const projectsDetails =
              milestone?.project?.project_manager_details || [];

            if (!Array.isArray(projectsDetails)) return false;

            const filterValue = query?.project_manager_details?.contains;

            return projectsDetails.find((pm: any) => pm?.id === filterValue);
          });

          const {
            milestonesAchievedOnTime,
            milestonesInProgress,
            milestonesDelayed,
            upsellCount,
            initialPaymentCount,
            paymentRecieved,
            previousDue,
          } = this.calculateMilestoneStats(
            filteredProjects,
            selectedMonth,
            isMonthlyFilter,
          );

          const milestonesWithStatus = filteredProjects.map((milestone) => {
            const { statusText, statusColor, delayDays } =
              this.calculateMilestoneStatus(milestone);
            return {
              ...milestone,
              statusText,
              statusColor,
              delayDays,
            };
          });

          return handleSuccessResponse('Success', HttpStatus.OK, {
            rows: milestonesWithStatus,
            count: filteredProjects.length,
            milestonePaymentCount: filteredProjects.length,
            milestoneCost:
              milestonesInProgress +
              milestonesDelayed +
              milestonesAchievedOnTime,
            inProgress: milestonesInProgress,
            delay: milestonesDelayed,
            achieveOnTime: milestonesAchievedOnTime,
            upsellCount,
            initialPaymentCount,
            paymentRecieved,
            monthResult,
            previousDue,
          });
        }
      }

      const projectIds = permissions.map((permission) => permission.project_id);
      let projectMilestone = await this.prisma.project_milestone.findMany({
        select: selectFields,
        ...(!pdf && { take: +query?.$top, skip: +query?.$skip }),
        where: { project_id: { in: projectIds }, ...where },
        orderBy: { created_at: 'desc' },
      });

      projectMilestone = this.filterMilestones(projectMilestone);
      const milestones = this.filterMilestones(
        await this.prisma.project_milestone.findMany({
          where: { project_id: { in: projectIds }, ...where },
        }),
      );

      const {
        milestonesAchievedOnTime,
        milestonesInProgress,
        milestonesDelayed,
        upsellCount,
        initialPaymentCount,
        paymentRecieved,
        previousDue,
      } = this.calculateMilestoneStats(
        milestones,
        selectedMonth,
        isMonthlyFilter,
      );

      const milestonesWithStatus = projectMilestone.map((milestone) => {
        const { statusText, statusColor, delayDays } =
          this.calculateMilestoneStatus(milestone);
        return {
          ...milestone,
          statusText,
          statusColor,
          delayDays,
        };
      });

      return handleSuccessResponse('Success', HttpStatus.OK, {
        rows: milestonesWithStatus,
        count: milestones.length,
        milestonePaymentCount: milestones.length,
        milestoneCost:
          milestonesInProgress + milestonesDelayed + milestonesAchievedOnTime,
        inProgress: milestonesInProgress,
        delay: milestonesDelayed,
        achieveOnTime: milestonesAchievedOnTime,
        upsellCount,
        initialPaymentCount,
        paymentRecieved,
        monthResult,
        previousDue,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(id: string, dto: any) {
    try {
      const projectMilestone = await this.prisma.project_milestone.update({
        where: { id: id },
        data: {
          milestone_phase_id: dto.milestone_phase_id,
          milestone_payment: dto.milestone_payment,
          targeted_month: dto.targeted_month,
          invoice: dto.invoice,
          invoice_date: dto.invoice_date,
          payment_recieved: dto.payment_recieved,
          payment_recieved_date: dto.payment_recieved_date,
          document: dto.document,
          delay_time: dto.delay_time,
          is_upsell: dto.is_upsell,
          is_initial_amount: dto.is_initial_amount,
        },
      });

      return handleSuccessResponse('Success', HttpStatus.OK, projectMilestone);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateTargetMonth(id: string, dto: any) {
    try {
      const prevMileStone = await this.prisma.project_milestone.findUnique({
        where: {
          id: id,
        },
      });
      const projectMilestone = await this.prisma.project_milestone.update({
        where: { id: id },
        data: {
          milestone: [
            ...dto?.mileStones,
            ...((prevMileStone?.milestone as []) ?? []),
          ],
          targeted_month: dto?.targeted_month,
          // onhold: [...dto?.onhold, ...((prevMileStone?.onhold as []) ?? [])],
        },
      });

      return handleSuccessResponse(
        'Success ok',
        HttpStatus.OK,
        projectMilestone,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async updateOnHold(id: string, dto: any) {
    try {
      const prevMileStone = await this.prisma.project_milestone.findUnique({
        where: {
          id: id,
        },
      });
      const onHoldUpdated = await this.prisma.project_milestone.update({
        where: { id: id },
        data: {
          onhold: [...dto?.onhold, ...((prevMileStone?.onhold as []) ?? [])],
        },
      });

      return handleSuccessResponse('Success ok', HttpStatus.OK, onHoldUpdated);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async getTargetMonthHistry(id: string) {
    try {
      const projectMilestone = await this.prisma.project_milestone.findUnique({
        where: { id: id },
      });

      return handleSuccessResponse(
        'Success ok',
        HttpStatus.OK,
        projectMilestone,
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      // Delete related milestone comments first
      await this.prisma.milestone_comment.deleteMany({
        where: { milestone_id: id },
      });

      // Now delete the project milestone
      await this.prisma.project_milestone.delete({
        where: { id: id },
      });

      return handleSuccessResponse(
        'Success',
        HttpStatus.OK,
        'Project Milestone Deleted Successfully',
      );
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async milestoneDashboardCountPaymentWise(query: any, request: any) {
    const user = request?.user;
    const selectFields = {
      id: true,
      milestone_payment: true,
      targeted_month: true,
      invoice: true,
      invoice_date: true,
      payment_recieved: true,
      payment_recieved_date: true,
      document: true,
      created_at: true,
      delay_time: true,
    };

    const { startDate, endDate } = query;

    if (startDate == '' || endDate == '') {
      return;
    }

    const whereCondition = {
      ...(startDate &&
        endDate && {
          targeted_month: {
            gte: moment.utc(startDate).startOf('day').toISOString(),
            lt: moment.utc(endDate).endOf('day').toISOString(),
          },
        }),
    };

    let projectMilestone;

    if (['Super Admin', 'Finance', 'PM Lead'].includes(user?.role?.name)) {
      projectMilestone = await this.prisma.project_milestone.findMany({
        where: {
          ...whereCondition,
          invoice: true,
          invoice_date: {
            not: null,
          },
        },
        select: selectFields,
        orderBy: {
          created_at: 'desc',
        },
      });
    } else {
      const permissions = await this.prisma.project_permissions.findMany({
        where: { user_id: user?.id },
      });

      const projectIds = permissions.map((permission) => permission.project_id);

      projectMilestone = await this.prisma.project_milestone.findMany({
        where: {
          project_id: { in: projectIds },
          invoice: true,
          invoice_date: {
            not: null,
          },
          ...whereCondition,
        },
        select: selectFields,
        orderBy: {
          created_at: 'desc',
        },
      });
    }

    projectMilestone = this.filterMilestones(projectMilestone);
    const milestoneData = {
      achieved: Array(12).fill(0),
      delayed: Array(12).fill(0),
      inProgress: Array(12).fill(0),
    };

    projectMilestone.forEach((milestone) => {
      const monthIndex = moment(milestone.targeted_month).month();
      const { statusText } =
        this.calculateMilestoneStatusPaymentWise(milestone);

      if (statusText.startsWith('Achieved')) {
        milestoneData.achieved[monthIndex] += milestone.milestone_payment;
      } else if (
        statusText.startsWith('Delayed') ||
        statusText === 'In Progress'
      ) {
        milestoneData.delayed[monthIndex] += milestone.milestone_payment;
      }
    });

    return handleSuccessResponse('Success', HttpStatus.OK, {
      milestoneData,
    });
  }

  async milestoneDashboardCountInvoiceWise(query: any, request: any) {
    const user = request?.user;
    const selectFields = {
      id: true,
      milestone_payment: true,
      targeted_month: true,
      invoice: true,
      invoice_date: true,
      payment_recieved: true,
      payment_recieved_date: true,
      document: true,
      created_at: true,
      delay_time: true,
      onhold: true,
    };

    const { startDate, endDate } = query;

    if (startDate == '' || endDate == '') {
      return;
    }

    const whereCondition = {
      ...(startDate &&
        endDate && {
          targeted_month: {
            gte: moment.utc(startDate).startOf('day').toISOString(),
            lt: moment.utc(endDate).endOf('day').toISOString(),
          },
        }),
    };

    let projectMilestone;

    if (['Super Admin', 'Finance', 'PM Lead'].includes(user?.role?.name)) {
      projectMilestone = await this.prisma.project_milestone.findMany({
        where: whereCondition,
        select: selectFields,
        orderBy: {
          created_at: 'desc',
        },
      });
    } else {
      const permissions = await this.prisma.project_permissions.findMany({
        where: { user_id: user?.id },
      });

      const projectIds = permissions.map((permission) => permission.project_id);

      projectMilestone = await this.prisma.project_milestone.findMany({
        where: {
          project_id: { in: projectIds },
          ...whereCondition,
        },
        select: selectFields,
        orderBy: {
          created_at: 'desc',
        },
      });
    }

    const milestoneData = {
      achieved: Array(12).fill(0),
      delayed: Array(12).fill(0),
      inProgress: Array(12).fill(0),
    };

    projectMilestone = this.filterMilestones(projectMilestone);

    projectMilestone.forEach((milestone) => {
      const monthIndex = moment(milestone.targeted_month).month();
      const { statusText } = this.calculateMilestoneStatus(milestone);

      if (statusText.startsWith('Achieved')) {
        milestoneData.achieved[monthIndex] += milestone.milestone_payment;
      } else if (statusText.startsWith('Delayed')) {
        milestoneData.delayed[monthIndex] += milestone.milestone_payment;
      } else if (statusText === 'In Progress') {
        milestoneData.inProgress[monthIndex] += milestone.milestone_payment;
      }
    });

    return handleSuccessResponse('Success', HttpStatus.OK, {
      milestoneData,
    });
  }
}

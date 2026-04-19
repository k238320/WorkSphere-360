import { calculatePercentage } from 'src/utils/helper';

 const progressbar = (project: any) => {
  project?.forEach((y) => {
    const additional_hours_listing = y?.project_hours?.filter(
      (x) => x?.project_category_hours?.name == 'Additional',
    );
    const remaining_hours_listing = y?.project_hours?.filter(
      (x: any) => x?.project_category_hours?.name == 'Sale Hours',
    );

    const upsell_hours_listing = y?.project_hours?.filter(
      (x: any) => x?.project_category_hours?.name == 'Upsell',
    );

    const final_additional_hours_listing: any = [];

    additional_hours_listing.map((x: any) => {
      const index = final_additional_hours_listing?.findIndex(
        (ele: any) =>
          ele.project_category_hours.id == x.project_category_hours.id &&
          ele.department.id == x.department.id,
      );
      if (index >= 0) {
        final_additional_hours_listing[index].hours =
          final_additional_hours_listing[index].hours + x.hours;
      } else {
        final_additional_hours_listing.push(x);
      }
    });

    const final_upSell_hours_listing = [];

    upsell_hours_listing.map((x: any) => {
      const index = final_upSell_hours_listing?.findIndex(
        (ele: any) =>
          ele.project_category_hours.id == x.project_category_hours.id &&
          ele.department.id == x.department.id,
      );
      if (index >= 0) {
        final_upSell_hours_listing[index].hours =
          final_upSell_hours_listing[index].hours + x.hours;
      } else {
        final_upSell_hours_listing.push(x);
      }
    });

    const remaining_consumed_hours: any = [];
    const additional_consumed_hours: any = [];

    const sale_remaining_hours = remaining_hours_listing?.reduce(
      (accumulator: any, currentValue: any) => {
        const department = y?.project_consumed_hours?.find(
          (x: any) => x?.department?.id === currentValue?.department?.id,
        );
        if (department?.consumed_hours > currentValue?.hours) {
          const obj = {
            consumed_hours: department?.consumed_hours - currentValue?.hours,
            department: department?.department,
          };

          const remainHours = {
            consumed_hours: currentValue?.hours,
            department: department?.department,
          };

          remaining_consumed_hours.push(remainHours);

          additional_consumed_hours?.push(obj);
        } else {
          if (department) {
            const obj = {
              consumed_hours: department?.consumed_hours,
              department: department?.department,
            };
            remaining_consumed_hours.push(obj);
          }
        }
        return accumulator + currentValue?.hours;
      },
      0,
    );

    const consumed_hours = remaining_consumed_hours?.reduce(
      (accumulator: any, currentValue: any) => {
        return accumulator + currentValue?.consumed_hours;
      },
      0,
    );
    const remaining_hours_percentage = calculatePercentage(
      consumed_hours,
      sale_remaining_hours,
    );

    const upsell_consumed_hours = [];

    final_additional_hours_listing?.reduce(
      (accumulator: any, currentValue: any) => {
        const department = additional_consumed_hours?.find(
          (x: any) => x?.department?.id === currentValue?.department?.id,
        );

        const departmentIndex = additional_consumed_hours?.findIndex(
          (x: any) => x?.department?.id === currentValue?.department?.id,
        );

        if (department?.consumed_hours > currentValue?.hours) {
          const obj = {
            consumed_hours: department?.consumed_hours - currentValue?.hours,
            department: department?.department,
          };

          upsell_consumed_hours?.push(obj);

          const remainHours = {
            consumed_hours: currentValue?.hours,
            department: department?.department,
          };

          if (departmentIndex != -1) {
            additional_consumed_hours[departmentIndex] = remainHours;
          }
        }
      },
      0,
    );

    y.remaining_consumed_hours = remaining_consumed_hours;
    y.remaining_hours_percentage = remaining_hours_percentage;
    y.final_additional_hours_listing = final_additional_hours_listing;
    y.additional_consumed_hours = additional_consumed_hours;
    y.final_upSell_hours_listing = final_upSell_hours_listing;
    y.upsell_consumed_hours = upsell_consumed_hours;
  });

  return project;
};

export const profitLoss = (allProjects: any) => {
  const perHourRate = 40;

  const overallTotals = {
    totalPlannedHours: 0,
    totalConsumedHours: 0,
    categoryTotals: {} as Record<string, number>,
  };
  return allProjects.map((project) => {
    const projectPlannedHours = project.project_hours.reduce((sum, entry) => {
      if (entry.project_category_hours?.name === 'Additional') return sum;
      return sum + entry.hours;
    }, 0);

    const projectConsumedHours = project.project_consumed_hours.reduce(
      (sum, entry) => sum + entry.consumed_hours,
      0,
    );

    project.project_hours.forEach((entry) => {
      if (entry.project_category_hours?.name === 'Additional') return;
      const categoryName = entry.project_category_hours?.name;
      overallTotals.categoryTotals[categoryName] =
        (overallTotals.categoryTotals[categoryName] || 0) + entry.hours;
    });

    overallTotals.totalPlannedHours += projectPlannedHours;
    overallTotals.totalConsumedHours += projectConsumedHours;

    const budget = projectPlannedHours * perHourRate;
    const cost = projectConsumedHours * perHourRate;
    const profitOrLoss = budget - cost;

    return {
      ...project,
      projectPlannedHours,
      projectConsumedHours,
      budget,
      cost,
      profitOrLoss,
      status: profitOrLoss >= 0 ? 'Profit' : 'Loss',
    };
  });
};

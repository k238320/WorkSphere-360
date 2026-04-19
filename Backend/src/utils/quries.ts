// src/helpers/user.helper.ts
import { MongoClient, ObjectId } from 'mongodb';
import { parseData } from './parseFilters';
import { profitLoss } from 'src/project/function';

export async function updateUserDirectMongo(
  id: string,
  dto: any,
  isSuper: boolean,
) {
  const uri = process.env.DATABASE_URL;
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const users = client.db(process.env.MONGO_DB_NAME).collection('user');

    await users.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          email: dto.email,
          name: dto.name ?? '',
          role_id: dto.role_id ? new ObjectId(dto.role_id) : null,
          resource_id: dto.resource_id ? new ObjectId(dto.resource_id) : null,
          super: isSuper,
          status: dto.status,
          designation: dto.designation,
          employement_code: dto.employement_code,
          picture: dto.picture,
        },
      },
    );
  } catch (error) {
    console.error('Mongo update error:', error);
    throw error;
  } finally {
    await client.close();
  }
}

export async function insertAttendanceIfNotExists(punches: any[]) {
  const uri = process.env.DATABASE_URL;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(process.env.MONGO_DB_NAME);
    const collection = db.collection('emp_attendance');

    for (const punch of punches) {
      const exists = await collection.findOne({
        emp_code: punch.emp_code,
        punch_time: new Date(punch.punch_time),
        punch_state: +punch.punch_state,
      });

      if (!exists) {
        await collection.insertOne({
          emp_code: punch.emp_code,
          name: punch.name,
          punch_state: +punch.punch_state,
          punch_time: new Date(punch.punch_time),
          created_at: new Date(punch.punch_time),
          location_type_id: 1,
        });
      }
    }
  } catch (err) {
    console.error('Mongo insert error:', err);
    throw err;
  } finally {
    await client.close();
  }
}

export async function getLatestAttendance(punchState: number) {
  const uri = process.env.DATABASE_URL;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(process.env.MONGO_DB_NAME);
    const collection = db.collection('emp_attendance');

    const latest = await collection
      .find({ punch_state: punchState, location_type_id: 1 })
      .sort({ punch_time: -1 })
      .limit(1)
      .toArray();

    return latest[0] || null;
  } catch (err) {
    console.error('Mongo fetch error:', err);
    throw err;
  } finally {
    await client.close();
  }
}

export async function getFilteredTasksNativeMongo({
  taskIds,
  where = {},
  skip = 0,
  limit = 50,
  resourceId,
  userId,
}: {
  taskIds?: string[];
  where?: any;
  skip?: number;
  limit?: number;
  resourceId?: any;
  userId: string;
}) {
  const uri = process.env.DATABASE_URL!;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(process.env.MONGO_DB_NAME);
    const tasksCollection = db.collection('task');

    const preMatch: any = {
      ...(taskIds?.length
        ? { _id: { $in: taskIds.map((id) => new ObjectId(id)) } }
        : {}),
    };

    const postMatch = { ...where };
    delete postMatch._id;
    delete postMatch.created_at;
    delete postMatch.completion_date;
    delete postMatch.actual_completion_date;

    const allocationLookupStage = {
      $lookup: {
        from: 'allocation',
        let: { taskId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$task_id', '$$taskId'] },
              ...(resourceId ? { resource_id: new ObjectId(resourceId) } : {}),
            },
          },
        ],
        as: 'allocation',
      },
    };

    const allocationFilterStage = resourceId
      ? { $match: { 'allocation.0': { $exists: true } } }
      : null;

    const lightPipeline = [
      { $match: {} },

      // Join with project
      {
        $lookup: {
          from: 'project',
          localField: 'project_id',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: '$project' },

      // 🔁 NEW: Lookup for global super permission (NOT task-specific)
      {
        $lookup: {
          from: 'task_permission',
          pipeline: [
            {
              $match: {
                user_id: new ObjectId(userId),
                super: true,
              },
            },
          ],
          as: 'super_permissions',
        },
      },

      // 🔁 Lookup for task-specific permission
      {
        $lookup: {
          from: 'task_permission',
          let: { taskId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$task_id', '$$taskId'] },
                    { $eq: ['$user_id', new ObjectId(userId)] },
                  ],
                },
              },
            },
          ],
          as: 'user_permissions',
        },
      },

      // ✅ Add isSuper flag
      {
        $addFields: {
          isSuper: { $gt: [{ $size: '$super_permissions' }, 0] },
        },
      },

      // ✅ Final permission filter
      // {
      //   $match: {
      //     $expr: {
      //       $or: [
      //         { $eq: ['$isSuper', true] },
      //         { $gt: [{ $size: '$user_permissions' }, 0] },
      //       ],
      //     },
      //   },
      // },

      {
        $match: {
          $expr: {
            $or: [
              { $eq: ['$isSuper', true] },
              { $gt: [{ $size: '$user_permissions' }, 0] },
            ],
          },
        },
      },

      // Allocation join
      allocationLookupStage,
      ...(allocationFilterStage ? [allocationFilterStage] : []),

      // User filters
      { $match: where },

      // Sort and paginate
      { $addFields: { sortField: '$_id' } },
      { $sort: { sortField: -1 } },
      { $skip: skip || 0 },
      { $limit: limit || 50 },

      // Project only _id
      {
        $project: {
          _id: 1,
        },
      },
    ];

    console.log('lightPipeline', JSON.stringify(lightPipeline));

    const lightResults = await tasksCollection
      .aggregate(lightPipeline)
      .toArray();
    const taskIdsPage = lightResults.map((t) => t._id);

    if (taskIdsPage.length === 0) return [];

    const countPipeline: any[] = [
      { $match: preMatch },
      {
        $lookup: {
          from: 'allocation',
          let: { taskId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$task_id', '$$taskId'] },
                ...(resourceId
                  ? { resource_id: new ObjectId(resourceId) }
                  : {}),
              },
            },
          ],
          as: 'allocation',
        },
      },
      ...(resourceId
        ? [{ $match: { 'allocation.0': { $exists: true } } }]
        : []),
      { $count: 'total' },
    ];

    const [countResult] = await tasksCollection
      .aggregate(countPipeline)
      .toArray();
    const totalCount = countResult?.total ?? 0;

    const fullPipeline: any[] = [
      {
        $match: { _id: { $in: taskIdsPage } },
      },
      {
        $lookup: {
          from: 'task_category',
          localField: 'task_category_id',
          foreignField: '_id',
          as: 'task_category',
        },
      },
      { $unwind: { path: '$task_category', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'project',
          localField: 'project_id',
          foreignField: '_id',
          as: 'project',
        },
      },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'project_hours',
          let: { projectId: '$project._id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$project_id', '$$projectId'] } } },
            {
              $lookup: {
                from: 'department',
                localField: 'department_id',
                foreignField: '_id',
                as: 'department',
              },
            },
            {
              $lookup: {
                from: 'project_category_hours',
                localField: 'project_catgory_hours_id',
                foreignField: '_id',
                as: 'project_category_hours',
              },
            },
            {
              $lookup: {
                from: 'role',
                localField: 'role_id',
                foreignField: '_id',
                as: 'role',
              },
            },
            {
              $project: {
                _id: 1,
                department_id: 1,
                department: { $arrayElemAt: ['$department', 0] },
                project_catgory_hours_id: 1,
                project_category_hours: {
                  $arrayElemAt: ['$project_category_hours', 0],
                },
                role_id: 1,
                role: { $arrayElemAt: ['$role', 0] },
                hours: 1,
                no_of_resources: 1,
                project_id: 1,
                created_at: 1,
                updated_at: 1,
                status: 1,
              },
            },
          ],
          as: 'project_hours',
        },
      },
      {
        $lookup: {
          from: 'project_consumed_hours',
          let: { projectId: '$project._id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$project_id', '$$projectId'] } } },
            {
              $lookup: {
                from: 'department',
                localField: 'department_id',
                foreignField: '_id',
                as: 'department',
              },
            },
            {
              $project: {
                _id: 1,
                hours: 1,
                consumed_hours: 1,
                department: { $arrayElemAt: ['$department', 0] },
              },
            },
          ],
          as: 'project_consumed_hours',
        },
      },
      {
        $lookup: {
          from: 'allocation',
          let: { taskId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$task_id', '$$taskId'] },
                ...(resourceId
                  ? { resource_id: new ObjectId(resourceId) }
                  : {}),
              },
            },
            {
              $lookup: {
                from: 'resource',
                localField: 'resource_id',
                foreignField: '_id',
                as: 'resource',
              },
            },
            {
              $project: {
                _id: 1,
                task_hours: 1,
                start_date: 1,
                end_date: 1,
                resource_id: 1,
                is_completed: 1,
                is_overtime: 1,
                resource: { $arrayElemAt: ['$resource', 0] },
              },
            },
          ],
          as: 'allocation',
        },
      },
      {
        $project: {
          id: { $toString: '$_id' },
          name: 1,
          department: 1,
          task_status: 1,
          created_at: 1,
          completion_date: 1,
          actual_completion_date: 1,
          task_category: {
            id: { $toString: '$task_category._id' },
            name: '$task_category.name',
          },
          project: {
            id: { $toString: '$project._id' },
            name: '$project.name',
            project_manager_details: '$project.project_manager_details',
            project_hours: {
              $map: {
                input: '$project_hours',
                as: 'ph',
                in: {
                  id: { $toString: '$$ph._id' },
                  department_id: { $toString: '$$ph.department_id' },
                  department: {
                    id: { $toString: '$$ph.department._id' },
                    name: '$$ph.department.name',
                  },
                  project_catgory_hours_id: {
                    $toString: '$$ph.project_catgory_hours_id',
                  },
                  project_category_hours: {
                    id: { $toString: '$$ph.project_category_hours._id' },
                    name: '$$ph.project_category_hours.name',
                  },
                  project_id: { $toString: '$$ph.project_id' },
                  no_of_resources: '$$ph.no_of_resources',
                  hours: '$$ph.hours',
                  role_id: { $toString: '$$ph.role_id' },
                  role: {
                    id: { $toString: '$$ph.role._id' },
                    name: '$$ph.role.name',
                  },
                  created_at: '$$ph.created_at',
                  updated_at: '$$ph.updated_at',
                  status: '$$ph.status',
                },
              },
            },
            project_consumed_hours: {
              $map: {
                input: '$project_consumed_hours',
                as: 'pch',
                in: {
                  id: { $toString: '$$pch._id' },
                  hours: '$$pch.hours',
                  consumed_hours: '$$pch.consumed_hours',
                  department: {
                    id: { $toString: '$$pch.department._id' },
                    name: '$$pch.department.name',
                  },
                },
              },
            },
          },
          allocation: {
            $map: {
              input: '$allocation',
              as: 'alloc',
              in: {
                id: { $toString: '$$alloc._id' },
                task_hours: '$$alloc.task_hours',
                start_date: '$$alloc.start_date',
                end_date: '$$alloc.end_date',
                resource_id: { $toString: '$$alloc.resource_id' },
                is_completed: '$$alloc.is_completed',
                is_overtime: '$$alloc.is_overtime',
                resource: {
                  id: { $toString: '$$alloc.resource._id' },
                  name: '$$alloc.resource.name',
                  is_team_lead: '$$alloc.resource.is_team_lead',
                  is_atl: '$$alloc.resource.is_atl',
                  show_in_calendar: '$$alloc.resource.show_in_calendar',
                },
              },
            },
          },
        },
      },
    ];

    const fullResults = await tasksCollection.aggregate(fullPipeline).toArray();

    return {
      data: fullResults,
      count: totalCount,
    };
  } finally {
    await client.close();
  }
}

export async function getFilteredTasksCountNativeMongo({
  taskIds,
  where = {},
  resourceFilterId,
}: {
  taskIds?: string[];
  where?: any;
  resourceFilterId?: ObjectId;
}): Promise<number> {
  const uri = process.env.DATABASE_URL!;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(process.env.MONGO_DB_NAME);
    const tasksCollection = db.collection('task');

    const pipeline: any[] = [];

    const baseMatch: any = {
      ...(taskIds?.length
        ? { _id: { $in: taskIds.map((id) => new ObjectId(id)) } }
        : {}),
    };
    pipeline.push({ $match: baseMatch });

    // 🧠 Add project lookup if filtering project.project_manager_details
    if (where['project.project_manager_details']) {
      pipeline.push({
        $lookup: {
          from: 'project',
          localField: 'project_id',
          foreignField: '_id',
          as: 'project',
        },
      });
      pipeline.push({
        $unwind: { path: '$project', preserveNullAndEmptyArrays: true },
      });
    }

    // 🧠 Add allocation + resource lookup if filtering resource
    if (resourceFilterId) {
      pipeline.push({
        $lookup: {
          from: 'allocation',
          let: { taskId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$task_id', '$$taskId'] },
                resource_id: resourceFilterId,
              },
            },
          ],
          as: 'allocation',
        },
      });

      pipeline.push({ $match: { 'allocation.0': { $exists: true } } });
    }

    // 📌 Apply all remaining direct filters
    if (Object.keys(where).length) {
      pipeline.push({ $match: where });
    }

    // Count stage
    pipeline.push({ $count: 'count' });

    const result = await tasksCollection.aggregate(pipeline).toArray();
    return result[0]?.count || 0;
  } finally {
    await client.close();
  }
}

export async function getFilteredProjectsNativeMongo(query: any) {
  const client = new MongoClient(process.env.DATABASE_URL!);
  await client.connect();
  const db = client.db(process.env.MONGO_DB_NAME!);
  const coll = db.collection('project');

  // 1. Permissions
  const perms = await db
    .collection('project_permissions')
    .find({ user_id: new ObjectId(query.user_id) })
    .toArray();

  if (!perms.length) {
    await client.close();
    return {
      rows: [],
      count: 0,
      statusCounts: {},
      projectDivisionsWithCount: [],
    };
  }

  const isSuper = perms.some((p) => p.super);
  const permIds = perms.map((p) => new ObjectId(p.project_id));

  // 2. Filters
  const parsed = parseData(query.$filter, []);
  const where: any = {};
  const statusFilterIds: ObjectId[] = [];
  let projectManagerFilter: ObjectId | null = null;

  for (const fl of parsed || []) {
    const val = fl.value.contains;
    switch (fl.columnName) {
      case 'name':
        where.name = { $regex: val, $options: 'i' };
        break;
      case 'project_manager_details':
        projectManagerFilter = new ObjectId(val);
        break;
      case 'status':
        statusFilterIds.push(new ObjectId(val));
        break;
      case 'projectDivision':
        where.$or = where.$or || [];
        where.$or.push(
          { 'projectDivision._id': new ObjectId(val) },
          { 'projectDivision.parentId': new ObjectId(val) },
        );
        break;
      case 'project_contract_type':
        where['project_contract_type._id'] = new ObjectId(val);
        break;
    }
  }

  // 3. Status pre-filter
  if (statusFilterIds.length) {
    const pre = await db
      .collection('project_status')
      .aggregate([
        { $sort: { created_at: -1 } },
        {
          $group: {
            _id: '$project_id',
            latest: { $first: '$porject_statuses_id' },
          },
        },
        { $match: { latest: { $in: statusFilterIds } } },
        { $project: { _id: 1 } },
      ])
      .toArray();

    const ids = pre.map((x) => x._id);
    if (!ids.length) {
      await client.close();
      return {
        rows: [],
        count: 0,
        statusCounts: {},
        projectDivisionsWithCount: [],
      };
    }
    where._id = { $in: ids };
  }

  // 4. Build pipeline
  const matchStage = {
    ...(isSuper ? {} : { _id: { $in: permIds } }),
    ...where,
  };

  const col = query.$orderby || '_id';
  const dir = query.$orderdir === 'asc' ? 1 : -1;
  const skip = +query.$skip || 0;
  const limit = +query.$top || 20;

  const pipe: any[] = [
    { $match: matchStage },

    // Lookup latestStatus
    {
      $lookup: {
        from: 'project_status',
        let: { pid: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$project_id', '$$pid'] },
            },
          },
          { $sort: { created_at: -1 } },
          { $limit: 1 },
          {
            $lookup: {
              from: 'project_statuses',
              localField: 'porject_statuses_id',
              foreignField: '_id',
              as: 'project_statuses',
            },
          },
          { $unwind: { path: '$project_statuses', preserveNullAndEmptyArrays: true } },
        ],
        as: 'project_status',
      },
    },

    // Lookups
    { $lookup: { from: 'project_contract_type', localField: 'project_contract_type', foreignField: '_id', as: 'project_contract_type' } },
    { $lookup: { from: 'projectDivision', localField: 'projectDivisionId', foreignField: '_id', as: 'projectDivision' } },
    { $unwind: { path: '$projectDivision', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'project_hours',
        let: { pid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$project_id', '$$pid'] } } },
          { $lookup: { from: 'department', localField: 'department', foreignField: '_id', as: 'department' } },
          { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
          { $lookup: { from: 'project_category_hours', localField: 'project_category_hours', foreignField: '_id', as: 'project_category_hours' } },
          { $unwind: { path: '$project_category_hours', preserveNullAndEmptyArrays: true } }
        ],
        as: 'project_hours',
      },
    },
    {
      $lookup: {
        from: 'project_consumed_hours',
        let: { pid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$project_id', '$$pid'] } } },
          { $lookup: { from: 'department', localField: 'department', foreignField: '_id', as: 'department' } },
          { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
        ],
        as: 'project_consumed_hours',
      },
    },
    {
      $lookup: {
        from: 'client_details',
        let: { pid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$project_id', '$$pid'] } } },
          { $sort: { created_at: -1 } },
          { $limit: 2 },
        ],
        as: 'client_details',
      },
    },
    {
      $lookup: {
        from: 'project_milestone',
        let: { pid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$project_id', '$$pid'] } } },
          { $lookup: { from: 'milestone_phase', localField: 'milestone_phase', foreignField: '_id', as: 'milestone_phase' } },
        ],
        as: 'project_milestone',
      },
    },

    ...(projectManagerFilter ? [{ $match: { 'project_manager_details.id': projectManagerFilter } }] : []),

    {
      $facet: {
        rows: [
          { $sort: { [col]: dir } },
          { $skip: skip },
          { $limit: limit },
          { $addFields: { id: '$_id' } },
        ],
        allRows: [
          { $sort: { [col]: dir } },
          { $addFields: { id: '$_id' } },
        ],
        count: [{ $count: 'total' }],
        statusCounts: [
          { $unwind: { path: '$project_status', preserveNullAndEmptyArrays: true } },
          { $unwind: { path: '$project_status.project_statuses', preserveNullAndEmptyArrays: true } },
          {
            $group: {
              _id: { $toLower: '$project_status.project_statuses.name' },
              count: { $sum: 1 },
            },
          },
        ],
        divisionCounts: [
          {
            $group: {
              _id: '$projectDivision._id',
              name: { $first: '$projectDivision.name' },
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ];

  const [res] = await coll.aggregate(pipe).toArray();
  await client.close();

  const statusCounts = {
    'on track': 0,
    'on hold': 0,
    completed: 0,
    'not started': 0,
    delayed: 0,
    unassigned: 0,
    ...res.statusCounts.reduce((a: any, c: any) => ((a[c._id] = c.count), a), {}),
  };

  const rows = query.pdf ? profitLoss(res.allRows) : profitLoss(res.rows);

  return {
    rows,
    count: query.pdf ? res.allRows.length : res.count[0]?.total || 0,
    statusCounts,
    projectDivisionsWithCount: res.divisionCounts.map((d: any) => ({
      id: d._id,
      name: d.name,
      count: d.count,
    })),
  };
}



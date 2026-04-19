export const parseData = (value, obj: any) => {
  const regexEndsWith = /endswith\('([^']*)',([^)]*)\)/;
  const matchesEndsWtih = value?.match(regexEndsWith);

  const regexStartswith = /startswith\('([^']*)',([^)]*)\)/;
  const matchesStartswith = value?.match(regexStartswith);

  const regexContains = /contains\('([^']*)',([^)]*)\)/;
  const matchesContains = value?.match(regexContains);

  // const regexSubstringof = /substringof\('([^']*)',([^)]*)\)/;
  const regexSubstringof = /substringof\('([^']*)',([^)]*)\)/g;
  const matchesSubstringof = value?.match(regexSubstringof);
  let abc;
  if (matchesSubstringof) {
    const regexSubstringof = /substringof\('([^']*)',([^)]*)\)/;
    abc = matchesSubstringof.map((x) => {
      return x?.match(regexSubstringof);
    });
  }

  const regexNotEqual = /([^ ]+)\s+ne\s+([^ ]+)/;
  const matchesNotEqual = value?.match(regexNotEqual);

  const regexEqual = /([^ ]+)\s+eq\s+([^ ]+)/;
  const matchesEqual = value?.match(regexEqual);

  const startDateRegex =
    // /^(\w+)\s+(\w+)\s+(\w+'\d{4}-\d{2}-\d{2}T\d{2}:\d{2}')$/;
    /^(\w+)\s+(\w+)\s+datetime'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})'$/;
  const startDateMatch = value.match(startDateRegex);

  const regex = /(\w+)\s+(\w+)\s+datetime'(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})'/g;
  let match;
  const matches = [];

  while ((match = regex?.exec(value)) !== null) {
    matches.push({
      field: match[1],
      operator: match[2],
      value: match[3],
    });
  }

  if (matchesEndsWtih) {
    const value = matchesEndsWtih[1];
    const columnName = matchesEndsWtih[2];

    return {
      columnName: columnName,
      value: value,
      filter: 'endsWith',
    };
  } else if (matchesStartswith) {
    const value = matchesStartswith[1];
    const columnName = matchesStartswith[2];

    return {
      columnName: columnName,
      value: value,
      filter: 'startsWith',
    };
  } else if (matchesContains) {
    const value = matchesContains[1];
    const columnName = matchesContains[2];

    return {
      columnName: columnName,
      value: value,
      filter: 'contains',
    };
  } else if (matchesSubstringof) {
    // const value = matchesSubstringof[1];
    // const columnName = matchesSubstringof[2];

    // return {
    //   columnName: columnName,
    //   value: value,
    //   filter: 'contains',
    // };

    let x;
    while ((x = regexSubstringof.exec(value)) !== null) {
      let where = {};
      const columnName = x[2];
      const filter = 'contains';
      const columnValue = x[1];

      where[columnName] = { contains: columnValue, mode: 'insensitive' };
      obj.push({
        columnName: columnName,
        value: {
          contains: columnValue,
          mode: 'insensitive',
        },
        filter: 'contains',
      });
    }
    return obj;
  } else if (matchesNotEqual) {
    const columnName = matchesNotEqual[1];
    const value = matchesNotEqual[2];

    return {
      columnName: columnName,
      value: value,
      filter: 'not',
    };
  } else if (matchesEqual) {
    const columnName = matchesEqual[1];
    const value = matchesEqual[2];

    return {
      columnName: columnName,
      value: value,
      filter: 'equals',
    };
  } else if (startDateMatch) {
    const columnName = startDateMatch[1]; // "start_date"
    const filter = startDateMatch[2]; // "gt"
    const value = startDateMatch[3]; // "datetime'2023-08-21T10:30'"

    const parsedStartDate = new Date(value);

    return {
      columnName: columnName,
      value: parsedStartDate,
      filter: filter,
    };
  } else if (matches.length > 0) {
    let where = {};

    matches.forEach((match, index) => {
      const columnName = match.field; // "start_date"
      const filter = match.operator; // "gt"
      const value = new Date(match.value); // "datetime'2023-08-21T10:30'"

      where = {
        ...where,
        [columnName]: {
          [filter]: value,
        },
      };
    });

    return {
      columnName: 'where',
      value: where,
      filter: '',
    };
  }
};

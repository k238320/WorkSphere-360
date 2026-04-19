import { useCallback, useEffect, useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/index.css';
import '@inovua/reactdatagrid-community/base.css';
import moment from 'moment';
import useAuth from 'hooks/useAuth';
import './styles.css';

window.moment = moment;

const gridStyle = { minHeight: 660, padding: '50px' };

const rowStyle = (rowProps: any) => {
    return {
        minHeight: '20px',
        height: '20px',
        border: 'none',
        backgroundColor: 'transparent'
    };
};

const DataGridOData = (props: any) => {
    const [filterValue, setFilterValue] = useState<any>(props?.filterValue || []);
    const [skip, setSkip] = useState<any>(0);
    const [limit, setlimit] = useState<any>(50);
    const [sortInfo, setSortInfo] = useState<any>(props?.defaultSortInfo || {});
    const { user } = useAuth();

    useEffect(() => {
        const sortIcons = document.querySelectorAll('.InovuaReactDataGrid__sort-icon--desc');
        sortIcons.forEach((icon) => {
            icon.addEventListener('click', (e) => {
                e.preventDefault();
            });
        });
    }, []);

    const loadData = async ({ skip, limit, sortInfo, filterValue }: any) => {
        let sorVar = ``;
        if (sortInfo) {
            sorVar = `&$orderby=${sortInfo?.name} ${sortInfo?.dir == 1 ? 'asc' : 'desc'}`;
        }

        let where: { [key: string]: any } = {
            where: {}
        };

        let temp = filterValue?.filter((x: any) => {
            return x.value != '' && x.value !== undefined;
        });

        for (let i = 0; i < temp.length; i++) {
            var element = temp[i];
            if (!element?.value) continue;

            if (element.type == 'date') {
                if (!String(element.value).startsWith('datetime')) {
                    element.value = moment(element.value).utc(false).format('YYYY-MM-DDTHH:mm');
                    element.value = `datetime'${element.value}'`;
                }
            }

            if (element.type == 'boolean') {
                if (String(element.value)?.toLocaleLowerCase()?.startsWith('a')) {
                    element.value = true;
                } else {
                    element.value = false;
                }
            }

            var result = typeChecked({ searchBy: element.value, type: element.operator, filter: filterChange[element.operator] });

            if (element.operator == 'notinrange') {
                where.where[element.name] = result;
                where.where = { _not: where.where };
            } else {
                where.where[element.name] = result;
            }
        }

        var filterString = `user_id=${user?.id}&$top=${limit}&$skip=${skip}${sorVar}&$filter=`;
        Object?.entries(where.where)?.map(([key, value]: any, index: any) => {
            if (index != 0) filterString += ' and ';
            var filterName: any = Object?.keys(value)[0];
            var filterValue = Object?.values(value)[0];
            if (filterName == 'substringof') {
                filterString += `substringof(${filterValue},${key})`;
            } else if (filterName == 'startswith') {
                filterString += `startswith(${filterValue},${key})`;
            } else if (filterName == 'endswith') {
                filterString += `endswith(${filterValue},${key})`;
            } else {
                filterString += `${key} ${filterName} ${filterValue}`;
            }
        });

        props.showdonwload && props.setQuery && props.setQuery(filterString);

        var responee = await props?.dataResolver(filterString);

        if (responee?.rows) {
            props?.setGetData &&
                props?.setGetData({
                    count: responee?.count,
                    milestonePaymentCount: responee?.milestonePaymentCount,
                    achieveOnTime: responee?.achieveOnTime,
                    milestoneCost: responee?.milestoneCost,
                    inProgress: responee?.inProgress,
                    delay: responee?.delay,
                    upsellCount: responee?.upsellCount,
                    initialPaymentCount: responee?.initialPaymentCount,
                    paymentRecieved: responee?.paymentRecieved,
                    monthResult: responee?.monthResult,
                    previousDue: responee?.previousDue,
                    projectDivisionsWithCount : responee?.projectDivisionsWithCount,
                    statusCounts : responee?.statusCounts
                });

            responee.rows = responee?.rows?.map((x: any) => {
                x.uuid = x?.[props?.keyName];
                return x;
            });

            return { data: responee?.rows, count: responee?.count };
        }

        return { data: [], count: 0 };
    };

    const typeChecked = ({ searchBy, type, filter }: any) => {
        if (type == 'contains' || type == 'notContains' || type == 'startsWith' || type == 'endsWith') {
            return { [filter]: `'${searchBy}'` };
        } else if (
            type == 'eq' ||
            type == 'neq' ||
            type == 'after' ||
            type == 'afterOrOn' ||
            type == 'before' ||
            type == 'beforeOrOn' ||
            type == 'gt' ||
            type == 'gte' ||
            type == 'lt' ||
            type == 'lte'
        ) {
            return { [filter]: searchBy };
        } else if (type == 'inrange' || type == 'notinrange') {
            return { [filter.start]: searchBy.start, [filter.end]: searchBy.end };
        }
    };

    const filterChange: { [key: string]: string | { [key: string]: string } } = {
        contains: 'substringof',
        notContains: '_nilike',
        startsWith: 'startswith',
        endsWith: 'endswith',
        eq: 'eq',
        neq: 'ne',
        after: 'gt',
        gte: 'ge',
        gt: 'gt',
        lte: 'le',
        lt: 'lt',
        afterOrOn: 'ge',
        before: 'lt',
        beforeOrOn: 'le',
        inrange: {
            start: 'ge',
            end: 'le'
        }
    };

    const dataSourceZX = useCallback(loadData, [props?.dataResolver, props?.setGetData, props?.keyName, user?.id]);

    const renderColumnFilterContextMenu: any = useCallback((menuProps: any, { cellProps }: any) => {
        var stringToRemove = ['operator-notContains', 'operator-empty', 'operator-notEmpty'];
        if (cellProps?.computedFilterValue?.type === 'string') {
            menuProps.items = menuProps?.items?.filter((item: any) => !stringToRemove?.includes(item?.itemId));
        }
    }, []);

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '15px',
                    marginBottom: '20px',
                    width: '100%'
                }}
            >
                {<span style={{ fontSize: '16px', fontWeight: 'bold' }}>{props?.monthResult}</span>}

                {props.showdonwload && (
                    <div className="button-container" style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={props.exportToXlsx}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                transition: 'background-color 0.3s ease'
                            }}
                            onMouseOver={(e: any) => (e.target.style.backgroundColor = '#45a049')}
                            onMouseOut={(e: any) => (e.target.style.backgroundColor = '#4CAF50')}
                        >
                            Download XLSX
                        </button>
                        <button
                            onClick={props.exportToPdf}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#008CBA',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                transition: 'background-color 0.3s ease'
                            }}
                            onMouseOver={(e: any) => (e.target.style.backgroundColor = '#007bb5')}
                            onMouseOut={(e: any) => (e.target.style.backgroundColor = '#008CBA')}
                        >
                            Download PDF
                        </button>
                    </div>
                )}
            </div>

            <div className="custom-datagrid-container">
                <ReactDataGrid
                    className="custom__grid"
                    handle={props?.setGridRef}
                    idProperty="uuid"
                    style={gridStyle}
                    columns={props?.columns}
                    rowStyle={rowStyle}
                    defaultFilterValue={props?.filterValue}
                    renderColumnFilterContextMenu={renderColumnFilterContextMenu}
                    defaultGroupBy={[]}
                    minRowHeight={90}
                    rowHeight={null}
                    headerHeight={40}
                    filterRowHeight={50}
                    pagination
                    enableSelection
                    selected={props?.selected}
                    onSelectionChange={props?.onSelectionChange}
                    enableClipboard={true}
                    dataSource={dataSourceZX}
                    defaultSortInfo={props?.defaultSortInfo}
                    skip={skip}
                    onSkipChange={setSkip}
                    limit={limit}
                    onLimitChange={setlimit}
                    sortInfo={sortInfo}
                    onSortInfoChange={setSortInfo}
                    onFilterValueChange={setFilterValue}
                    checkboxColumn={props?.disableCheckbox ? false : true}
                    rowFocusClassName="custom-focus-row"
                    loading={props.loading}
                />
            </div>
        </>
    );
};

export default DataGridOData;

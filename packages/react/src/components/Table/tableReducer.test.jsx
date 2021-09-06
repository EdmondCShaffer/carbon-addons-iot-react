import React from 'react';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import { Add20 } from '@carbon/icons-react';

import { tableReducer, filterData, searchData, filterSearchAndSort } from './tableReducer';
import {
  tableRegister,
  tablePageChange,
  tableToolbarToggle,
  tableFilterApply,
  tableFilterClear,
  tableActionCancel,
  tableActionApply,
  tableColumnSort,
  tableColumnOrder,
  tableRowSelect,
  tableRowSelectAll,
  tableRowExpand,
  tableSearchApply,
  tableRowActionStart,
  tableRowActionComplete,
  tableRowActionEdit,
  tableRowActionError,
} from './tableActionCreators';
import { initialState, tableColumns } from './Table.story';

describe('table reducer', () => {
  it('nothing', () => {
    expect(tableReducer(undefined, { type: 'BOGUS' })).toEqual({});
  });
  it('return the same state if there is a missmatching instanceId', () => {
    // We use an action that will be forwarded to the base reducer
    expect(tableReducer(initialState, tablePageChange({ page: 3, pageSize: 10 }, 'id1'))).toBe(
      initialState
    );
  });
  it('row action tests', () => {
    const updatedRowActionState = tableReducer(initialState, tableRowActionStart('row-1'));
    const newRowActions = updatedRowActionState.view.table.rowActions;
    expect(newRowActions).toHaveLength(1);
    expect(newRowActions[0].rowId).toEqual('row-1');
    expect(newRowActions[0].isRunning).toEqual(true);

    // Set the error for the running one
    const updatedRowActionState2 = tableReducer(
      updatedRowActionState,
      tableRowActionError('row-1', 'error')
    );
    const newRowActions2 = updatedRowActionState2.view.table.rowActions;
    expect(newRowActions2).toHaveLength(1);
    expect(newRowActions2[0].rowId).toEqual('row-1');
    expect(newRowActions2[0].error).toEqual('error');

    // Clear the action
    const updatedRowActionState3 = tableReducer(initialState, tableRowActionComplete('row-1'));
    const newRowActions3 = updatedRowActionState3.view.table.rowActions;
    expect(newRowActions3).toHaveLength(0);

    // Enable a rows edit mode
    const updatedRowActionState4 = tableReducer(initialState, tableRowActionEdit('row-1'));
    const newRowActions4 = updatedRowActionState4.view.table.rowActions;
    expect(newRowActions4[0].rowId).toEqual('row-1');
    expect(newRowActions4[0].isEditMode).toBeTruthy();
  });
  describe('filter tests', () => {
    it('TABLE_FILTER_CLEAR', () => {
      expect(tableReducer(initialState, tableFilterClear()).view.filters).toEqual([]);
    });
    it('TABLE_FILTER_APPLY filter should filter data', () => {
      const updatedState = tableReducer(
        initialState,
        tableFilterApply({ [tableColumns[0].id]: '1' })
      );
      // Apply the filter
      expect(updatedState.view.filters).toEqual([{ columnId: tableColumns[0].id, value: '1' }]);
      // data should result in less records
      expect(updatedState.view.table.filteredData.length).toBeLessThan(initialState.data.length);
    });
  });
  describe('pagination', () => {
    it('TABLE_PAGE_CHANGE ', () => {
      const updatedState = tableReducer(
        {
          ...initialState,
          view: {
            ...initialState.view,
            pagination: { ...initialState.view.pagination, totalItems: 100 },
          },
        },
        tablePageChange({ page: 3, pageSize: 10 })
      );
      expect(initialState.data.length).toEqual(100);
      expect(updatedState.view.pagination.page).toEqual(3);
    });
    it('TABLE_PAGE_CHANGE with invalid page', () => {
      const updatedState = tableReducer(initialState, tablePageChange({ page: 65, pageSize: 10 }));
      expect(updatedState.view.pagination.page).toEqual(1);
    });
  });
  describe('toolbar actions', () => {
    it('TABLE_TOOLBAR_TOGGLE ', () => {
      const updatedState = tableReducer(initialState, tableToolbarToggle('column'));
      expect(updatedState.view.toolbar.activeBar).toEqual('column');

      const updatedState2 = tableReducer(updatedState, tableToolbarToggle('column'));
      expect(updatedState2.view.toolbar.activeBar).not.toEqual('column');
    });
    it('TABLE_SEARCH_APPLY filter should search data', () => {
      const searchString = 'searchString';
      const updatedState = tableReducer(initialState, tableSearchApply(searchString));
      // Apply the search
      expect(updatedState.view.toolbar.search.defaultValue).toEqual(searchString);
      expect(updatedState.view.pagination.page).toEqual(1);
    });
  });
  describe('table actions', () => {
    it('TABLE_ACTION_CANCEL ', () => {
      const tableWithSelection = tableReducer(initialState, tableRowSelectAll(true));
      // All should be selected
      expect(tableWithSelection.view.table.selectedIds.length).toEqual(initialState.data.length);

      const tableAfterCancel = tableReducer(initialState, tableActionCancel());
      expect(tableAfterCancel.view.table.selectedIds).toEqual([]);
      expect(tableAfterCancel.view.table.isSelectAllSelected).toEqual(false);
      expect(tableAfterCancel.view.table.isSelectAllIndeterminate).toEqual(false);
    });
    it('TABLE_ACTION_APPLY ', () => {
      // Select everything first
      const tableWithSelection = tableReducer(initialState, tableRowSelectAll(true));

      // All should be selected
      expect(tableWithSelection.view.table.selectedIds.length).toEqual(initialState.data.length);

      // If it's not delete we should clear the selection
      const tableAfterCustomAction = tableReducer(tableWithSelection, tableActionApply('custom'));
      expect(tableAfterCustomAction.view.table.selectedIds).toEqual([]);
      expect(tableAfterCustomAction.view.table.isSelectAllSelected).toEqual(false);
      expect(tableAfterCustomAction.view.table.isSelectAllIndeterminate).toEqual(false);
      expect(tableAfterCustomAction.data).toEqual(initialState.data);
      expect(tableAfterCustomAction.view.table.filteredData).toEqual(
        initialState.view.table.filteredData
      );

      // If it is delete we should update data and filtered data
      const tableAfterDeleteAction = tableReducer(tableWithSelection, tableActionApply('delete'));
      expect(tableAfterDeleteAction.view.table.selectedIds).toEqual([]);
      expect(tableAfterDeleteAction.view.table.isSelectAllSelected).toEqual(false);
      expect(tableAfterDeleteAction.view.table.isSelectAllIndeterminate).toEqual(false);
      expect(tableAfterDeleteAction.data).toEqual([]);
      expect(tableAfterDeleteAction.view.table.filteredData).toEqual([]);
    });
  });
  describe('table column actions', () => {
    it('TABLE_COLUMN_SORT', () => {
      const sortColumnAction = tableColumnSort(tableColumns[0].id);
      // First sort ASC
      expect(initialState.view.table.sort).toBeUndefined();
      const tableSorted = tableReducer(initialState, sortColumnAction);
      expect(tableSorted.view.table.sort.columnId).toEqual(tableColumns[0].id);
      expect(tableSorted.view.table.sort.direction).toEqual('ASC');
      // Order should be changed in the filteredData
      expect(initialState.data).not.toEqual(tableSorted.view.table.filteredData);

      // Then sort descending
      const tableSortedDesc = tableReducer(tableSorted, sortColumnAction);
      expect(tableSortedDesc.view.table.sort.columnId).toEqual(tableColumns[0].id);
      expect(tableSortedDesc.view.table.sort.direction).toEqual('DESC');
      // The previous sorted data shouldn't match
      expect(tableSortedDesc.view.table.filteredData).not.toEqual(
        tableSorted.view.table.filteredData
      );

      const tableSortedNone = tableReducer(tableSortedDesc, sortColumnAction);
      const filteredTable = tableReducer(initialState, tableRegister({ data: initialState.data }));

      expect(tableSortedNone.view.table.sort).toBeUndefined();
      // Data should no longer be sorted but should be filtered
      expect(filteredTable.view.table.filteredData).toEqual(
        tableSortedNone.view.table.filteredData
      );
    });

    it('TABLE_COLUMN_SORT multisort', () => {
      const multiSortState = merge({}, initialState, {
        view: {
          table: {
            sort: [
              {
                columnId: 'string',
                direction: 'ASC',
              },
              {
                columnId: 'date',
                direction: 'ASC',
              },
            ],
          },
        },
      });
      const sortColumnAction = tableColumnSort('string');
      const tableSorted = tableReducer(multiSortState, sortColumnAction);

      expect(tableSorted.view.table.sort).toEqual([
        {
          columnId: 'string',
          direction: 'DESC',
        },
        {
          columnId: 'date',
          direction: 'ASC',
        },
      ]);
    });

    it('TABLE_COLUMN_SORT custom sort function', () => {
      const sortColumnAction = tableColumnSort(tableColumns[4].id);
      const mockSortFunction = jest.fn().mockReturnValue(initialState.data);
      // Splice in our custom mock sort function
      initialState.columns.splice(4, 1, {
        ...initialState.columns[4],
        sortFunction: mockSortFunction,
      });
      // First sort ASC
      tableReducer(initialState, sortColumnAction);
      expect(mockSortFunction).toHaveBeenCalled();
    });
    it('TABLE_COLUMN_ORDER', () => {
      expect(initialState.view.table.ordering[0].isHidden).toBe(false);
      // Hide the first column
      const columnHideAction = tableColumnOrder([{ columnId: tableColumns[0].id, isHidden: true }]);
      const tableWithHiddenColumn = tableReducer(initialState, columnHideAction);
      expect(tableWithHiddenColumn.view.table.ordering[0].isHidden).toBe(true);
    });
  });
  describe('Table Row Operations', () => {
    it('TABLE_ROW_SELECT', () => {
      expect(initialState.view.table.selectedIds).toEqual([]);

      // Select a row
      const tableWithSelectedRow = tableReducer(initialState, tableRowSelect(['row-1'], 'multi'));
      expect(tableWithSelectedRow.view.table.selectedIds).toEqual(['row-1']);
      expect(tableWithSelectedRow.view.table.isSelectAllSelected).toEqual(false);
      expect(tableWithSelectedRow.view.table.isSelectAllIndeterminate).toEqual(true);

      // Unselect the row
      const tableWithUnSelectedRow = tableReducer(
        tableWithSelectedRow,
        tableRowSelect([], 'multi')
      );
      expect(tableWithUnSelectedRow.view.table.selectedIds).toEqual([]);
      expect(tableWithUnSelectedRow.view.table.isSelectAllSelected).toEqual(false);
      expect(tableWithUnSelectedRow.view.table.isSelectAllIndeterminate).toEqual(false);
    });
    it('TABLE_ROW_SELECT--SINGLE', () => {
      // set the table to single select
      const updatedInitialState = {
        ...initialState,
        view: {
          ...initialState.view,
          table: {
            ...initialState.view.table,
            hasRowSelection: 'single',
          },
        },
      };
      expect(initialState.view.table.selectedIds).toEqual([]);

      // Select a row
      const tableWithSelectedRow = tableReducer(
        updatedInitialState,
        tableRowSelect(['row-1'], 'single')
      );
      expect(tableWithSelectedRow.view.table.selectedIds).toEqual(['row-1']);
      expect(tableWithSelectedRow.view.table.isSelectAllSelected).toEqual(false);
      expect(tableWithSelectedRow.view.table.isSelectAllIndeterminate).toEqual(true);

      // Select a second row, should deselect a previously selected row
      const tableWithPreviouslySelectedRow = tableReducer(
        {
          ...updatedInitialState,
          view: {
            ...updatedInitialState.view,
            table: {
              ...updatedInitialState.view.table,
              selectedIds: ['row-1'],
            },
          },
        },
        tableRowSelect(['row-2'], 'single')
      );
      expect(tableWithPreviouslySelectedRow.view.table.selectedIds).toEqual(['row-2']);
      expect(tableWithPreviouslySelectedRow.view.table.isSelectAllSelected).toEqual(false);
      expect(tableWithPreviouslySelectedRow.view.table.isSelectAllIndeterminate).toEqual(true);
    });
    it('TABLE_ROW_SELECT_ALL', () => {
      expect(initialState.view.table.selectedIds).toEqual([]);
      // Select all
      const tableWithSelectedAll = tableReducer(initialState, tableRowSelectAll(true));
      expect(tableWithSelectedAll.view.table.selectedIds.length).toEqual(
        tableWithSelectedAll.data.length
      );
      expect(tableWithSelectedAll.view.table.isSelectAllIndeterminate).toEqual(false);
      expect(tableWithSelectedAll.view.table.isSelectAllSelected).toEqual(true);
      // Unselect all
      const tableWithUnSelectedAll = tableReducer(initialState, tableRowSelectAll(false));
      expect(tableWithUnSelectedAll.view.table.selectedIds.length).toEqual(0);
      expect(tableWithUnSelectedAll.view.table.isSelectAllIndeterminate).toEqual(false);
      expect(tableWithUnSelectedAll.view.table.isSelectAllSelected).toEqual(false);
    });
    it('TABLE_ROW_EXPAND', () => {
      expect(initialState.view.table.expandedIds).toEqual([]);
      // Expanded row
      const tableWithExpandedRow = tableReducer(initialState, tableRowExpand('row-1', true));
      expect(tableWithExpandedRow.view.table.expandedIds).toEqual(['row-1']);
      // Collapsed row
      const tableWithCollapsedRow = tableReducer(initialState, tableRowExpand('row-1', false));
      expect(tableWithCollapsedRow.view.table.expandedIds).toEqual([]);
    });
    it('REGISTER_TABLE', () => {
      // Data should be filtered once table registers
      expect(initialState.view.table.filteredData).toBeUndefined();
      const tableWithFilteredData = tableReducer(
        merge({}, initialState, {
          view: {
            table: {
              isSelectAllSelected: true,
              isSelectAllIndeterminate: true,
            },
          },
        }),
        tableRegister({ data: initialState.data, isLoading: false })
      );
      expect(tableWithFilteredData.data).toEqual(initialState.data);
      expect(tableWithFilteredData.view.table.filteredData.length).toBeGreaterThan(0);
      expect(tableWithFilteredData.view.table.isSelectAllSelected).toEqual(false);
      expect(tableWithFilteredData.view.table.isSelectAllIndeterminate).toEqual(false);
      expect(tableWithFilteredData.view.table.filteredData.length).not.toEqual(
        initialState.data.length
      );
      expect(tableWithFilteredData.view.table.loadingState.isLoading).toEqual(false);

      // Initial state with sort specified but no filters
      const initialStateWithSortAndNoFilters = merge({}, omit(initialState, 'view.filters'), {
        view: {
          table: { sort: { columnId: 'string', direction: 'ASC' } },
          filters: [],
        },
      });
      const tableWithSortedData = tableReducer(
        initialStateWithSortAndNoFilters,
        tableRegister({ data: initialState.data, isLoading: false })
      );
      expect(tableWithSortedData.data).toEqual(initialState.data);
      expect(tableWithSortedData.view.table.loadingState.isLoading).toEqual(false);
      expect(tableWithSortedData.view.table.filteredData.length).toEqual(
        initialStateWithSortAndNoFilters.data.length
      );
      // But they shouldn't be equal because the order changed
      expect(tableWithSortedData.view.table.filteredData).not.toEqual(
        initialStateWithSortAndNoFilters.data
      );

      // is Loading should be set false and rowCount should be correct
      expect(tableWithSortedData.view.table.loadingState.isLoading).toEqual(false);
      expect(tableWithSortedData.view.table.loadingState.rowCount).toEqual(0);
    });
  });
});

describe('filter, search and sort', () => {
  it('filterData', () => {
    const mockData = [{ values: { number: 10, node: <Add20 />, string: 'string', null: null } }];
    const mockDataWithMultiselect = [
      {
        values: {
          number: 10,
          select: 'option-B',
          string: 'string',
          null: null,
        },
      },
      {
        values: { number: 8, select: 'option-A', string: 'string', null: null },
      },
      {
        values: { number: 8, select: 'option-C', string: 'string', null: null },
      },
    ];
    const stringFilter = { columnId: 'string', value: 'String' };
    const numberFilter = { columnId: 'number', value: 10 };
    const multiselectFilter = {
      columnId: 'select',
      value: ['option-A', 'option-B'],
    };
    expect(filterData(mockData, [stringFilter])).toHaveLength(1);
    // case insensitive
    expect(filterData(mockData, [stringFilter])).toHaveLength(1);
    expect(filterData(mockData, [numberFilter])).toHaveLength(1);
    expect(filterData(mockDataWithMultiselect, [multiselectFilter])).toHaveLength(2);
  });

  it('filterData with custom comparison', () => {
    const mockData = [{ values: { number: 10, node: <Add20 />, string: 'string', null: null } }];
    const stringFilter = { columnId: 'string', value: 'String' };
    const numberFilter = { columnId: 'number', value: 10 };

    const customFilterFunction = (columnFilterValue, value) => columnFilterValue === value;
    expect(
      filterData(
        mockData,
        [stringFilter],
        [{ id: 'string', filter: { filterFunction: customFilterFunction } }]
      )
    ).toHaveLength(0);
    // partial
    expect(
      filterData(
        mockData,
        [{ columnId: 'string', value: 'str' }],
        [{ id: 'string', filter: { filterFunction: customFilterFunction } }]
      )
    ).toHaveLength(0);
    // case insensitive
    expect(filterData(mockData, [stringFilter])).toHaveLength(1);
    expect(
      filterData(
        mockData,
        [numberFilter],
        [{ id: 'number', filter: { filterFunction: customFilterFunction } }]
      )
    ).toHaveLength(1);
  });

  it('searchData', () => {
    const mockData = [{ values: { number: 10, node: <Add20 />, string: 'string', null: null } }];
    expect(searchData(mockData, 10)).toHaveLength(1);
    expect(searchData(mockData, 'string')).toHaveLength(1);
    // case insensitive
    expect(searchData(mockData, 'STRING')).toHaveLength(1);
  });

  it('filterSearchAndSort', () => {
    const mockData = [{ values: { number: 10, node: <Add20 />, string: 'string', null: null } }];
    expect(filterSearchAndSort(mockData)).toHaveLength(1);
    expect(filterSearchAndSort(mockData, {}, { value: 10 })).toHaveLength(1);
    expect(filterSearchAndSort(mockData, {}, { value: 20 })).toHaveLength(0);
    expect(
      filterSearchAndSort(mockData, {}, {}, [{ columnId: 'string', value: 'string' }])
    ).toHaveLength(1);
    expect(
      filterSearchAndSort(mockData, {}, {}, [{ columnId: 'string', value: 'none' }])
    ).toHaveLength(0);
  });
  it('filterSearchAndSort with custom sort function', () => {
    const mockData = [
      { values: { number: 10, node: <Add20 />, severity: 'High', null: null } },
      { values: { number: 10, node: <Add20 />, severity: 'Low', null: null } },
      {
        values: { number: 10, node: <Add20 />, severity: 'Medium', null: null },
      },
    ];
    const mockSortFunction = jest.fn().mockReturnValue(mockData);
    expect(
      filterSearchAndSort(
        mockData,
        { columnId: 'severity', direction: 'ASC' },
        {},
        [],
        [{ id: 'severity', sortFunction: mockSortFunction }]
      )
    ).toHaveLength(3);
    expect(mockSortFunction).toHaveBeenCalled();
  });

  it('filterSearchAndSort with multisort and custom sort function', () => {
    const mockData = [
      { values: { number: 10, node: <Add20 />, severity: 'High', null: null } },
      { values: { number: 10, node: <Add20 />, severity: 'Low', null: null } },
      {
        values: { number: 10, node: <Add20 />, severity: 'Medium', null: null },
      },
    ];

    const mockSortFunction = jest.fn(({ data, columnId, direction }) => {
      const sortedData = data.slice();

      sortedData.sort((a, b) => {
        const aSev = a.values[columnId];
        const bSev = b.values[columnId];
        let compare = -1;
        switch (`${aSev}-${bSev}`) {
          case 'Low-Medium':
          case 'Low-High':
          case 'Medium-High':
            compare = -1;
            break;
          case 'Medium-Low':
          case 'High-Low':
          case 'High-Medium':
            compare = 1;
            break;
          default:
            compare = 0;
            break;
        }

        return direction === 'ASC' ? compare : -compare;
      });

      return sortedData;
    });

    const sortedResult = filterSearchAndSort(
      mockData.slice(),
      [
        { columnId: 'number', direction: 'ASC' },
        { columnId: 'severity', direction: 'ASC' },
      ],
      {},
      [],
      [
        { id: 'severity', sortFunction: mockSortFunction, isSortable: true },
        { id: 'number', isSortable: true },
      ]
    );
    expect(sortedResult).toHaveLength(3);
    expect(mockSortFunction).toHaveBeenCalled();

    // low
    expect(sortedResult[0]).toEqual(mockData[1]);
    // medium
    expect(sortedResult[1]).toEqual(mockData[2]);
    // high
    expect(sortedResult[2]).toEqual(mockData[0]);

    // flip the direction now
    const sortedResultDesc = filterSearchAndSort(
      mockData.slice(),
      [
        { columnId: 'number', direction: 'ASC' },
        { columnId: 'severity', direction: 'DESC' },
      ],
      {},
      [],
      [
        { id: 'severity', sortFunction: mockSortFunction, isSortable: true },
        { id: 'number', isSortable: true },
      ]
    );
    expect(sortedResultDesc).toHaveLength(3);
    expect(mockSortFunction).toHaveBeenCalled();
    // high
    expect(sortedResultDesc[0]).toEqual(mockData[0]);
    // medium
    expect(sortedResultDesc[1]).toEqual(mockData[2]);
    // low
    expect(sortedResultDesc[2]).toEqual(mockData[1]);
  });
});

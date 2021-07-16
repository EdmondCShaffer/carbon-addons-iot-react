import React from 'react';
import { mount } from 'enzyme';
import cloneDeep from 'lodash/cloneDeep';
import { render, screen, fireEvent, within, act } from '@testing-library/react';

import { settings } from '../../../constants/Settings';

import TableHead from './TableHead';
import TableHeader from './TableHeader';
import { MIN_COLUMN_WIDTH } from './columnWidthUtilityFunctions';

const { iotPrefix } = settings;

const commonTableHeadProps = {
  tableId: 'tablehead-test',
  /** List of columns */
  columns: [
    { id: 'col1', name: 'Column 1', isSortable: false },
    { id: 'col2', name: 'Column 2', isSortable: false },
    { id: 'col3', name: 'Column 3', isSortable: true, align: 'start' },
  ],
  tableState: {
    selection: {},
    sort: {
      columnId: 'col3',
      direction: 'ASC',
    },
    ordering: [
      { columnId: 'col1', isHidden: false },
      { columnId: 'col2', isHidden: false },
      { columnId: 'col3', isHidden: false },
    ],
  },
  actions: { onChangeOrdering: jest.fn() },
  options: { wrapCellText: 'auto', truncateCellText: false },
};

describe('TableHead', () => {
  it('be selectable by testID or testId', () => {
    const { rerender } = render(<TableHead {...commonTableHeadProps} testID="TABLE_HEAD" />, {
      container: document.body.appendChild(document.createElement('table')),
    });

    expect(screen.getByTestId('TABLE_HEAD')).toBeDefined();
    expect(screen.getByTestId('TABLE_HEAD-column-col1')).toBeDefined();
    expect(screen.getByTestId('TABLE_HEAD-column-col2')).toBeDefined();
    expect(screen.getByTestId('TABLE_HEAD-column-col3')).toBeDefined();

    rerender(<TableHead {...commonTableHeadProps} testId="table_head" />, {
      container: document.body.appendChild(document.createElement('table')),
    });

    expect(screen.getByTestId('table_head')).toBeDefined();
    expect(screen.getByTestId('table_head-column-col1')).toBeDefined();
    expect(screen.getByTestId('table_head-column-col2')).toBeDefined();
    expect(screen.getByTestId('table_head-column-col3')).toBeDefined();
  });
  it('columns should render', () => {
    const wrapper = mount(<TableHead {...commonTableHeadProps} />, {
      attachTo: document.createElement('table'),
    });
    const tableHeaders = wrapper.find(TableHeader);
    expect(tableHeaders).toHaveLength(3);
  });

  it('columns should render extra column for multi select', () => {
    const myProps = {
      ...commonTableHeadProps,
      options: {
        ...commonTableHeadProps.options,
        hasRowExpansion: true,
        hasRowSelection: 'multi',
      },
    };
    const wrapper = mount(<TableHead {...myProps} />, {
      attachTo: document.createElement('table'),
    });
    const tableHeaders = wrapper.find(TableHeader);
    expect(tableHeaders).toHaveLength(4);
  });

  it('hasRowActions flag creates empty TableHeader', () => {
    const myProps = {
      ...commonTableHeadProps,
      options: {
        ...commonTableHeadProps.options,
        hasRowActions: true,
      },
    };
    const wrapper = mount(<TableHead {...myProps} />, {
      attachTo: document.createElement('table'),
    });
    const lastTableHeader = wrapper.find('TableHeader').last();

    expect(lastTableHeader.getDOMNode().className).toEqual(
      `${iotPrefix}--table-header-row-action-column`
    );

    expect(lastTableHeader.find('.bx--table-header-label').getDOMNode().innerHTML).toEqual('');
  });

  it('make sure data-column is set for width', () => {
    const myProps = { ...commonTableHeadProps };
    const wrapper = mount(<TableHead {...myProps} />, {
      attachTo: document.createElement('table'),
    });
    const tableHeaders = wrapper.find('th[data-column="col1"]');
    expect(tableHeaders).toHaveLength(1);
  });

  it('activeBar set to "filter" shows FilterHeaderRow', () => {
    const myProps = {
      ...commonTableHeadProps,
      tableState: { ...commonTableHeadProps.tableState },
    };
    myProps.tableState.activeBar = 'filter';
    let wrapper = mount(<TableHead {...myProps} />, {
      attachTo: document.createElement('table'),
    });
    expect(wrapper.exists('FilterHeaderRow')).toBeTruthy();

    delete myProps.tableState.activeBar;
    wrapper = mount(<TableHead {...myProps} />, {
      attachTo: document.createElement('table'),
    });
    expect(wrapper.exists('FilterHeaderRow')).toBeFalsy();
  });

  it('activeBar set to "column" shows ColumnHeaderRow', () => {
    const myProps = {
      ...commonTableHeadProps,
      tableState: { ...commonTableHeadProps.tableState },
    };
    myProps.tableState.activeBar = 'column';
    const wrapper = mount(<TableHead {...myProps} />, {
      attachTo: document.createElement('table'),
    });
    expect(wrapper.exists('ColumnHeaderRow')).toBeTruthy();
  });

  it('check has resize if has resize is true ', () => {
    const myProps = {
      ...commonTableHeadProps,
      options: { ...commonTableHeadProps.options, hasResize: true },
    };
    const wrapper = mount(<TableHead {...myProps} />, {
      attachTo: document.createElement('table'),
    });
    const tableHeaders = wrapper.find(`div.${iotPrefix}--column-resize-handle`);
    tableHeaders.first().simulate('click');
    expect(tableHeaders).toHaveLength(2);
  });

  it('check not resize if has resize is false ', () => {
    const myProps = {
      ...commonTableHeadProps,
      options: { ...commonTableHeadProps.options, hasResize: false },
    };
    const wrapper = mount(<TableHead {...myProps} />, {
      attachTo: document.createElement('table'),
    });
    const tableHeaders = wrapper.find('div.column-resize-handle');
    expect(tableHeaders).toHaveLength(0);
  });

  it('check hidden item is not shown ', () => {
    const myProps = {
      ...commonTableHeadProps,
      tableState: {
        ...commonTableHeadProps.tableState,
        ordering: [
          { columnId: 'col1', isHidden: false },
          { columnId: 'col2', isHidden: false },
          { columnId: 'col3', isHidden: true },
        ],
      },
      hasResize: false,
    };

    const wrapper = mount(<TableHead {...myProps} />, {
      attachTo: document.createElement('table'),
    });
    const tableHeaders = wrapper.find(TableHeader);
    expect(tableHeaders).toHaveLength(2);
  });

  it('header renders with resizing columns when columns are empty on initial render', () => {
    const wrapper = mount(
      <TableHead
        tableId="tablehead-test"
        columns={[]}
        tableState={{
          filters: [],
          expandedIds: [],
          isSelectAllSelected: false,
          selectedIds: [],
          rowActions: [],
          sort: {},
          ordering: [],
          loadingState: { rowCount: 5 },
          selection: { isSelectAllSelected: false },
        }}
        actions={{ onColumnResize: jest.fn() }}
        options={{ ...commonTableHeadProps.options, hasResize: true }}
      />,
      {
        attachTo: document.createElement('table'),
      }
    );
    const tableHeaders = wrapper.find(TableHeader);
    expect(tableHeaders).toHaveLength(0);
    // trigger a re-render with non-empty columns
    wrapper.setProps({
      ...commonTableHeadProps,
      options: { ...commonTableHeadProps.options, hasResize: true },
    });
    // sync enzyme component tree with the updated dom

    wrapper.update();
    const tableHeaderResizeHandles = wrapper.find(`div.${iotPrefix}--column-resize-handle`);
    tableHeaderResizeHandles.first().simulate('mouseDown');
    tableHeaderResizeHandles.first().simulate('mouseMove');
    tableHeaderResizeHandles.first().simulate('mouseUp');
    expect(tableHeaderResizeHandles).toHaveLength(2);
  });

  it('fixed column widths for non-resizable columns', () => {
    const myProps = {
      ...commonTableHeadProps,
      columns: [{ id: 'col1', name: 'Column 1', width: '101px', isSortable: false }],
      tableState: {
        ...commonTableHeadProps.tableState,
        ordering: [{ columnId: 'col1', isHidden: false }],
      },
      options: { ...commonTableHeadProps.options, hasResize: false },
    };

    let wrapper = mount(<TableHead {...myProps} />, {
      attachTo: document.createElement('table'),
    });
    const nonSortableTableHead = wrapper.find(TableHeader).first().find('th');
    expect(nonSortableTableHead.prop('width')).toBe('101px');

    myProps.columns[0].isSortable = true;
    wrapper = mount(<TableHead {...myProps} />, {
      attachTo: document.createElement('table'),
    });
    const sortableTableHead = wrapper.find(TableHeader).first().find('th');
    expect(sortableTableHead.prop('width')).toBe('101px');
  });

  describe('Column resizing active', () => {
    let ordering;
    let columns;
    let myActions;
    let myProps;
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    const mockGetBoundingClientRect = jest.fn();

    beforeAll(() => {
      Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;
    });

    beforeEach(() => {
      ordering = [
        { columnId: 'col1', isHidden: false },
        { columnId: 'col2', isHidden: false },
        { columnId: 'col3', isHidden: false },
      ];
      columns = [
        { id: 'col1', name: 'Column 1', width: '100px' },
        { id: 'col2', name: 'Column 2', width: '100px' },
        { id: 'col3', name: 'Column 3', width: '100px' },
      ];

      myActions = { onChangeOrdering: jest.fn(), onColumnResize: jest.fn() };
      myProps = {
        ...commonTableHeadProps,
        columns,
        tableState: {
          ...commonTableHeadProps.tableState,
          ordering,
          activeBar: 'column',
        },
        options: {
          hasResize: true,
          wrapCellText: 'auto',
          truncateCellText: false,
        },
        actions: myActions,
        showExpanderColumn: true,
      };
    });

    afterAll(() => {
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    });

    it('toggle hide column correctly updates the column widths of visible columns', () => {
      mockGetBoundingClientRect.mockImplementation(() => ({ width: 100 }));

      const wrapper = mount(<TableHead {...myProps} />, {
        attachTo: document.createElement('table'),
      });
      const onColumnToggleFunc = wrapper.find('ColumnHeaderRow').prop('onColumnToggle');
      const orderingAfterTogleHide = [
        { columnId: 'col1', isHidden: true },
        { columnId: 'col2', isHidden: false },
        { columnId: 'col3', isHidden: false },
      ];

      // Hide col1. The width of col1 is proportionally distributed over
      // the remaining visible columns.

      act(() => {
        onColumnToggleFunc('col1', orderingAfterTogleHide);
      });

      expect(myActions.onColumnResize).toHaveBeenCalledWith([
        { id: 'col1', name: 'Column 1', width: '100px' },
        { id: 'col2', name: 'Column 2', width: '150px' },
        { id: 'col3', name: 'Column 3', width: '150px' },
      ]);
      expect(myActions.onChangeOrdering).toHaveBeenCalledWith(orderingAfterTogleHide);
    });

    it('toggle show column correctly updates the column widths of visible columns', () => {
      myProps.tableState = {
        ...myProps.tableState,
        ordering: [
          { columnId: 'col1', isHidden: true },
          { columnId: 'col2', isHidden: false },
          { columnId: 'col3', isHidden: false },
        ],
      };

      mockGetBoundingClientRect.mockImplementation(() => ({ width: 200 }));

      const wrapper = mount(
        <TableHead
          {...myProps}
          columns={[
            { id: 'col1', name: 'Column 1', width: '200px' },
            { id: 'col2', name: 'Column 2', width: '200px' },
            { id: 'col3', name: 'Column 3', width: '200px' },
          ]}
        />,
        {
          attachTo: document.createElement('table'),
        }
      );
      const onColumnToggleFunc = wrapper.find('ColumnHeaderRow').prop('onColumnToggle');

      const orderingAfterTogleShow = [
        { columnId: 'col1', isHidden: false },
        { columnId: 'col2', isHidden: false },
        { columnId: 'col3', isHidden: false },
      ];

      // Show col1. The width needed for col1 is proportionally subtracted from
      // the other visible columns.
      act(() => {
        onColumnToggleFunc('col1', orderingAfterTogleShow);
      });

      expect(myActions.onColumnResize).toHaveBeenCalledWith([
        { id: 'col1', name: 'Column 1', width: '133px' },
        { id: 'col2', name: 'Column 2', width: '133px' },
        { id: 'col3', name: 'Column 3', width: '133px' },
      ]);
      expect(myActions.onChangeOrdering).toHaveBeenCalledWith(orderingAfterTogleShow);
    });

    it('toggle show column does not allow columns to shrink below MIN WIDTH', () => {
      myProps.tableState = {
        ...myProps.tableState,
        ordering: [
          { columnId: 'col1', isHidden: true },
          { columnId: 'col2', isHidden: false },
          { columnId: 'col3', isHidden: false },
        ],
      };

      mockGetBoundingClientRect.mockImplementation(() => ({ width: 100 }));

      const wrapper = mount(<TableHead {...myProps} />, {
        attachTo: document.createElement('table'),
      });
      const onColumnToggleFunc = wrapper.find('ColumnHeaderRow').prop('onColumnToggle');

      const orderingAfterTogleShow = [
        { columnId: 'col1', isHidden: false },
        { columnId: 'col2', isHidden: false },
        { columnId: 'col3', isHidden: false },
      ];

      // Show col1. The width needed for col1 is proportionally subtracted from
      // the other visible columns.
      act(() => {
        onColumnToggleFunc('col1', orderingAfterTogleShow);
      });

      expect(myActions.onColumnResize).toHaveBeenCalledWith([
        { id: 'col1', name: 'Column 1', width: '67px' },
        { id: 'col2', name: 'Column 2', width: `67px` },
        { id: 'col3', name: 'Column 3', width: `67px` },
      ]);

      myActions.onColumnResize.mock.calls[0][0].forEach((column) => {
        expect(parseInt(column.width, 10)).toBeGreaterThanOrEqual(MIN_COLUMN_WIDTH);
      });

      expect(myActions.onChangeOrdering).toHaveBeenCalledWith(orderingAfterTogleShow);
    });

    it('toggle show column without initial width correctly updates the column widths of visible columns', () => {
      myProps.tableState = {
        ...myProps.tableState,
        ordering: [
          { columnId: 'col1', isHidden: false },
          { columnId: 'col2', isHidden: false },
          { columnId: 'col3', isHidden: true },
        ],
      };
      myProps.columns = [
        { id: 'col1', name: 'Column 1', width: '200px' },
        { id: 'col2', name: 'Column 2', width: '200px' },
        { id: 'col3', name: 'Column 3' },
      ];

      mockGetBoundingClientRect.mockImplementation(() => ({ width: 200 }));

      const wrapper = mount(<TableHead {...myProps} />, {
        attachTo: document.createElement('table'),
      });
      const onColumnToggleFunc = wrapper.find('ColumnHeaderRow').prop('onColumnToggle');

      const orderingAfterTogleShow = [
        { columnId: 'col1', isHidden: false },
        { columnId: 'col2', isHidden: false },
        { columnId: 'col3', isHidden: false },
      ];

      // Show col3 which has no initial column width.
      act(() => {
        onColumnToggleFunc('col3', orderingAfterTogleShow);
      });

      expect(myActions.onColumnResize).toHaveBeenCalledWith([
        { id: 'col1', name: 'Column 1', width: '133px' },
        { id: 'col2', name: 'Column 2', width: '133px' },
        { id: 'col3', name: 'Column 3', width: '133px' },
      ]);
      expect(myActions.onChangeOrdering).toHaveBeenCalledWith(orderingAfterTogleShow);
    });

    it('should not add resize handle to the last visible column if there is no expander column', () => {
      myProps.tableState = {
        ...myProps.tableState,
        ordering: [
          { columnId: 'col1', isHidden: false },
          { columnId: 'col2', isHidden: false },
          { columnId: 'col3', isHidden: false },
        ],
      };
      myProps.showExpanderColumn = false;
      mockGetBoundingClientRect.mockImplementation(() => ({ width: 100 }));

      const wrapper = mount(<TableHead {...myProps} />, {
        attachTo: document.createElement('table'),
      });
      const resizeHandles = wrapper.find(`div.${iotPrefix}--column-resize-handle`);
      expect(resizeHandles).toHaveLength(2);
      const lastTableHeader = wrapper.find(`.${iotPrefix}--table-header-resize`).last();
      expect(lastTableHeader.find(`div.${iotPrefix}--column-resize-handle`)).toHaveLength(0);

      // Hide the last column (use shortcut via props)
      const orderingAfterToggleHide = cloneDeep(myProps.tableState.ordering).map((col) =>
        col.columnId === 'col3' ? { ...col, isHidden: true } : col
      );
      wrapper.setProps({
        ...myProps,
        tableState: {
          ...myProps.tableState,
          ordering: orderingAfterToggleHide,
        },
      });
      wrapper.update();
      const updatedResizeHandles = wrapper.find(`div.${iotPrefix}--column-resize-handle`);
      expect(updatedResizeHandles).toHaveLength(1);

      const modLastTableHeader = wrapper.find(`.${iotPrefix}--table-header-resize`).last();
      expect(modLastTableHeader.find(`div.${iotPrefix}--column-resize-handle`)).toHaveLength(0);
    });

    it('should always add resize handle to the last visible column if there is an expander column', () => {
      myProps.tableState = {
        ...myProps.tableState,
        ordering: [
          { columnId: 'col1', isHidden: false },
          { columnId: 'col2', isHidden: false },
          { columnId: 'col3', isHidden: false },
        ],
      };
      myProps.showExpanderColumn = true;

      render(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });

      const lastColumnResizeHandle = within(screen.getByTitle('Column 3').closest('th')).getByRole(
        'button',
        {
          name: 'Resize column',
        }
      );

      expect(lastColumnResizeHandle).not.toBeNull();
    });

    it('should add an extra expander column if prop showExpanderColumn:true', () => {
      myProps.tableState = {
        ...myProps.tableState,
        ordering: [
          { columnId: 'col1', isHidden: false },
          { columnId: 'col2', isHidden: false },
        ],
      };
      myProps.showExpanderColumn = true;
      myProps.testID = 'my-test';

      render(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });
      expect(screen.getByTestId('my-test-expander-column')).not.toBeNull();
    });

    it('should not add an extra expander column if prop showExpanderColumn:false', () => {
      myProps.tableState = {
        ...myProps.tableState,
        ordering: [
          { columnId: 'col1', isHidden: false },
          { columnId: 'col2', isHidden: false },
        ],
      };
      myProps.showExpanderColumn = false;
      myProps.testID = 'my-test';

      render(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });
      expect(screen.queryByTestId('my-test-expander-column')).toBeNull();
    });

    it('should update the column widths when column prop changes and all column prop have widths defined', () => {
      mockGetBoundingClientRect.mockImplementation(() => ({ width: 100 }));
      const { rerender } = render(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });
      expect(screen.getAllByText('Column 1')[0].closest('th')).toHaveStyle({
        width: '100px',
      });

      // All props have widths so the column widths are updated
      rerender(
        <TableHead
          {...myProps}
          columns={[
            { id: 'col1', name: 'Column 1', width: '250px' },
            { id: 'col2', name: 'Column 2', width: '150px' },
            { id: 'col3', name: 'Column 3', width: '100px' },
          ]}
        />,
        {
          container: document.body.appendChild(document.createElement('table')),
        }
      );
      expect(screen.getAllByText('Column 1')[0].closest('th')).toHaveStyle({
        width: '250px',
      });
      expect(screen.getAllByText('Column 2')[0].closest('th')).toHaveStyle({
        width: '150px',
      });
      expect(screen.getAllByText('Column 3')[0].closest('th')).toHaveStyle({
        width: '100px',
      });
    });

    it('should update the column widths when column prop changes and all visible column props have widths defined', () => {
      mockGetBoundingClientRect.mockImplementation(() => ({ width: 100 }));
      const orderingWidthHiddenCol1 = [
        { columnId: 'col1', isHidden: true },
        ...myProps.tableState.ordering.slice(1),
      ];
      myProps.tableState.ordering = orderingWidthHiddenCol1;

      const { rerender } = render(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });

      rerender(
        <TableHead
          {...myProps}
          columns={[
            { id: 'col1', name: 'Column 1' },
            { id: 'col2', name: 'Column 2', width: '300px' },
            { id: 'col3', name: 'Column 3', width: '400px' },
          ]}
        />,
        {
          container: document.body.appendChild(document.createElement('table')),
        }
      );
      expect(screen.getAllByText('Column 2')[0].closest('th')).toHaveStyle({
        width: '300px',
      });
      expect(screen.getAllByText('Column 3')[0].closest('th')).toHaveStyle({
        width: '400px',
      });
    });

    it('should not update the column widths when column prop changes and visible columns are lacking width', () => {
      mockGetBoundingClientRect.mockImplementation(() => ({ width: 100 }));
      const { rerender } = render(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });
      rerender(
        <TableHead
          {...myProps}
          columns={[
            { id: 'col1', name: 'Column 1', width: undefined },
            { id: 'col2', name: 'Column 2', width: '150px' },
            { id: 'col3', name: 'Column 3', width: '100px' },
          ]}
        />,
        {
          container: document.body.appendChild(document.createElement('table')),
        }
      );
      expect(screen.getAllByText('Column 1')[0].closest('th')).toHaveStyle({
        width: '100px',
      });
      expect(screen.getAllByText('Column 2')[0].closest('th')).toHaveStyle({
        width: '100px',
      });
      expect(screen.getAllByText('Column 3')[0].closest('th')).toHaveStyle({
        width: '100px',
      });

      rerender(
        <TableHead
          {...myProps}
          columns={[
            { id: 'col1', name: 'Column 1', width: '100' },
            { id: 'col2', name: 'Column 2', width: '150px' },
            { id: 'col3', name: 'Column 3' },
          ]}
        />,
        {
          container: document.body.appendChild(document.createElement('table')),
        }
      );
      expect(screen.getAllByText('Column 1')[0].closest('th')).toHaveStyle({
        width: '100px',
      });
      expect(screen.getAllByText('Column 2')[0].closest('th')).toHaveStyle({
        width: '100px',
      });
      expect(screen.getAllByText('Column 3')[0].closest('th')).toHaveStyle({
        width: '100px',
      });
    });

    it('handles removing columns by distributing the width on remaining cols', () => {
      mockGetBoundingClientRect.mockImplementation(() => ({ width: 100 }));
      const { rerender } = render(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });
      myProps.tableState.ordering = myProps.tableState.ordering.slice(2);
      myProps.columns = myProps.columns.slice(2);

      rerender(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });

      expect(screen.getAllByText('Column 3')[0].closest('th')).toHaveStyle({
        width: '300px',
      });
    });

    it('handles removing hidden columns without any widths', () => {
      mockGetBoundingClientRect.mockImplementation(() => ({ width: 100 }));
      const orderingWidthHiddenCol1 = [
        { columnId: 'col1', isHidden: true },
        ...myProps.tableState.ordering.slice(1),
      ];
      myProps.tableState.ordering = orderingWidthHiddenCol1;
      myProps.tableState.activeBar = 'column';

      const { rerender } = render(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });
      myProps.tableState.ordering = myProps.tableState.ordering.slice(1);
      myProps.columns = myProps.columns.slice(1);

      rerender(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });
      const toggleHideCol2Button = screen.getAllByText('Column 2')[1];
      fireEvent.click(toggleHideCol2Button);

      expect(myActions.onColumnResize).toHaveBeenCalledWith([
        { id: 'col2', name: 'Column 2', width: '100px' },
        { id: 'col3', name: 'Column 3', width: '200px' },
      ]);
    });

    it('handles adding new columns by subtracting the needed width from other visible columns', () => {
      // Make sure all columns have an initial width of 200 so that there is plenty of space to subtract
      myProps.columns = myProps.columns.map((col) => ({
        ...col,
        width: '200px',
      }));
      mockGetBoundingClientRect.mockImplementation(() => ({ width: 200 }));

      const { rerender } = render(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });

      expect(screen.getAllByText('Column 1')[0].closest('th')).toHaveStyle({
        width: '200px',
      });
      expect(screen.getAllByText('Column 2')[0].closest('th')).toHaveStyle({
        width: '200px',
      });
      expect(screen.getAllByText('Column 3')[0].closest('th')).toHaveStyle({
        width: '200px',
      });

      // Add two new columns
      myProps.tableState.ordering = [
        ...myProps.tableState.ordering,
        { columnId: 'col4', isHidden: false },
        { columnId: 'col5', isHidden: false },
      ];
      myProps.columns = [
        ...myProps.columns,
        { id: 'col4', name: 'Column 4', width: '150px' },
        { id: 'col5', name: 'Column 5', width: '150px' },
      ];

      rerender(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });

      expect(screen.getAllByText('Column 1')[0].closest('th')).toHaveStyle({
        width: '120px',
      });
      expect(screen.getAllByText('Column 2')[0].closest('th')).toHaveStyle({
        width: '120px',
      });
      expect(screen.getAllByText('Column 3')[0].closest('th')).toHaveStyle({
        width: '120px',
      });
      expect(screen.getAllByText('Column 4')[0].closest('th')).toHaveStyle({
        width: '120px',
      });
      expect(screen.getAllByText('Column 5')[0].closest('th')).toHaveStyle({
        width: '120px',
      });
    });

    it('handles adding and removing columns during the same rerender', () => {
      // Make sure all columns have an initial width of 200 so that there is plenty of space to subtract
      myProps.columns = myProps.columns.map((col) => ({
        ...col,
        width: '200px',
      }));
      mockGetBoundingClientRect.mockImplementation(() => ({ width: 200 }));

      const { rerender } = render(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });

      expect(screen.getAllByText('Column 1')[0].closest('th')).toHaveStyle({
        width: '200px',
      });
      expect(screen.getAllByText('Column 2')[0].closest('th')).toHaveStyle({
        width: '200px',
      });
      expect(screen.getAllByText('Column 3')[0].closest('th')).toHaveStyle({
        width: '200px',
      });

      // Add 2 new columns
      myProps.tableState.ordering = [
        ...myProps.tableState.ordering,
        { columnId: 'col4', isHidden: false },
        { columnId: 'col5', isHidden: false },
      ];
      myProps.columns = [
        ...myProps.columns,
        { id: 'col4', name: 'Column 4', width: '200px' },
        { id: 'col5', name: 'Column 5', width: '200px' },
      ];
      // Remove one column
      myProps.tableState.ordering = myProps.tableState.ordering.slice(1);
      myProps.columns = myProps.columns.slice(1);

      rerender(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });

      expect(screen.getAllByText('Column 2')[0].closest('th')).toHaveStyle({
        width: '150px',
      });
      expect(screen.getAllByText('Column 3')[0].closest('th')).toHaveStyle({
        width: '150px',
      });
      expect(screen.getAllByText('Column 4')[0].closest('th')).toHaveStyle({
        width: '150px',
      });
    });

    it('handles adding a new hidden column', () => {
      mockGetBoundingClientRect.mockImplementation(() => ({ width: 100 }));
      const { rerender } = render(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });

      // Add 1 new hidden columns
      myProps.tableState.ordering = [
        ...myProps.tableState.ordering,
        { columnId: 'col4', isHidden: true },
      ];
      myProps.columns = [...myProps.columns, { id: 'col4', name: 'Column 4', width: '100px' }];

      rerender(<TableHead {...myProps} />, {
        container: document.body.appendChild(document.createElement('table')),
      });

      expect(screen.getAllByText('Column 1')[0].closest('th')).toHaveStyle({
        width: '100px',
      });
      expect(screen.getAllByText('Column 2')[0].closest('th')).toHaveStyle({
        width: '100px',
      });
      expect(screen.getAllByText('Column 3')[0].closest('th')).toHaveStyle({
        width: '100px',
      });
      expect(screen.getAllByText('Column 4')[0].closest('th')).not.toHaveStyle({
        width: '100px',
      });
    });
  });
});

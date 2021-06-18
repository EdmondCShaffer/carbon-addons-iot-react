import React, { createElement, useMemo, useRef, useState } from 'react';
import { boolean, text, select, array } from '@storybook/addon-knobs';
import { withReadme } from 'storybook-readme';
import { action } from '@storybook/addon-actions';
import { SettingsAdjust16 } from '@carbon/icons-react';
import isEqual from 'lodash/isEqual';
import assign from 'lodash/assign';

import RuleBuilder from '../RuleBuilder/RuleBuilder';
import FullWidthWrapper from '../../internal/FullWidthWrapper';
import StoryNotice from '../../internal/StoryNotice';
import FlyoutMenu, { FlyoutMenuDirection } from '../FlyoutMenu/FlyoutMenu';
import { csvDownloadHandler } from '../../utils/componentUtilityFunctions';
import Button from '../Button/Button';

import StatefulTable from './StatefulTable';
import {
  initialState,
  getNewRow,
  tableActions,
  selectTextWrapping,
  tableColumnsFixedWidth,
  tableData,
  tableColumns,
  defaultOrdering,
  tableColumnsWithOverflowMenu,
  tableColumnsWithAlignment,
} from './Table.story';
import Table from './Table';
import README from './README.md';
import TableManageViewsModal from './TableManageViewsModal/TableManageViewsModal';
import TableViewDropdown from './TableViewDropdown/TableViewDropdown';
import TableSaveViewModal from './TableSaveViewModal/TableSaveViewModal';

export const StatefulTableWithNestedRowItems = (props) => {
  const tableData = initialState.data.map((i, idx) => ({
    ...i,
    children:
      idx % 4 !== 0
        ? [getNewRow(idx, 'A', true), getNewRow(idx, 'B', true)]
        : idx === 4
        ? [
            getNewRow(idx, 'A', true),
            {
              ...getNewRow(idx, 'B'),
              children: [
                getNewRow(idx, 'B-1', true),
                {
                  ...getNewRow(idx, 'B-2'),
                  children: [getNewRow(idx, 'B-2-A', true), getNewRow(idx, 'B-2-B', true)],
                },
                getNewRow(idx, 'B-3', true),
              ],
            },
            getNewRow(idx, 'C', true),
            {
              ...getNewRow(idx, 'D', true),
              children: [
                getNewRow(idx, 'D-1', true),
                getNewRow(idx, 'D-2', true),
                getNewRow(idx, 'D-3', true),
              ],
            },
          ]
        : undefined,
  }));
  return (
    <div>
      <StatefulTable
        id="table"
        {...initialState}
        secondaryTitle={text('Secondary Title', `Row count: ${initialState.data.length}`)}
        columns={tableColumnsFixedWidth}
        data={tableData}
        options={{
          ...initialState.options,
          hasRowNesting: true,
          hasFilter: true,
          wrapCellText: select('wrapCellText', selectTextWrapping, 'always'),
        }}
        view={{
          ...initialState.view,
          filters: [],
          toolbar: {
            activeBar: null,
          },
        }}
        actions={tableActions}
        lightweight={boolean('lightweight', false)}
        {...props}
      />
    </div>
  );
};

export default {
  title: '1 - Watson IoT/Table/StatefulTable',

  parameters: {
    component: StatefulTable,
  },

  excludeStories: [
    'tableColumns',
    'tableColumnsWithAlignment',
    'tableColumnsFixedWidth',
    'tableColumnsWithOverflowMenu',
    'initialState',
    'StatefulTableWithNestedRowItems',
  ],
};

export const SimpleStatefulExample = withReadme(README, () => (
  <FullWidthWrapper>
    <StatefulTable
      id="table"
      {...initialState}
      actions={tableActions}
      lightweight={boolean('lightweight', false)}
      options={{
        hasRowSelection: select('hasRowSelection', ['multi', 'single'], 'multi'),
        hasRowExpansion: boolean('hasRowExpansion', false),
        hasRowNesting: boolean('hasRowNesting', false),
        wrapCellText: select('wrapCellText', selectTextWrapping, 'always'),
      }}
      view={{ table: { selectedIds: array('selectedIds', []) } }}
    />
  </FullWidthWrapper>
));

SimpleStatefulExample.story = {
  name: 'simple stateful table',
  parameters: {
    info: {
      text:
        'This is an example of the <StatefulTable> component that uses local state to handle all the table actions. This is produced by wrapping the <Table> in a container component and managing the state associated with features such the toolbar, filters, row select, etc. For more robust documentation on the prop model and source, see the other "with function" stories.',
      propTables: [Table],
      propTablesExclude: [StatefulTable],
    },
  },
};

export const StatefulExampleWithRowNestingAndFixedColumns = withReadme(README, () => (
  <StatefulTableWithNestedRowItems />
));

StatefulExampleWithRowNestingAndFixedColumns.story = {
  name: 'Stateful Example with row nesting and fixed columns',

  parameters: {
    info: {
      text: `

      This stateful table has nested rows.  To setup your table this way you must pass a children prop along with each of your data rows.

      <br />

      ~~~js
      data=[
        {
          id: 'rowid',
          values: {
            col1: 'value1
          },
          children: [
            {
              id: 'child-rowid,
              values: {
                col1: 'nested-value1'
              }
            }
          ]
        }
      ]
      ~~~

      <br />

      You must also set hasRowNesting to true in your table options

      <br />

      ~~~js
        options={
          hasRowNesting: true
        }
      ~~~

      <br />

      `,
      propTables: [Table],
      propTablesExclude: [StatefulTable],
    },
  },
};

export const StatefulExampleWithSingleNestedHierarchy = withReadme(README, () => {
  const tableData = initialState.data.map((i, idx) => ({
    ...i,
    children: [getNewRow(idx, 'A', true), getNewRow(idx, 'B', true)],
  }));
  return (
    <div>
      <StatefulTable
        id="table"
        {...initialState}
        secondaryTitle={text('Secondary Title', `Row count: ${initialState.data.length}`)}
        columns={tableColumns}
        data={tableData}
        options={{
          ...initialState.options,
          hasRowNesting: {
            hasSingleNestedHierarchy: true,
          },
          wrapCellText: select('wrapCellText', selectTextWrapping, 'always'),
        }}
        actions={tableActions}
        lightweight={boolean('lightweight', false)}
      />
    </div>
  );
});

StatefulExampleWithSingleNestedHierarchy.story = {
  name: 'Stateful Example with single nested hierarchy',

  parameters: {
    info: {
      text: `

      This stateful table has nested rows.  To setup your table this way you must pass a children prop along with each of your data rows.
      In addition, if there is a single level of row nesting, hasRowNesting can be customized to add additional styling seen in this story

      <br />

      ~~~js
      data=[
        {
          id: 'rowid',
          values: {
            col1: 'value1
          },
          children: [
            {
              id: 'child-rowid,
              values: {
                col1: 'nested-value1'
              }
            }
          ]
        }
      ]
      ~~~

      <br />

      You must also set hasRowExpansion to true and hasRowNesting to an object with hasSingleLevelRowNesting to true in your table options

      <br />

      ~~~js
        options={
          hasRowExpansion: true,
          hasRowNesting: {
            hasSingleLevelRowNesting: true
          }
        }
      ~~~

      <br />

      `,
      propTables: [Table],
      propTablesExclude: [StatefulTable],
    },
  },
};

export const StatefulExampleWithMultiselectFiltering = withReadme(README, () => (
  <FullWidthWrapper>
    <StatefulTable
      id="table"
      {...initialState}
      columns={initialState.columns.map((column) => {
        if (column.filter) {
          return {
            ...column,
            filter: {
              ...column.filter,
              isMultiselect: !!column.filter?.options,
            },
          };
        }
        return column;
      })}
      view={{
        ...initialState.view,
        pagination: {
          ...initialState.view.pagination,
          maxPages: 5,
        },
        toolbar: {
          activeBar: 'filter',
        },
        filters: [],
      }}
      secondaryTitle={text('Secondary Title', `Row count: ${initialState.data.length}`)}
      actions={tableActions}
      isSortable
      lightweight={boolean('lightweight', false)}
      options={{
        ...initialState.options,
        hasFilter: select('hasFilter', ['onKeyPress', 'onEnterAndBlur'], 'onKeyPress'),
        wrapCellText: select('wrapCellText', selectTextWrapping, 'always'),
        hasSingleRowEdit: true,
      }}
    />
  </FullWidthWrapper>
));

StatefulExampleWithMultiselectFiltering.story = {
  name: 'Stateful Example with multiselect filtering',

  parameters: {
    info: {
      text: `This table has a multiselect filter. To support multiselect filtering, make sure to pass isMultiselect: true to the filter prop on the table.`,
      propTables: [Table],
      propTablesExclude: [StatefulTable],
    },
  },
};

export const StatefulExampleWithPreSetMultiselectFiltering = withReadme(README, () => (
  <FullWidthWrapper>
    <StatefulTable
      id="table"
      {...initialState}
      columns={initialState.columns.map((column) => {
        if (column.filter) {
          return {
            ...column,
            filter: {
              ...column.filter,
              isMultiselect: !!column.filter?.options,
            },
          };
        }
        return column;
      })}
      view={{
        ...initialState.view,
        pagination: {
          ...initialState.view.pagination,
          maxPages: 5,
        },
        toolbar: {
          activeBar: 'filter',
        },
      }}
      secondaryTitle={text('Secondary Title', `Row count: ${initialState.data.length}`)}
      actions={tableActions}
      isSortable
      lightweight={boolean('lightweight', false)}
      options={{
        ...initialState.options,
        hasFilter: select('hasFilter', ['onKeyPress', 'onEnterAndBlur'], 'onKeyPress'),
        wrapCellText: select('wrapCellText', selectTextWrapping, 'always'),
        hasSingleRowEdit: true,
      }}
    />
  </FullWidthWrapper>
));

StatefulExampleWithPreSetMultiselectFiltering.story = {
  name: 'Stateful Example with pre-set multiselect filtering',

  parameters: {
    info: {
      text: `This table has a multiselect filter. To support multiselect filtering, make sure to pass isMultiselect: true to the filter prop on the table.`,
      propTables: [Table],
      propTablesExclude: [StatefulTable],
    },
  },
};

export const Minitable = withReadme(README, () => (
  <StatefulTable
    id="table"
    secondaryTitle={text('Secondary Title', `Row count: ${initialState.data.length}`)}
    style={{ maxWidth: '300px' }}
    columns={tableColumns.slice(0, 2)}
    data={tableData}
    actions={tableActions}
    options={{
      hasSearch: true,
      hasPagination: true,
      hasRowSelection: 'single',
    }}
  />
));

Minitable.story = {
  name: 'minitable',

  parameters: {
    info: {
      text: `The table will automatically adjust to narrow mode if you set a style or class that makes max-width smaller than 600 pixels (which is the width needed to render the full pagination controls) `,
    },
  },
};

export const SimpleStatefulExampleWithColumnOverflowMenu = withReadme(README, () => (
  <FullWidthWrapper>
    <StatefulTable
      id="table"
      {...initialState}
      columns={tableColumnsWithOverflowMenu}
      actions={tableActions}
      lightweight={boolean('lightweight', false)}
      options={{
        hasAggregations: true,
        hasPagination: boolean('hasPagination', true),
        hasRowSelection: select('hasRowSelection', ['multi', 'single'], 'multi'),
        hasRowExpansion: false,
        hasResize: true,
        wrapCellText: select('wrapCellText', selectTextWrapping, 'always'),
      }}
      view={{
        aggregations: {
          label: 'Total',
          columns: [
            {
              id: 'number',
              align: 'end',
            },
          ],
        },
        table: { selectedIds: array('selectedIds', []) },
      }}
    />
  </FullWidthWrapper>
));

SimpleStatefulExampleWithColumnOverflowMenu.story = {
  name: 'with column overflow menu and aggregate column values',

  parameters: {
    info: {
      text:
        'This is an example of the <StatefulTable> component that implements the overflow menu in the column header. Refer to the source files under /src/components/Table/TableHead for details. ',
      propTables: [Table],
      propTablesExclude: [StatefulTable],
    },
  },
};

export const StatefulExampleWithI18NStrings = withReadme(README, () => (
  <StatefulTable
    id="table"
    {...initialState}
    secondaryTitle={text('Secondary Title', `Row count: ${initialState.data.length}`)}
    actions={tableActions}
    options={{
      hasRowActions: true,
    }}
    view={{
      filters: [],
      table: {
        sort: {
          columnId: 'number',
          direction: 'DESC',
        },
        rowActions: [
          {
            rowId: 'row-1',
            isRunning: true,
          },
          {
            rowId: 'row-3',
            error: {
              title: 'Import failed',
              message: 'Contact your administrator',
            },
          },
        ],
      },
    }}
    locale={select('locale', ['fr', 'en'], 'fr')}
    i18n={{
      /** pagination */
      pageBackwardAria: text('i18n.pageBackwardAria', '__Previous page__'),
      pageForwardAria: text('i18n.pageForwardAria', '__Next page__'),
      pageNumberAria: text('i18n.pageNumberAria', '__Page Number__'),
      itemsPerPage: text('i18n.itemsPerPage', '__Items per page:__'),
      itemsRange: (min, max) => `__${min}–${max} items__`,
      currentPage: (page) => `__page ${page}__`,
      itemsRangeWithTotal: (min, max, total) => `__${min}–${max} of ${total} items__`,
      pageRange: (current, total) => `__${current} of ${total} pages__`,
      /** table body */
      overflowMenuAria: text('i18n.overflowMenuAria', '__More actions__'),
      clickToExpandAria: text('i18n.clickToExpandAria', '__Click to expand content__'),
      clickToCollapseAria: text('i18n.clickToCollapseAria', '__Click to collapse content__'),
      selectAllAria: text('i18n.selectAllAria', '__Select all items__'),
      selectRowAria: text('i18n.selectRowAria', '__Select row__'),
      /** toolbar */
      clearAllFilters: text('i18n.clearAllFilters', '__Clear all filters__'),
      searchLabel: text('i18n.searchLabel', '__Search__'),
      searchPlaceholder: text('i18n.searchPlaceholder', '__Search__'),
      columnSelectionButtonAria: text('i18n.columnSelectionButtonAria', '__Column Selection__'),
      filterButtonAria: text('i18n.filterButtonAria', '__Filters__'),
      editButtonAria: text('i18n.editButtonAria', '__Edit rows__'),
      clearFilterAria: text('i18n.clearFilterAria', '__Clear filter__'),
      filterAria: text('i18n.filterAria', '__Filter__'),
      openMenuAria: text('i18n.openMenuAria', '__Open menu__'),
      closeMenuAria: text('i18n.closeMenuAria', '__Close menu__'),
      clearSelectionAria: text('i18n.clearSelectionAria', '__Clear selection__'),
      batchCancel: text('i18n.batchCancel', '__Cancel__'),
      itemsSelected: text('i18n.itemsSelected', '__items selected__'),
      itemSelected: text('i18n.itemSelected', '__item selected__'),
      filterNone: text('i18n.filterNone', '__filterNone__'),
      filterAscending: text('i18n.filterAscending', '__filterAscending__'),
      filterDescending: text('i18n.filterDescending', '__filterDescending__'),
      /** empty state */
      emptyMessage: text('i18n.emptyMessage', '__There is no data__'),
      emptyMessageWithFilters: text(
        'i18n.emptyMessageWithFilters',
        '__No results match the current filters__'
      ),
      emptyButtonLabel: text('i18n.emptyButtonLabel', '__Create some data__'),
      emptyButtonLabelWithFilters: text('i18n.emptyButtonLabel', '__Clear all filters__'),
      inProgressText: text('i18n.inProgressText', '__In Progress__'),
      actionFailedText: text('i18n.actionFailedText', '__Action Failed__'),
      learnMoreText: text('i18n.learnMoreText', '__Learn More__'),
      dismissText: text('i18n.dismissText', '__Dismiss__'),
      // table error state
      tableErrorStateTitle: text('i18n.tableErrorStateTitle', 'Unable to load the page'),
      buttonLabelOnTableError: text('i18n.buttonLabelOnTableError', 'Refresh the page'),
    }}
  />
));

StatefulExampleWithI18NStrings.story = {
  name: 'Stateful Example with I18N strings',

  parameters: {
    info: {
      text: `

      By default the table shows all of its internal strings in English.  If you want to support multiple languages, you must populate these i18n keys with the appropriate label for the selected UI language.

      <br />

      ~~~js
        i18n={

          /** pagination */
          pageBackwardAria,
          pageForwardAria,
          pageNumberAria,
          itemsPerPage,
          itemsRange,
          currentPage,
          itemsRangeWithTotal,
          pageRange,

          /** table body */
          overflowMenuAria,
          clickToExpandAria,
          clickToCollapseAria,
          selectAllAria,
          selectRowAria,

          /** toolbar */
          clearAllFilters,
          searchPlaceholder,
          columnSelectionButtonAria,
          filterButtonAria,
          editButtonAria,
          clearFilterAria,
          filterAria,
          openMenuAria,
          closeMenuAria,
          clearSelectionAria,

          /** empty state */
          emptyMessage,
          emptyMessageWithFilters,
          emptyButtonLabel,
          emptyButtonLabelWithFilters,
          inProgressText,
          actionFailedText,
          learnMoreText,
          dismissText,
        }

      <br />

      `,
      propTables: [Table],
      propTablesExclude: [StatefulTable],
    },
  },
};

export const StatefulExampleWithColumnTooltip = () => (
  <FullWidthWrapper>
    <StatefulTable
      id="table"
      {...initialState}
      columns={tableColumns.map((column) => ({
        ...column,
        tooltip: column.id === 'select' ? 'Select an option' : undefined,
      }))}
      actions={tableActions}
      lightweight={boolean('lightweight', false)}
      options={{
        hasRowSelection: select('hasRowSelection', ['multi', 'single'], 'multi'),
        hasRowExpansion: boolean('hasRowExpansion', false),
        hasRowNesting: boolean('hasRowNesting', false),
        wrapCellText: 'alwaysTruncate',
      }}
      view={{ table: { selectedIds: array('selectedIds', []) } }}
    />
  </FullWidthWrapper>
);

StatefulExampleWithColumnTooltip.story = {
  parameters: {
    info: {
      propTables: [Table],
      propTablesExclude: [StatefulTable],
    },
  },
};

export const SimpleStatefulExampleWithAlignment = withReadme(README, () => (
  <FullWidthWrapper>
    <StatefulTable
      id="table"
      {...initialState}
      secondaryTitle={text('Secondary Title', `Row count: ${initialState.data.length}`)}
      columns={tableColumnsWithAlignment}
      actions={tableActions}
      lightweight={boolean('lightweight', false)}
      options={{
        hasRowSelection: select('hasRowSelection', ['multi', 'single'], 'multi'),
        hasRowExpansion: false,
      }}
      view={{ table: { selectedIds: array('selectedIds', []) } }}
    />
  </FullWidthWrapper>
));

SimpleStatefulExampleWithAlignment.story = {
  name: 'Simple Stateful Example with alignment',

  parameters: {
    info: {
      text:
        'This is an example of the <StatefulTable> component that uses local state to handle all the table actions. This is produced by wrapping the <Table> in a container component and managing the state associated with features such the toolbar, filters, row select, etc. For more robust documentation on the prop model and source, see the other "with function" stories.',
      propTables: [Table],
      propTablesExclude: [StatefulTable],
    },
  },
};

export const StatefulExampleWithEveryThirdRowUnselectable = withReadme(README, () => (
  <StatefulTable
    id="table"
    {...initialState}
    secondaryTitle={text('Secondary Title', `Row count: ${initialState.data.length}`)}
    data={initialState.data.map((eachRow, index) => ({
      ...eachRow,
      isSelectable: index % 3 !== 0,
    }))}
    actions={tableActions}
    lightweight={boolean('lightweight', false)}
    options={{
      hasRowSelection: select('hasRowSelection', ['multi', 'single'], 'multi'),
      hasRowExpansion: false,
    }}
    view={{ table: { selectedIds: array('selectedIds', []) } }}
  />
));

StatefulExampleWithEveryThirdRowUnselectable.story = {
  name: 'Stateful Example with every third row unselectable',

  parameters: {
    info: {
      text:
        'This is an example of the <StatefulTable> component that uses local state to handle all the table actions. This is produced by wrapping the <Table> in a container component and managing the state associated with features such the toolbar, filters, row select, etc. For more robust documentation on the prop model and source, see the other "with function" stories.',
      propTables: [Table],
      propTablesExclude: [StatefulTable],
    },
  },
};

export const StatefulExampleWithExpansionMaxPagesAndColumnResize = withReadme(README, () => (
  <FullWidthWrapper>
    <StatefulTable
      id="table"
      {...initialState}
      view={{
        ...initialState.view,
        pagination: {
          ...initialState.view.pagination,
          maxPages: 5,
        },
        toolbar: {
          activeBar: 'filter',
          customToolbarContent: (
            <FlyoutMenu
              direction={FlyoutMenuDirection.BottomEnd}
              buttonProps={{ size: 'default', renderIcon: SettingsAdjust16 }}
              iconDescription="Helpful description"
              triggerId="test-flyout-id"
              transactional={boolean('Flyout Transactional', true)}
              onApply={action('Flyout Menu Apply Clicked')}
              onCancel={action('Flyout Menu Cancel Clicked')}
            >
              Example Flyout Content
            </FlyoutMenu>
          ),
        },
      }}
      secondaryTitle={text('Secondary Title', `Row count: ${initialState.data.length}`)}
      actions={{
        ...tableActions,
        toolbar: {
          ...tableActions.toolbar,
          onDownloadCSV: (filteredData) => csvDownloadHandler(filteredData, 'my table data'),
        },
      }}
      isSortable
      lightweight={boolean('lightweight', false)}
      options={{
        ...initialState.options,
        hasResize: true,
        hasFilter: select('hasFilter', ['onKeyPress', 'onEnterAndBlur'], 'onKeyPress'),
        wrapCellText: select('wrapCellText', selectTextWrapping, 'always'),
        hasSingleRowEdit: true,
      }}
    />
  </FullWidthWrapper>
));

StatefulExampleWithExpansionMaxPagesAndColumnResize.story = {
  name: 'Stateful Example with expansion, maxPages, and column resize',

  parameters: {
    info: {
      text: `

      This table has expanded rows.  To support expanded rows, make sure to pass the expandedData prop to the table and set options.hasRowExpansion=true.

      <br />

      ~~~js
      expandedData={[
        {rowId: 'row-0',content: <RowExpansionContent />},
        {rowId: 'row-1',content: <RowExpansionContent />},
        {rowId: 'row-2',content: <RowExpansionContent />},
        …
      ]}

      options = {
        hasRowExpansion:true
      }

      view={{
        pagination: {
          maxPages: 5,
        }
      }}

      ~~~

      <br />

      `,
      propTables: [Table],
      propTablesExclude: [StatefulTable],
    },
  },
};

export const StatefulExampleWithCreateSaveViews = withReadme(README, () => {
  // The initial default state for this story is one with no active filters
  // and no default search value etc, i.e. a view all scenario.
  const defaultState = {
    ...initialState,
    columns: initialState.columns.map((col) => ({
      ...col,
      width: '150px',
    })),
    view: {
      ...initialState.view,
      filters: [],
      toolbar: {
        activeBar: 'filter',
        search: { defaultValue: '' },
      },
    },
  };

  // Create some mockdata to represent previously saved views.
  // The props can be any subset of the view and columns prop that
  // you need in order to successfully save and load your views.
  const viewExample = {
    description: 'Columns: 7, Filters: 0, Search: pinoc',
    id: 'view1',
    isPublic: true,
    isDeleteable: true,
    isEditable: true,
    title: 'My view 1',
    props: {
      view: {
        filters: [],
        table: {
          ordering: defaultState.view.table.ordering,
          sort: {},
        },
        toolbar: {
          activeBar: 'column',
          search: { defaultValue: text('defaultSearchValue', 'pinoc') },
        },
      },
      columns: defaultState.columns,
    },
  };
  const viewExample2 = {
    description: 'Columns: 7, Filters: 1, Search:',
    id: 'view2',
    isPublic: false,
    isDeleteable: true,
    isEditable: true,
    title: 'My view 2',
    props: {
      view: {
        filters: [{ columnId: 'string', value: 'helping' }],
        table: {
          ordering: defaultState.view.table.ordering,
          sort: {
            columnId: 'select',
            direction: 'DESC',
          },
        },
        toolbar: {
          activeBar: 'filter',
          search: { defaultValue: '' },
        },
      },
      columns: defaultState.columns,
    },
  };

  /** The "store" that holds all the existing views */
  const [viewsStorage, setViewsStorage] = useState([viewExample, viewExample2]);
  /** Tracks if the user has modified the view since it was selected */
  const [selectedViewEdited, setSelectedViewEdited] = useState(false);
  /** The props & metadata of the view currently selected */
  const [selectedView, setSelectedView] = useState(viewExample2);
  /** The props & metadata representing the current state needed by SaveViewModal  */
  const [viewToSave, setViewToSave] = useState(undefined);
  /** The id of the view that is currently the default */
  const [defaultViewId, setDefaultViewId] = useState('view2');
  /** Number of views per page in the TableManageViewModal */
  const manageViewsRowsPerPage = 10;
  /** Current page number in the TableManageViewModal */
  const [manageViewsCurrentPageNumber, setManageViewsCurrentPageNumber] = useState(1);
  /** Current filters in the TableManageViewModal. Can hold 'searchTerm' and 'showPublic' */
  const [manageViewsCurrentFilters, setManageViewsCurrentFilters] = useState({
    searchTerm: '',
    showPublic: true,
  });
  /** Flag needed to open and close the TableManageViewModal */
  const [manageViewsModalOpen, setManageViewsModalOpen] = useState(false);
  /** Collection of filtered views needed for the pagination in the TableManageViewModal */
  const [manageViewsFilteredViews, setManageViewsFilteredViews] = useState(viewsStorage);
  /** Collection of views on the current page in the TableManageViewModal */
  const [manageViewsCurrentPageItems, setManageViewsCurrentPageItems] = useState(
    viewsStorage.slice(0, manageViewsRowsPerPage)
  );

  // The seletable items to be presented by the ViewDropDown.
  const selectableViews = useMemo(
    () => viewsStorage.map(({ id, title }) => ({ id, text: title })),
    [viewsStorage]
  );

  // A helper method for currentUserViewRef that extracts a relevant subset of the
  // properties avilable in the "view" prop. It also extracts the columns since they
  // potentially hold the column widths.
  const extractViewRefData = ({ view, columns }) => {
    return {
      columns,
      view: {
        filters: view.filters,
        table: {
          ordering: view.table.ordering,
          sort: view.table.sort || {},
        },
        toolbar: {
          activeBar: view.toolbar.activeBar,
          search: { ...view.toolbar.search },
        },
      },
    };
  };

  // The table's current user view configuration (inlcuding unsaved changes to the selected view).
  // useRef is preferred over useState so that the value can be updated without causing a
  // rerender of the table.
  const currentUserViewRef = useRef({
    props: {
      ...(selectedView ? selectedView.props : extractViewRefData(defaultState)),
    },
  });

  // Callback from the StatefulTable when view, columns or search value have
  // been modified and we need to update our ref that holds the latest view config.
  const onUserViewModified = (newState) => {
    const {
      view,
      columns,
      // The default search value is not updated just because the user modifies
      // the actual search input so in order to set the defaultValue we can access
      // the internal "currentSearchValue" via a special state prop
      state: { currentSearchValue },
    } = newState;

    const props = extractViewRefData({ view, columns });
    props.view.toolbar.search = {
      ...props.view.toolbar.search,
      defaultValue: currentSearchValue,
    };
    currentUserViewRef.current = { props };

    if (!selectedView) {
      setSelectedViewEdited(!isEqual(props, extractViewRefData(defaultState)));
    } else {
      setSelectedViewEdited(!isEqual(props, selectedView.props));
    }
  };

  /**
   * The TableManageViewsModal is an external component that can be placed outside
   * the table. It is highly customizable and is used to list existing views and
   * provide the used the option to delete and edit the view's metadata. See the
   * TableManageViewsModal story for a more detailed documentation.
   */
  const renderManageViewsModal = () => {
    const showPage = (pageNumber, views) => {
      const rowUpperLimit = pageNumber * manageViewsRowsPerPage;
      const currentItemsOnPage = views.slice(rowUpperLimit - manageViewsRowsPerPage, rowUpperLimit);
      setManageViewsCurrentPageNumber(pageNumber);
      setManageViewsCurrentPageItems(currentItemsOnPage);
    };

    const applyFiltering = ({ searchTerm, showPublic }) => {
      const views = viewsStorage
        .filter(
          (view) =>
            searchTerm === '' || view.title.toLowerCase().search(searchTerm.toLowerCase()) !== -1
        )
        .filter((view) => (showPublic ? view : !view.isPublic));

      setManageViewsFilteredViews(views);
      showPage(1, views);
    };

    const onDelete = (viewId) => {
      if (selectedView?.id === viewId) {
        currentUserViewRef.current = {
          props: { ...extractViewRefData(defaultState) },
        };
        setSelectedViewEdited(false);
        setSelectedView(undefined);
      }

      const deleteIndex = viewsStorage.findIndex((view) => view.id === viewId);
      setViewsStorage((existingViews) => {
        const modifiedViews = [...existingViews];
        modifiedViews.splice(deleteIndex, 1);
        setManageViewsFilteredViews(modifiedViews);
        showPage(1, modifiedViews);
        return modifiedViews;
      });
    };

    return (
      <TableManageViewsModal
        actions={{
          onDisplayPublicChange: (showPublic) => {
            const newFilters = {
              ...manageViewsCurrentFilters,
              showPublic,
            };
            setManageViewsCurrentFilters(newFilters);
            applyFiltering(newFilters);
          },
          onSearchChange: (searchTerm = '') => {
            const newFilters = {
              ...manageViewsCurrentFilters,
              searchTerm,
            };
            setManageViewsCurrentFilters(newFilters);
            applyFiltering(newFilters);
          },
          onEdit: (viewId) => {
            setManageViewsModalOpen(false);
            const viewToEdit = viewsStorage.find((view) => view.id === viewId);
            setSelectedView(viewToEdit);
            setViewToSave(viewToEdit);
          },
          onDelete,
          onClearError: action('onClearManageViewsModalError'),
          onClose: () => setManageViewsModalOpen(false),
        }}
        defaultViewId={defaultViewId}
        error={select('error', [undefined, 'My error msg'], undefined)}
        isLoading={boolean('isLoading', false)}
        open={manageViewsModalOpen}
        views={manageViewsCurrentPageItems}
        pagination={{
          page: manageViewsCurrentPageNumber,
          onPage: (pageNumber) => showPage(pageNumber, manageViewsFilteredViews),
          maxPage: Math.ceil(manageViewsFilteredViews.length / manageViewsRowsPerPage),
          pageOfPagesText: (pageNumber) => `Page ${pageNumber}`,
        }}
      />
    );
  };

  /**
   * The TableViewDropdown is an external component that needs to be passed in
   * via the customToolbarContent and positioned according to the applications needs.
   * Most of the functionality in the TableViewDropdown can be overwritten. See the
   * TableViewDropdown story for a more detailed documentation.
   */

  const renderViewDropdown = () => {
    return (
      <TableViewDropdown
        style={{ order: '-1', width: '300px' }}
        selectedViewId={selectedView?.id}
        selectedViewEdited={selectedViewEdited}
        views={selectableViews}
        actions={{
          onSaveAsNewView: () => {
            setViewToSave({
              id: undefined,
              ...currentUserViewRef.current,
            });
          },
          onManageViews: () => {
            setManageViewsModalOpen(true);
            setManageViewsCurrentPageItems(viewsStorage.slice(0, manageViewsRowsPerPage));
          },
          onChangeView: ({ id }) => {
            const selected = viewsStorage.find((view) => view.id === id);
            setSelectedView(selected);
            setSelectedViewEdited(false);
            currentUserViewRef.current = selected?.props || {
              props: extractViewRefData(defaultState),
            };
          },
          onSaveChanges: () => {
            setViewToSave({
              ...selectedView,
              ...currentUserViewRef.current,
            });
          },
        }}
      />
    );
  };

  /**
   * The TableSaveViewModal is a an external component that can be placed
   * outside the table. Is is used both for saving new views and for
   * updating existing ones. See the TableSaveViewModal story for a more
   * detailed documentation.
   */
  const renderSaveViewModal = () => {
    const saveView = (viewMetaData) => {
      setViewsStorage((existingViews) => {
        const modifiedStorage = [];
        const saveNew = viewToSave.id === undefined;
        const { isDefault, ...metaDataToSave } = viewMetaData;
        const generatedId = new Date().getTime().toString();

        if (saveNew) {
          const newViewToStore = {
            ...viewToSave,
            ...metaDataToSave,
            id: generatedId,
            isDeleteable: true,
            isEditable: true,
          };
          modifiedStorage.push(...existingViews, newViewToStore);
          setSelectedView(newViewToStore);
        } else {
          const indexToUpdate = existingViews.findIndex((view) => view.id === viewToSave.id);
          const viewsCopy = [...existingViews];
          const modifiedViewToStore = {
            ...viewToSave,
            ...metaDataToSave,
          };
          viewsCopy[indexToUpdate] = modifiedViewToStore;
          setSelectedView(modifiedViewToStore);
          modifiedStorage.push(...viewsCopy);
        }

        if (isDefault) {
          setDefaultViewId(saveNew ? generatedId : viewToSave.id);
        }

        setSelectedViewEdited(false);
        return modifiedStorage;
      });
      setViewToSave(undefined);
    };

    // Simple description example that can be replaced by any string or node.
    // See the TableSaveViewModal story for more examples.
    const getDescription = ({ table, filters, toolbar }) =>
      `Columns: ${table.ordering.filter((col) => !col.isHidden).length},
        Filters: ${filters?.length || 0},
        Search: ${toolbar?.search?.defaultValue}`;

    return (
      viewToSave && (
        <TableSaveViewModal
          actions={{
            onSave: saveView,
            onClose: () => {
              setViewToSave(undefined);
            },
            onClearError: action('onClearError'),
            onChange: action('onChange'),
          }}
          sendingData={boolean('sendingData', false)}
          error={select('error', [undefined, 'My error msg'], undefined)}
          open
          titleInputInvalid={boolean('titleInputInvalid', false)}
          titleInputInvalidText={text('titleInputInvalidText', undefined)}
          viewDescription={getDescription(viewToSave.props.view)}
          initialFormValues={{
            title: viewToSave.title,
            isPublic: viewToSave.isPublic,
            isDefault: viewToSave.id === defaultViewId,
          }}
          i18n={{
            modalTitle: viewToSave.id ? 'Update view' : 'Save new view',
          }}
        />
      )
    );
  };

  // We need to merge (using assign) the view properties from a few sources as
  // explained below in order to get the desired result. This is written as a
  // more general function, but it can just as well be written as an explicit
  // object literal picking the right properties from the differentsources.
  const mergedViewProp = useMemo(() => {
    const merged = assign(
      {},
      // The default state view contains properties that are not
      // part of this Save View example, e.g. pagination, so we include
      // the default state as a baseline view configuration.
      defaultState.view,
      // These are the properties specific for the currently selected view
      selectedView?.props?.view,
      // These are the properties of an unsaved modified view that already
      // have to be rendered before they become part of the selected view.
      viewToSave?.props?.view
    );
    return merged;
  }, [defaultState, selectedView, viewToSave]);

  return (
    <FullWidthWrapper>
      {renderManageViewsModal()}
      {renderSaveViewModal()}
      <StatefulTable
        key={`table-story-${selectedView?.id}`}
        id="table"
        {...defaultState}
        columns={viewToSave?.props?.columns || selectedView?.props?.columns || defaultState.columns}
        view={{
          ...mergedViewProp,
          // The TableViewDropdown should be inserted as customToolbarContent
          toolbar: {
            ...mergedViewProp.toolbar,
            customToolbarContent: renderViewDropdown(),
          },
        }}
        secondaryTitle="Table with user view management"
        actions={{
          ...tableActions,
          onUserViewModified,
        }}
        isSortable
        lightweight={boolean('lightweight', false)}
        options={{
          ...defaultState.options,
          hasResize: true,
          hasFilter: select('hasFilter', ['onKeyPress', 'onEnterAndBlur'], 'onKeyPress'),
          wrapCellText: select('wrapCellText', selectTextWrapping, 'always'),
          // Enables the behaviour in StatefulTable and Table required
          // to fully implement Create and Save Views
          hasUserViewManagement: true,
        }}
      />
    </FullWidthWrapper>
  );
});

StatefulExampleWithCreateSaveViews.story = {
  name: 'Stateful Example with Create & Save Views',
  decorators: [createElement],
  parameters: {
    info: {
      text: `
      This story shows a complete implementation of user configurable View Management.
      The story's source code is too complex to successfully be shown here, please view
      the actual source code.
      `,
      propTables: [Table],
      propTablesExclude: [StatefulTable],
    },
  },
};

export const WithPreFilledSearch = withReadme(README, () => {
  const [defaultValue, setDefaultValue] = useState('toyota');
  const sampleDefaultValues = ['whiteboard', 'scott', 'helping'];
  return (
    <>
      <p>
        Click the button below to demonstrate updating the pre-filled search (defaultValue) via
        state/props
      </p>
      <Button
        onClick={() => {
          setDefaultValue(
            sampleDefaultValues[sampleDefaultValues.indexOf(defaultValue) + 1] ||
              sampleDefaultValues[0]
          );
        }}
        style={{ marginBottom: '1rem' }}
      >
        Update defaultValue prop to new value
      </Button>
      <Button
        onClick={() => {
          setDefaultValue('');
        }}
        style={{ marginBottom: '1rem', marginLeft: '1rem' }}
      >
        Reset defaultValue prop to empty string
      </Button>
      <StatefulTable
        id="table"
        secondaryTitle={text('Secondary Title', `Row count: ${initialState.data.length}`)}
        style={{ maxWidth: '300px' }}
        columns={tableColumns.slice(0, 2)}
        data={tableData}
        actions={tableActions}
        options={{
          hasSearch: true,
          hasPagination: true,
          hasRowSelection: 'single',
        }}
        view={{
          toolbar: {
            search: {
              defaultValue,
            },
          },
        }}
        i18n={{
          emptyButtonLabelWithFilters: text('i18n.emptyButtonLabel', '__Clear all filters__'),
        }}
      />
    </>
  );
});

WithPreFilledSearch.story = {
  name: 'with pre-filled search',
  decorators: [createElement],
  parameters: {
    info: {
      text: `The table will pre-fill a search value, expand the search input and trigger a search`,
    },
  },
};

export const StatefulTableWithAdvancedFilters = withReadme(README, () => {
  const [showBuilder, setShowBuilder] = useState(false);

  const [advancedFilters, setAdvancedFilters] = useState([
    {
      filterId: 'story-filter',
      /** Text for main tilte of page */
      filterTitleText: 'Story Filter',
      /** Text for metadata for the filter */
      filterMetaText: `last updated: 2021-03-11 15:34:01`,
      /** tags associated with particular filter */
      filterTags: ['fav', 'other-tag'],
      /** users that have access to particular filter */
      filterAccess: [
        {
          username: 'Example-User',
          email: 'example@pal.com',
          name: 'Example User',
          access: 'edit',
        },
        {
          username: 'Other-User',
          email: 'other@pal.com',
          name: 'Other User',
          access: 'read',
        },
      ],
      /** All possible users that can be granted access */
      filterUsers: [
        {
          id: 'teams',
          name: 'Teams',
          groups: [
            {
              id: 'team-a',
              name: 'Team A',
              users: [
                {
                  username: '@tpeck',
                  email: 'tpeck@pal.com',
                  name: 'Templeton Peck',
                },
                {
                  username: '@jsmith',
                  email: 'jsmith@pal.com',
                  name: 'John Smith',
                },
              ],
            },
          ],
        },
        {
          username: 'Example-User',
          email: 'example@pal.com',
          name: 'Example User',
        },
        {
          username: 'Test-User',
          email: 'test@pal.com',
          name: 'Test User',
        },
        {
          username: 'Other-User',
          email: 'other@pal.com',
          name: 'Other User',
        },
      ],
      /**
       * the rules passed into the component. The RuleBuilder is a controlled component, so
       * this works the same as passing defaultValue to a controlled input component.
       */
      filterRules: {
        id: '14p5ho3pcu',
        groupLogic: 'ALL',
        rules: [
          {
            id: 'rsiru4rjba',
            columnId: 'date',
            operand: 'CONTAINS',
            value: '19',
          },
          {
            id: '34bvyub9jq',
            columnId: 'boolean',
            operand: 'EQ',
            value: 'true',
          },
        ],
      },
      filterColumns: tableColumns,
    },
    {
      filterId: 'next-filter',
      /** Text for main tilte of page */
      filterTitleText: 'Next Filter',
      /** Text for metadata for the filter */
      filterMetaText: `last updated: 2021-03-11 15:34:01`,
      /** tags associated with particular filter */
      filterTags: ['fav', 'other-tag'],
      /** users that have access to particular filter */
      filterAccess: [
        {
          username: 'Example-User',
          email: 'example@pal.com',
          name: 'Example User',
          access: 'edit',
        },
        {
          username: 'Other-User',
          email: 'other@pal.com',
          name: 'Other User',
          access: 'read',
        },
      ],
      /** All possible users that can be granted access */
      filterUsers: [
        {
          id: 'teams',
          name: 'Teams',
          groups: [
            {
              id: 'team-a',
              name: 'Team A',
              users: [
                {
                  username: '@tpeck',
                  email: 'tpeck@pal.com',
                  name: 'Templeton Peck',
                },
                {
                  username: '@jsmith',
                  email: 'jsmith@pal.com',
                  name: 'John Smith',
                },
              ],
            },
          ],
        },
        {
          username: 'Example-User',
          email: 'example@pal.com',
          name: 'Example User',
        },
        {
          username: 'Test-User',
          email: 'test@pal.com',
          name: 'Test User',
        },
        {
          username: 'Other-User',
          email: 'other@pal.com',
          name: 'Other User',
        },
      ],
      /**
       * the rules passed into the component. The RuleBuilder is a controlled component, so
       * this works the same as passing defaultValue to a controlled input component.
       */
      filterRules: {
        id: '14p5ho3pcu',
        groupLogic: 'ALL',
        rules: [
          {
            id: 'rsiru4rjba',
            columnId: 'select',
            operand: 'EQ',
            value: 'option-C',
          },
          {
            id: '34bvyub9jq',
            columnId: 'boolean',
            operand: 'EQ',
            value: 'false',
          },
        ],
      },
      filterColumns: tableColumns,
    },
  ]);

  return (
    <>
      <StoryNotice experimental componentName="StatefulTable with advancedFilters" />

      <div style={{ position: 'relative' }}>
        <StatefulTable
          id="table"
          columns={tableColumns}
          data={tableData}
          actions={{
            ...tableActions,
            toolbar: {
              ...tableActions.toolbar,
              onCreateAdvancedFilter: () => {
                setShowBuilder(true);
              },
            },
          }}
          options={{
            hasPagination: true,
            hasRowSelection: 'multi',
            hasAdvancedFilter: true,
          }}
          view={{
            filters: [
              {
                columnId: 'string',
                value: 'whiteboard',
              },
              {
                columnId: 'select',
                value: 'option-B',
              },
            ],
            advancedFilters,
            selectedAdvancedFilterIds: ['story-filter'],
            table: {
              ordering: defaultOrdering,
            },
          }}
        />
        {showBuilder && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
            }}
          >
            <RuleBuilder
              onSave={(newFilter) => {
                setAdvancedFilters((prev) => [
                  ...prev,
                  {
                    filterId: 'a-new-filter-id',
                    ...newFilter,
                  },
                ]);
                setShowBuilder(false);
              }}
              onCancel={() => {
                setShowBuilder(false);
              }}
              filter={{
                filterColumns: tableColumns.map(({ id, name }) => ({ id, name })),
              }}
            />
          </div>
        )}
      </div>
    </>
  );
});

StatefulTableWithAdvancedFilters.story = {
  name: '☢️ StatefulTable with advanced filters',
  decorators: [createElement],
};

export const WithResizeAndInitialColumnWidthsOnSimpleStatefulWithRowSelectionSort = withReadme(
  README,
  () => (
    <StatefulTable
      id="table"
      {...initialState}
      actions={tableActions}
      lightweight={boolean('lightweight', false)}
      columns={tableColumns.map((i, idx) => ({
        width: idx % 2 === 0 ? '100px' : '200px',
        isSortable: true,
        ...i,
      }))}
      options={{
        hasRowSelection: select('hasRowSelection', ['multi', 'single'], 'multi'),
        hasRowExpansion: false,
        hasResize: true,
        wrapCellText: select('wrapCellText', selectTextWrapping, 'always'),
      }}
      view={{ table: { selectedIds: array('selectedIds', []) } }}
    />
  )
);

WithResizeAndInitialColumnWidthsOnSimpleStatefulWithRowSelectionSort.story = {
  name: 'with resize and initial column widths on Simple Stateful with row selection & sort',
};

export const WithResizeHasColumnSelectionAndInitialColumnWidths = withReadme(README, () => (
  <StatefulTable
    id="table"
    options={{
      hasResize: true,
      hasColumnSelection: true,
      wrapCellText: select('wrapCellText', selectTextWrapping, 'always'),
    }}
    columns={tableColumns.map((i, idx) => ({
      width: idx % 2 === 0 ? '100px' : '200px',
      ...i,
    }))}
    data={tableData}
    actions={tableActions}
    view={{
      table: {
        ordering: defaultOrdering,
      },
    }}
  />
));

WithResizeHasColumnSelectionAndInitialColumnWidths.story = {
  name: 'with resize, hasColumnSelection and initial column widths',

  parameters: {
    info: {
      source: true,
      propTables: false,
    },
  },
};

export const WithMultiSorting = withReadme(README, () => {
  return (
    <StatefulTable
      columns={tableColumns.map((i, idx) => ({
        ...i,
        isSortable: idx !== 1,
        align: i.id === 'number' ? 'end' : i.id === 'string' ? 'center' : 'start',
      }))}
      data={tableData}
      actions={tableActions}
      options={{
        hasFilter: false,
        hasPagination: true,
        hasRowSelection: 'multi',
        hasAggregations: true,
        hasMultiSort: true,
        hasResize: true,
        hasColumnSelection: true,
      }}
      view={{
        filters: [],
        aggregations: {
          label: 'Total',
          columns: [
            {
              id: 'number',
              align: 'end',
              isSortable: true,
            },
          ],
        },
        table: {
          ordering: defaultOrdering,
          sort: [
            {
              columnId: 'select',
              direction: 'ASC',
            },
            {
              columnId: 'string',
              direction: 'ASC',
            },
          ],
        },
      }}
    />
  );
});

WithMultiSorting.story = {
  name: 'with multi-sorting',
};

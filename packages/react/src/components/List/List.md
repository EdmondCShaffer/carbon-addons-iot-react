# `List` component

## Table of Contents

- [Getting started](#getting-started)
- [Simple list](#simple-list)
- [Props](#props)
- [External links](#external-links)
  - [Source Code](#source-code)
  - [Feedback](#feedback)

## Getting Started

The list allows you to render a list of items of varying complexity and hierarchy.

```jsx
import { List } from 'carbon-addons-iot-react';
```

## Simple list

```jsx
const yankees = {
  'DJ LeMahieu': '2B',
  'Luke Voit': '1B',
  'Gary Sanchez': 'C',
  'Kendrys Morales': 'DH',
  'Gleyber Torres': 'SS',
  'Clint Frazier': 'RF',
  'Brett Gardner': 'LF',
  'Gio Urshela': '3B',
  'Cameron Maybin': 'RF',
  'Robinson Cano': '2B',
};

<List
  title="New York Yankees"
  items={Object.entries(yankees).map(([key]) => ({
    id: key,
    content: { value: key },
  }))}
/>;
```

## Props

| Name                       | Type                                                                                                                                            | Default                                         | Description                                                                        |
| :------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------- | :--------------------------------------------------------------------------------- |
| className                  | string                                                                                                                                          | null                                            | Specify an optional className to be applied to the container                       |
| title                      | string                                                                                                                                          | null                                            | list title                                                                         |
| search                     | shape                                                                                                                                           | null                                            | search bar call back function and search value                                     |
| search.onChange            | function                                                                                                                                        |                                                 |                                                                                    |
| search.value               | string                                                                                                                                          |                                                 |                                                                                    |
| buttons                    | array\<node\>                                                                                                                                   | []                                              | action buttons on right side of list title                                         |
| overrides                  | shape                                                                                                                                           | null                                            | Node to override the default header                                                |
| overrides.header           | shape                                                                                                                                           |                                                 |                                                                                    |
| overrides.header.props     | object\|function                                                                                                                                |                                                 |                                                                                    |
| overrides.header.component | element                                                                                                                                         |                                                 |                                                                                    |
| items                      | array\<object\>                                                                                                                                 | []                                              | data source of list items                                                          |
| items[].id                 | string                                                                                                                                          |                                                 |                                                                                    |
| items[].content            | shape                                                                                                                                           |                                                 |                                                                                    |
| items[].content.value      | string                                                                                                                                          |                                                 |                                                                                    |
| items[].content.icon       | node                                                                                                                                            |                                                 |                                                                                    |
| items[].content.tags       | arrayOf(node)                                                                                                                                   |                                                 |                                                                                    |
| items[].children           | object                                                                                                                                          |                                                 |                                                                                    |
| items[].isSelectable       | boolean                                                                                                                                         |                                                 |                                                                                    |
| editingStyle               | enum:<br>&nbsp;EditingStyle.Single<br>&nbsp;EditingStyle.Multiple<br>&nbsp;EditingStyle.SingleNesting<br>&nbsp;EditingStyle.MultipleNesting<br> | null                                            | list editing style                                                                 |
| isFullHeight               | bool                                                                                                                                            | false                                           | use full height in list                                                            |
| isLargeRow                 | bool                                                                                                                                            | false                                           | use large/fat row in list                                                          |
| isLoading                  | bool                                                                                                                                            | false                                           | optional skeleton to be rendered while loading data                                |
| iconPosition               | enum:<br>&nbsp;'left'<br>&nbsp;'right'<br>                                                                                                      | 'left'                                          | icon can be left or right side of list row primary value                           |
| i18n                       | shape                                                                                                                                           |                                                 | i18n strings                                                                       |
| i18n.searchPlaceHolderText | string                                                                                                                                          | 'Enter a value'                                 |                                                                                    |
| i18n.expand                | string                                                                                                                                          | Expand'                                         |                                                                                    |
| i18n.close                 | string                                                                                                                                          | 'Close'                                         |                                                                                    |
| selectedIds                | arrayOf(string)                                                                                                                                 | []                                              | Multiple currently selected items                                                  |
| pagination                 | shape                                                                                                                                           | null                                            | pagination at the bottom of list                                                   |
| pagination.page            | number                                                                                                                                          |                                                 |                                                                                    |
| pagination.maxPage         | number                                                                                                                                          |                                                 |                                                                                    |
| pagination.pageOfPagesText | function                                                                                                                                        | (page, maxPage) => `Page ${page} of ${maxPage}` | (page, maxPage) => string                                                          |
| pagination.pageText        | string                                                                                                                                          |                                                 |                                                                                    |
| pagination.nextPageText    | string                                                                                                                                          | 'Next page'                                     |                                                                                    |
| pagination.prevPageText    | string                                                                                                                                          | 'Prev page'                                     |                                                                                    |
| pagination.onPage          | func                                                                                                                                            |                                                 |                                                                                    |
| pagination.totalItems      | number                                                                                                                                          |                                                 |                                                                                    |
| pagination.totalItemsText  | string                                                                                                                                          | 'Items'                                         |                                                                                    |
| pagination.testID          | string                                                                                                                                          | 'iot-simple-pagination'                         |                                                                                    |
| expandedIds                | arrayOf(string)                                                                                                                                 | []                                              | ids of row expanded                                                                |
| handleSelect               | function                                                                                                                                        | () => {}                                        | call back function of select                                                       |
| toggleExpansion            | function                                                                                                                                        | () => {}                                        | call back function of expansion                                                    |
| onItemMoved                | function                                                                                                                                        | () => {}                                        | callback function for reorder                                                      |
| itemWillMove               | function                                                                                                                                        | () => { return true;}                           | callback function when reorder will occur - can cancel the move by returning false |
| emptyState                 | node, string                                                                                                                                    | 'No list items to show'                         | content shown if list is empty                                                     |

## External Links

### Source Code

[Source code](https://github.com/carbon-design-system/carbon-addons-iot-react/tree/next/packages/react/src/components/List)

### Feedback

Help us improve this component by providing feedback, asking questions on Slack, or updating this file on
[GitHub](https://github.com/carbon-design-system/carbon-addons-iot-react/tree/next/packages/react/src/components/List/List.md).

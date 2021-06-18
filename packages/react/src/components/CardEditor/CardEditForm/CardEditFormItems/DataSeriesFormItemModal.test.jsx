import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import omit from 'lodash/omit';

import DataSeriesFormItemModal from './DataSeriesFormItemModal';

describe('DataSeriesFormItemModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockOnChange = jest.fn();
  const mockSetShowEditor = jest.fn();
  const mockSetEditDataItem = jest.fn();
  const mockSetEditDataSeries = jest.fn();
  const groupedBarConfig = {
    title: 'Untitled',
    size: 'MEDIUM',
    type: 'BAR',
    content: {
      type: 'GROUPED',
      layout: 'VERTICAL',
      series: [
        {
          dataSourceId: 'temperature',
          label: 'temperature',
          color: '#6929c4',
        },
      ],
      categoryDataSourceId: 'firmware',
    },
    dataSource: {
      groupBy: ['firmware'],
    },
  };

  const timeSeriesCardConfig = {
    id: 'Timeseries',
    title: 'Untitled',
    size: 'MEDIUMWIDE',
    type: 'TIMESERIES',
    content: {
      series: [
        {
          label: 'Temperature',
          dataSourceId: 'temperature',
          color: '#6929c4',
        },
        {
          label: 'Pressure',
          dataSourceId: 'pressure',
        },
      ],
      xLabel: 'Time',
      yLabel: 'Temperature (˚F)',
      includeZeroOnXaxis: true,
      includeZeroOnYaxis: true,
      timeDataSourceId: 'timestamp',
    },
    interval: 'day',
  };

  const valueCardConfig = {
    id: 'Standard',
    title: 'value card',
    type: 'VALUE',
    size: 'MEDIUM',
    content: {
      attributes: [
        {
          dataSourceId: 'key1',
          unit: '%',
          precision: 3,
          label: 'Key 1',
        },
        {
          dataSourceId: 'key2',
          unit: 'lb',
          label: 'Key 2',
          precision: 3,
        },
      ],
    },
  };

  const editGroupedBarDataItem = {
    dataSourceId: 'temperature',
    label: 'temperature',
    color: '#6929c4',
  };

  const editTimeseriesDataItem = {
    label: 'Temperature',
    dataSourceId: 'temperature',
    color: 'red',
    aggregationMethods: [
      { id: 'last', text: 'Last' },
      { id: 'mean', text: 'Mean' },
      { id: 'max', text: 'Max' },
      { id: 'min', text: 'Min' },
    ],
  };

  const editTimeseriesDataItemAggregated = {
    label: 'Temperature Max',
    dataSourceId: 'temperature_max',
    color: 'red',
    aggregationMethods: [
      { id: 'none', text: 'None' },
      { id: 'last', text: 'Last' },
      { id: 'mean', text: 'Mean' },
      { id: 'max', text: 'Max' },
      { id: 'min', text: 'Min' },
    ],
    aggregationMethod: 'max',
    grain: 'hourly',
  };

  const editDataSeriesTimeSeries = [
    {
      label: 'Temperature',
      dataSourceId: 'temperature',
      color: 'red',
    },
  ];

  const editValueDataItem = {
    dataSourceId: 'key1',
    unit: '%',
    precision: 3,
    label: 'Key 1',
  };

  const availableDimensions = {
    deviceid: ['73000', '73001', '73002'],
    manufacturer: ['Rentech', 'GHI Industries'],
  };

  const commonProps = {
    onChange: mockOnChange,
    setShowEditor: mockSetShowEditor,
    setEditDataItem: mockSetEditDataItem,
    setEditDataSeries: mockSetEditDataSeries,
    availableDimensions,
  };

  it('Renders for timeseries card data', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItem}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const label = screen.getByText('Custom label');
    const legendColorLabel = screen.getByText('Line color');
    expect(label).toBeInTheDocument();
    expect(legendColorLabel).toBeInTheDocument();
  });
  it('Non-timebased simple bar should hide grain', () => {
    const simpleNonTimeBasedBar = {
      title: 'Untitled',
      size: 'MEDIUM',
      type: 'BAR',
      content: {
        type: 'SIMPLE',
        layout: 'VERTICAL',
        series: [
          {
            dataItemId: 'torque',
            dataSourceId: 'torque_4b840252-adca-4075-8272-edd6705c2353',
            label: 'Torque',
            aggregationMethod: 'mean',
            color: '#6929c4',
          },
        ],
        categoryDataSourceId: 'deviceid',
      },
      dataSource: {
        groupBy: ['deviceid'],
      },
    };

    const aggregatedBarChartDataItem = {
      label: 'Temperature Max',
      dataSourceId: 'torque_4b840252-adca-4075-8272-edd6705c2353',
      color: 'red',
      aggregationMethods: [
        { id: 'none', text: 'None' },
        { id: 'last', text: 'Last' },
        { id: 'mean', text: 'Mean' },
        { id: 'max', text: 'Max' },
        { id: 'min', text: 'Min' },
      ],
      aggregationMethod: 'max',
    };

    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={simpleNonTimeBasedBar}
        editDataItem={aggregatedBarChartDataItem}
      />
    );
    // grain field should be hidden though aggregator should be shown
    expect(screen.queryByLabelText('Grain')).not.toBeInTheDocument();
    const aggregationValue = screen.getByText('Max');
    expect(aggregationValue).toBeInTheDocument();
  });
  it('Timebased simple bar should show grain', () => {
    const simpleTimeBasedBar = {
      title: 'Untitled',
      size: 'MEDIUM',
      type: 'BAR',
      content: {
        type: 'SIMPLE',
        layout: 'VERTICAL',
        series: [
          {
            dataItemId: 'torque',
            dataSourceId: 'torque_4b840252-adca-4075-8272-edd6705c2353',
            label: 'Torque',
            aggregationMethod: 'mean',
            color: '#6929c4',
          },
        ],
        timeDataSourceId: 'timestamp',
      },
      dataSource: {},
    };

    const aggregatedBarChartDataItem = {
      label: 'Temperature Max',
      dataSourceId: 'torque_4b840252-adca-4075-8272-edd6705c2353',
      color: 'red',
      aggregationMethods: [
        { id: 'none', text: 'None' },
        { id: 'last', text: 'Last' },
        { id: 'mean', text: 'Mean' },
        { id: 'max', text: 'Max' },
        { id: 'min', text: 'Min' },
      ],
      aggregationMethod: 'max',
    };

    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={simpleTimeBasedBar}
        editDataItem={aggregatedBarChartDataItem}
      />
    );
    // grain field and aggregator should be shown
    expect(screen.queryAllByLabelText('Grain')[0]).toBeInTheDocument();
    const aggregationValue = screen.getByText('Max');
    expect(aggregationValue).toBeInTheDocument();
  });
  it('Non-timebased stacked bar should hide grain', () => {
    const stackedNonTimeBasedBar = {
      title: 'Untitled',
      size: 'MEDIUM',
      type: 'BAR',
      content: {
        type: 'STACKED',
        layout: 'VERTICAL',
        series: [
          {
            dataItemId: 'torque',
            dataSourceId: 'torque_565ba583-dc00-4ee2-a480-5ed7d3e47ab1',
            label: 'Torque',
            aggregationMethod: 'mean',
            color: '#6929c4',
          },
        ],
        categoryDataSourceId: 'deviceid',
      },
      dataSource: {
        groupBy: ['deviceid'],
      },
    };

    const aggregatedBarChartDataItem = {
      label: 'Temperature Max',
      dataSourceId: 'torque_565ba583-dc00-4ee2-a480-5ed7d3e47ab1',
      color: 'red',
      aggregationMethods: [
        { id: 'none', text: 'None' },
        { id: 'last', text: 'Last' },
        { id: 'mean', text: 'Mean' },
        { id: 'max', text: 'Max' },
        { id: 'min', text: 'Min' },
      ],
      aggregationMethod: 'max',
    };

    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={stackedNonTimeBasedBar}
        editDataItem={aggregatedBarChartDataItem}
      />
    );

    // grain field should be hidden though aggregator should be shown
    expect(screen.queryByLabelText('Grain')).not.toBeInTheDocument();
    const aggregationValue = screen.getByText('Max');
    expect(aggregationValue).toBeInTheDocument();
  });
  it('timebased stacked bar should show grain', () => {
    const stackedTimeBasedBar = {
      title: 'Untitled',
      size: 'MEDIUM',
      type: 'BAR',
      content: {
        type: 'STACKED',
        layout: 'VERTICAL',
        series: [
          {
            dataItemId: 'torque',
            dataSourceId: 'torque_565ba583-dc00-4ee2-a480-5ed7d3e47ab1',
            label: 'Torque',
            aggregationMethod: 'mean',
            color: '#6929c4',
          },
        ],
        timeDataSourceId: 'timestamp',
      },
      dataSource: {},
    };

    const aggregatedBarChartDataItem = {
      label: 'Temperature Max',
      dataSourceId: 'torque_565ba583-dc00-4ee2-a480-5ed7d3e47ab1',
      color: 'red',
      aggregationMethods: [
        { id: 'none', text: 'None' },
        { id: 'last', text: 'Last' },
        { id: 'mean', text: 'Mean' },
        { id: 'max', text: 'Max' },
        { id: 'min', text: 'Min' },
      ],
      aggregationMethod: 'max',
    };

    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={stackedTimeBasedBar}
        editDataItem={aggregatedBarChartDataItem}
      />
    );

    // grain field and aggregator should be shown
    expect(screen.queryAllByLabelText('Grain')[0]).toBeInTheDocument();
    const aggregationValue = screen.getByText('Max');
    expect(aggregationValue).toBeInTheDocument();
  });
  it('Non-timebased table card should hide grain', () => {
    const stackedNonTimeBasedTableCard = {
      title: 'table without timestamp',
      size: 'LARGE',
      type: 'TABLE',
      content: {
        columns: [
          {
            dataItemId: 'deviceid',
            dataSourceId: 'deviceid',
            label: 'deviceid',
            type: 'DIMENSION',
            destination: 'groupBy',
          },
          {
            dataItemId: 'torque',
            dataSourceId: 'torque_308e4cf2-7da1-4dd1-be90-d99db81da6f5',
            label: 'Torque',
          },
          {
            dataItemId: 'temperature',
            dataSourceId: 'temperature_b7853ab7-49ab-4337-9682-4be94b31fd06',
            label: 'Temperature',
          },
        ],
        allowNavigation: true,
        showHeader: true,
      },
      dataSource: {
        groupBy: ['deviceid'],
      },
    };

    const aggregatedBarChartDataItem = {
      label: 'Temperature Max',
      dataSourceId: 'torque_565ba583-dc00-4ee2-a480-5ed7d3e47ab1',
      color: 'red',
      aggregationMethods: [
        { id: 'none', text: 'None' },
        { id: 'last', text: 'Last' },
        { id: 'mean', text: 'Mean' },
        { id: 'max', text: 'Max' },
        { id: 'min', text: 'Min' },
      ],
      aggregationMethod: 'max',
    };

    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={stackedNonTimeBasedTableCard}
        editDataItem={aggregatedBarChartDataItem}
      />
    );

    // grain field should be hidden though aggregator should be shown
    expect(screen.queryByLabelText('Grain')).not.toBeInTheDocument();
    const aggregationValue = screen.getByText('Max');
    expect(aggregationValue).toBeInTheDocument();
  });
  it('timebased table card should show grain', () => {
    const stackedTimeBasedTableCard = {
      title: 'table without timestamp',
      size: 'LARGE',
      type: 'TABLE',
      content: {
        columns: [
          {
            dataSourceId: 'timestamp',
            dataItemId: 'timestamp',
            label: 'Timestamp',
            type: 'TIMESTAMP',
            sort: 'DESC',
          },
          {
            dataItemId: 'deviceid',
            dataSourceId: 'deviceid',
            label: 'deviceid',
            type: 'DIMENSION',
            destination: 'groupBy',
          },
          {
            dataItemId: 'torque',
            dataSourceId: 'torque_308e4cf2-7da1-4dd1-be90-d99db81da6f5',
            label: 'Torque',
          },
          {
            dataItemId: 'temperature',
            dataSourceId: 'temperature_b7853ab7-49ab-4337-9682-4be94b31fd06',
            label: 'Temperature',
          },
        ],
        allowNavigation: true,
        showHeader: true,
      },
      dataSource: {
        groupBy: ['deviceid'],
      },
    };

    const aggregatedBarChartDataItem = {
      label: 'Temperature Max',
      dataSourceId: 'torque_565ba583-dc00-4ee2-a480-5ed7d3e47ab1',
      color: 'red',
      aggregationMethods: [
        { id: 'none', text: 'None' },
        { id: 'last', text: 'Last' },
        { id: 'mean', text: 'Mean' },
        { id: 'max', text: 'Max' },
        { id: 'min', text: 'Min' },
      ],
      aggregationMethod: 'max',
    };

    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={stackedTimeBasedTableCard}
        editDataItem={aggregatedBarChartDataItem}
      />
    );

    // grain field and aggregator should be shown
    expect(screen.queryAllByLabelText('Grain')[0]).toBeInTheDocument();
    const aggregationValue = screen.getByText('Max');
    expect(aggregationValue).toBeInTheDocument();
  });
  it('Renders for value card data', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={valueCardConfig}
        editDataItem={editValueDataItem}
      />
    );

    const customLabel = screen.getByText('Custom label');
    const unitLabel = screen.getByText('Unit');
    const dataFilterLabel = screen.getByText('Data filter');
    expect(customLabel).toBeInTheDocument();
    expect(unitLabel).toBeInTheDocument();
    expect(dataFilterLabel).toBeInTheDocument();
  });
  it('Adds a custom label in a value card', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={valueCardConfig}
        editDataItem={editValueDataItem}
      />
    );

    const customLabelInput = screen.getByDisplayValue('Key 1');
    expect(customLabelInput).toBeInTheDocument();

    fireEvent.change(customLabelInput, {
      target: { value: 'newLabel' },
    });
    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      dataSourceId: 'key1',
      label: 'newLabel',
      precision: 3,
      unit: '%',
    });
  });
  it('Changes unit in a value card', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={valueCardConfig}
        editDataItem={editValueDataItem}
      />
    );

    const unitInput = screen.getByDisplayValue('%');
    expect(unitInput).toBeInTheDocument();

    fireEvent.change(unitInput, {
      target: { value: 'PSI' },
    });
    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      dataSourceId: 'key1',
      label: 'Key 1',
      precision: 3,
      unit: 'PSI',
    });
  });
  it('Changes precision in a value card', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={valueCardConfig}
        editDataItem={editValueDataItem}
      />
    );

    const precisionSelector = screen.getByText('3');
    expect(precisionSelector).toBeInTheDocument();

    fireEvent.click(precisionSelector);

    const selectorOption = screen.getByText('2');
    expect(selectorOption).toBeInTheDocument();

    fireEvent.click(selectorOption);
    expect(mockSetEditDataItem).toHaveBeenCalled();
  });
  it('Removes precision in a value card', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={valueCardConfig}
        editDataItem={{ ...editValueDataItem, precision: 3 }}
      />
    );

    const precisionSelector = screen.getByText('3');
    expect(precisionSelector).toBeInTheDocument();

    fireEvent.click(precisionSelector);

    const notSetOption = screen.getByText('Not set');
    expect(notSetOption).toBeInTheDocument();

    fireEvent.click(notSetOption);

    expect(mockSetEditDataItem).toHaveBeenCalled();
  });
  it('Removes dataFilter in a value card', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={valueCardConfig}
        editDataItem={{
          ...editValueDataItem,
          dataFilter: { manufacturer: 'Rentech' },
        }}
      />
    );

    const dataFilterSelector = screen.getByText('manufacturer');
    expect(dataFilterSelector).toBeInTheDocument();

    fireEvent.click(dataFilterSelector);

    const noneOption = screen.getAllByText('None')[1];
    expect(noneOption).toBeInTheDocument();

    fireEvent.click(noneOption);

    expect(mockSetEditDataItem).toHaveBeenCalled();
  });
  it('Changes dataFilter in a ValueCard', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={valueCardConfig}
        editDataItem={editValueDataItem}
      />
    );

    const dataFilterDimensionInput = screen.getAllByText('None')[1];
    expect(dataFilterDimensionInput).toBeInTheDocument();

    fireEvent.click(dataFilterDimensionInput);

    const deviceIdOption = screen.getByText('deviceid');
    expect(deviceIdOption).toBeInTheDocument();

    fireEvent.click(deviceIdOption);

    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      dataFilter: {
        deviceid: '73000',
      },
      dataSourceId: 'key1',
      label: 'Key 1',
      precision: 3,
      unit: '%',
    });
  });
  it('Changes dataFilter value in a ValueCard', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={valueCardConfig}
        editDataItem={{
          dataFilter: {
            deviceid: '73000',
          },
          dataSourceId: 'key1',
          label: 'Key 1',
          precision: 3,
          unit: '%',
        }}
      />
    );

    const dataFilterValueInput = screen.getByText('73000');
    expect(dataFilterValueInput).toBeInTheDocument();

    fireEvent.click(dataFilterValueInput);

    const valueOption = screen.getByText('73001');
    expect(valueOption).toBeInTheDocument();

    fireEvent.click(valueOption);

    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      dataFilter: {
        deviceid: '73001',
      },
      dataSourceId: 'key1',
      label: 'Key 1',
      precision: 3,
      unit: '%',
    });
  });
  it('Changes the label in a TimeseriesCard', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItem}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const labelInput = screen.getByDisplayValue('Temperature');
    expect(labelInput).toBeInTheDocument();

    fireEvent.change(labelInput, {
      target: { value: 'newLabel' },
    });
    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      label: 'newLabel',
      dataSourceId: 'temperature',
      color: 'red',
      aggregationMethods: [
        {
          id: 'last',
          text: 'Last',
        },
        {
          id: 'mean',
          text: 'Mean',
        },
        {
          id: 'max',
          text: 'Max',
        },
        {
          id: 'min',
          text: 'Min',
        },
      ],
    });
  });
  it('Changes the color in a TimeseriesCard', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItemAggregated}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const colorDropdown = screen.getAllByTitle('Open menu')[2];
    expect(colorDropdown).toBeInTheDocument();

    fireEvent.click(colorDropdown);

    const magentaColor = screen.getAllByRole('option')[5];
    expect(magentaColor).toBeInTheDocument();

    fireEvent.click(magentaColor);
    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      ...editTimeseriesDataItemAggregated,
      color: '#520408',
    });
  });
  it('Changes grain on aggregated item', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItemAggregated}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const grainDropdown = screen.getByText('Hourly');
    expect(grainDropdown).toBeInTheDocument();

    fireEvent.click(grainDropdown);

    const grainOption = screen.getAllByRole('option')[2];
    expect(grainOption).toBeInTheDocument();

    fireEvent.click(grainOption);
    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      ...editTimeseriesDataItemAggregated,
      grain: 'weekly',
    });
  });
  it('Renders an aggregation selector in summary dashboards and fires setEditDataItem', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItem}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const aggregationDropdown = screen.getAllByText('None')[0];
    expect(aggregationDropdown).toBeInTheDocument();

    fireEvent.click(aggregationDropdown);

    const aggregationOption = screen.getByText('Min');
    expect(aggregationOption).toBeInTheDocument();

    fireEvent.click(aggregationOption);

    expect(mockSetEditDataItem).toHaveBeenCalled();
  });
  it('Switching between non-aggregated to aggregated should default the grain', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItem}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    // First set the aggregator from None to Min, should default a grain
    const aggregationDropdown = screen.getAllByText('None')[0];
    expect(aggregationDropdown).toBeInTheDocument();

    fireEvent.click(aggregationDropdown);

    const aggregationOption = screen.getByText('Min');
    expect(aggregationOption).toBeInTheDocument();

    fireEvent.click(aggregationOption);

    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      ...editTimeseriesDataItem,
      aggregationMethod: 'min',
      grain: 'hourly',
    });
  });
  it('Switching between aggregated to nonaggregated should clear the grain', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        isSummaryDashboard
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItemAggregated}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    // Now set the aggregator back from Max to None
    const aggregationDropdown2 = screen.getAllByLabelText('Aggregation method')[0];
    fireEvent.click(aggregationDropdown2);
    const aggregationOptionNone = screen.getAllByRole('option')[0];
    expect(aggregationOptionNone).toBeInTheDocument();

    fireEvent.click(aggregationOptionNone);

    expect(mockSetEditDataItem).toHaveBeenCalledWith({
      ...omit(editTimeseriesDataItemAggregated, 'grain'),
      aggregationMethod: 'none',
    });
  });
  it('Renders a read only aggregation field in instance dashboards', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItemAggregated}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const aggregationValue = screen.getByText('Max');
    expect(aggregationValue).toBeInTheDocument();
  });
  it('Closes the editor and empties out the editDataItem', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={timeSeriesCardConfig}
        editDataItem={editTimeseriesDataItemAggregated}
        editDataSeries={editDataSeriesTimeSeries}
      />
    );

    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);

    expect(mockSetEditDataItem).toHaveBeenCalled();
    expect(mockSetShowEditor).toHaveBeenCalled();
  });
  it('Renders the DataSeriesEditorTable', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={groupedBarConfig}
        editDataItem={editGroupedBarDataItem}
        editDataSeries={[editGroupedBarDataItem]}
      />
    );

    const modalTitle = screen.getByText('Customize data series');
    expect(modalTitle).toBeInTheDocument();
  });

  it('Renders the DataSeriesEditorTable as size xs by default', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={groupedBarConfig}
        editDataItem={editGroupedBarDataItem}
        editDataSeries={[editGroupedBarDataItem]}
      />
    );

    const xsContainer = screen
      .getByText('Customize data series')
      .closest('.bx--modal-container--xs');
    expect(xsContainer).toBeInTheDocument();

    const largeContainer = screen
      .queryByText('Customize data series')
      .closest('.iot--composed-modal--large');
    expect(largeContainer).not.toBeInTheDocument();
  });

  it('Renders the DataSeriesEditorTable as size large if isLarge prop is true', () => {
    render(
      <DataSeriesFormItemModal
        {...commonProps}
        showEditor
        cardConfig={groupedBarConfig}
        editDataItem={editGroupedBarDataItem}
        editDataSeries={[editGroupedBarDataItem]}
        isLarge
      />
    );

    const largeContainer = screen
      .getByText('Customize data series')
      .closest('.iot--composed-modal--large');
    expect(largeContainer).toBeInTheDocument();
  });
});

import React from 'react';
import { action } from '@storybook/addon-actions';
import { text, select, object, boolean } from '@storybook/addon-knobs';
import { spacing05 } from '@carbon/layout';

import { COLORS, CARD_SIZES } from '../../constants/LayoutConstants';
import { getCardMinSize } from '../../utils/componentUtilityFunctions';
import { getIntervalChartData, chartData } from '../../utils/sample';

import TimeSeriesCard from './TimeSeriesCard';

const commonProps = {
  id: 'facility-temperature',
  availableActions: { range: true, expand: true },
};

export default {
  title: __DEV__ ? '1 - Watson IoT/⚠️ TimeSeriesCard' : '1 - Watson IoT/TimeSeriesCard',
  parameters: {
    component: TimeSeriesCard,
  },
};

export const SinglePoint = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const interval = select('interval', ['hour', 'day', 'week', 'quarter', 'month', 'year'], 'hour');
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
          decimalPrecision: 1,
          showLegend: true,
        })}
        values={getIntervalChartData(interval, 1, { min: 10, max: 100 }, 100)}
        interval={interval}
        breakpoint="lg"
        size={size}
        showTimeInGMT={boolean('showTimeInGMT', false)}
        onCardAction={action('onCardAction')}
        tooltipDateFormatPattern={text('tooltipDateFormatPattern', 'L HH:mm:ss')}
      />
    </div>
  );
};

SinglePoint.story = {
  name: 'single point',
};

export const WithVariables = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const interval = select('interval', ['hour', 'day', 'week', 'quarter', 'month', 'year'], 'hour');
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature {not-working}')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        cardVariables={object('Variables', {
          'not-working': 'working',
        })}
        content={object('content', {
          series: [
            {
              label: 'Temperature {not-working}',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time {not-working}',
          yLabel: 'Temperature {not-working} (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData(interval, 1, { min: 10, max: 100 }, 100)}
        interval={interval}
        showTimeInGMT={boolean('showTimeInGMT', false)}
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
        tooltipDateFormatPattern={text('tooltipDateFormatPattern', 'L HH:mm:ss')}
      />
    </div>
  );
};

WithVariables.story = {
  name: 'with variables',

  parameters: {
    info: {
      text: `
    # Passing variables
    To pass a variable into your card, identify a variable to be used by wrapping it in curly brackets.
    Make sure you have added a prop called 'cardVariables' to your card that is an object with key value pairs such that the key is the variable name and the value is the value to replace it with.
    Optionally you may use a callback as the cardVariables value that will be given the variable and the card as arguments.
    `,
    },
  },
};

export const MediumSingleLineIntervalHour = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
        })}
        values={getIntervalChartData('hour', 10, { min: 10, max: 100 }, 100)}
        interval="hour"
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
        tooltipDateFormatPattern={text('tooltipDateFormatPattern', 'L HH:mm:ss')}
      />
    </div>
  );
};

MediumSingleLineIntervalHour.story = {
  name: 'medium / single line - interval hour',
};

export const MultiLineNoXYLabel = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
          ],

          xLabel: 'Time',
          yLabel: 'Temperature (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData('day', 30, { min: 10, max: 100 }, 100)}
        interval="day"
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

MultiLineNoXYLabel.story = {
  name: 'multi line - (No X/Y Label)',
};

export const MediumSingleLineIntervalMonthYearSameYear = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData('month', 6, { min: 10, max: 100 }, 100, 1569945252000)}
        interval="month"
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

MediumSingleLineIntervalMonthYearSameYear.story = {
  name: 'medium / single line - interval month (Year/ Same Year)',
};

export const MediumMultipleLineIntervalMonthYearSameYear = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
            {
              label: 'Humidity',
              dataSourceId: 'humidity',
            },
            {
              label: 'Ecount',
              dataSourceId: 'ecount',
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
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData('month', 6, { min: 10, max: 100 }, 100, 1569945252000)}
        interval="month"
        breakpoint="lg"
        size={size}
      />
    </div>
  );
};

MediumMultipleLineIntervalMonthYearSameYear.story = {
  name: 'medium / multiple line - interval month (Year/ Same Year)',
};

export const MediumSingleLineIntervalYearTwoDataPoint = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
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
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData('year', 2, { min: 10, max: 100 }, 100)}
        interval="year"
        breakpoint="lg"
        size={size}
      />
    </div>
  );
};

MediumSingleLineIntervalYearTwoDataPoint.story = {
  name: 'medium / single line - interval year (Two data point)',
};

export const MediumMultiLineNoXYLabel = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const interval = select('interval', ['hour', 'day', 'week', 'quarter', 'month', 'year'], 'hour');
  return (
    <div
      style={{
        width: text('cardWidth', `${getCardMinSize('lg', size).x}px`),
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
            {
              label: 'Pressure',
              dataSourceId: 'pressure',
            },
            {
              label: 'Humidity',
              dataSourceId: 'humidity',
            },
            {
              label: 'Count',
              dataSourceId: 'ecount',
            },
          ],
          xLabel: '',
          yLabel: '',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData(interval, 12, { min: 10, max: 100 }, 100)}
        interval={interval}
        showTimeInGMT={boolean('showTimeInGMT', false)}
        breakpoint="lg"
        size={size}
        tooltipDateFormatPattern={text('tooltipDateFormatPattern', 'L HH:mm:ss')}
      />
    </div>
  );
};

MediumMultiLineNoXYLabel.story = {
  name: 'medium / multi line - (No X/Y Label)',
};

export const LargeSingleLineIntervalHourSameDay = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature (˚F)',
          includeZeroOnXaxis: false,
          includeZeroOnYaxis: false,
          timeDataSourceId: 'timestamp',
          zoomBar: {
            enabled: true,
            axes: 'top',
            // initialZoomDomain: []
          },
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData('minute', 15, { min: 4700000, max: 4800000 }, 100)}
        interval="minute"
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

LargeSingleLineIntervalHourSameDay.story = {
  name: 'large / single line - interval hour (Same day)',
};

export const LargeSingleLineIntervalDayWeek = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData('day', 7, { min: 10, max: 100 }, 100)}
        interval="day"
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

LargeSingleLineIntervalDayWeek.story = {
  name: 'large / single line - interval day (Week)',
};

export const LargeSingleLineIntervalDayMonth = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData('day', 30, { min: 10, max: 100 }, 100)}
        interval="day"
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

LargeSingleLineIntervalDayMonth.story = {
  name: 'large / single line - interval day (Month)',
};

export const LargeSingleLineIntervalMonthYearDiffYear = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          zoomBar: {
            enabled: true,
            axes: 'top',
            // initialZoomDomain: []
          },
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData('month', 24, { min: 10, max: 100 }, 100)}
        interval="month"
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

LargeSingleLineIntervalMonthYearDiffYear.story = {
  name: 'large / single line - interval month (Year/ Diff Year)',
};

export const LargeSingleLineYearIntervalOneDataPoint = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature',
          includeZeroOnXaxis: false,
          includeZeroOnYaxis: false,
          timeDataSourceId: 'timestamp',
          zoomBar: {
            enabled: true,
            axes: 'top',
            // initialZoomDomain: []
          },
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData('year', 10, { min: 10, max: 100 }, 100)}
        interval="year"
        breakpoint="lg"
        size={size}
      />
    </div>
  );
};

LargeSingleLineYearIntervalOneDataPoint.story = {
  name: 'large / single line - year interval (One data point)',
};

export const LargeMultiLineNoInterval = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
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
          zoomBar: {
            enabled: true,
            axes: 'top',
            // initialZoomDomain: []
          },
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData('day', 12, { min: 10, max: 100 }, 100)}
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

LargeMultiLineNoInterval.story = {
  name: 'large / multi line - no interval',
};

export const CustomColors = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  const interval = select('interval', ['hour', 'day', 'week', 'quarter', 'month', 'year'], 'hour');
  return (
    <div
      style={{
        width: text('cardWidth', `${getCardMinSize('lg', size).x}px`),
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
              color: COLORS.MAGENTA,
            },
            {
              label: 'Pressure',
              dataSourceId: 'pressure',
              color: COLORS.TEAL,
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData(interval, 12, { min: 10, max: 100 }, 100)}
        interval={interval}
        breakpoint="lg"
        showTimeInGMT={boolean('showTimeInGMT', false)}
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

CustomColors.story = {
  name: 'custom colors',
};

export const LargeUnits = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
              color: text('color', COLORS.MAGENTA),
            },
          ],
          unit: '˚F',
          xLabel: 'Time',
          yLabel: 'Temperature',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData('day', 10, { min: 10, max: 100 }, 100)}
        interval="day"
        breakpoint="lg"
        size={size}
        showTimeInGMT={boolean('showTimeInGMT', false)}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

LargeUnits.story = {
  name: 'large / units',
};

export const WithZoomBar = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          zoomBar: {
            enabled: true,
            axes: 'top',
            view: 'slider_view',
          },
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData('month', 24, { min: 10, max: 100 }, 100)}
        interval="month"
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

WithZoomBar.story = {
  name: 'with zoomBar',
};

export const DomainRange = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  const data = getIntervalChartData('day', 50, { min: 10, max: 100 }, 100);
  const timestamps = data.map((d) => d.timestamp);
  const minDate = new Date(Math.min(...timestamps));
  const day = minDate.getDay();
  minDate.setDate(day + 10);

  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time t',
          yLabel: 'Temperature (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        values={data}
        availableActions={{ range: true }}
        interval="hour"
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
        domainRange={[minDate.valueOf(), Math.max(...timestamps)]}
      />
    </div>
  );
};

DomainRange.story = {
  name: 'domainRange',
};

export const Empty = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
              color: COLORS.PURPLE,
            },
          ],
          timeDataSourceId: 'timestamp',
        })}
        interval="hour"
        showTimeInGMT={boolean('showTimeInGMT', false)}
        breakpoint="lg"
        values={[]}
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

Empty.story = {
  name: 'empty',
};

export const HighlightAlertRanges = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGEWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          alertRanges: [
            {
              startTimestamp: 1572313622000,
              endTimestamp: 1572486422000,
              color: '#FF0000',
              details: 'Alert name',
            },
            {
              startTimestamp: 1572313622000,
              endTimestamp: 1572824320000,
              color: '#FFFF00',
              details: 'Less severe',
            },
          ],
          addSpaceOnEdges: 1,
          zoomBar: {
            enabled: true,
            axes: 'top',
            view: 'graph_view',
          },
        })}
        values={getIntervalChartData('day', 7, { min: 10, max: 100 }, 100, 1572824320000)}
        interval="hour"
        breakpoint="lg"
        showTimeInGMT={boolean('showTimeInGMT', false)}
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

HighlightAlertRanges.story = {
  name: 'highlight alert ranges',
};

export const EmptyForARange = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
              color: COLORS.PURPLE,
            },
          ],
          timeDataSourceId: 'timestamp',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          addSpaceOnEdges: 1,
        })}
        range="day"
        interval="hour"
        breakpoint="lg"
        showTimeInGMT={boolean('showTimeInGMT', false)}
        values={chartData.events.slice(0, 20)}
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

EmptyForARange.story = {
  name: 'empty for a range',
};

export const LotsOfDots = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGEWIDE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
            },
          ],
          xLabel: 'Time',
          yLabel: 'Temperature (˚F)',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
          zoomBar: {
            enabled: true,
            axes: 'top',
            view: 'graph_view',
          },
        })}
        values={getIntervalChartData('day', 2000, { min: 10, max: 100 }, 100, 1572824320000)}
        interval="hour"
        breakpoint="lg"
        showTimeInGMT={boolean('showTimeInGMT', false)}
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

LotsOfDots.story = {
  name: 'lots of dots',
};

export const IsEditable = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isEditable={boolean('isEditable', true)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature',
              dataSourceId: 'temperature',
              color: COLORS.PURPLE,
            },
            {
              label: 'Pressure',
              dataSourceId: 'pressure',
              color: COLORS.MAGENTA,
            },
            {
              label: 'Humidity',
              dataSourceId: 'humidity',
              color: COLORS.TEAL,
            },
          ],
          xLabel: 'Time',

          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        interval={select('interval', ['hour', 'day', 'week', 'month', 'year'], 'hour')}
        breakpoint="lg"
        showTimeInGMT={boolean('showTimeInGMT', false)}
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

IsEditable.story = {
  name: 'isEditable',
};

export const IsExpanded = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.MEDIUM);
  // needs static data so that the snapshot will always retain the same values
  const staticData = [
    {
      ENTITY_ID: 'Sensor2-1',
      temperature: 20,
      humidity: 5.51,
      ecount: 6,
      devname: '6ctgim0Qcq',
      pressure: 7.4,
      status: true,
      timestamp: 1569945252000,
    },
    {
      ENTITY_ID: 'Sensor2-1',
      temperature: 19,
      humidity: 7.36,
      ecount: 58,
      devname: '6ctgim0Qcq',
      pressure: 9.21,
      status: true,
      timestamp: 1567353252000,
    },
    {
      ENTITY_ID: 'Sensor2-1',
      temperature: 29,
      humidity: 3.32,
      ecount: 32,
      devname: '6ctgim0Qcq',
      pressure: 9.58,
      status: true,
      timestamp: 1564674852000,
    },
    {
      ENTITY_ID: 'Sensor2-1',
      temperature: 86,
      humidity: 2.98,
      ecount: 45,
      devname: '6ctgim0Qcq',
      pressure: 8.72,
      status: true,
      timestamp: 1561996452000,
    },
    {
      ENTITY_ID: 'Sensor2-1',
      temperature: 11,
      humidity: 9.25,
      ecount: 38,
      devname: '6ctgim0Qcq',
      pressure: 9.57,
      status: true,
      timestamp: 1559404452000,
    },
    {
      ENTITY_ID: 'Sensor2-1',
      temperature: 35,
      humidity: 8.15,
      ecount: 18,
      devname: '6ctgim0Qcq',
      pressure: 8.3,
      status: true,
      timestamp: 1556726052000,
    },
  ];
  return (
    <div style={{ width: `${getCardMinSize('lg', size).x}px`, margin: 20 }}>
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', true)}
        content={object('content', {
          series: [
            {
              label: 'Temp',
              dataSourceId: 'temperature',
            },
            {
              label: 'Humidity',
              dataSourceId: 'humidity',
            },
            {
              label: 'Electricity',
              dataSourceId: 'ecount',
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
          decimalPrecision: 2,
          timeDataSourceId: 'timestamp',
          zoomBar: {
            enabled: true,
            axes: 'top',
          },
          addSpaceOnEdges: 1,
        })}
        values={staticData}
        interval="month"
        breakpoint="lg"
        size={size}
      />
    </div>
  );
};

IsExpanded.story = {
  name: 'isExpanded',
};

export const DataFilter = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Temperature')}
        key="dataFilter"
        isEditable={boolean('isEditable', false)}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Temperature Device 1',
              dataSourceId: 'temperature',
              dataFilter: {
                ENTITY_ID: 'Sensor2-1',
              },
              color: text('color1', COLORS.MAGENTA),
            },
            {
              label: 'Temperature Device 2',
              dataSourceId: 'temperature',
              dataFilter: {
                ENTITY_ID: 'Sensor2-3',
              },
              color: text('color2', COLORS.BLUE),
            },
          ],
          unit: '˚F',
          xLabel: 'Time',
          yLabel: 'Temperature',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        values={getIntervalChartData('day', 12, { min: 10, max: 100 }, 100).reduce(
          (acc, dataPoint) => {
            // make "two devices worth of data" so that we can filter
            acc.push(dataPoint);
            acc.push({
              ...dataPoint,
              temperature: dataPoint.temperature / 2,
              ENTITY_ID: 'Sensor2-3',
            });
            return acc;
          },
          []
        )}
        interval="day"
        showTimeInGMT={boolean('showTimeInGMT', false)}
        breakpoint="lg"
        size={size}
        onCardAction={action('onCardAction')}
      />
    </div>
  );
};

DataFilter.story = {
  name: 'dataFilter',
};

export const Locale = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Pressure')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        content={object('content', {
          series: [
            {
              label: 'Pressure',
              dataSourceId: 'pressure',
              color: text('color', COLORS.MAGENTA),
            },
          ],
          unit: 'm/sec',
          xLabel: 'Time',
          yLabel: 'Pressure',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
        })}
        locale={select('locale', ['fr', 'en'], 'fr')}
        values={getIntervalChartData('day', 12, { min: 10, max: 100000 }, 100)}
        interval="day"
        breakpoint="lg"
        showTimeInGMT={boolean('showTimeInGMT', false)}
        size={size}
        onCardAction={action('onCardAction')}
        i18n={{
          tooltipGroupLabel: 'Translated Group',
        }}
      />
    </div>
  );
};

Locale.story = {
  name: 'locale',
};

export const Thresholds = () => {
  const size = select('size', Object.keys(CARD_SIZES), CARD_SIZES.LARGE);
  const interval = select('interval', ['hour', 'day', 'week', 'quarter', 'month', 'year'], 'hour');

  const values = getIntervalChartData(interval, 20, { min: 10, max: 100 }, 100, 1572824320000);
  return (
    <div
      style={{
        width: `${getCardMinSize('lg', size).x}px`,
        margin: spacing05 + 4,
      }}
    >
      <TimeSeriesCard
        {...commonProps}
        title={text('title', 'Pressure')}
        isLoading={boolean('isLoading', false)}
        isExpanded={boolean('isExpanded', false)}
        isEditable={boolean('isEditable', true)}
        content={object('content-thresholds', {
          series: [
            {
              label: 'Pressure',
              dataSourceId: 'pressure',
              color: text('color', COLORS.PURPLE),
            },
          ],
          unit: 'm/sec',
          xLabel: 'Time',
          yLabel: 'Pressure',
          includeZeroOnXaxis: true,
          includeZeroOnYaxis: true,
          timeDataSourceId: 'timestamp',
          addSpaceOnEdges: 1,
          alertRanges: [
            {
              startTimestamp: 1,
              endTimestamp: 2572486422000,
              color: '#FF0000',
              details: 'Alert name',
            },
          ],
          thresholds: [
            {
              axis: 'y',
              value: 300,
              fillColor: 'red',
              label: 'Alert 1',
            },
            {
              axis: 'y',
              value: 4,
              fillColor: 'red',
              label: 'Alert 3',
            },
            { axis: 'y', value: -100, fillColor: 'yellow', label: 'Alert 2' },
          ],
        })}
        values={values}
        interval="day"
        breakpoint="lg"
        showTimeInGMT={boolean('showTimeInGMT', false)}
        size={size}
        onCardAction={action('onCardAction')}
        i18n={{
          tooltipGroupLabel: 'Translated Group',
        }}
      />
    </div>
  );
};

Thresholds.story = {
  name: 'thresholds',
};

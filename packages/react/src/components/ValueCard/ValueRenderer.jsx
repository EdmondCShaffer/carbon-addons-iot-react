import React from 'react';
import PropTypes from 'prop-types';
import isNil from 'lodash/isNil';
import classnames from 'classnames';

import { CARD_LAYOUTS } from '../../constants/LayoutConstants';
import { formatNumberWithPrecision } from '../../utils/cardUtilityFunctions';

import { BASE_CLASS_NAME, PREVIEW_DATA } from './valueCardUtils';

const propTypes = {
  value: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
  layout: PropTypes.oneOf(Object.values(CARD_LAYOUTS)),
  precision: PropTypes.number,
  color: PropTypes.string,
  locale: PropTypes.string,
  customFormatter: PropTypes.func,
  fontSize: PropTypes.number.isRequired,
  /** optional option to determine whether the number should be abbreviated (i.e. 10,000 = 10K) */
  isNumberValueCompact: PropTypes.bool.isRequired,
  testId: PropTypes.string,
};

const defaultProps = {
  layout: CARD_LAYOUTS.HORIZONTAL,
  precision: 0,
  color: null,
  locale: 'en',
  customFormatter: null,
  testId: 'value',
};

/**
 * This components job is determining how to render different kinds of card values.
 * It handles precision, font size, styling in a consistent way for card values.
 *
 */
const ValueRenderer = ({
  value,
  layout,
  precision,
  color,
  locale,
  customFormatter,
  fontSize,
  isNumberValueCompact,
  testId,
}) => {
  let renderValue = value;
  if (typeof value === 'boolean') {
    renderValue = (
      <span
        data-testid={`${testId}-boolean`}
        className={`${BASE_CLASS_NAME}__value-renderer--boolean`}
      >
        {value.toString()}
      </span>
    );
  } else if (typeof value === 'number') {
    renderValue = formatNumberWithPrecision(value, precision, locale, isNumberValueCompact);
  } else if (isNil(value)) {
    renderValue = PREVIEW_DATA;
  }

  renderValue = isNil(customFormatter) ? renderValue : customFormatter(renderValue, value);

  return (
    <div className={`${BASE_CLASS_NAME}__value-renderer--wrapper`}>
      <span
        data-testid={testId}
        className={classnames(`${BASE_CLASS_NAME}__value-renderer--value`, {
          [`${BASE_CLASS_NAME}__value-renderer--value--vertical`]: layout === CARD_LAYOUTS.VERTICAL,
        })}
        style={{
          '--value-renderer-font-size': `${fontSize}px`,
          '--value-renderer-color': color,
          // if the font size is small enough to fit in the boundary box, wrap to 2 lines
          // otherwise, trucate the first line
          '--value-renderer-max-lines': fontSize < 20 ? 2 : 1,
        }}
      >
        {renderValue}
      </span>
    </div>
  );
};

ValueRenderer.propTypes = propTypes;
ValueRenderer.defaultProps = defaultProps;

export default ValueRenderer;

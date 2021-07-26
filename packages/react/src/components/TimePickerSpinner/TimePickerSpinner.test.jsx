import React from 'react';
import { mount } from 'enzyme';
import { screen, render, fireEvent } from '@testing-library/react';

import { keyCodes } from '../../constants/KeyCodeConstants';

import TimePickerSpinner, { TIMEGROUPS } from './TimePickerSpinner';

const timePickerProps = {
  id: 'timepickerspinner',
  onClick: jest.fn(),
  onChange: jest.fn(),
};

describe('TimePickerSpinner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should be selectable by testId', () => {
    render(<TimePickerSpinner {...timePickerProps} spinner testId="time_picker_spinner" />);
    expect(screen.getByTestId('time_picker_spinner')).toBeDefined();
    expect(screen.getByTestId('time_picker_spinner-up-button')).toBeDefined();
    expect(screen.getByTestId('time_picker_spinner-down-button')).toBeDefined();
  });

  it('with spinner', () => {
    render(<TimePickerSpinner {...timePickerProps} spinner />);
    expect(screen.queryAllByRole('button')).toHaveLength(2);
  });

  it('without spinner', () => {
    render(<TimePickerSpinner {...timePickerProps} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('increment/decrement value via buttons', () => {
    render(<TimePickerSpinner {...timePickerProps} spinner />);

    fireEvent.click(screen.queryByRole('button', { name: /Increment hours/i }));
    expect(screen.getByRole('textbox').value).toEqual('01:00');

    fireEvent.click(screen.queryByRole('button', { name: /Decrement hours/i }));
    expect(screen.getByRole('textbox').value).toEqual('00:00');
  });

  // Note: JSDOM follows the whatwg spec of keyboard events which may not follow
  // the current or expected behvaior of keyboard interaction in browsers.
  // The following test covers the keyboard interaction at a base level, but
  // needs to be improved by testing keyboard focus/interactions in-browser via cypress or similar.
  it('increment/decrement value via keyboard', () => {
    render(<TimePickerSpinner {...timePickerProps} spinner />);

    screen.getByRole('textbox').focus();

    fireEvent.keyUp(document.activeElement || document.body, {
      key: 'ArrowLeft',
      code: 'ArrowLeft',
      keyCode: keyCodes.LEFT,
    });
    fireEvent.keyUp(document.activeElement || document.body, {
      key: 'ArrowUp',
      code: 'ArrowUp',
      keyCode: keyCodes.UP,
    });
    expect(screen.getByRole('textbox').value).toEqual('01:00');

    fireEvent.keyUp(document.activeElement || document.body, {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: keyCodes.DOWN,
    });
    expect(screen.getByRole('textbox').value).toEqual('00:00');
  });

  it('value is not modified on unrelated keystroke', () => {
    render(<TimePickerSpinner {...timePickerProps} spinner />);

    screen.getByRole('textbox').focus();

    fireEvent.keyUp(document.activeElement || document.body, {
      key: 'Escape',
      code: 'Escape',
      keyCode: keyCodes.ESCAPE,
    });
    expect(screen.getByRole('textbox').value).toEqual('');
  });

  it('work with strings', () => {
    const wrapper = mount(<TimePickerSpinner {...timePickerProps} value="xyz" spinner />);

    wrapper.find('input').simulate('blur');

    expect(wrapper.find('input').props().value).toEqual('');

    wrapper.find('.iot--time-picker__controls--btn.down-icon').first().simulate('click');
    expect(wrapper.find('input').props().value).toEqual('23:00');
  });

  // NOTE: enzyme's `simulate` doesn't really simulate anything.
  // The following test covers the keyboard interaction at a base level, but
  // needs to be improved by testing keyboard focus/interactions in-browser
  // via cypress or similar.
  it('show indicator', () => {
    const wrapper = mount(<TimePickerSpinner {...timePickerProps} spinner />);

    const upButton = wrapper.find('.iot--time-picker__controls--btn.up-icon').first();
    const downButton = wrapper.find('.iot--time-picker__controls--btn.down-icon').first();

    upButton.simulate('focus');
    upButton.simulate('click');
    expect(wrapper.find('input').props().value).toEqual('01:00');
    expect(
      wrapper
        .find('.iot--time-picker__wrapper')
        .hasClass('iot--time-picker__wrapper--show-underline')
    ).toEqual(true);
    upButton.simulate('mouseover');
    upButton.simulate('mouseout');
    upButton.simulate('blur');
    upButton.simulate('mouseout');
    expect(
      wrapper
        .find('.iot--time-picker__wrapper')
        .hasClass('iot--time-picker__wrapper--show-underline')
    ).toEqual(false);

    wrapper.find('input').simulate('keydown', { keyCode: keyCodes.DOWN });
    wrapper.find('input').simulate('keydown', { keyCode: keyCodes.UP });
    wrapper.find('input').simulate('keydown', { keyCode: keyCodes.ESCAPE });
    expect(wrapper.find('input').props().value).toEqual('01:00');
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 0);

    downButton.simulate('focus');
    downButton.simulate('click');
    expect(wrapper.find('input').props().value).toEqual('00:00');
    downButton.simulate('mouseover');
    downButton.simulate('mouseout');
    downButton.simulate('blur');
  });

  it('onClick should be called', () => {
    const wrapper = mount(<TimePickerSpinner {...timePickerProps} spinner />);
    wrapper.find('input').simulate('click');
    expect(timePickerProps.onClick).toHaveBeenCalled();
  });

  it('onChange should be called', () => {
    const wrapper = mount(<TimePickerSpinner {...timePickerProps} spinner />);
    wrapper.find('input').simulate('change');
    expect(timePickerProps.onChange).toHaveBeenCalled();
  });

  it('12-hour picker', () => {
    const wrapper = mount(
      <TimePickerSpinner {...timePickerProps} value="12:00" spinner is12hour />
    );
    wrapper.find('.iot--time-picker__controls--btn.up-icon').first().simulate('click');
    expect(wrapper.find('input').props().value).toEqual('00:00');
  });

  it('default timeGroup to minutes', () => {
    const wrapper = mount(
      <TimePickerSpinner
        {...timePickerProps}
        value="12:00"
        spinner
        defaultTimegroup={TIMEGROUPS.MINUTES}
      />
    );
    wrapper.find('.iot--time-picker__controls--btn.up-icon').first().simulate('click');
    expect(wrapper.find('input').props().value).toEqual('12:01');
  });

  it('flip minutes back to 59 after hitting 0', () => {
    const wrapper = mount(
      <TimePickerSpinner
        {...timePickerProps}
        value="12:00"
        spinner
        defaultTimegroup={TIMEGROUPS.MINUTES}
      />
    );
    wrapper.find('.iot--time-picker__controls--btn.down-icon').first().simulate('click');
    expect(wrapper.find('input').props().value).toEqual('12:59');
  });
});

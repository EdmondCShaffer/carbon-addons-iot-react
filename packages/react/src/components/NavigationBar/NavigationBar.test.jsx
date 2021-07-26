import React from 'react';
import { mount } from 'enzyme';
import { render, screen } from '@testing-library/react';

import NavigationBar from './NavigationBar';

const commonNavigationBarProps = {
  tabs: [
    { id: 'tab1', label: 'tabLabel', 'data-id': 'tab1' },
    { id: 'tab2', label: 'tabLabel2', 'data-id': 'tab2' },
  ],
};

describe('NavigationBar', () => {
  it('should be selectable by testId', () => {
    render(
      <NavigationBar
        {...commonNavigationBarProps}
        testId="navigation_bar"
        actions={[
          {
            id: 'button1',
            children: 'New Entity Type',
            onClick: jest.fn(),
          },
          {
            id: 'button2',
            children: 'Button 2',
            kind: 'secondary',
            onClick: jest.fn(),
          },
        ]}
      />
    );

    expect(screen.getByTestId('navigation_bar')).toBeDefined();
    expect(screen.getByTestId('navigation_bar-tabs')).toBeDefined();
    expect(screen.getByTestId('navigation_bar-actions')).toBeDefined();
    expect(screen.getByTestId('navigation_bar-button-button1')).toBeDefined();
    expect(screen.getByTestId('navigation_bar-button-button2')).toBeDefined();
  });
  it('onSelectionChange', () => {
    const wrapper = mount(<NavigationBar {...commonNavigationBarProps} />);
    const tab1 = wrapper.find('[data-id="tab1"]');
    tab1.at(0).simulate('click');
    // no exception should be thrown

    const mockSelectionChange = jest.fn();
    const wrapper2 = mount(
      <NavigationBar {...commonNavigationBarProps} onSelectionChange={mockSelectionChange} />
    );
    const tab2 = wrapper2.find('[data-id="tab2"]');
    expect(mockSelectionChange).not.toHaveBeenCalled();
    tab2.at(0).simulate('click');
    expect(mockSelectionChange).toHaveBeenCalled();
  });
});

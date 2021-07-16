import { mount } from 'enzyme';
import React from 'react';
import { ComboBox, TextInput } from 'carbon-components-react';
import { render, screen } from '@testing-library/react';

import { settings } from '../../../../constants/Settings';

import FilterHeaderRow from './FilterHeaderRow';

const { iotPrefix } = settings;

describe('FilterHeaderRow', () => {
  const commonFilterProps = { onApplyFilter: jest.fn() };

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    console.error.mockClear();
  });
  afterAll(() => {
    console.error.mockRestore();
  });

  it('should be selectable by testId', () => {
    render(
      <FilterHeaderRow
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[{ id: 'col1', isFilterable: true }]}
        testId="filter_header_row"
      />
    );
    expect(screen.getByTestId('filter_header_row')).toBeDefined();
  });

  it('text input change updates state', () => {
    const wrapper = mount(
      <FilterHeaderRow
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[{ id: 'col1', isFilterable: true }]}
      />
    );
    wrapper.find('input').simulate('change', { target: { value: 'mytext' } });
    expect(wrapper.state()).toEqual({
      filterValues: { col1: 'mytext' },
      prevPropsFilters: [],
    });
  });

  it('each column is marked with data-column', () => {
    const wrapper = mount(
      <FilterHeaderRow
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[{ id: 'col1' }]}
      />
    );
    const columns = wrapper.find("th[data-column='col1']");
    expect(columns).toHaveLength(1);
  });

  it('text input clear button clears filter', () => {
    const wrapper = mount(
      <FilterHeaderRow
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[{ id: 'col1' }]}
      />
    );
    wrapper.find('input').simulate('change', { target: { value: 'mytext' } });
    wrapper.find('[title="Clear filter"]').simulate('click');
    expect(wrapper.state()).toEqual({
      filterValues: { col1: '' },
      prevPropsFilters: [],
    });
  });

  it('filter input is hidden when isFilterable is false', () => {
    const wrapper = mount(
      <FilterHeaderRow
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }]}
        columns={[{ id: 'col1', isFilterable: false }]}
      />
    );
    expect(wrapper.find('input').exists()).toEqual(false);
  });

  it('prevent filter modifications when isDisabled is true ', () => {
    const wrapper = mount(
      <FilterHeaderRow
        {...commonFilterProps}
        isDisabled="true"
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[{ id: 'col1' }, { id: 'col2', options: [{ id: 'opt1', text: 'option1' }] }]}
        filters={[{ columnId: 'col1', value: 'myVal' }]}
      />
    );

    expect(wrapper.find(ComboBox).props().disabled).toEqual('true');
    expect(wrapper.find(TextInput).props().disabled).toEqual('true');
    expect(wrapper.find(`.${iotPrefix}--clear-filters-button--disabled`)).toHaveLength(1);

    wrapper.find(`.${iotPrefix}--clear-filters-button--disabled`).simulate('click');
    expect(wrapper.state().filterValues.col1).toEqual('myVal');
  });

  it('adds an extra cell for the expander column when showExpanderColumn is true', () => {
    const { container, rerender } = render(
      <FilterHeaderRow
        showExpanderColumn={false}
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[{ id: 'col1' }, { id: 'col2' }]}
        filters={[]}
      />
    );
    expect(container.querySelectorAll('th').length).toEqual(3);

    rerender(
      <FilterHeaderRow
        showExpanderColumn
        {...commonFilterProps}
        ordering={[{ columnId: 'col1' }, { columnId: 'col2' }]}
        columns={[{ id: 'col1' }, { id: 'col2' }]}
        filters={[]}
      />
    );
    expect(container.querySelectorAll('th').length).toEqual(4);
  });
});

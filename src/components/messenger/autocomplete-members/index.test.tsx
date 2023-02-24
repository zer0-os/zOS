import React from 'react';

import { shallow } from 'enzyme';
import { AutocompleteMembers } from './';

import { Properties } from './';
import AsyncSelect from 'react-select/async';
import { ActionMeta } from 'react-select';

describe('autocomplete-members', () => {
  const mockedOptions = [
    { label: 'Mocked option 1', value: 'mocked-option-1' },
    { label: 'Mocked option 2', value: 'mocked-option-2' },
    { label: 'Mocked option 3', value: 'mocked-option-3' },
    { label: 'Mocked option 4', value: 'mocked-option-4' },
    { label: 'Mocked option 5', value: 'mocked-option-5' },
    { label: 'Mocked option 6', value: 'mocked-option-6' },
    { label: 'Mocked option 7', value: 'mocked-option-7' },
    { label: 'Mocked option 8', value: 'mocked-option-8' },
    { label: 'Mocked option 9', value: 'mocked-option-9' },
    { label: 'Mocked option 10', value: 'mocked-option-10' },
  ];

  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      className: '',
      placeholder: '',
      selectedItems: [],
      search: () => undefined,
      onChange: () => undefined,
      ...props,
    };

    return shallow(<AutocompleteMembers {...allProps} />);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'todo' });

    const asyncSelect = wrapper.find(AsyncSelect);

    expect(asyncSelect.find('.todo').exists()).toBe(true);
  });

  it('it renders the placeholder', () => {
    const placeholder = 'todo';
    const wrapper = subject({ placeholder });

    const asyncSelect = wrapper.find(AsyncSelect);

    expect(asyncSelect.prop('placeholder')).toEqual(placeholder);
  });

  it('should render select', () => {
    const search = jest.fn();
    const wrapper = subject(search);

    const asyncSelect = wrapper.find(AsyncSelect);

    expect(asyncSelect.exists()).toBe(true);
  });

  it('should call search ', async () => {
    const search = jest.fn(() => Promise.resolve([]));
    const inputSearch = 'anything';
    const wrapper = subject({ search });

    wrapper.find(AsyncSelect).prop('loadOptions')(inputSearch, jest.fn());

    expect(search).toHaveBeenCalledWith(inputSearch, '');
  });

  it('should call onChange', async () => {
    const onChange = jest.fn();
    const wrapper = subject({ onChange, isMulti: true });

    wrapper.find(AsyncSelect).prop('onChange')(mockedOptions, '' as unknown as ActionMeta<unknown>);

    expect(onChange).toHaveBeenCalledWith(mockedOptions.map((option) => option.value));
  });

  it('should render selections members', () => {
    const search = jest.fn();
    const wrapper = subject(search);

    expect(wrapper.find('.current__selections').exists()).toBe(true);
  });

  it('should call onChange when remove member is clicked', async () => {
    const onChange = jest.fn();
    const wrapper = subject({ onChange, isMulti: true });
    wrapper.find(AsyncSelect).prop('onChange')(mockedOptions, '' as unknown as ActionMeta<unknown>);

    wrapper
      .find('.current__selections-list__delete')
      .first()
      .simulate('click', { target: { getAttribute: () => ({ 'data-value': mockedOptions[0].value }) } });

    expect(onChange).toHaveBeenCalledWith(mockedOptions.map((option) => option.value));
  });
});

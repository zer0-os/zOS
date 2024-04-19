import React from 'react';

import { shallow } from 'enzyme';
import { AutocompleteMembers } from './';
import { when } from 'jest-when';

import { Properties } from './';

describe('autocomplete-members', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      search: () => undefined,
      onSelect: () => undefined,
      ...props,
    };

    return shallow(<AutocompleteMembers {...allProps} />);
  };

  it('renders results', async () => {
    const search = jest.fn();
    when(search)
      .calledWith('name')
      .mockResolvedValue([
        { name: 'Result 1', id: 'result-1', image: 'image-1' },
      ]);
    const wrapper = subject({ search });

    await searchFor(wrapper, 'name');

    expect(wrapper.find('.autocomplete-members__search-results Avatar').prop('imageURL')).toEqual('image-1');
  });

  it('displays filtered results excluding selected options', async () => {
    const search = jest.fn();
    when(search)
      .calledWith('name')
      .mockResolvedValue([
        { name: 'Result 1', id: 'result-1' },
        { name: 'Result 2', id: 'result-2' },
      ]);

    // Define selected options
    const selectedOptions = [
      { value: 'result-1', label: 'Result 1', image: undefined },
    ];

    const wrapper = subject({ search, selectedOptions });

    // Simulate a non-empty search
    await searchFor(wrapper, 'name');

    // Ensure that state.results is correctly updated with filtered results
    expect(wrapper.state('results')).toEqual([
      { value: 'result-2', label: 'Result 2', image: undefined, subLabel: '' },
    ]);

    // Ensure that the component renders the filtered result
    expect(wrapper.find('.autocomplete-members__search-results')).toHaveLength(1);
    expect(wrapper.find('.autocomplete-members__search-results').text()).toContain('Result 2');

    // Ensure that the selected option is not displayed in the component
    expect(wrapper.find('.autocomplete-members__search-results').text()).not.toContain('Result 1');
  });

  it('excludes the selected option from search results on subsequent searches', async () => {
    const search = jest.fn();
    when(search)
      .calledWith('name')
      .mockResolvedValue([
        { name: 'Result 1', id: 'result-1' },
        { name: 'Result 2', id: 'result-2' },
      ]);

    const onSelect = jest.fn();
    const wrapper = subject({ search, onSelect });

    await searchFor(wrapper, 'name');

    wrapper
      .find('.autocomplete-members__search-results > div')
      .first()
      .simulate('click', {
        currentTarget: { dataset: { id: 'result-1' } },
      });

    when(search)
      .calledWith('name')
      .mockResolvedValue([
        { name: 'Result 2', id: 'result-2' },
      ]);

    await searchFor(wrapper, 'name');

    expect(wrapper.state('results')).toEqual([expect.objectContaining({ value: 'result-2' })]);
    expect(wrapper.find('.autocomplete-members__search-results').text()).not.toContain('Result 1');
  });

  it('search with empty string clears results', async () => {
    const search = jest.fn();
    when(search)
      .calledWith('name')
      .mockResolvedValue([{ name: 'Result 1', id: 'result-1' }]);
    const wrapper = subject({ search });
    await searchFor(wrapper, 'name');
    expect(wrapper.find('.autocomplete-members__search-results').exists()).toBeTrue();

    await searchFor(wrapper, '');

    expect(wrapper.find('.autocomplete-members__search-results').exists()).toBeFalse();
  });

  it('fires onSelect when result is clicked', async () => {
    const search = jest.fn();
    when(search).mockResolvedValue([
      { name: 'Result 1', id: 'result-1' },
    ]);
    const onSelect = jest.fn();
    const wrapper = subject({ search, onSelect });
    await searchFor(wrapper, 'name');

    wrapper
      .find('.autocomplete-members__search-results > div')
      .simulate('click', { currentTarget: { dataset: { id: 'result-1' } } });

    expect(onSelect).toHaveBeenCalledWith({ value: 'result-1', label: 'Result 1', subLabel: '' });
  });

  it('fires onSelect when enter is pressed on a result', async () => {
    const search = jest.fn();
    when(search).mockResolvedValue([
      { name: 'Result 1', id: 'result-1' },
    ]);
    const onSelect = jest.fn();
    const wrapper = subject({ search, onSelect });
    await searchFor(wrapper, 'name');

    wrapper
      .find('.autocomplete-members__search-results > div')
      .simulate('keydown', { key: 'Enter', currentTarget: { dataset: { id: 'result-1' } } });

    expect(onSelect).toHaveBeenCalledWith({ value: 'result-1', label: 'Result 1', subLabel: '' });
  });

  it('clears search input when a member is selected', async () => {
    const search = jest.fn();
    when(search).mockResolvedValue([
      { name: 'Member 1', id: 'member-1' },
      { name: 'Member 2', id: 'member-2' },
    ]);

    const wrapper = subject({ search, onSelect: jest.fn() });
    await searchFor(wrapper, 'Member');

    wrapper
      .find('.autocomplete-members__search-results > div')
      .first()
      .simulate('click', {
        currentTarget: { dataset: { id: 'member-1' } },
      });

    expect(wrapper.find('Input').prop('value')).toEqual('');
  });

  it('clears search results when a member is selected', async () => {
    const search = jest.fn();
    when(search).mockResolvedValue([
      { name: 'Member 1', id: 'member-1' },
      { name: 'Member 2', id: 'member-2' },
    ]);

    const wrapper = subject({ search, onSelect: jest.fn() });
    await searchFor(wrapper, 'Member');

    wrapper
      .find('.autocomplete-members__search-results > div')
      .first()
      .simulate('click', {
        currentTarget: { dataset: { id: 'member-1' } },
      });

    expect(wrapper.state('results')).toEqual(null);
  });

  it('calls onSearchChange with true when search begins', async () => {
    const onSearchChange = jest.fn();
    const search = jest.fn().mockResolvedValue([]);
    const wrapper = subject({ search, onSearchChange });

    await searchFor(wrapper, 'name');

    expect(onSearchChange).toHaveBeenCalledWith(true);
  });

  it('calls onSearchChange with false when search is cleared', async () => {
    const onSearchChange = jest.fn();
    const search = jest.fn().mockResolvedValue([]);
    const wrapper = subject({ search, onSearchChange });

    await searchFor(wrapper, 'name');
    await searchFor(wrapper, '');

    expect(onSearchChange).toHaveBeenCalledWith(false);
  });

  it('calls onSearchChange with false when an item is selected', async () => {
    const onSearchChange = jest.fn();
    const search = jest.fn();
    when(search).mockResolvedValue([
      { name: 'Member 1', id: 'member-1' },
      { name: 'Member 2', id: 'member-2' },
    ]);
    const onSelect = jest.fn();
    const wrapper = subject({ search, onSelect, onSearchChange });

    await searchFor(wrapper, 'Member 1');
    wrapper
      .find('.autocomplete-members__search-results > div')
      .first()
      .simulate('click', {
        currentTarget: { dataset: { id: 'member-1' } },
      });

    expect(onSearchChange).toHaveBeenLastCalledWith(false);
  });
});

async function searchFor(wrapper, searchString) {
  await wrapper.find('Input').simulate('change', searchString);
}

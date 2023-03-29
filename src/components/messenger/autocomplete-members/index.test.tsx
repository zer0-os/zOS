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

  it('renders empty result message', async () => {
    const search = jest.fn();
    when(search).mockResolvedValue([]);
    const wrapper = subject({ search });

    await searchFor(wrapper, 'name');

    expect(wrapper.find('.autocomplete-members__empty-results').exists()).toBeTrue();
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

    expect(onSelect).toHaveBeenCalledWith('result-1');
  });
});

async function searchFor(wrapper, searchString) {
  await wrapper.find('Input').simulate('change', searchString);
}

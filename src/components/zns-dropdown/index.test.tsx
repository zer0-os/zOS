import React from 'react';

import { ZNSDropdown, Properties } from './';
import { shallow } from 'enzyme';

let onSelect;
let onCloseBar;
let api;

describe('zns-dropdown', () => {
  beforeEach(() => {
    onSelect = jest.fn();
    onCloseBar = jest.fn();
    api = jest.fn();
  });

  function subject(initialData: Partial<Properties> = {}) {
    const state: Properties = {
      onSelect,
      onCloseBar,
      api,
      ...initialData,
    };

    return shallow(<ZNSDropdown {...state} />);
  }

  it('findMatches maps results', async () => {
    const apiResults = [
      {
        id: 'zns-id',
        title: 'zns-title',
        description: 'zns-description',
        znsRoute: 'zns-route',
      },
    ];

    const wrapper = subject({
      api: {
        search: async (searchString) => {
          if (searchString === 'search-string') {
            return apiResults;
          }
          return [];
        },
      },
    });

    const mappedResults = await dropdownInstance(wrapper).findMatches('search-string');

    expect([
      {
        id: 'zns-id',
        value: 'zns-title',
        summary: 'zns-description',
        route: 'zns-route',
      },
    ]).toEqual(mappedResults);
  });

  it('onSelect returns route', async () => {
    const apiResults = [
      {
        id: 'zns-id-first',
        title: 'zns-title-first',
        description: 'zns-description-first',
        znsRoute: 'zns-route-first',
      },
      {
        id: 'zns-id-second',
        title: 'zns-title-second',
        description: 'zns-description-second',
        znsRoute: 'zns-route-second',
      },
    ];
    const wrapper = subject({
      api: {
        search: async () => {
          return apiResults;
        },
      },
    });
    await dropdownInstance(wrapper).findMatches('search-string');

    wrapper.find('AutocompleteDropdown').simulate('select', { id: 'zns-id-first' });

    expect(onSelect).toHaveBeenCalledWith(apiResults[0].znsRoute);
  });

  it('announces close event when result is selected', async () => {
    const apiResults = [
      {
        id: 'zns-id-first',
        title: 'zns-title-first',
        description: 'zns-description-first',
        znsRoute: 'zns-route-first',
      },
    ];
    const wrapper = subject({
      api: {
        search: async () => {
          return apiResults;
        },
      },
    });
    await dropdownInstance(wrapper).findMatches('search-string');

    wrapper.find('AutocompleteDropdown').simulate('select', { id: 'zns-id-first' });

    expect(onCloseBar).toHaveBeenCalled();
  });

  it('announces close event when dropdown edit is cancelled', async () => {
    const wrapper = subject();

    wrapper.find('AutocompleteDropdown').simulate('cancel');

    expect(onCloseBar).toHaveBeenCalled();
  });
});

function dropdownInstance(wrapper) {
  return wrapper.instance() as ZNSDropdown;
}

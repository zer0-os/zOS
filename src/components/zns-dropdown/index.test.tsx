import React from 'react';

import { ZNSDropdown, Properties } from './';
import { shallow } from 'enzyme';

let onSelect;
let api;

describe('zns-dropdown', () => {
  beforeEach(() => {
    onSelect = jest.fn();
    api = jest.fn();
  });

  function subject(initialData:Partial<Properties> = {}) {
    const state:Properties = {
      onSelect,
      api,
      ...initialData,
    };

    return shallow(<ZNSDropdown {...state} />);
  }

  it('findMatches maps results', async () => {
    const apiResults = [{ id: 'zns-id', title: 'zns-title', description: 'zns-description', znsRoute: 'zns-route' }];

    const wrapper = subject({ api: { search: async () => { return apiResults } } });

    const mappedResults = await wrapper.instance().findMatches();

    expect([{ id: 'zns-id', value: 'zns-title', summary: 'zns-description', route: 'zns-route' }]).toEqual(mappedResults);
  });

  it('onSelect returns route', async () => {
    const apiResults = [
      { id: 'zns-id-first', title: 'zns-title-first', description: 'zns-description-first', znsRoute: 'zns-route-first' },
      { id: 'zns-id-second', title: 'zns-title-second', description: 'zns-description-second', znsRoute: 'zns-route-second' },
    ];

    const wrapper = subject({ api: { search: async () => { return apiResults } } });

    await wrapper.instance().findMatches();

    wrapper.instance().onSelect(apiResults[0]);

    expect(onSelect).toHaveBeenCalledWith(apiResults[0].znsRoute);
  });
});

import React from 'react';

import { AutocompleteDropdown, Properties, Result } from './';
import { shallow } from 'enzyme';

let onSelect;
let onCloseBar;

describe('autocomplete-dropdown', () => {
  beforeEach(() => {
    onSelect = jest.fn();
    onCloseBar = jest.fn();
  });

  function subject(initialData: Partial<Properties> = {}) {
    const state: Properties = {
      findMatches: null,
      onSelect,
      onCloseBar,
      value: null,
      ...initialData,
    };

    return shallow(<AutocompleteDropdown {...state} />);
  }

  it('it renders input', () => {
    const wrapper = subject({
      placeholder: 'TYPE STUFF',
      value: 'Selected One',
    });

    const input = wrapper.find('input');

    expect(input.prop('placeholder')).toEqual('TYPE STUFF');
    expect(input.prop('value')).toEqual('Selected One');
  });

  it('it renders the new value when prop changes', () => {
    const wrapper = subject({ value: 'First selection' });

    expect(wrapper.find('input').prop('value')).toEqual('First selection');

    wrapper.setProps({ value: 'Changed selection' });

    expect(wrapper.find('input').prop('value')).toEqual('Changed selection');
  });

  it('it renders match suggestions', async () => {
    const searchResults = [
      {
        id: 'result-first-id',
        value: 'result-first-value',
        route: 'result-first-route',
      },
      {
        id: 'result-second-id',
        value: 'result-second-value',
        route: 'result-second-route',
      },
    ];

    const wrapper = subject({ findMatches: stubSearchFor('anything', searchResults) });

    await performSearch(wrapper, 'anything');

    expect(wrapper.find(Result).map((r) => r.prop('item'))).toEqual(searchResults);
  });

  it('it sets the first item found to the "focused" one', async () => {
    const findMatches = stubSearchFor('anything', [
      {
        id: 'result-first-id',
        value: 'result-first-value',
        route: 'result-first-route',
      },
      {
        id: 'result-second-id',
        value: 'result-second-value',
        route: 'result-second-route',
      },
    ]);

    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'anything');

    expect(wrapper.find(Result).map((r) => r.prop('isFocused'))).toEqual([
      true,
      false,
    ]);
  });

  it('it sets the next item as to the "focused" one when hitting "down"', async () => {
    const findMatches = stubSearchFor('anything', [
      {
        id: 'result-first-id',
        value: 'result-first-value',
        route: 'result-first-route',
      },
      {
        id: 'result-second-id',
        value: 'result-second-value',
        route: 'result-second-route',
      },
      {
        id: 'result-third-id',
        value: 'result-third-value',
        route: 'result-third-route',
      },
    ]);

    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'anything');

    expect(wrapper.find(Result).map((r) => r.prop('isFocused'))).toEqual([
      true,
      false,
      false,
    ]);

    const input = wrapper.find('input');
    input.simulate('keydown', {
      key: 'ArrowDown',
      preventDefault: () => {},
      stopPropagation: () => {},
    });

    expect(wrapper.find(Result).map((r) => r.prop('isFocused'))).toEqual([
      false,
      true,
      false,
    ]);
  });

  it('it sets the last item as to the "focused" one when hitting "up"', async () => {
    const findMatches = stubSearchFor('anything', [
      {
        id: 'result-first-id',
        value: 'result-first-value',
        route: 'result-first-route',
      },
      {
        id: 'result-second-id',
        value: 'result-second-value',
        route: 'result-second-route',
      },
      {
        id: 'result-third-id',
        value: 'result-third-value',
        route: 'result-third-route',
      },
    ]);

    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'anything');

    expect(wrapper.find(Result).map((r) => r.prop('isFocused'))).toEqual([
      true,
      false,
      false,
    ]);

    const input = wrapper.find('input');
    input.simulate('keydown', {
      key: 'ArrowUp',
      preventDefault: () => {},
      stopPropagation: () => {},
    });

    expect(wrapper.find(Result).map((r) => r.prop('isFocused'))).toEqual([
      false,
      false,
      true,
    ]);
  });

  it('it selects the currently focused option when pressing "Enter"', async () => {
    const searchResults = [
      {
        id: 'result-first-id',
        value: 'result-first-value',
        route: 'result-first-route',
      },
      {
        id: 'result-second-id',
        value: 'result-second-value',
        route: 'result-second-route',
      },
    ];
    const findMatches = stubSearchFor('anything', searchResults);

    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'anything');

    const input = wrapper.find('input');
    input.simulate('keydown', {
      key: 'ArrowUp',
      preventDefault: () => {},
      stopPropagation: () => {},
    });
    input.simulate('keydown', {
      key: 'Enter',
      preventDefault: () => {},
      stopPropagation: () => {},
    });

    expect(onSelect).toHaveBeenCalledWith(searchResults[1]);
  });

  it('selecting a match triggers change event', async () => {
    const expectation = 'result-first-value';
    const searchResults = [
      {
        id: 'result-first-id',
        value: expectation,
        route: 'result-first-route',
      },
      {
        id: 'result-second-id',
        value: 'result-second-value',
        route: 'result-second-route',
      },
    ];
    const findMatches = stubSearchFor('anything', searchResults);

    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'anything');

    wrapper.update();

    const option = wrapper
      .find(Result)
      .findWhere((n) => {
        const match = n.prop('item') as any;
        return match.value === expectation;
      })
      .first();
    option.shallow().find('.autocomplete-dropdown-item').simulate('mouseDown', inputEvent());

    expect(onSelect).toHaveBeenCalledWith(searchResults[0]);
  });

  it('selecting an option verifies value and closes dropdown', async () => {
    const expectation = 'result-value';

    const findMatches = stubSearchFor('anything', [{ id: 'result-id', value: expectation, route: 'result-route' }]);
    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'anything');

    wrapper.update();

    const option = wrapper
      .find(Result)
      .findWhere((n) => {
        const match = n.prop('item') as any;
        return match.value === expectation;
      })
      .first();
    option.shallow().find('.autocomplete-dropdown-item').simulate('mouseDown', inputEvent());

    expect(wrapper.find('input').prop('value')).toEqual(expectation);
    expect(wrapper.find(Result).exists()).toBe(false);
  });

  it('it closes dropdown when focus lost', async () => {
    const findMatches = () => {
      return [{ id: 'result-id', value: 'result-value', route: 'result-route' }];
    };
    const wrapper = subject({ findMatches, value: 'original value' });

    const input = wrapper.find('input');

    jest.useFakeTimers();
    input.simulate('change', { target: { value: 'someSearch' } });
    jest.runAllTimers();

    input.simulate('blur');

    expect(input.prop('value')).toEqual('original value');
    expect(wrapper.find('[className*="__items"]').exists()).toBe(false);
  });

  it('it displays "No results found" when there are no matches', async () => {
    const findMatches = () => {
      return [];
    };
    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'someSearch');

    expect(wrapper.text()).toEqual('No results found');
  });

  it('hides search bar when pressing "escape"', async () => {
    const findMatches = () => {
      return [];
    };
    const wrapper = subject({ findMatches });

    const input = wrapper.find('input');

    jest.useFakeTimers();
    input.simulate('keydown', {
      key: 'ArrowUp',
      preventDefault: () => {},
      stopPropagation: () => {},
    });
    input.simulate('keydown', {
      key: 'Enter',
      preventDefault: () => {},
      stopPropagation: () => {},
    });
    jest.runAllTimers();

    await new Promise(setImmediate);

    expect(wrapper.find('.autocomplete-dropdown__item-container').exists()).toBe(false);
  });

  it('does not close search bar when empty value', async () => {
    const wrapper = subject({ value: 'lets delete this' });

    let input = wrapper.find('input');

    input.simulate('change', { target: { value: '' } });

    expect(onCloseBar).not.toHaveBeenCalled();
  });

  it('set min height to results wrapper', async () => {
    const findMatches = stubSearchFor('anything', [
      {
        id: 'result-first-id',
        value: 'result-first-value',
        route: 'result-first-route',
      },
      {
        id: 'result-second-id',
        value: 'result-second-value',
        route: 'result-second-route',
      },
    ]);

    const wrapper = subject({ findMatches });
    expect(wrapper.find('.autocomplete-dropdown__results').exists()).toBe(false);

    await performSearch(wrapper, 'anything');

    expect(wrapper.find('.autocomplete-dropdown__results').prop('style').height).toEqual(35);
  });

  describe('result', () => {
    beforeEach(() => {
      onSelect = jest.fn();
    });

    function subject(initialData = {}) {
      const props: Properties = {
        item: {},
        isFocused: false,
        onSelect,
        ...initialData,
      };

      return shallow(<Result {...props} />);
    }

    it('verifies expected attributes are present', () => {
      const expectation = {
        value: 'result-value',
        route: 'result-route',
        summary: 'result-summary',
      };

      const wrapper = subject({ item: expectation });

      Object.values(expectation).forEach((value) => {
        expect(wrapper.html().includes(value)).toBe(true);
      });
    });
  });
});

function inputEvent(attrs = {}) {
  return {
    preventDefault: () => {},
    stopPropagation: () => {},
    ...attrs,
  };
}

async function performSearch(dropdown, searchString) {
  const input = dropdown.find('input');
  // Fake the timers because we debounce search requests
  jest.useFakeTimers();
  input.simulate('change', { target: { value: searchString } });
  jest.runAllTimers();
  // Release the thread so the async search can complete
  await new Promise(setImmediate);
}

function stubSearchFor(expectedSearch, results) {
  return (search) => {
    if (search === expectedSearch) {
      return results;
    }
    return [];
  };
}

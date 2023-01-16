import React from 'react';

import { AutocompleteDropdown, Properties, Result } from './';
import { shallow } from 'enzyme';
import { Key } from '../../lib/keyboard-search';

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
      stubResult('first'),
      stubResult('second'),
    ];

    const wrapper = subject({ findMatches: stubSearchFor('anything', searchResults) });

    await performSearch(wrapper, 'anything');

    expect(wrapper.find(Result).map((r) => r.prop('item'))).toEqual(searchResults);
  });

  it('it sets the first item found to the "focused" one', async () => {
    const findMatches = stubSearchFor('anything', [
      stubResult('first'),
      stubResult('second'),
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
      stubResult('first'),
      stubResult('second'),
      stubResult('third'),
    ]);

    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'anything');

    expect(wrapper.find(Result).map((r) => r.prop('isFocused'))).toEqual([
      true,
      false,
      false,
    ]);

    pressKey(wrapper, Key.ArrowDown);

    expect(wrapper.find(Result).map((r) => r.prop('isFocused'))).toEqual([
      false,
      true,
      false,
    ]);
  });

  it('it sets the last item as to the "focused" one when hitting "up"', async () => {
    const findMatches = stubSearchFor('anything', [
      stubResult('first'),
      stubResult('second'),
      stubResult('third'),
    ]);

    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'anything');

    expect(wrapper.find(Result).map((r) => r.prop('isFocused'))).toEqual([
      true,
      false,
      false,
    ]);

    pressKey(wrapper, Key.ArrowUp);

    expect(wrapper.find(Result).map((r) => r.prop('isFocused'))).toEqual([
      false,
      false,
      true,
    ]);
  });

  it('it selects the currently focused option when pressing "Enter"', async () => {
    const searchResults = [
      stubResult('first'),
      stubResult('second'),
    ];
    const findMatches = stubSearchFor('anything', searchResults);

    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'anything');

    pressKey(wrapper, Key.ArrowUp);
    pressKey(wrapper, Key.Enter);

    expect(onSelect).toHaveBeenCalledWith(searchResults[1]);
  });

  it('selecting a match triggers change event', async () => {
    const searchResults = [
      stubResult('first'),
      stubResult('second'),
    ];
    const valueToSelect = searchResults[0].value;
    const findMatches = stubSearchFor('anything', searchResults);

    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'anything');

    wrapper.update();

    const option = wrapper
      .find(Result)
      .findWhere((n) => {
        const match = n.prop('item') as any;
        return match.value === valueToSelect;
      })
      .first();
    option.shallow().find('.autocomplete-dropdown-item').simulate('mouseDown', inputEvent());

    expect(onSelect).toHaveBeenCalledWith(searchResults[0]);
  });

  it('selecting an option verifies value and closes dropdown', async () => {
    const searchResults = [
      stubResult('first'),
    ];
    const valueToSelect = searchResults[0].value;
    const findMatches = stubSearchFor('anything', searchResults);
    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'anything');

    wrapper.update();

    const option = wrapper
      .find(Result)
      .findWhere((n) => {
        const match = n.prop('item') as any;
        return match.value === valueToSelect;
      })
      .first();
    option.shallow().find('.autocomplete-dropdown-item').simulate('mouseDown', inputEvent());

    expect(wrapper.find('input').prop('value')).toEqual(valueToSelect);
    expect(wrapper.find(Result).exists()).toBe(false);
  });

  it('it closes dropdown when focus lost', async () => {
    const findMatches = () => {
      return [stubResult('result')];
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

    jest.useFakeTimers();
    pressKey(wrapper, Key.ArrowUp);
    pressKey(wrapper, Key.Enter);
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
    const findMatches = stubSearchFor('anything', []);

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

function stubResult(prefix) {
  return {
    id: `${prefix}-id`,
    value: `${prefix}-value`,
    route: `${prefix}-route`,
  };
}

function pressKey(wrapper, key) {
  const input = wrapper.find('input');
  input.simulate('keydown', {
    key,
    preventDefault: () => {},
    stopPropagation: () => {},
  });
}

import React from 'react';

import { AutocompleteDropdown, AutocompleteItem, Properties, Result, ResultProperties } from './';
import { shallow } from 'enzyme';
import { Key } from '../../lib/keyboard-search';
import { releaseThread } from '../../test/utils';

let onSelect;
let onCancel;

describe('autocomplete-dropdown', () => {
  beforeEach(() => {
    onSelect = jest.fn();
    onCancel = jest.fn();
  });

  function subject(initialData: Partial<Properties> = {}) {
    const state: Properties = {
      findMatches: null,
      onSelect,
      onCancel,
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
    const searchResults = stubResults(2);

    const wrapper = subject({ findMatches: stubSearchFor('anything', searchResults) });

    await performSearch(wrapper, 'anything');

    expect(wrapper.find(Result).map((r) => r.prop('item'))).toEqual(searchResults);
  });

  it('it sets the first item found to the "focused" one', async () => {
    const findMatches = stubSearchFor('anything', stubResults(2));

    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'anything');

    expect(wrapper.find(Result).map((r) => r.prop('isFocused'))).toEqual([
      true,
      false,
    ]);
  });

  it('it sets the next item as to the "focused" one when hitting "down"', async () => {
    const findMatches = stubSearchFor('anything', stubResults(3));

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
    const findMatches = stubSearchFor('anything', stubResults(3));

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
    const searchResults = stubResults(2);
    const findMatches = stubSearchFor('anything', searchResults);

    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'anything');

    pressKey(wrapper, Key.ArrowUp);
    pressKey(wrapper, Key.Enter);

    expect(wrapper.find('input').prop('value')).toEqual(searchResults[1].value);
    expect(onSelect).toHaveBeenCalledWith(searchResults[1]);
  });

  it('it selects the item via mouse', async () => {
    const searchResults = stubResults(2);
    const valueToSelect = searchResults[0].value;
    const findMatches = stubSearchFor('anything', searchResults);

    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'anything');
    wrapper.update();
    selectOption(wrapper, valueToSelect);

    expect(wrapper.find('input').prop('value')).toEqual(searchResults[0].value);
    expect(onSelect).toHaveBeenCalledWith(searchResults[0]);
  });

  it('selecting an option closes results dropdown', async () => {
    const searchResults = stubResults(1);
    const valueToSelect = searchResults[0].value;
    const wrapper = subject({ findMatches: stubSearchFor('anything', searchResults) });

    await performSearch(wrapper, 'anything');

    wrapper.update();

    selectOption(wrapper, valueToSelect);

    expect(wrapper.find('.autocomplete-dropdown__results').exists()).toBe(false);
  });

  describe('when focus is lost', () => {
    it('it resets the input', async () => {
      const findMatches = stubSearchFor('someSearch', stubResults(1));
      const wrapper = subject({ findMatches, value: 'original value' });
      await performSearch(wrapper, 'someSearch');

      wrapper.find('input').simulate('blur');

      expect(wrapper.find('input').prop('value')).toEqual('original value');
    });

    it('it closes dropdown', async () => {
      const findMatches = stubSearchFor('someSearch', stubResults(1));
      const wrapper = subject({ findMatches, value: 'original value' });
      await performSearch(wrapper, 'someSearch');
      expect(wrapper.find('.autocomplete-dropdown__results').exists()).toBe(true);

      wrapper.find('input').simulate('blur');

      expect(wrapper.find('.autocomplete-dropdown__results').exists()).toBe(false);
    });

    it('it announces cancel', async () => {
      const findMatches = stubSearchFor('someSearch', stubResults(1));
      const wrapper = subject({ findMatches, value: 'original value' });
      await performSearch(wrapper, 'someSearch');

      wrapper.find('input').simulate('blur');

      expect(onCancel).toHaveBeenCalled();
    });
  });

  it('it displays "No results found" when there are no matches', async () => {
    const findMatches = stubSearchFor('someSearch', []);
    const wrapper = subject({ findMatches });

    await performSearch(wrapper, 'someSearch');

    expect(wrapper.text()).toEqual('No results found');
  });

  it('announces cancel when "escape" is pressed', async () => {
    const findMatches = stubSearchFor('someSearch', stubResults(1));
    const wrapper = subject({ findMatches });

    pressKeyOn(wrapper, Key.Escape);

    expect(onCancel).toHaveBeenCalled();
  });

  it('closes search results when input cleared', async () => {
    const findMatches = stubSearchFor('anything', stubResults(1));
    const wrapper = subject({ findMatches });
    await performSearch(wrapper, 'anything');

    expect(wrapper.find('.autocomplete-dropdown__item-container').exists()).toBe(true);

    wrapper.find('input').simulate('change', { target: { value: '' } });

    expect(wrapper.find('.autocomplete-dropdown__item-container').exists()).toBe(false);
  });

  it('does not announce cancel when value cleared', async () => {
    const wrapper = subject({ value: 'lets delete this' });

    let input = wrapper.find('input');

    input.simulate('change', { target: { value: '' } });

    expect(onCancel).not.toHaveBeenCalled();
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

    function subject(initialData: Partial<ResultProperties> = {}) {
      const props: ResultProperties = {
        item: {} as AutocompleteItem,
        isFocused: false,
        onSelect,
        ...initialData,
      };

      return shallow(<Result {...props} />);
    }

    it('verifies expected attributes are present', () => {
      const item = {
        id: 'result-id',
        value: 'result-value',
        route: 'result-route',
        summary: 'result-summary',
      };

      const wrapper = subject({ item });

      expect(wrapper.find('.autocomplete-dropdown-item__value').text()).toEqual(item.value);
      expect(wrapper.find('.autocomplete-dropdown-item__route').text()).toEqual(item.route);
      expect(wrapper.find('.autocomplete-dropdown-item__text').prop('title')).toEqual(item.summary);
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
  await releaseThread();
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

function stubResults(num) {
  const results = [];
  for (let i = 1; i <= num; i++) {
    results.push(stubResult(i));
  }
  return results;
}

function pressKey(wrapper, key) {
  pressKeyOn(wrapper.find('input'), key);
}

function pressKeyOn(node, key) {
  node.simulate('keydown', {
    key,
    preventDefault: () => {},
    stopPropagation: () => {},
  });
}

function selectOption(component, value) {
  component
    .find(Result)
    .findWhere((n) => (n.prop('item') as any).value === value)
    .first()
    .shallow()
    .find('.autocomplete-dropdown-item')
    .simulate('mouseDown', inputEvent());
}

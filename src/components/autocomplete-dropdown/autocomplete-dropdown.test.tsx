/**
 * @jest-environment jsdom
 */

import React from 'react';

import { AutocompleteDropdown, Properties, Result } from './';
import { shallow, mount } from 'enzyme';

let findMatches;
let onSelect;
let onCloseBar;

describe('autocomplete-dropdown', () => {
  beforeEach(() => {
    findMatches = jest.fn();
    onSelect = jest.fn();
    onCloseBar = jest.fn();
  });

  function subject(initialData: Partial<Properties> = {}) {
    const state: Properties = {
      findMatches,
      onSelect,
      onCloseBar,
      value: null,
      ...initialData,
    };

    return shallow(<AutocompleteDropdown {...state} />);
  }

  function subjectMount(initialData: Partial<Properties> = {}) {
    const state: Properties = {
      findMatches,
      onSelect,
      onCloseBar,
      value: null,
      ...initialData,
    };

    return mount(<AutocompleteDropdown {...state} />);
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
    findMatches = () => { return [
      { id: 'result-first-id', value: 'result-first-value', route: 'result-first-route' },
      { id: 'result-second-id', value: 'result-second-value', route: 'result-second-route' },
    ]};

    const wrapper = subject({ findMatches });

    const input = wrapper.find('input');

    jest.useFakeTimers();
    input.simulate('change', { target: { value: 'anything' } });
    jest.runAllTimers();

    await new Promise(setImmediate);

    expect(wrapper.find(Result).map(r => r.prop('item'))).toEqual(findMatches());
  });

  it('it sets the first item found to the "focused" one', async () => {
    findMatches = () => { return [
      { id: 'result-first-id', value: 'result-first-value', route: 'result-first-route' },
      { id: 'result-second-id', value: 'result-second-value', route: 'result-second-route' },
    ]};

    const wrapper = subject({ findMatches });

    const input = wrapper.find('input');

    jest.useFakeTimers();
    input.simulate('change', { target: { value: 'anything' } });
    jest.runAllTimers();

    await new Promise(setImmediate);

    expect(wrapper.find(Result).map(r => r.prop('isFocused'))).toEqual([true, false]);
  });

  it('it sets the next item as to the "focused" one when hitting "down"', async () => {
    findMatches = () => { return [
      { id: 'result-first-id', value: 'result-first-value', route: 'result-first-route' },
      { id: 'result-second-id', value: 'result-second-value', route: 'result-second-route' },
    ]};

    const wrapper = subject({ findMatches });

    const input = wrapper.find('input');

    jest.useFakeTimers();
    input.simulate('change', { target: { value: 'anything' } });
    jest.runAllTimers();

    await new Promise(setImmediate);

    expect(wrapper.find(Result).map(r => r.prop('isFocused'))).toEqual([true, false]);

    input.simulate('keydown', { key: 'ArrowDown', preventDefault: () => {}, stopPropagation: () => {} });

    expect(wrapper.find(Result).map(r => r.prop('isFocused'))).toEqual([false, true]);
  });

  it('it sets the last item as to the "focused" one when hitting "up"', async () => {
    findMatches = () => { return [
      { id: 'result-first-id', value: 'result-first-value', route: 'result-first-route' },
      { id: 'result-second-id', value: 'result-second-value', route: 'result-second-route' },
      { id: 'result-third-id', value: 'result-third-value', route: 'result-third-route' },
    ]};

    const wrapper = subject({ findMatches });

    const input = wrapper.find('input');

    jest.useFakeTimers();
    input.simulate('change', { target: { value: 'anything' } });
    jest.runAllTimers();

    await new Promise(setImmediate);

    expect(wrapper.find(Result).map(r => r.prop('isFocused'))).toEqual([true, false, false]);

    input.simulate('keydown', { key: 'ArrowUp', preventDefault: () => {}, stopPropagation: () => {} });

    expect(wrapper.find(Result).map(r => r.prop('isFocused'))).toEqual([false, false, true]);
  });

  it('it selects the currently focused option when pressing "Enter"', async () => {
    findMatches = () => { return [
      { id: 'result-first-id', value: 'result-first-value', route: 'result-first-route' },
      { id: 'result-second-id', value: 'result-second-value', route: 'result-second-route' },
    ]};

    const wrapper = subject({ findMatches });

    const input = wrapper.find('input');

    jest.useFakeTimers();
    input.simulate('change', { target: { value: 'anything' } });
    jest.runAllTimers();

    await new Promise(setImmediate);

    input.simulate('keydown', { key: 'ArrowUp', preventDefault: () => {}, stopPropagation: () => {} });
    input.simulate('keydown', { key: 'Enter', preventDefault: () => {}, stopPropagation: () => {} });

    expect(onSelect).toHaveBeenCalledWith(findMatches()[1]);
  });

  it('selecting a match triggers change event', async () => {
    const expectation = 'result-first-value';

    findMatches = () => { return [
      { id: 'result-first-id', value: expectation, route: 'result-first-route' },
      { id: 'result-second-id', value: 'result-second-value', route: 'result-second-route' },
    ]};

    const wrapper = subjectMount({ findMatches });

    const input = wrapper.find('input');

    jest.useFakeTimers();
    input.simulate('change', { target: { value: 'anything' } });
    jest.runAllTimers();

    await new Promise(setImmediate);

    wrapper.update();

    const option = wrapper.find('[className*="-item"]').filterWhere((n) => n.text() === expectation);
    option.simulate('mouseDown');

    expect(onSelect).toHaveBeenCalledWith(findMatches()[0]);
  });

  it('selecting an option verifies value and closes dropdown', async () => {
    const expectation = 'result-value';

    findMatches = () => { return [{ id: 'result-id', value: expectation, route: 'result-route' }] };
    const wrapper = subjectMount({ findMatches });

    let input = wrapper.find('input');

    jest.useFakeTimers();
    input.simulate('change', { target: { value: expectation } });
    jest.runAllTimers();

    await new Promise(setImmediate);

    wrapper.update();

    const option = wrapper.find('[className*="-item"]').filterWhere((n) => n.text() === expectation);
    option.simulate('mouseDown');

    input = wrapper.find('input');

    expect(input.prop('value')).toEqual(expectation);
    expect(wrapper.find('[className*="__items"]').exists()).toBe(false);
  });

  it('it closes dropdown when focus lost', async () => {
    findMatches = () => { return [{ id: 'result-id', value: 'result-value', route: 'result-route' }] };
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
    findMatches = () => { return [] };
    const wrapper = subject({ findMatches });

    const input = wrapper.find('input');

    jest.useFakeTimers();
    input.simulate('change', { target: { value: 'someSearch' } });
    jest.runAllTimers();

    await new Promise(setImmediate);

    expect(wrapper.text()).toEqual('No results found');
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
      const expectation = { value: 'result-value', route: 'result-route', summary: 'result-summary' };

      const wrapper = subject({ item: expectation });

      Object.values(expectation).forEach(value => {
        expect(wrapper.html().includes(value)).toBe(true);
      })
    });
  })
});

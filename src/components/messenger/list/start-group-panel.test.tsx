import React from 'react';
import { shallow } from 'enzyme';

import { StartGroupPanel, Properties } from './start-group-panel';

jest.mock('../autocomplete-members');
jest.mock('@zero-tech/zui/components');

describe('StartGroupPanel', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      searchUsers: () => {},
      onBack: () => {},
      onContinue: () => {},
      ...props,
    };

    return shallow(<StartGroupPanel {...allProps} />);
  };

  it('forwards search function to Autocomplete', function () {
    const searchUsers = jest.fn();
    const wrapper = subject({ searchUsers });

    expect(wrapper.find('AutocompleteMembers').prop('search')).toBe(searchUsers);
  });

  it('fires onBack when back icon clicked', function () {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    wrapper.find('PanelHeader').simulate('back');

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('fires onContinue when continue is clicked', function () {
    const onContinue = jest.fn();
    const wrapper = subject({ onContinue });

    wrapper.find('AutocompleteMembers').simulate('select', { value: 'id-1' });
    wrapper.find('AutocompleteMembers').simulate('select', { value: 'id-2' });
    wrapper.find('Button').simulate('press');

    expect(onContinue).toHaveBeenCalledWith([
      { value: 'id-1' },
      { value: 'id-2' },
    ]);
  });

  it('enables continue button based on number of users', function () {
    const wrapper = subject({});

    expect(wrapper.find('Button').prop('isDisabled')).toBeTrue();

    wrapper.find('AutocompleteMembers').simulate('select', { value: 'id-1' });
    expect(wrapper.find('Button').prop('isDisabled')).toBeFalse();

    wrapper.find('SelectedUserTag').first().simulate('remove', 'id-1');
    expect(wrapper.find('Button').prop('isDisabled')).toBeTrue();
  });

  it('shows selected member count', function () {
    const wrapper = subject({});

    expect(wrapper.find('.start-group-panel__selected-count').text()).toEqual('0 members selected');

    wrapper.find('AutocompleteMembers').simulate('select', { value: 'id-1' });
    expect(wrapper.find('.start-group-panel__selected-count').text()).toEqual('1 member selected');

    wrapper.find('AutocompleteMembers').simulate('select', { value: 'id-2' });
    expect(wrapper.find('.start-group-panel__selected-count').text()).toEqual('2 members selected');
  });

  it('renders selected members', function () {
    const wrapper = subject({});

    wrapper.find('AutocompleteMembers').simulate('select', { value: 'id-1', label: 'User 1', image: 'url-1' });
    wrapper.find('AutocompleteMembers').simulate('select', { value: 'id-2', label: 'User 2', image: 'url-2' });

    expect(wrapper.find('SelectedUserTag').map(userLabel)).toEqual([
      'User 1',
      'User 2',
    ]);
  });

  it('unselects users when X is clicked', function () {
    const wrapper = subject({});
    wrapper.find('AutocompleteMembers').simulate('select', { value: 'id-1', label: 'User 1', image: 'url-1' });
    wrapper.find('AutocompleteMembers').simulate('select', { value: 'id-2', label: 'User 2', image: 'url-2' });

    wrapper.find('SelectedUserTag').first().simulate('remove', 'id-1');

    expect(wrapper.find('SelectedUserTag').map(userLabel)).toEqual(['User 2']);
  });

  it('renders unique list of selected users', function () {
    const wrapper = subject({});
    wrapper.find('AutocompleteMembers').simulate('select', { value: 'id-1', label: 'User 1', image: 'url-1' });
    // Select the same option
    wrapper.find('AutocompleteMembers').simulate('select', { value: 'id-1', label: 'User 1', image: 'url-1' });

    expect(wrapper.find('SelectedUserTag').map(userLabel)).toEqual(['User 1']);
  });
});

function userLabel(tag) {
  return tag.prop('userOption').label;
}

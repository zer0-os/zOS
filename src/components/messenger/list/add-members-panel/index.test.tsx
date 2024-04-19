import React from 'react';
import { shallow } from 'enzyme';

import { PanelHeader } from '../panel-header';
import { AddMembersPanel, Properties } from '.';
import { SelectedUserTag } from '../selected-user-tag';
import { AutocompleteMembers } from '../../autocomplete-members';
import { Button } from '@zero-tech/zui/components';
import { IconAlertCircle } from '@zero-tech/zui/icons';

describe(AddMembersPanel, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isSubmitting: false,
      error: '',
      searchUsers: () => {},
      onBack: () => {},
      onSubmit: () => {},
      ...props,
    };

    return shallow(<AddMembersPanel {...allProps} />);
  };

  it('forwards search function to Autocomplete', function () {
    const searchUsers = jest.fn();
    const wrapper = subject({ searchUsers });

    expect(wrapper.find(AutocompleteMembers).prop('search')).toBe(searchUsers);
  });

  it('fires onBack when back icon clicked', function () {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    wrapper.find(PanelHeader).simulate('back');

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('fires onSubmit when submit button is clicked', function () {
    const onSubmit = jest.fn();
    const wrapper = subject({ onSubmit });

    wrapper.find(AutocompleteMembers).simulate('select', { value: 'id-1' });
    wrapper.find(AutocompleteMembers).simulate('select', { value: 'id-2' });
    wrapper.find(Button).simulate('press');

    expect(onSubmit).toHaveBeenCalledWith([
      { value: 'id-1' },
      { value: 'id-2' },
    ]);
  });

  it('renders button when members are selected', function () {
    const wrapper = subject({});

    expect(wrapper).not.toHaveElement(Button);

    wrapper.find(AutocompleteMembers).simulate('select', { value: 'id-1' });
    expect(wrapper).toHaveElement(Button);
  });

  it('sets button to loading state if submitting', function () {
    const wrapper = subject({ isSubmitting: true });

    wrapper.find(AutocompleteMembers).simulate('select', { value: 'id-1' });

    expect(wrapper.find(Button).prop('isLoading')).toBeTrue();
  });

  it('shows selected member count', function () {
    const wrapper = subject({});

    wrapper.find(AutocompleteMembers).simulate('select', { value: 'id-1' });
    expect(wrapper.find('.add-members-panel__selected-count').text()).toEqual('1 member selected');

    wrapper.find(AutocompleteMembers).simulate('select', { value: 'id-2' });
    expect(wrapper.find('.add-members-panel__selected-count').text()).toEqual('2 members selected');
  });

  it('renders selected members', function () {
    const wrapper = subject({});

    wrapper.find(AutocompleteMembers).simulate('select', { value: 'id-1', label: 'User 1', image: 'url-1' });
    wrapper.find(AutocompleteMembers).simulate('select', { value: 'id-2', label: 'User 2', image: 'url-2' });

    expect(wrapper.find(SelectedUserTag).map(userLabel)).toEqual([
      'User 1',
      'User 2',
    ]);
  });

  it('unselects users when X is clicked', function () {
    const wrapper = subject({});
    wrapper.find(AutocompleteMembers).simulate('select', { value: 'id-1', label: 'User 1', image: 'url-1' });
    wrapper.find(AutocompleteMembers).simulate('select', { value: 'id-2', label: 'User 2', image: 'url-2' });

    wrapper.find(SelectedUserTag).first().simulate('remove', 'id-1');

    expect(wrapper.find(SelectedUserTag).map(userLabel)).toEqual(['User 2']);
  });

  it('renders unique list of selected users', function () {
    const wrapper = subject({});
    wrapper.find(AutocompleteMembers).simulate('select', { value: 'id-1', label: 'User 1', image: 'url-1' });
    // force select the same option (the same user can't be selected, but just in case)
    wrapper.find(AutocompleteMembers).simulate('select', { value: 'id-1', label: 'User 1', image: 'url-1' });

    expect(wrapper.find(SelectedUserTag).map(userLabel)).toEqual(['User 1']);
  });

  it('displays error message when error prop is present', function () {
    const error = 'Error adding member';
    const wrapper = subject({ error });

    expect(wrapper.find('.add-members-panel__error-message').text()).toEqual(error);
    expect(wrapper.find(IconAlertCircle)).toHaveLength(1);
  });
});

function userLabel(tag) {
  return tag.prop('userOption').label;
}

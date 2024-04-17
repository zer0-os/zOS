import React from 'react';
import { shallow } from 'enzyme';

import CreateConversationPanel, { Properties } from '.';
import { PanelHeader } from '../panel-header';
import { AutocompleteMembers } from '../../autocomplete-members';
import { SelectedUserTag } from '../selected-user-tag';
import { bem } from '../../../../lib/bem';

const c = bem('.create-conversation');

describe(CreateConversationPanel, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      initialSelections: [],
      isSubmitting: false,

      onBack: () => {},
      search: () => {},
      onCreateOneOnOne: () => {},
      onStartGroup: () => {},
      onOpenInviteDialog: () => {},
      ...props,
    };

    return shallow(<CreateConversationPanel {...allProps} />);
  };

  it('forwards search function to Autocomplete', function () {
    const search = jest.fn();
    const wrapper = subject({ search });

    expect(wrapper.find(AutocompleteMembers)).toHaveProp('search', search);
  });

  it('fires onCreateOneOnOne when a single user is selected', function () {
    const onCreateOneOnOne = jest.fn();
    const onStartGroup = jest.fn();
    const wrapper = subject({ onCreateOneOnOne, onStartGroup });

    wrapper.find(AutocompleteMembers).simulate('select', { value: 'user-one' });
    wrapper.find(c('submit-button')).simulate('press');

    expect(onCreateOneOnOne).toHaveBeenCalledWith('user-one');
    expect(onStartGroup).not.toHaveBeenCalled();
  });

  it('fires onStartGroup when multiple users are selected', () => {
    const onCreateOneOnOne = jest.fn();
    const onStartGroup = jest.fn();
    const wrapper = subject({ onStartGroup, onCreateOneOnOne });

    wrapper.find(AutocompleteMembers).simulate('select', { value: 'user-one' });
    wrapper.find(AutocompleteMembers).simulate('select', { value: 'user-two' });
    wrapper.find(c('submit-button')).simulate('press');

    expect(onStartGroup).toHaveBeenCalledWith([{ value: 'user-one' }, { value: 'user-two' }]);
    expect(onCreateOneOnOne).not.toHaveBeenCalled();
  });

  it('fires onBack when back icon clicked', function () {
    const onBack = jest.fn();
    const wrapper = subject({ onBack });

    wrapper.find(PanelHeader).simulate('back');

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('fires onOpenInviteDialog when invite button is clicked', function () {
    const onOpenInviteDialog = jest.fn();
    const wrapper = subject({ onOpenInviteDialog });

    wrapper.find(c('invite-button')).simulate('press');

    expect(onOpenInviteDialog).toHaveBeenCalledOnce();
  });

  it('initializes with provided initial selections', () => {
    const initialUsers = [
      { value: 'user-one', label: 'User One' },
      { value: 'user-two', label: 'User Two' },
    ];

    const wrapper = subject({ initialSelections: initialUsers });

    expect(wrapper.find(SelectedUserTag)).toHaveLength(initialUsers.length);
    expect(wrapper.find(SelectedUserTag).at(0).prop('userOption')).toEqual(initialUsers[0]);
    expect(wrapper.find(SelectedUserTag).at(1).prop('userOption')).toEqual(initialUsers[1]);
  });

  it('redners the submit button if users are selected', () => {
    const wrapper = subject({});

    wrapper.find(AutocompleteMembers).simulate('select', { value: 'user-one' });

    expect(wrapper).toHaveElement(c('submit-button'));
  });

  it('does not render the submit button if no users are selected', () => {
    const wrapper = subject({ initialSelections: [{ value: 'user-one', label: 'UserOne' }] });

    wrapper.find(SelectedUserTag).simulate('remove', 'user-one');

    expect(wrapper).not.toHaveElement(c('submit-button'));
  });

  it('sets isLoading on button when isSubmitting is true', () => {
    const onCreateOneOnOne = jest.fn();
    const wrapper = subject({ isSubmitting: true, onCreateOneOnOne });

    wrapper.find(AutocompleteMembers).simulate('select', { value: 'user-one' });

    expect(wrapper.find(c('submit-button'))).toHaveProp('isLoading', true);
  });

  it('renders selected users if users are selected', () => {
    const wrapper = subject({});

    wrapper.find(AutocompleteMembers).simulate('select', { value: 'user-one' });

    expect(wrapper).toHaveElement(c('selected-users'));
  });

  it('does not render selected users if no users are selected', () => {
    const wrapper = subject({ initialSelections: [{ value: 'user-one', label: 'UserOne' }] });

    wrapper.find(SelectedUserTag).simulate('remove', 'user-one');

    expect(wrapper).not.toHaveElement(c('selected-users'));
  });
});

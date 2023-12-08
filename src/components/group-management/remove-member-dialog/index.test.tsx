import React from 'react';

import { shallow } from 'enzyme';

import { RemoveMemberDialog, Properties } from '.';
import { bem } from '../../../lib/bem';
import { Alert, ModalConfirmation } from '@zero-tech/zui/components';

const c = bem('.remove-member-dialog');

describe(RemoveMemberDialog, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      userName: 'StubUser',
      roomName: 'StubRoom',
      inProgress: false,
      error: '',
      onClose: () => {},
      onRemove: () => {},
      ...props,
    };

    return shallow(<RemoveMemberDialog {...allProps} />);
  };

  it('renders the message with NO room name', function () {
    const wrapper = subject({ userName: 'Johnny Cash', roomName: '' });

    expect(wrapper.find(c('')).text()).toEqual(
      'Are you sure you want to remove Johnny Cash from the group?Johnny Cash will lose access to the conversation and its history.'
    );
  });

  it('renders the message with a room name', function () {
    const wrapper = subject({ userName: 'Johnny Cash', roomName: 'Fun Room' });

    expect(wrapper.find(c('')).text()).toEqual(
      'Are you sure you want to remove Johnny Cash from Fun Room?Johnny Cash will lose access to the conversation and its history.'
    );
  });

  it('publishes close event when cancelled', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find(ModalConfirmation).simulate('cancel');

    expect(onClose).toHaveBeenCalled();
  });

  it('publishes onRemove event when confirmed', () => {
    const onRemove = jest.fn();
    const wrapper = subject({ onRemove });

    wrapper.find(ModalConfirmation).simulate('confirm');

    expect(onRemove).toHaveBeenCalled();
  });

  it('renders loading text when isInProgress with NO room name', () => {
    const wrapper = subject({ inProgress: true, userName: 'Johnny Cash', roomName: '' });

    expect(wrapper.find(c('')).text()).toEqual('Removing Johnny Cash from the group.');
  });

  it('renders loading text when isInProgress with room name', () => {
    const wrapper = subject({ inProgress: true, userName: 'Johnny Cash', roomName: 'Fun Room' });

    expect(wrapper.find(c('')).text()).toEqual('Removing Johnny Cash from Fun Room.');
  });

  it('renders confirmation message when NOT isInProgress', () => {
    const wrapper = subject({ inProgress: false });

    expect(wrapper.find(ModalConfirmation).prop('confirmationLabel')).toEqual('Remove Member');
  });

  it('renders sets inProgress on Modal', () => {
    const wrapper = subject({ inProgress: true });

    expect(wrapper.find(ModalConfirmation).prop('inProgress')).toEqual(true);
  });

  it('renders the error message', () => {
    const wrapper = subject({ error: 'this is an error' });

    expect(wrapper.find(Alert).prop('children')).toEqual('this is an error');
  });
});

import React from 'react';

import { shallow } from 'enzyme';

import { MemberManagementDialog, Properties } from '.';
import { bem } from '../../../lib/bem';
import { Alert, ModalConfirmation } from '@zero-tech/zui/components';

const c = bem('.remove-member-dialog');

const mockConfirmitionDefinition = {
  getProgressMessage: () => 'Removing Johnny Cash from the group.',
  getTitle: () => 'Remove Member',
  getMessage: () => <></>,
};

describe(MemberManagementDialog, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      definition: mockConfirmitionDefinition,
      inProgress: false,
      error: '',
      onClose: () => {},
      onConfirm: () => {},
      ...props,
    };

    return shallow(<MemberManagementDialog {...allProps} />);
  };

  describe('confirmition definition (remove member)', () => {
    it('renders the message', function () {
      const wrapper = subject({
        definition: {
          ...mockConfirmitionDefinition,
          getMessage: () => (
            <>
              Are you sure you want to remove Johnny Cash from Fun Room?
              <br />
              Johnny Cash will lose access to the conversation and its history.
            </>
          ),
        },
      });

      expect(wrapper.find(c('')).text()).toEqual(
        'Are you sure you want to remove Johnny Cash from Fun Room?Johnny Cash will lose access to the conversation and its history.'
      );
    });

    it('renders progress message', () => {
      const wrapper = subject({
        inProgress: true,
        definition: {
          ...mockConfirmitionDefinition,
          getProgressMessage: () => 'Removing Johnny Cash from the group.',
        },
      });

      expect(wrapper.find(c('')).text()).toEqual('Removing Johnny Cash from the group.');
    });

    it('renders title', () => {
      const wrapper = subject({
        definition: {
          ...mockConfirmitionDefinition,
          getTitle: () => 'Remove Member',
        },
      });

      expect(wrapper.find(ModalConfirmation).prop('title')).toEqual('Remove Member');
    });
  });

  it('publishes close event when cancelled', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find(ModalConfirmation).simulate('cancel');

    expect(onClose).toHaveBeenCalled();
  });

  it('publishes onRemove event when confirmed', () => {
    const onConfirm = jest.fn();
    const wrapper = subject({ onConfirm });

    wrapper.find(ModalConfirmation).simulate('confirm');

    expect(onConfirm).toHaveBeenCalled();
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

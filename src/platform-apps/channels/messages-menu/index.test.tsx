import React from 'react';
import { shallow } from 'enzyme';
import { MessageMenu } from '.';

describe('Message Menu', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      className: '',
      onDelete: undefined,
      canEdit: false,
      ...props,
    };

    return shallow(<MessageMenu {...allProps} />);
  };

  it('adds className', () => {
    const onDelete = jest.fn();
    const wrapper = subject({ className: 'message-menu', onDelete, canEdit: true });

    expect(wrapper.hasClass('message-menu')).toBe(true);
  });

  it('it should renders delete button when icon menu is clicked', () => {
    const onDelete = jest.fn();
    const wrapper = subject({ onDelete, canEdit: true });

    expect(wrapper.find('.message__menu-item__icon').exists()).toBe(true);

    wrapper.find('.message__menu-item__icon').simulate('click');

    expect(wrapper.find('.delete-button').exists()).toBe(true);
  });

  it('it should show delete modal when delete is clicked', () => {
    const onDelete = jest.fn();
    const wrapper = subject({ onDelete, canEdit: true });

    wrapper.find('.delete-button').simulate('click');

    expect(wrapper.find('.confirm-dialog__message').exists()).toBe(true);
  });

  it('it should call delete message when confirm button is clicked', () => {
    const onDelete = jest.fn();
    const wrapper = subject({ onDelete, canEdit: true });

    wrapper.find('.delete-button').simulate('click');

    expect(wrapper.find('.confirm-delete__footer-button').exists()).toBe(true);

    wrapper.find('.confirm-delete__footer-button').first().simulate('click');

    expect(onDelete).toHaveBeenCalled();
  });
});

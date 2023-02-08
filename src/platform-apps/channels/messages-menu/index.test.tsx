import React from 'react';
import { shallow } from 'enzyme';
import { MessageMenu } from '.';

describe('Message Menu', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      className: '',
      onDelete: undefined,
      onEdit: undefined,
      onReply: undefined,
      canEdit: false,
      canReply: false,
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

    wrapper.find('IconButton').simulate('click');

    expect(wrapper.find('.delete-item').exists()).toBe(true);
  });

  it('it should show delete modal when delete is clicked', () => {
    const onDelete = jest.fn();
    const wrapper = subject({ onDelete, canEdit: true });

    wrapper.find('.delete-item').simulate('click');

    expect(wrapper.find('.confirm-dialog__message').exists()).toBe(true);
  });

  it('it should call delete message when confirm button is clicked', () => {
    const onDelete = jest.fn();
    const wrapper = subject({ onDelete, canEdit: true });

    wrapper.find('.delete-item').simulate('click');

    expect(wrapper.find('.confirm-delete__footer-button').exists()).toBe(true);

    wrapper.find('.confirm-delete__footer-button').first().simulate('click');

    expect(onDelete).toHaveBeenCalled();
  });

  it('it should renders edit button when icon menu is clicked', () => {
    const onEdit = jest.fn();
    const wrapper = subject({ onEdit, canEdit: true });

    wrapper.find('IconButton').simulate('click');

    expect(wrapper.find('.edit-item').exists()).toBe(true);
  });

  it('it should call edit message when edit button is clicked', () => {
    const onEdit = jest.fn();
    const wrapper = subject({ onEdit, canEdit: true });

    wrapper.find('.edit-item').simulate('click');

    expect(onEdit).toHaveBeenCalled();
  });

  it('it should render reply button', () => {
    const onReply = jest.fn();
    const wrapper = subject({ onReply, canReply: true });

    expect(wrapper.find('.reply-item').exists()).toBe(true);
  });

  it('it should not render reply button if canReply is false', () => {
    const onReply = jest.fn();
    const wrapper = subject({ onReply });

    expect(wrapper.find('.reply-item').exists()).toBe(false);
  });

  it('it should call reply message when reply button is clicked', () => {
    const onReply = jest.fn();
    const wrapper = subject({ onReply, canReply: true });

    wrapper.find('.reply-item').simulate('click');

    expect(onReply).toHaveBeenCalled();
  });
});

import React from 'react';
import { shallow } from 'enzyme';
import { Container as DirectMessageChat, Properties } from './';
import { DIRECT_MESSAGES_TEST } from '../../../store/direct-messages/saga.test';

describe('direct-message-members', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      setActiveDirectMessage: jest.fn(),
      directMessages: DIRECT_MESSAGES_TEST,
      fetchDirectMessages: jest.fn(),
      ...props,
    };

    return shallow(<DirectMessageChat {...allProps} />);
  };

  it('render direct message members', function () {
    const wrapper = subject({});

    expect(wrapper.find('.direct-message-members').exists()).toBe(true);
  });

  it('fetch members', function () {
    const fetchDirectMessages = jest.fn();

    subject({ fetchDirectMessages });

    expect(fetchDirectMessages).toHaveBeenCalledOnce();
  });

  it('render members name', function () {
    const wrapper = subject({});

    const displayChatNames = wrapper.find('.direct-message-members__user-name').map((node) => node.text());

    expect(displayChatNames).toStrictEqual([
      'Charles Diya, Eric',
      'Eric',
    ]);
  });

  it('handle member click', function () {
    const setActiveDirectMessage = jest.fn();

    const wrapper = subject({ setActiveDirectMessage });

    wrapper.find('.direct-message-members__user').first().simulate('click');

    expect(setActiveDirectMessage).toHaveBeenCalledWith('292444273_bd035e84edfbaf11251ffef196de2ab47496439c');
  });

  it('should not render unread messages', function () {
    const wrapper = subject({});

    expect(wrapper.find('.direct-message-members__user-unread-count').exists()).toBe(false);
  });

  it('renders unread messages', function () {
    const [
      firstDirectMessage,
      ...restOfDirectMessages
    ] = DIRECT_MESSAGES_TEST;

    const unreadCount = 10;

    const wrapper = subject({
      directMessages: [
        {
          ...firstDirectMessage,
          unreadCount,
        },
        ...restOfDirectMessages,
      ],
    });

    expect(wrapper.find('.direct-message-members__user-unread-count').text()).toEqual(unreadCount.toString());
  });
});

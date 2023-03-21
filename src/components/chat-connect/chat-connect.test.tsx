import React from 'react';
import { shallow } from 'enzyme';
import { Container as ChatConnect } from './chat-connect';

const connect = jest.fn();
const disconnect = jest.fn();

describe('ChatConnect', () => {
  const chat = {
    connect,
    initChat: jest.fn(),
    disconnect,
  };

  const subject = (props: any = {}) => {
    const allProps = {
      context: { isAuthenticated: false },
      userId: null,
      chatAccessToken: null,
      chat,
      ...props,
    };

    return shallow(<ChatConnect {...allProps} />);
  };

  it('connect with chat when authenticated with user and chatAccessToken', () => {
    const expectation = {
      userId: 'user-id',
      chatAccessToken: 'chat-access-token',
    };

    const wrapper = subject();

    wrapper.setProps({
      context: { isAuthenticated: true },
      ...expectation,
    });

    expect(connect).toHaveBeenCalledWith(expectation.userId, expectation.chatAccessToken);
  });

  it('do not connect with chat when missing chatAccessToken', () => {
    const expectation = {
      userId: 'user-id',
      chatAccessToken: null,
    };

    const wrapper = subject();

    wrapper.setProps({
      context: { isAuthenticated: true },
      ...expectation,
    });

    expect(connect).not.toHaveBeenCalled();
  });

  it('disconnect from chat when not authenticated', () => {
    const wrapper = subject({ context: { isAuthenticated: true } });

    wrapper.setProps({
      context: { isAuthenticated: false },
    });

    expect(disconnect).toHaveBeenCalled();
  });

  describe('mapState', () => {
    test('required chat params when authenticated', () => {
      const expectation = {
        userId: 'user-id',
        chatAccessToken: 'chat-access-token',
      };

      const state = {
        authentication: {
          user: {
            data: { id: expectation.userId },
          },
        },
        chat: { chatAccessToken: { value: expectation.chatAccessToken } },
      };

      const props = ChatConnect.mapState(state as any, { context: { isAuthenticated: true } } as any);

      expect(props).toEqual(expect.objectContaining(expectation));
    });

    test('guard from not authenticated', () => {
      const props = ChatConnect.mapState({} as any, { context: { isAuthenticated: false } } as any);

      expect(props).toEqual({});
    });
  });
});

import React from 'react';
import { shallow } from 'enzyme';
import { FeedView, Message, Properties } from './feed-view';
import { Posts } from '../posts';
import { MessagesFetchState } from '../../../../store/channels';
import { Spinner } from '@zero-tech/zui/components/LoadingIndicator';
import { Waypoint } from 'react-waypoint';

describe('FeedView', () => {
  const POST_MESSAGES_TEST = [
    { id: 'post-one', message: 'First post', createdAt: 1658776625730, isPost: true },
    { id: 'post-two', message: 'Second post', createdAt: 1659018545428, isPost: true },
  ] as any;

  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      currentUserId: 'user-id',
      postMessages: [],
      hasLoadedMessages: true,
      messagesFetchStatus: MessagesFetchState.SUCCESS,
      fetchPosts: jest.fn(),
      onFetchMore: jest.fn(),
      loadAttachmentDetails: jest.fn(),
      transferMeow: jest.fn(),
      userMeowBalance: '0',
      meowPost: jest.fn(),

      ...props,
    };

    return shallow(<FeedView {...allProps} />);
  };

  it('renders posts for each message', () => {
    const wrapper = subject({ postMessages: POST_MESSAGES_TEST });

    const postsComponent = wrapper.find(Posts);
    expect(postsComponent.exists()).toBe(true);
    expect(postsComponent.prop('postMessages')).toEqual(POST_MESSAGES_TEST);
  });

  it('renders a message when there are no posts', () => {
    const wrapper = subject({ postMessages: [] });

    expect(wrapper).toHaveElement(Message);
  });

  it('renders a spinner when messages are loading', () => {
    const wrapper = subject({ hasLoadedMessages: false });

    expect(wrapper).toHaveElement(Spinner);
  });

  it('renders a waypoint if posts are present', () => {
    const onFetchMoreSpy = jest.fn();
    const wrapper = subject({ postMessages: POST_MESSAGES_TEST, onFetchMore: onFetchMoreSpy });

    const waypoint = wrapper.find(Waypoint);
    expect(waypoint.exists()).toBe(true);
    expect(waypoint.prop('onEnter')).toEqual(onFetchMoreSpy);
  });

  it('does not render a waypoint if no posts are present', () => {
    const wrapper = subject({ postMessages: [] });

    expect(wrapper).not.toHaveElement(Waypoint);
  });

  it('renders a spinner when messages have not been loaded yet', () => {
    const wrapper = subject({ postMessages: POST_MESSAGES_TEST, hasLoadedMessages: false });

    expect(wrapper).toHaveElement(Spinner);

    wrapper.setProps({ hasLoadedMessages: true });
    expect(wrapper).not.toHaveElement(Spinner);
  });

  it('renders a spinner when messagesFetchStatus is equal to MORE_IN_PROGRESS', () => {
    const wrapper = subject({
      postMessages: POST_MESSAGES_TEST,
      messagesFetchStatus: MessagesFetchState.MORE_IN_PROGRESS,
    });

    expect(wrapper).toHaveElement(Spinner);

    wrapper.setProps({ messagesFetchStatus: MessagesFetchState.SUCCESS });
    expect(wrapper).not.toHaveElement(Spinner);
  });

  it('renders a message component with children', () => {
    const wrapper = shallow(<Message>Test Message</Message>);

    expect(wrapper.text()).toEqual('Test Message');
  });
});

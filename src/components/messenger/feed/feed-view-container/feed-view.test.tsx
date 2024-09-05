import React from 'react';
import { shallow } from 'enzyme';
import { FeedView, Message, Properties } from './feed-view';
import { Posts } from '../components/posts';
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
      postMessages: [],
      hasLoadedMessages: true,
      messagesFetchStatus: MessagesFetchState.SUCCESS,
      fetchPosts: jest.fn(),
      onFetchMore: jest.fn(),
      loadAttachmentDetails: jest.fn(),

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

  it('renders a waypoint if posts are present and content exceeds viewport height', () => {
    const onFetchMoreSpy = jest.fn();
    const wrapper = subject({ postMessages: POST_MESSAGES_TEST, onFetchMore: onFetchMoreSpy });

    wrapper.setState({ shouldRenderWaypoint: true });

    const waypoint = wrapper.find(Waypoint);
    expect(waypoint.exists()).toBe(true);
    expect(waypoint.prop('onEnter')).toEqual(onFetchMoreSpy);
  });

  it('does not render a waypoint if content does not exceed viewport height', () => {
    const wrapper = subject({ postMessages: POST_MESSAGES_TEST });

    wrapper.setState({ shouldRenderWaypoint: false });

    expect(wrapper.find(Waypoint).exists()).toBe(false);
  });

  it('renders a waypoint if posts are present and content height changes after update', () => {
    const onFetchMoreSpy = jest.fn();
    const wrapper = subject({ postMessages: POST_MESSAGES_TEST, onFetchMore: onFetchMoreSpy });

    wrapper.setState({ shouldRenderWaypoint: true });

    const waypoint = wrapper.find(Waypoint);
    expect(waypoint.exists()).toBe(true);
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

  it('renders a message component with children', () => {
    const wrapper = shallow(<Message>Test Message</Message>);

    expect(wrapper.text()).toEqual('Test Message');
  });

  it('updates shouldRenderWaypoint state based on content height after mount', () => {
    const wrapper = subject({ postMessages: POST_MESSAGES_TEST });

    const instance = wrapper.instance() as FeedView;
    jest.spyOn(instance, 'checkContentHeight');

    instance.componentDidMount();

    expect(instance.checkContentHeight).toHaveBeenCalled();
  });

  it('updates shouldRenderWaypoint state based on content height after update', () => {
    const wrapper = subject({ postMessages: POST_MESSAGES_TEST });

    const instance = wrapper.instance() as FeedView;
    jest.spyOn(instance, 'checkContentHeight');

    wrapper.setProps({
      postMessages: [
        ...POST_MESSAGES_TEST,
        { id: 'post-three', message: 'Third post', createdAt: 1659018545429, isPost: true },
      ],
    });

    expect(instance.checkContentHeight).toHaveBeenCalled();
  });
});

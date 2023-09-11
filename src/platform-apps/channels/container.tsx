import React from 'react';
import { Provider } from 'react-redux';
import { Redirect } from 'react-router-dom';
import getDeepProperty from 'lodash.get';
import { setActiveChannelId } from '../../store/chat';
import { markAllMessagesAsReadInChannel } from '../../store/channels';

import { RootState } from '../../store/reducer';
import { Store } from 'redux';

import { connectContainer } from '../../store/redux-container';

import { fetchChannels, denormalizeChannels } from '../../store/channels-list';
import { Channel } from '../../store/channels';

import { ChannelList } from './channel-list';
import { AppLayout, AppContextPanel, AppContent } from '@zer0-os/zos-component-library';

import './styles.scss';
import { AuthenticationState } from '../../store/authentication/types';
import { ChatViewContainer } from '../../components/chat-view-container/chat-view-container';
import { ScrollbarContainer } from '../../components/scrollbar-container';
import { ZUIProvider } from '@zero-tech/zui/ZUIProvider';

interface PublicProperties {
  store: Store<RootState>;
  provider: any;
  route: any;
  channelId?: string;
  match: { url: string };
}

export interface Properties extends PublicProperties {
  setActiveChannelId: (channelId: string) => void;
  markAllMessagesAsReadInChannel: (payload: { channelId: string }) => void;

  domainId: string;
  channels: Channel[];
  fetchChannels: (domainId: string) => void;
  user: AuthenticationState['user'];
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const channels = denormalizeChannels(state);

    const {
      authentication: { user },
    } = state;

    return {
      user,
      domainId: state.zns.value.rootDomainId,
      channels,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      fetchChannels,
      setActiveChannelId,
      markAllMessagesAsReadInChannel,
    };
  }

  setActiveChannelId() {
    if (this.props.channelId) {
      this.props.setActiveChannelId(this.props.channelId);
      this.props.markAllMessagesAsReadInChannel({ channelId: this.props.channelId });
    }
  }

  componentDidMount() {
    const { domainId } = this.props;

    if (domainId) {
      this.props.fetchChannels(domainId);
      this.setActiveChannelId();
    }
  }

  componentWillUnmount(): void {
    this.props.setActiveChannelId(null);
  }

  componentDidUpdate(prevProps: Properties) {
    const { user, domainId } = this.props;

    if (!domainId) {
      return;
    }

    if (prevProps.user.data !== user.data || prevProps.domainId !== domainId) {
      this.props.fetchChannels(domainId);
    }

    // to handle the case when you switch between apps (eg.Chat -> Trade -> Chat)
    // or when you're switching between channels (channel1 -> channel2)
    if (prevProps.channelId !== this.props.channelId) {
      this.setActiveChannelId();
    }
  }

  // only render the channel(s) which belong to "this" domain/network
  isChannelValid(channelId) {
    return this.props.channels.some((c) => c.id === channelId);
  }

  renderChannelView() {
    if (this.props.channelId && this.isChannelValid(this.props.channelId)) {
      return <ChatViewContainer channelId={this.props.channelId} showSenderAvatar />;
    }

    const defaultChannelId = getDeepProperty(this.props, 'channels[0].id', null);
    if (defaultChannelId) {
      return <Redirect to={`${this.props.match.url}/${defaultChannelId}`} />;
    }

    return null;
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <ZUIProvider>
          <AppLayout className='channels'>
            <AppContextPanel>
              <ScrollbarContainer variant='on-hover'>
                <ChannelList channels={this.props.channels} currentChannelId={this.props.channelId} />
              </ScrollbarContainer>
            </AppContextPanel>
            <AppContent className='channel-app'>{this.renderChannelView()}</AppContent>
          </AppLayout>
        </ZUIProvider>
      </Provider>
    );
  }
}

export const ChannelsContainer = connectContainer<PublicProperties>(Container);

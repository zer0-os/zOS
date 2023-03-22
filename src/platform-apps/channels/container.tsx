import React from 'react';
import { Provider } from 'react-redux';
import { Redirect } from 'react-router-dom';
import getDeepProperty from 'lodash.get';

import { RootState } from '../../store';
import { Store } from 'redux';

import { connectContainer } from '../../store/redux-container';

import {
  fetch as fetchChannels,
  receiveUnreadCount,
  stopSyncChannels,
  denormalizeChannels,
} from '../../store/channels-list';
import { Channel } from '../../store/channels';

import { ChannelList } from './channel-list';
import { AppLayout, AppContextPanel, AppContent } from '@zer0-os/zos-component-library';

import './styles.scss';
import { AuthenticationState } from '../../store/authentication/types';
import { ChatViewContainer } from '../../components/chat-view-container/chat-view-container';
import { withContext as withAuthenticationContext } from '../../components/authentication/context';

interface PublicProperties {
  store: Store<RootState>;
  provider: any;
  route: any;
  channelId?: string;
  match: { url: string };
}

export interface Properties extends PublicProperties {
  domainId: string;
  channels: Channel[];
  fetchChannels: (domainId: string) => void;
  receiveUnreadCount: (domainId: string) => void;
  stopSyncChannels: () => void;
  user: AuthenticationState['user'];
  context: {
    isAuthenticated: boolean;
  };
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
      receiveUnreadCount,
      stopSyncChannels,
    };
  }

  componentDidMount() {
    const {
      context: { isAuthenticated },
      domainId,
    } = this.props;

    this.props.fetchChannels(domainId);

    if (isAuthenticated) {
      this.props.receiveUnreadCount(domainId);
    }
  }

  componentDidUpdate(prevProps: Properties) {
    const {
      context: { isAuthenticated },
      user,
      domainId,
    } = this.props;

    if (isAuthenticated) {
      if (prevProps.user.data !== user.data) {
        this.props.fetchChannels(domainId);
        this.props.receiveUnreadCount(domainId);
      }
    }
  }

  componentWillUnmount() {
    this.props.stopSyncChannels();
  }

  renderChannelView() {
    if (this.props.channelId) {
      return <ChatViewContainer channelId={this.props.channelId} />;
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
        <AppLayout className='channels'>
          <AppContextPanel>
            <ChannelList
              channels={this.props.channels}
              currentChannelId={this.props.channelId}
            />
          </AppContextPanel>
          <AppContent className='channel-app'>{this.renderChannelView()}</AppContent>
        </AppLayout>
      </Provider>
    );
  }
}

export const ChannelsContainer = withAuthenticationContext<PublicProperties>(connectContainer<{}>(Container));

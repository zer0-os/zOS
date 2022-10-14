import React from 'react';
import { Provider } from 'react-redux';
import { Redirect } from 'react-router-dom';
import getDeepProperty from 'lodash.get';

import { RootState } from '../../store';
import { Store } from 'redux';

import { connectContainer } from '../../store/redux-container';

import { fetch as fetchChannels, receiveUnreadCount, stopSyncChannels, denormalize } from '../../store/channels-list';
import { Channel } from '../../store/channels';

import { ChannelList } from './channel-list';
import { ChannelViewContainer } from './channel-view-container';
import { AppLayout, AppContextPanel, AppContent } from '@zer0-os/zos-component-library';
import { Provider as AuthenticationContextProvider } from '../../components/authentication/context';

import './styles.scss';

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
  isAuthenticated: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const channels = denormalize(state.channelsList.value, state);

    return {
      domainId: state.zns.value.rootDomainId,
      channels,
      isAuthenticated: !!state.authentication.user?.data,
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
    this.props.fetchChannels(this.props.domainId);
    this.props.receiveUnreadCount(this.props.domainId);
  }

  componentWillUnmount() {
    this.props.stopSyncChannels();
  }

  get authenticationContext() {
    const { isAuthenticated } = this.props;
    return {
      isAuthenticated,
    };
  }

  renderChannelView() {
    if (this.props.channelId) {
      return <ChannelViewContainer channelId={this.props.channelId} />;
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
        <AuthenticationContextProvider value={this.authenticationContext}>
          <AppLayout className='channels'>
            <AppContextPanel>
              <ChannelList
                channels={this.props.channels}
                currentChannelId={this.props.channelId}
              />
            </AppContextPanel>
            <AppContent>{this.renderChannelView()}</AppContent>
          </AppLayout>
        </AuthenticationContextProvider>
      </Provider>
    );
  }
}

export const ChannelsContainer = connectContainer<PublicProperties>(Container);

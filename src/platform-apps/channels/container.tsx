import React from 'react';
import { Provider } from 'react-redux';
import { RootState } from '../../store';
import { Store } from 'redux';

import { connectContainer } from '../../store/redux-container';

import { fetch as fetchChannels, denormalize } from '../../store/channels-list';
import { Channel } from '../../store/channels';

import { Channels } from '.';

import './styles.scss';

interface PublicProperties {
  store: Store<RootState>;
  provider: any;
  route: any;
}

export interface Properties extends PublicProperties {
  domainId: string;
  channels: Channel[];
  fetchChannels: (domainId: string) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const channels = denormalize(state.channelsList.value, state);

    return {
      domainId: state.zns.value.rootDomainId,
      channels,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      fetchChannels,
    };
  }

  componentDidMount() {
    this.props.fetchChannels(this.props.domainId);
  }

  render() {
    return (
      <Provider store={this.props.store}>
        <Channels />
      </Provider>
    );
  }
}

export const ChannelsContainer = connectContainer<PublicProperties>(Container);

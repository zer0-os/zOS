import React from 'react';
import { Provider } from 'react-redux';
import { RootState } from '../../store';
import { Store } from 'redux';

import { connectContainer } from '../../store/redux-container';

import { connect } from '../../store/channels';

import { Channels } from '.';

import './styles.scss';

interface PublicProperties {
  store: Store<RootState>;
  provider: any;
  route: any;
}

export interface Properties extends PublicProperties {
  channelsAccount: string;
  connect: (account: string) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const channelsAccount = state.channels.value.account;

    return { channelsAccount };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      connect,
    };
  }

  componentDidMount() {
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

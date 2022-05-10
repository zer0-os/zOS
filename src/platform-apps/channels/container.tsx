import React from 'react';
import { Provider } from 'react-redux';
import { RootState } from '../../store';
import { Store } from 'redux';

import { connectContainer } from '../../store/redux-container';

import { Connect } from './connect';
import { PlatformUser } from '../../app-sandbox/container';

import './styles.scss';
import {Channels} from '.';

interface PublicProperties {
  store: Store<RootState>;
  provider: any;
  route: any;
  user: PlatformUser;
}

export interface Properties extends PublicProperties {
  channelsAccount: string;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const channelsAccount = state.channels.value.account;

    return { channelsAccount };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { };
  }

  get isConnected() {
    const userAccount = this.props.user.account;

    return userAccount && ( this.props.channelsAccount === userAccount );
  }

  renderChildren() {
    if (!this.isConnected) {
      return <Connect account={this.props.user.account} />;
    }

    return <Channels />;
  }

  render() {
    return (
      <Provider store={this.props.store}>
        {this.renderChildren()}
      </Provider>
    );
  }
}

export const ChannelsContainer = connectContainer<PublicProperties>(Container);

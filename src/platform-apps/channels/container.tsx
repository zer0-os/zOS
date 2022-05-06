import React from 'react';

import { Connect } from './connect';
import { PlatformUser } from '../../app-sandbox/container';

import './styles.scss';

export interface Properties {
  provider: any;
  route: any;
  user: PlatformUser;
}

export class ChannelsContainer extends React.Component<Properties> {
  render() {
    return <Connect account={this.props.user.account} />;
  }
}

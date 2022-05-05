import React from 'react';

import { Channels } from '.';

export interface Properties {
  provider: any;
  route: any; // XXX - switch this back to string
}

export class ChannelsContainer extends React.Component<Properties> {
  render() {
    return <Channels />;
  }
}

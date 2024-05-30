import * as React from 'react';

import { OverviewPanel } from './overview-panel';
import { User } from '../../../store/channels';

export interface Properties {
  readBy: User[];
  sentTo: User[];

  closeMessageInfo: () => void;
}

export class MessageInfo extends React.Component<Properties> {
  render() {
    return (
      <OverviewPanel
        readBy={this.props.readBy}
        sentTo={this.props.sentTo}
        closeMessageInfo={this.props.closeMessageInfo}
      />
    );
  }
}

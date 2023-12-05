import * as React from 'react';
import { PanelHeader } from '../panel-header';

export interface Properties {
  onBack: () => void;
}

export class EditConversationPanel extends React.Component<Properties> {
  render() {
    return (
      <>
        <PanelHeader title={'Edit Group'} onBack={this.props.onBack} />
      </>
    );
  }
}

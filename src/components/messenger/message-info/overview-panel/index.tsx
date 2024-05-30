import * as React from 'react';

import { bemClassName } from '../../../../lib/bem';
import { PanelHeader } from '../../list/panel-header';
import { CitizenListItem } from '../../../citizen-list-item';
import { ScrollbarContainer } from '../../../scrollbar-container';
import { User } from '../../../../store/channels';

import './styles.scss';

const cn = bemClassName('message-info-overview-panel');

export interface Properties {
  readBy: User[];
  sentTo: User[];

  closeMessageInfo: () => void;
}

export class OverviewPanel extends React.Component<Properties> {
  close = () => {
    this.props.closeMessageInfo();
  };

  renderMembers = () => {
    const { readBy, sentTo } = this.props;

    return (
      <ScrollbarContainer>
        {readBy.length > 0 && (
          <div {...cn('section')}>
            <div {...cn('section-title')}>Read By</div>

            {readBy.map((u) => (
              <CitizenListItem key={u.userId} user={u}></CitizenListItem>
            ))}
          </div>
        )}

        {sentTo.length > 0 && (
          <div {...cn('section')}>
            <div {...cn('section-title')}>Sent To</div>

            {sentTo.map((u) => (
              <CitizenListItem key={u.userId} user={u}></CitizenListItem>
            ))}
          </div>
        )}
      </ScrollbarContainer>
    );
  };

  render() {
    return (
      <div {...cn()}>
        <div {...cn('header-container')}>
          <PanelHeader title={'Message Info'} onBack={this.close} />
        </div>

        <div {...cn('body')}>{this.renderMembers()}</div>
      </div>
    );
  }
}

import * as React from 'react';

import { bemClassName } from '../../../../lib/bem';
import { PanelHeader } from '../../list/panel-header';
import { CitizenListItem } from '../../../citizen-list-item';
import { ScrollbarContainer } from '../../../scrollbar-container';
import { User } from '../../../../store/channels';
import { ContentHighlighter } from '../../../content-highlighter';

import './styles.scss';
import moment from 'moment';

const cn = bemClassName('message-info-overview-panel');

export interface Properties {
  readBy: User[];
  sentTo: User[];
  sentBy: User;
  message: string;
  messageCreatedAt: string;

  closeMessageInfo: () => void;
}

export class OverviewPanel extends React.Component<Properties> {
  close = () => {
    this.props.closeMessageInfo();
  };

  renderTime(): React.ReactElement {
    const messageTime = moment(this.props.messageCreatedAt).format('ddd, MMM DD [at] h:mm A');
    return <div {...cn('message-timestamp')}>{messageTime}</div>;
  }

  renderMessage = () => {
    return (
      <div {...cn('message-container')}>
        {this.props.message && (
          <div {...cn('message-content-container')}>
            <div {...cn('message-content')}>
              <ContentHighlighter message={this.props.message} />
            </div>
          </div>
        )}
        {this.renderTime()}
      </div>
    );
  };

  renderMembers = () => {
    const { readBy, sentTo, sentBy } = this.props;

    return (
      <div>
        {sentBy && (
          <div {...cn('section')}>
            <div {...cn('section-title')}>From</div>

            <CitizenListItem key={sentBy.userId} user={sentBy}></CitizenListItem>
          </div>
        )}
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
      </div>
    );
  };

  render() {
    return (
      <div {...cn()}>
        <ScrollbarContainer>
          <div {...cn('header-container')}>
            <PanelHeader title={'Message Info'} onBack={this.close} />
          </div>

          <div {...cn('body')}>
            {this.renderMessage()}
            {this.renderMembers()}
          </div>
        </ScrollbarContainer>
      </div>
    );
  }
}

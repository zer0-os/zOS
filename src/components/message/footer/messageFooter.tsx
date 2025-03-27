import { bemClassName } from '../../../lib/bem';
import { MessageSendStatus } from '../../../store/messages';
import { IconAlertCircle } from '@zero-tech/zui/icons';
import moment from 'moment';

interface MessageFooterProps {
  isEditing: boolean;
  sendStatus: MessageSendStatus;
  updatedAt: number;
  createdAt: number;
  showTimestamp: boolean;
}

const cn = bemClassName('message');

export const MessageFooter = ({ isEditing, sendStatus, updatedAt, createdAt, showTimestamp }: MessageFooterProps) => {
  if (isEditing) {
    return null;
  }

  const isSendStatusFailed = sendStatus === MessageSendStatus.FAILED;
  const footerElements = [];

  if (!!updatedAt && !isSendStatusFailed) {
    footerElements.push(<span key='edited'>(Edited)</span>);
  }
  if (!isSendStatusFailed && showTimestamp) {
    footerElements.push(
      <div key='time' {...cn('time')}>
        {moment(createdAt).format('h:mm A')}
      </div>
    );
  }
  if (isSendStatusFailed) {
    footerElements.push(
      <div key='failure' {...cn('failure-message')}>
        Failed to send <IconAlertCircle size={16} />
      </div>
    );
  }

  if (footerElements.length === 0) {
    return null;
  }

  return <div {...cn('footer')}>{footerElements}</div>;
};

import { bemClassName } from '../../../lib/bem';
import {
  MessageMenu as MessageMenuComponent,
  Properties as MessageMenuComponentProps,
} from '../../../platform-apps/channels/messages-menu';
import { MediaType, Media, MessageSendStatus } from '../../../store/messages';

const cn = bemClassName('message');

export interface MessageMenuProps
  extends Pick<
    MessageMenuComponentProps,
    | 'onDelete'
    | 'onEdit'
    | 'onReply'
    | 'onInfo'
    | 'onDownload'
    | 'onCopy'
    | 'onOpenChange'
    | 'onCloseMenu'
    | 'onReportUser'
  > {
  isOwner: boolean;
  message: string;
  sendStatus: MessageSendStatus;
  media: Media;
  isMenuOpen?: boolean;
  isMenuFlying?: boolean;
  isHidden?: boolean;
}

export const MessageMenu = ({
  isOwner,
  message,
  sendStatus,
  media,
  onDelete,
  onEdit,
  onReply,
  onInfo,
  onDownload,
  onCopy,
  onOpenChange,
  onCloseMenu,
  onReportUser,
  isMenuOpen = false,
  isMenuFlying = false,
  isHidden = false,
}: MessageMenuProps) => {
  const canEditMessage =
    isOwner &&
    message &&
    !isHidden &&
    sendStatus !== MessageSendStatus.IN_PROGRESS &&
    sendStatus !== MessageSendStatus.FAILED;

  const canDeleteMessage = isOwner && sendStatus !== MessageSendStatus.IN_PROGRESS;

  const canReportUser = !isOwner && sendStatus !== MessageSendStatus.IN_PROGRESS;

  const canReply =
    sendStatus !== MessageSendStatus.IN_PROGRESS && sendStatus !== MessageSendStatus.FAILED && !isGiphyMessage(media);

  const canViewInfo = sendStatus !== MessageSendStatus.IN_PROGRESS && sendStatus !== MessageSendStatus.FAILED;

  const canDownload = media?.type === MediaType.Image && media?.mimetype !== 'image/gif';

  const canCopy = media?.type === MediaType.Image && media?.mimetype !== 'image/gif';

  return (
    <MessageMenuComponent
      {...cn('menu-item')}
      canEdit={canEditMessage}
      canDelete={canDeleteMessage}
      canReply={canReply}
      canReportUser={canReportUser}
      canViewInfo={canViewInfo}
      canDownload={canDownload}
      canCopy={canCopy}
      onDelete={onDelete}
      onEdit={onEdit}
      onReply={onReply}
      onInfo={onInfo}
      onDownload={onDownload}
      onCopy={onCopy}
      onOpenChange={onOpenChange}
      onCloseMenu={onCloseMenu}
      onReportUser={onReportUser}
      isMenuOpen={isMenuOpen}
      isMenuFlying={isMenuFlying}
    />
  );
};

const isGiphyMessage = (media: Media) => {
  return media?.type === MediaType.Image && media?.mimetype === 'image/gif';
};

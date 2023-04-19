import { provider } from '../../lib/cloudinary/provider';
import { Message } from '../../store/messages';
import { mapNotification as mapNotificationUtils } from '../../components/notification/utils';

const DEFAULT_HEADING = 'Chat message received';

export const send = (options: { body; heading; tag }) => {
  const { body, heading, tag } = options;

  new Notification(heading, {
    tag: tag,
    body,
    icon: provider.getSource({ src: 'v1681525214/zero-logo-round.png', local: false, options: {} }),
  });
};

export function mapMessage(message: Message) {
  return { heading: DEFAULT_HEADING, body: 'You have received a message', tag: message.id };
}

export function mapNotification(notification: Notification) {
  // XXX verify with UX team that we want to display the user's name in a mention and reply notification
  const { body, id } = mapNotificationUtils(notification);

  return { heading: DEFAULT_HEADING, body, tag: id };
}

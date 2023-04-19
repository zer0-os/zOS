import { provider } from '../../lib/cloudinary/provider';
import { Message } from '../../store/messages';

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

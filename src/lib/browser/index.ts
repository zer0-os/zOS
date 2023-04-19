import { provider } from '../../lib/cloudinary/provider';

export const send = (options: { body; tag; heading? }) => {
  const { body, heading, tag } = options;

  new Notification(heading || 'zOS', {
    tag: tag.toString(),
    body,
    icon: provider.getSource({ src: 'v1681525214/zero-logo-round.png', local: false, options: {} }),
  });
};

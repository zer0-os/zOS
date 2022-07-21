import { config } from '../../config';

export async function fetchChannels(_id: string) {
  const data = await fetch(`${config.ZERO_API_URL}/api/networks/${_id}/chatChannels/public`);
  const channels = await data.json();
  return channels.map((channel, index) => ({
    id: `channel-id-${index}`,
    ...channel,
  }));
}

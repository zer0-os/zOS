import { config } from '../../config';

export async function fetchChannels(_id: string) {
  const channels = await fetch(`${config.ZERO_API_URL}/api/networks/${_id}/chatChannels/public`);
  return await channels.json();
}

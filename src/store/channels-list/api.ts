import { config } from '../../config';

export async function fetchChannels(id: string) {
  const channels = await fetch(`${config.ZERO_API_URL}/api/networks/${id}/chatChannels/public`);
  return await channels.json();
}

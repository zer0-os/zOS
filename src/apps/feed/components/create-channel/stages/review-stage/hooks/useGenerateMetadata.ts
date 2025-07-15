import { config } from '../../../../../../../config';

export async function generateMetadata(zna: string, isWorld: boolean): Promise<string> {
  const metadataUrl = `${config.znsMetadataApiUrl}/${isWorld ? 'worlds' : 'subdomains'}/${zna}/generate`;

  const response = await fetch(metadataUrl);
  const metadata = await response.json();

  if (!metadata?.external_metadata_id) {
    throw new Error('Failed to generate metadata');
  }

  return metadata.external_metadata_id;
}

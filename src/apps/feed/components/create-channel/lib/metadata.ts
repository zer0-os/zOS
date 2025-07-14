export async function generateMetadata(zna: string, isWorld: boolean): Promise<string> {
  const metadataUrl = `https://zns-metadata-service-dev-b5318feb0abe.herokuapp.com/${
    isWorld ? 'worlds' : 'subdomains'
  }/${zna}/generate`;

  const response = await fetch(metadataUrl);
  const metadata = await response.json();

  if (!metadata?.external_metadata_id) {
    throw new Error('Failed to generate metadata');
  }

  return metadata.external_metadata_id;
}

const GRAPH_ENDPOINT =
  'https://gateway-arbitrum.network.thegraph.com/api/8dc80943117f7ee08a9a28ad5036cbab/subgraphs/id/78WsHdZFtkPrZjT3nYvd2KvFZ6w8mbZXsJexsBEXM2uV';

export async function getParentDomainHash(parentZna: string): Promise<string> {
  const query = `
    query DomainByZna($zna: String!) {
      domains(where: { zna: $zna }) {
        id
      }
    }
  `;

  const response = await fetch(GRAPH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { zna: parentZna } }),
  });

  const data = await response.json();
  const parentHash = data?.data?.domains?.[0]?.id;

  if (!parentHash) {
    throw new Error(`Failed to resolve parent domain: ${parentZna}`);
  }

  return parentHash;
}

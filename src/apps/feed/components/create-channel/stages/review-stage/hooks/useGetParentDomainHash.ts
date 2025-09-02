const GRAPH_ENDPOINT = 'https://zchain-subgraph.zero.tech/zapp-zns/subgraph/zchain';

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

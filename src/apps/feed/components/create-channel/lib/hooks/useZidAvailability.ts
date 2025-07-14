import { useQuery } from '@tanstack/react-query';

const GRAPH_ENDPOINT =
  'https://gateway-arbitrum.network.thegraph.com/api/8dc80943117f7ee08a9a28ad5036cbab/subgraphs/id/78WsHdZFtkPrZjT3nYvd2KvFZ6w8mbZXsJexsBEXM2uV';

const EXACT_ZID_QUERY = `
  query DomainByZna($zna: String!) {
    domains(where: { zna: $zna }) {
      zna
    }
  }
`;

export function useZidAvailability(debouncedZid: string) {
  const isValid =
    !!debouncedZid && debouncedZid.length > 0 && /^[a-z0-9-]+$/.test(debouncedZid) && !debouncedZid.includes('.');

  return useQuery({
    queryKey: ['zid-availability', debouncedZid],
    enabled: isValid,
    queryFn: async () => {
      const res = await fetch(GRAPH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: EXACT_ZID_QUERY,
          variables: { zna: debouncedZid },
        }),
      });
      const data = await res.json();
      if (data.errors) throw new Error('Error checking ZID availability');
      const isTaken = data.data.domains && data.data.domains.length > 0;
      return !isTaken;
    },
    staleTime: 0,
  });
}

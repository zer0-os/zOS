import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

const GRAPH_ENDPOINT =
  'https://gateway-arbitrum.network.thegraph.com/api/8dc80943117f7ee08a9a28ad5036cbab/subgraphs/id/78WsHdZFtkPrZjT3nYvd2KvFZ6w8mbZXsJexsBEXM2uV';

const QUERY = `
  query FuzzySearchByZna($zna: String) {
    domains(where: {zna_contains: $zna}) {
      zna
    }
  }
`;

export function useZidAvailability(zid: string, debounceMs = 400) {
  const [debouncedZid, setDebouncedZid] = useState(zid);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedZid(zid), debounceMs);
    return () => clearTimeout(handler);
  }, [zid, debounceMs]);

  return useQuery({
    queryKey: ['zid-availability', debouncedZid],
    enabled: !!debouncedZid,
    queryFn: async () => {
      const res = await fetch(GRAPH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: QUERY,
          variables: { zna: debouncedZid },
        }),
      });
      const data = await res.json();
      if (data.errors) throw new Error('Error searching ZID');
      // If any domains are returned, the ZID is taken (or similar exists)
      return !data.data.domains || data.data.domains.length === 0;
    },
    staleTime: 0,
  });
}

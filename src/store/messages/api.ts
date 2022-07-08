export const api = {
  async fetch(_id: string) {
    return [
      'stuff',
      'tacos',
      'cats',
      'work',
    ].map((name, index) => ({
      id: `message-id-${index}`,
      name,
    }));
  },
};

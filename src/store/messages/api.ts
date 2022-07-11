export const api = {
  async fetch(_id: string) {
    return [
      'stuff',
      'tacos',
      'cats',
      'work',
    ].map((message, index) => ({
      id: `message-id-${index}`,
      message,
    }));
  },
};

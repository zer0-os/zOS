export const api = {
  async fetch(_id: string) {
    return [
      'this is a message all about stuff',
      'this is a message all about tacos',
      'this is a message all about cats',
      'this is a message all about work',
    ].map((message, index) => ({
      id: `message-id-${index}`,
      message,
    }));
  },
};

export const api = {
  async fetch(id: string) {
    return [
      `this is a message in channel #${id} all about stuff`,
      `this is a message in channel #${id} all about tacos`,
      `this is a message in channel #${id} all about cats`,
      `this is a message in channel #${id} all about work`,
    ].map((message, index) => ({
      id: `message-id-${index}`,
      message,
    }));
  },
};

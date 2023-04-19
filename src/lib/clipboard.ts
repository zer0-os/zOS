export const clipboard = {
  async write(text: string) {
    return navigator.clipboard.writeText(text);
  },
};

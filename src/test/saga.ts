export function stubResponse(matcher, response) {
  return [
    matcher,
    response,
  ] as any;
}

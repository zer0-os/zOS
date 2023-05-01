export function inputEvent(attrs = {}) {
  return {
    preventDefault: () => {},
    stopPropagation: () => {},
    ...attrs,
  };
}

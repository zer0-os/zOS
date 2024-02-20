import { Button } from '@zero-tech/zui/components';

export function inputEvent(attrs = {}) {
  return {
    preventDefault: () => {},
    stopPropagation: () => {},
    ...attrs,
  };
}

export function buttonLabelled(wrapper, label) {
  return wrapper.findWhere((node) => node.type() === Button && node.children().text() === label);
}

export async function releaseThread() {
  await new Promise(jest.requireActual('timers').setImmediate);
}

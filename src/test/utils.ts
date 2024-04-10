import { Button } from '@zero-tech/zui/components/Button';

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

export function pressButton(wrapper, label: string) {
  buttonLabelled(wrapper, label).simulate('press');
}

export async function releaseThread() {
  await new Promise(jest.requireActual('timers').setImmediate);
}

export function selectDropdownItem(wrapper, selector, itemId: string) {
  const dropdownMenu = wrapper.find(selector);
  const menuItem = dropdownMenu.prop('items').find((item) => item.id === itemId);
  menuItem.onSelect();
}

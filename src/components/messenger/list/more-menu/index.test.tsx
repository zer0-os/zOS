import React from 'react';
import { shallow } from 'enzyme';
import { Properties, MoreMenu } from '.';
import { DropdownMenu } from '@zero-tech/zui/components';

describe(MoreMenu, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      isFavorite: false,
      onFavorite: () => {},
      ...props,
    };

    return shallow(<MoreMenu {...allProps} />);
  };

  describe('Favorite', () => {
    it('calls onFavorite when the favorite menu item is selected', function () {
      const onFavorite = jest.fn();
      const wrapper = subject({ onFavorite });
      selectItem(wrapper, 'favorite');

      expect(onFavorite).toHaveBeenCalled();
    });
  });
});

function selectItem(wrapper, id) {
  menuItem(wrapper, id).onSelect();
}

function menuItem(menu, id) {
  const dropdownMenu = menu.find(DropdownMenu);
  return dropdownMenu.prop('items').find((i) => i.id === id);
}

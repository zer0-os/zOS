import React from 'react';
import { shallow } from 'enzyme';
import { Properties, MoreMenu } from '.';
import { DropdownMenu } from '@zero-tech/zui/components';
import { DefaultRoomLabels } from '../../../../../store/channels';

describe(MoreMenu, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      labels: [],
      isOpen: false,
      onAddLabel: () => {},
      onRemoveLabel: () => {},
      onClose: () => {},
      ...props,
    };

    return shallow(<MoreMenu {...allProps} />);
  };

  it('fires onAddLabel event', function () {
    const onAddLabel = jest.fn();

    selectItem(subject({ onAddLabel, labels: [] }), 'favorite');

    expect(onAddLabel).toHaveBeenCalledWith(DefaultRoomLabels.FAVORITE);
  });

  it('fires onRemoveLabel event', function () {
    const onRemoveLabel = jest.fn();

    selectItem(subject({ onRemoveLabel, labels: [DefaultRoomLabels.FAVORITE] }), 'unfavorite');

    expect(onRemoveLabel).toHaveBeenCalledWith(DefaultRoomLabels.FAVORITE);
  });

  it('should display "Unfavorite" label when room has favorite label', () => {
    const wrapper = subject({ labels: [DefaultRoomLabels.FAVORITE] });

    const favoriteItem = menuItem(wrapper, 'unfavorite');

    expectLabelToContainText(favoriteItem, 'Unfavorite');
  });

  it('should display "Favorite" label when room does NOT have favorite label', () => {
    const wrapper = subject({ labels: [] });

    const favoriteItem = menuItem(wrapper, 'favorite');

    expectLabelToContainText(favoriteItem, 'Favorite');
  });
});

function selectItem(wrapper, id) {
  menuItem(wrapper, id).onSelect();
}

function menuItem(menu, id) {
  const dropdownMenu = menu.find(DropdownMenu);
  return dropdownMenu.prop('items').find((i) => i.id === id);
}

function expectLabelToContainText(item, expectedText) {
  const label = shallow(item.label);
  expect(label.text()).toContain(expectedText);
}

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

  it('should display "Add to Work" label when room does NOT have work label', () => {
    const wrapper = subject({ labels: [] });

    const workItem = menuItem(wrapper, 'add-m.work');

    expectLabelToContainText(workItem, 'Add to Work');
  });

  it('should display "Remove from Work" label when room has work label', () => {
    const wrapper = subject({ labels: [DefaultRoomLabels.WORK] });

    const workItem = menuItem(wrapper, 'remove-m.work');

    expectLabelToContainText(workItem, 'Remove from Work');
  });

  it('should display "Add to Family" label when room does NOT have family label', () => {
    const wrapper = subject({ labels: [] });

    const workItem = menuItem(wrapper, 'add-m.family');

    expectLabelToContainText(workItem, 'Add to Family');
  });

  it('should display "Remove from Family" label when room has family label', () => {
    const wrapper = subject({ labels: [DefaultRoomLabels.FAMILY] });

    const workItem = menuItem(wrapper, 'remove-m.family');

    expectLabelToContainText(workItem, 'Remove from Family');
  });

  it('should display "Add to Social" label when room does NOT have social label', () => {
    const wrapper = subject({ labels: [] });

    const workItem = menuItem(wrapper, 'add-m.social');

    expectLabelToContainText(workItem, 'Add to Social');
  });

  it('should display "Remove from Social" label when room has family label', () => {
    const wrapper = subject({ labels: [DefaultRoomLabels.SOCIAL] });

    const workItem = menuItem(wrapper, 'remove-m.social');

    expectLabelToContainText(workItem, 'Remove from Social');
  });

  it('should display "Archive chat" if conversation is not archived', function () {
    const wrapper = subject({ labels: [] });

    const workItem = menuItem(wrapper, 'add-m.archived');

    expectLabelToContainText(workItem, 'Archive chat');
  });

  it('should only show "Unarchive chat" in more menu if conversation is archived', function () {
    const wrapper = subject({ labels: [DefaultRoomLabels.ARCHIVED] });

    const workItem = menuItem(wrapper, 'unarchive');

    expectLabelToContainText(workItem, 'Unarchive chat');
    expect(wrapper.find(DropdownMenu).prop('items').length).toBe(1);
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

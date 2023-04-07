import React from 'react';

import { shallow } from 'enzyme';

import { GroupDetailsPanel, Properties } from './group-details-panel';
import { SelectedUserTag } from './selected-user-tag';

describe('GroupDetailsPanel', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      users: [],
      onBack: () => null,
      onCreate: () => null,
      ...props,
    };

    return shallow(<GroupDetailsPanel {...allProps} />);
  };

  it('fires onBack when back icon clicked', function () {
    const onBack = jest.fn();

    const wrapper = subject({ onBack });

    wrapper.find('PanelHeader').simulate('back');

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('shows selected member count', function () {
    let wrapper = subject({ users: [] });

    expect(wrapper.find('.group-details-panel__selected-count').text()).toEqual('0 members selected');

    wrapper = subject({ users: [stubUser()] });
    expect(wrapper.find('.group-details-panel__selected-count').text()).toEqual('1 member selected');

    wrapper = subject({
      users: [
        stubUser(),
        stubUser(),
      ],
    });
    expect(wrapper.find('.group-details-panel__selected-count').text()).toEqual('2 members selected');
  });

  it('shows selected users', function () {
    const wrapper = subject({
      users: [
        stubUser({ value: 'user-1' }),
        stubUser({ value: 'user-2' }),
      ],
    });

    expect(wrapper.find(SelectedUserTag).length).toEqual(2);
    expect(wrapper.find(SelectedUserTag).at(0).prop('userOption').value).toEqual('user-1');
    expect(wrapper.find(SelectedUserTag).at(1).prop('userOption').value).toEqual('user-2');
  });

  it('fires onCreate when create group is clicked', function () {
    const onCreate = jest.fn();
    const users = [
      stubUser({ value: 'u-1' }),
      stubUser({ value: 'u-2' }),
    ];
    const wrapper = subject({ onCreate, users });

    wrapper.find('Button').simulate('press');

    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ users: users }));
  });

  it('includes group name onCreate', function () {
    const onCreate = jest.fn();
    const wrapper = subject({ onCreate });

    wrapper.find('Input').simulate('change', 'group name');
    wrapper.find('Button').simulate('press');

    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'group name' }));
  });

  it('includes cover photo onCreate', function () {
    const image = { some: 'image' };
    const onCreate = jest.fn();
    const wrapper = subject({ onCreate });

    wrapper.find('ImageUpload').simulate('change', image);
    wrapper.find('Button').simulate('press');

    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ image }));
  });
});

function stubUser(props = {}): any {
  return { value: 'id-1', label: 'User 1', image: 'url-1', ...props };
}

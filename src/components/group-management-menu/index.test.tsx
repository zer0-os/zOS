import React from 'react';
import { shallow } from 'enzyme';
import { Properties, GroupManagementMenu } from '.';
import { DropdownMenu } from '@zero-tech/zui/components';

describe(GroupManagementMenu, () => {
  const subject = () => {
    const allProps: Properties = {};

    return shallow(<GroupManagementMenu {...allProps} />);
  };

  it('renders DropdownMenu component', function () {
    const wrapper = subject();

    expect(wrapper).toHaveElement(DropdownMenu);
  });
});

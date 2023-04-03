import React from 'react';
import { shallow } from 'enzyme';

import { SelectedUserTag, Properties } from './selected-user-tag';

jest.mock('@zero-tech/zui/components', () => ({ Avatar: () => <></> }));
jest.mock('@zero-tech/zui/icons', () => ({ IconXClose: () => <></> }));

describe('SelectedUserTag', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      userOption: { value: '', label: '', image: '' },
      onRemove: () => null,
      ...props,
    };

    return shallow(<SelectedUserTag {...allProps} />);
  };

  it('renders selected members', function () {
    const userOption = { value: 'id-1', label: 'User 1', image: 'url-1' };

    const wrapper = subject({ userOption });

    expect(wrapper.find('.start-group-panel__user-label').text()).toEqual('User 1');
    expect(wrapper.find('Avatar').prop('imageURL')).toEqual('url-1');
  });

  it('publishes remove event', function () {
    const userOption = { value: 'id-1', label: 'User 1', image: 'url-1' };
    const onRemove = jest.fn();

    const wrapper = subject({ userOption, onRemove });

    wrapper.find('button').simulate('click');

    expect(onRemove).toHaveBeenCalledWith('id-1');
  });
});

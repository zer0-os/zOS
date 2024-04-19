import React from 'react';
import { shallow } from 'enzyme';

import { SelectedUserTag, Properties } from '.';
import { bem } from '../../../../lib/bem';

jest.mock('@zero-tech/zui/components', () => ({ Avatar: () => <></>, IconButton: () => <></> }));
jest.mock('@zero-tech/zui/icons', () => ({ IconXClose: () => <></> }));

const c = bem('.selected-user-tag');

describe('SelectedUserTag', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      userOption: { value: '', label: '', image: '' },
      tagSize: 'compact',
      onRemove: () => null,
      ...props,
    };

    return shallow(<SelectedUserTag {...allProps} />);
  };

  it('renders selected members', function () {
    const userOption = { value: 'id-1', label: 'User 1', image: 'url-1' };

    const wrapper = subject({ userOption });

    expect(wrapper.find('.selected-user-tag__user-label').text()).toEqual('User 1');
    expect(wrapper.find('Avatar').prop('imageURL')).toEqual('url-1');
  });

  it('publishes remove event', function () {
    const userOption = { value: 'id-1', label: 'User 1', image: 'url-1' };
    const onRemove = jest.fn();

    const wrapper = subject({ userOption, onRemove });

    wrapper.find(c('user-remove')).simulate('click');

    expect(onRemove).toHaveBeenCalledWith('id-1');
  });

  it('does not render remove button if no handler provided', function () {
    const userOption = { value: 'id-1', label: 'User 1', image: 'url-1' };

    const wrapper = subject({ userOption, onRemove: null });

    expect(wrapper).not.toHaveElement(c('user-remove'));
  });

  it('renders with default size as compact', () => {
    const userOption = { value: 'id-1', label: 'User 1', image: 'url-1' };
    const wrapper = subject({ userOption });

    expect(wrapper.find('.selected-user-tag--compact')).toExist();
    expect(wrapper.find('Avatar')).toHaveProp('size', 'small');
  });

  it('renders with size as spacious when specified', () => {
    const userOption = { value: 'id-1', label: 'User 1', image: 'url-1' };
    const wrapper = subject({ userOption, tagSize: 'spacious' });

    expect(wrapper.find('.selected-user-tag--spacious')).toExist();
    expect(wrapper.find('Avatar')).toHaveProp('size', 'regular');
  });
});

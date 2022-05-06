import React from 'react';

import { shallow } from 'enzyme';

import { ChannelsContainer } from './container';
import { Connect } from './connect';

describe('ChannelsContainer', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      user: {},
      ...props,
    };

    return shallow(<ChannelsContainer {...allProps} />);
  };

  it('renders connect component if no user account present', () => {
    const wrapper = subject({ user: {} });

    expect(wrapper.find(Connect).exists()).toBe(true);
  });

  // describe('mapState', () => {
  //   const subject = (state: Partial<RootState>) => Container.mapState({
  //     ...state,
  //     theme: {
  //       viewMode: ViewModes.Dark,
  //       ...(state.theme || {}),
  //     },
  //   } as RootState);

  //   test('viewMode', () => {
  //     const state = subject({ theme: { value: { viewMode: ViewModes.Light } } });

  //     expect(state.viewMode).toEqual(ViewModes.Light);
  //   });
  // });
});

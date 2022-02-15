import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { AddressBar } from '.';
import { Container } from './container';

describe('AddressBarContainer', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      updateConnector: () => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('passes route to address bar', () => {
    const wrapper = subject({ route: 'the.cats.pajamas' });

    expect(wrapper.find(AddressBar).prop('route')).toBe('the.cats.pajamas');
  });

  it('passes className to address bar', () => {
    const wrapper = subject({ className: 'the-class' });

    expect(wrapper.find(AddressBar).prop('className')).toBe('the-class');
  });

  describe('mapState', () => {
    const subject = (state: Partial<RootState>) => Container.mapState({
      ...state,
      zns: {
        ...(state.zns || {}),
      },
    } as RootState);

    test('viewMode', () => {
      const state = subject({ zns: { value: { route: 'what.is.this' } } });

      expect(state.route).toEqual('what.is.this');
    });
  });
});

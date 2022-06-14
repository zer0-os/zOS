import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { Link } from 'react-router-dom';
import { Apps } from '../../lib/apps';
import { Container } from '.';

describe('Logo', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      calssName: '',
      type: '',
      defaultZnsRoute: '',
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'logo' });

    expect(wrapper.find(Link).children().first().hasClass('logo')).toBe(true);
  });

  it('should take back to page root', () => {
    const wrapper = subject({ type: Apps.Feed, defaultZnsRoute: 'wilder' });

    expect(wrapper.find(Link).prop('to')).toEqual('/wilder/feed');
  });

  describe('mapState', () => {
    const subject = (state: Partial<RootState>) =>
      Container.mapState({
        ...state,
        apps: {
          selectedApp: { type: Apps.NFTS },
        },
      } as RootState);

    test('type', () => {
      const state = subject({});

      expect(state.type).toEqual(Apps.NFTS);
    });
  });
});

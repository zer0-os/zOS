import React from 'react';

import { shallow } from 'enzyme';

import { Component as FeatureFlag, Properties } from '.';

let featureFlags: any = {};

describe('feature-flag', () => {
  const subject = (props: Partial<Properties>, child: any = <div />) => {
    const allProps: Properties = {
      featureFlag: '',
      featureFlags,
      ...props,
    };

    return shallow(<FeatureFlag {...allProps}>{child}</FeatureFlag>);
  };

  it('renders the child if feature flag is true', function () {
    featureFlags.tacos = true;

    const wrapper = subject({ featureFlag: 'tacos' }, <div className='taco-component' />);

    expect(wrapper.hasClass('taco-component')).toBe(true);
  });

  it('does not render the child if feature flag is false', function () {
    featureFlags.tacos = false;

    const wrapper = subject({ featureFlag: 'tacos' }, <div className='taco-component' />);

    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('does not render the child if feature flag does not exist', function () {
    const wrapper = subject({ featureFlag: 'tacos' }, <div className='taco-component' />);

    expect(wrapper.isEmptyRender()).toBe(true);
  });
});

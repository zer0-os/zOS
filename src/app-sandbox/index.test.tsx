import React from 'react';
import { shallow } from 'enzyme';
// import { FeedContainer } from '../../apps/feed/container';

import { AppSandbox } from '.';

describe('AppSandbox', () => {
  const subject = (props: any) => {
    const allProps = {
      ...props,
    };

    return shallow(<AppSandbox {...allProps} />);
  };

});

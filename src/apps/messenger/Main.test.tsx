import React from 'react';
import { shallow } from 'enzyme';

import { Container as Main, Properties } from './Main';
import { MessengerChat } from '../../components/messenger/chat';

describe(Main, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps: Properties = {
      context: {
        isAuthenticated: false,
      },
      ...props,
    };

    return shallow(<Main {...allProps} />);
  };

  it('renders direct message chat component', () => {
    const wrapper = subject({ context: { isAuthenticated: true } });

    expect(wrapper).toHaveElement(MessengerChat);
  });
});

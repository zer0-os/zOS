import React from 'react';
import { shallow } from 'enzyme';

import CreateConversationPanel, { Properties } from './create-conversation-panel';

describe('CreateConversationPanel', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      toggleConversation: () => {},
      usersInMyNetworks: () => {},
      createOneOnOneConversation: () => {},
      ...props,
    };

    return shallow(<CreateConversationPanel {...allProps} />);
  };

  it('XXX', function () {
    const wrapper = subject({});

    expect(wrapper).toHaveElement('.start__chat');
  });
});

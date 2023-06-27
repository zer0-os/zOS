import React from 'react';
import { shallow } from 'enzyme';

import { ChatSkeleton, Properties } from './chat-skeleton';

describe(ChatSkeleton, () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      conversationId: '',
      ...props,
    };

    return shallow(<ChatSkeleton {...allProps} />);
  };

  it('renders the next skeleton when the channel id changes', () => {
    const wrapper = subject({ conversationId: 'aaa' });

    expect(wrapper).toHaveElement('ChatSkeleton1');

    wrapper.setProps({ conversationId: 'bbb' });
    expect(wrapper).toHaveElement('ChatSkeleton2');
  });

  it('loops around to the first skeleton again', () => {
    const wrapper = subject({ conversationId: 'aaa' });

    // To ensure we don't depend on test order, we figure out which one is currently rendered
    // and then re-render until we know we've rendered the last one. Then we can test that
    // it loops around to the first one again.
    let id = 1;
    if (wrapper.find('ChatSkeleton1').length !== 0) {
      id = 1;
    } else if (wrapper.find('ChatSkeleton2').length !== 0) {
      id = 2;
    } else {
      id = 3;
    }
    while (id < 3) {
      id++;
      wrapper.setProps({ conversationId: `convo${id}` });
    }

    wrapper.setProps({ conversationId: 'should restart' });
    expect(wrapper).toHaveElement('ChatSkeleton1');
  });
});

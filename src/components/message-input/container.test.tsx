import { shallow } from 'enzyme';

import { Container } from './container';

describe('MessageInputContainer', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      onsubmit: jest.fn(),
      initialValue: '12',
      getUsersForMentions: jest.fn(),
      renderAfterInput: jest.fn(),
      onMessageInputRendered: jest.fn(),
      id: '123',
      reply: null,
      currentUserId: '11',
      onRemoveReply: jest.fn(),
      isEditing: false,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('should call focus on message input render', () => {
    const textareaRef = {
      current: {
        focus: jest.fn(),
      },
    };

    const wrapper = subject({ id: null });
    (wrapper.instance() as any).onMessageInputRendered(textareaRef);

    expect(textareaRef.current.focus).toHaveBeenCalled();
  });

  it('should not call focus on message input render if activeConversationId not equal the id of textareaRef', () => {
    const activeConversationId = '1';
    const textareaRef = {
      current: {
        focus: jest.fn(),
        id: 'some-other-id',
      },
    };

    const wrapper = subject({ activeConversationId });

    (wrapper.instance() as any).onMessageInputRendered(textareaRef);

    expect(textareaRef.current.focus).not.toHaveBeenCalled();
  });

  it('should call focus on message input render if activeConversationId equal the id of textareaRef', () => {
    const activeConversationId = '123';
    const textareaRef = {
      current: {
        focus: jest.fn(),
        id: activeConversationId,
      },
    };

    const wrapper = subject({ activeConversationId });

    (wrapper.instance() as any).onMessageInputRendered(textareaRef);

    expect(textareaRef.current.focus).toHaveBeenCalled();
  });
});

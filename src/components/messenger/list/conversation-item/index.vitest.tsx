import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ConversationItem } from './index';
import { Channel, ConversationStatus, DefaultRoomLabels, MessagesFetchState, User } from '../../../../store/channels';
import { MatrixAvatar } from '../../../matrix-avatar';
import { bemClassName } from '../../../../lib/bem';

vi.mock('../../../matrix-avatar', () => ({
  MatrixAvatar: vi.fn((props) => (
    <div
      data-testid='mock-matrix-avatar'
      data-imageurl={props.imageURL || 'undefined'}
      data-isgroup={String(props.isGroup)}
    >
      MockAvatar
    </div>
  )),
}));

vi.mock('../message-preivew/message-preview', () => ({
  MessagePreview: vi.fn(({ lastMessage, otherMembersTyping, isTyping }) => {
    if (isTyping && otherMembersTyping?.length > 0) {
      return <div data-testid='typing-indicator'>Someone is typing...</div>;
    }
    if (lastMessage) {
      return <div data-testid='message-preview'>{lastMessage.message || 'No message content'}</div>;
    }
    return <div data-testid='message-preview-empty'>No messages</div>;
  }),
}));

const cn = bemClassName('conversation-item');
const getClassName = (...args: string[]) => cn(...args).className;

const staticAvatarProps = {
  isRaised: true,
  tabIndex: -1,
  size: 'regular',
};

const createMockUser = (id: string, firstName: string, lastName: string, profileImage?: string): User => ({
  userId: id,
  matrixId: `matrix-${id}`,
  profileId: `profile-${id}`,
  primaryZID: `zid-${id}`,
  firstName,
  lastName,
  profileImage: profileImage || '',
  isOnline: false,
  lastSeenAt: '',
});

const mockGetUser = vi.fn();

describe('ConversationItem', () => {
  const renderComponent = (partialProps: Partial<typeof defaultProps> = {}) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const finalProps = { ...defaultProps, ...partialProps };

    return render(
      <QueryClientProvider client={queryClient}>
        <ConversationItem {...finalProps} />
      </QueryClientProvider>
    );
  };

  interface MockMessage {
    id: string;
    message?: string;
    createdAt: number;
    sender: { userId: string };
  }

  const baseConversation: Channel = {
    id: 'conv-1',
    optimisticId: '',
    name: '',
    icon: '',
    otherMembers: [],
    lastMessage: null,
    unreadCount: { total: 0, highlight: 0 },
    createdAt: Date.now(),
    hasLoadedMessages: false,
    otherMembersTyping: [],
    labels: [],
    messages: [],
    memberHistory: [],
    totalMembers: 0,
    bumpStamp: 0,
    hasMore: false,
    conversationStatus: ConversationStatus.CREATED,
    messagesFetchStatus: MessagesFetchState.SUCCESS,
    adminMatrixIds: [],
  };

  const defaultProps = {
    filter: '',
    conversation: baseConversation,
    currentUserId: 'user-0',
    activeConversationId: '',
    isCollapsed: false,
    getUser: mockGetUser,
    onClick: vi.fn(),
    onAddLabel: vi.fn(),
    onRemoveLabel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockImplementation((userId: string) => createMockUser(userId, `User-${userId}`, ''));
  });

  describe('Avatar Display', () => {
    it('should render the correct avatar for a one-on-one conversation', () => {
      const user1 = createMockUser('user-1', 'John', 'Doe', 'john.jpg');
      renderComponent({
        conversation: {
          ...baseConversation,
          totalMembers: 2,
          otherMembers: [user1],
        },
      });
      expect(MatrixAvatar).toHaveBeenCalledWith(
        expect.objectContaining({
          ...staticAvatarProps,
          imageURL: 'john.jpg',
          isGroup: false,
        }),
        expect.anything()
      );
      expect(screen.getByTestId('mock-matrix-avatar')).toBeInTheDocument();
    });

    it('should render the correct avatar for a group conversation with a group icon', () => {
      const user1 = createMockUser('user-1', 'John', 'Doe');
      const user2 = createMockUser('user-2', 'Jane', 'Smith');
      renderComponent({
        conversation: {
          ...baseConversation,
          icon: 'group-icon.png',
          otherMembers: [user1, user2],
        },
      });
      expect(MatrixAvatar).toHaveBeenCalledWith(
        expect.objectContaining({
          ...staticAvatarProps,
          imageURL: 'group-icon.png',
          isGroup: true,
        }),
        expect.anything()
      );
      expect(screen.getByTestId('mock-matrix-avatar')).toBeInTheDocument();
    });

    it('should render a generic group avatar for a group conversation without a specific icon', () => {
      const user1 = createMockUser('user-1', 'John', 'Doe');
      const user2 = createMockUser('user-2', 'Jane', 'Smith');
      renderComponent({
        conversation: {
          ...baseConversation,
          icon: '',
          otherMembers: [user1, user2],
        },
      });
      expect(MatrixAvatar).toHaveBeenCalledWith(
        expect.objectContaining({
          ...staticAvatarProps,
          imageURL: undefined,
          isGroup: true,
        }),
        expect.anything()
      );
      expect(screen.getByTestId('mock-matrix-avatar')).toBeInTheDocument();
    });
  });

  describe('Conversation Title Display', () => {
    it("should display the other member's name for a one-on-one conversation", () => {
      const user1 = createMockUser('user-1', 'Alice', 'Wonderland');
      renderComponent({
        conversation: {
          ...baseConversation,
          name: '',
          otherMembers: [user1],
        },
      });
      expect(screen.getByText('Alice Wonderland')).toBeInTheDocument();
    });

    it('should display a list of member names for a multi-member conversation', () => {
      const user1 = createMockUser('user-1', 'Bob', 'Builder');
      const user2 = createMockUser('user-2', 'Charlie', 'Chaplin');
      renderComponent({
        conversation: {
          ...baseConversation,
          name: '',
          otherMembers: [user1, user2],
        },
      });
      expect(screen.getByText('Bob Builder, Charlie Chaplin')).toBeInTheDocument();
    });

    it('should display the custom name if the conversation has one', () => {
      const user1 = createMockUser('user-1', 'David', 'Copperfield');
      renderComponent({
        conversation: {
          ...baseConversation,
          name: 'Custom Group Name',
          otherMembers: [user1],
        },
      });
      expect(screen.getByText('Custom Group Name')).toBeInTheDocument();
    });
  });

  describe('Muted Status Indicator', () => {
    it('should display a muted bell icon when a conversation is muted', () => {
      renderComponent({
        conversation: {
          ...baseConversation,
          labels: [DefaultRoomLabels.MUTE],
        },
      });
      expect(screen.getByText('icon')).toBeInTheDocument();
    });

    it('should not display a muted indicator if the conversation is not muted', () => {
      renderComponent({
        conversation: {
          ...baseConversation,
          labels: [],
        },
      });
      expect(screen.queryByText('icon')).not.toBeInTheDocument();
    });
  });

  describe('Click Interaction', () => {
    it('should call onClick with the conversation ID when the item is clicked', () => {
      const handleClick = vi.fn();
      renderComponent({
        conversation: {
          ...baseConversation,
          id: 'clicked-conv-id',
          name: 'Clickable Test Conversation',
        },
        onClick: handleClick,
      });
      fireEvent.click(screen.getByRole('button', { name: /Clickable Test Conversation/i }));
      expect(handleClick).toHaveBeenCalledWith('clicked-conv-id');
    });

    it('should call onClick with the conversation ID when Enter key is pressed', () => {
      const handleKeyDown = vi.fn();
      renderComponent({
        conversation: {
          ...baseConversation,
          id: 'enter-key-conv-id',
          name: 'Enterable Test Conversation',
        },
        onClick: handleKeyDown,
      });
      fireEvent.keyDown(screen.getByRole('button', { name: /Enterable Test Conversation/i }), {
        key: 'Enter',
        code: 'Enter',
      });
      expect(handleKeyDown).toHaveBeenCalledWith('enter-key-conv-id');
    });
  });

  describe('Unread Message Count', () => {
    it('should display the unread count when there are unread messages', () => {
      renderComponent({
        conversation: {
          ...baseConversation,
          unreadCount: { total: 5, highlight: 0 },
        },
      });
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should not display an unread count if there are no unread messages', () => {
      renderComponent({
        conversation: {
          ...baseConversation,
          unreadCount: { total: 0, highlight: 0 },
        },
      });
      expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
    });

    it('should display the highlight count when there are unread highlights', () => {
      renderComponent({
        conversation: {
          ...baseConversation,
          unreadCount: { total: 5, highlight: 2 },
        },
      });
      expect(screen.getByText('2')).toHaveClass(getClassName('unread-highlight'));
      expect(screen.queryByText('5')).not.toBeInTheDocument();
    });

    it('should display the total unread count if highlights are zero but total is not', () => {
      renderComponent({
        conversation: {
          ...baseConversation,
          unreadCount: { total: 3, highlight: 0 },
        },
      });
      expect(screen.getByText('3')).toHaveClass(getClassName('unread-count'));
      expect(screen.queryByText('3')).not.toHaveClass(getClassName('unread-highlight'));
    });
  });

  describe('Message Preview and Typing Indicator', () => {
    it('should display the last message preview when no one is typing', () => {
      const lastMessage: MockMessage = {
        id: 'msg-1',
        message: 'Hello there',
        createdAt: Date.now(),
        sender: { userId: 'user-1' },
      };
      renderComponent({
        conversation: {
          ...baseConversation,
          lastMessage: lastMessage as any,
          otherMembersTyping: [],
        },
      });
      expect(screen.getByTestId('message-preview')).toHaveTextContent('Hello there');
      expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
    });

    it('should display a typing indicator when other members are typing', () => {
      const typingUser = createMockUser('user-2', 'Typing', 'User');
      renderComponent({
        conversation: {
          ...baseConversation,
          lastMessage: null,
          otherMembersTyping: [typingUser.userId],
        },
      });
      expect(screen.getByTestId('typing-indicator')).toHaveTextContent('Someone is typing...');
      expect(screen.queryByTestId('message-preview')).not.toBeInTheDocument();
    });

    it('should prioritize typing indicator over message preview when members are typing', () => {
      const lastMessage: MockMessage = {
        id: 'msg-2',
        message: 'This should not be visible',
        createdAt: Date.now(),
        sender: { userId: 'user-1' },
      };
      const typingUser = createMockUser('user-3', 'Another', 'Typer');
      renderComponent({
        conversation: {
          ...baseConversation,
          lastMessage: lastMessage as any,
          otherMembersTyping: [typingUser.userId],
        },
      });
      expect(screen.getByTestId('typing-indicator')).toHaveTextContent('Someone is typing...');
      expect(screen.queryByTestId('message-preview')).not.toBeInTheDocument();
    });

    it('should display nothing for preview if no last message and no one is typing', () => {
      renderComponent({
        conversation: {
          ...baseConversation,
          lastMessage: null,
          otherMembersTyping: [],
        },
      });
      expect(screen.getByTestId('message-preview-empty')).toHaveTextContent('No messages');
      expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Timestamp Display', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should display the stubbed timestamp when there is a last message', () => {
      const specificDate = new Date('2025-05-12T15:32:29.098Z');
      vi.setSystemTime(specificDate);

      const lastMessage: MockMessage = {
        id: 'msg-ts',
        message: 'Timestamp test',
        createdAt: Date.now(),
        sender: { userId: 'user-1' },
      };
      renderComponent({
        conversation: {
          ...baseConversation,
          lastMessage: lastMessage as any,
        },
      });
      expect(screen.getByText('8:32 AM')).toBeInTheDocument();
    });

    it('should not display a timestamp if there is no last message', () => {
      renderComponent({
        conversation: {
          ...baseConversation,
          lastMessage: null,
        },
      });

      const timestampElement = screen.queryByText((content, element) => {
        return element.classList.contains(getClassName('timestamp')) && content === '';
      });

      expect(timestampElement).toBeInTheDocument();
    });
  });
});

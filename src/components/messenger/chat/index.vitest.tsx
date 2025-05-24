import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { FC } from 'react';
import { AnyAction, Dispatch } from 'redux';
import { MessengerChat } from './index';
import {
  LeaveGroupDialogStatus,
  setLeaveGroupStatus as importedSetLeaveGroupStatusAction,
} from '../../../store/group-management';
import { CHANNEL_DEFAULTS, onRemoveReply as importedOnRemoveReply, NormalizedChannel } from '../../../store/channels';
import { send as importedSendMessageAction } from '../../../store/messages';
import { LeaveGroupDialogContainer as ImportedLeaveGroupDialogContainer } from '../../group-management/leave-group-dialog/container';
import { MessageInput as ImportedMessageInput } from '../../message-input';
import { useDispatch as importedUseDispatch } from 'react-redux';
import { searchMentionableUsersForChannel as importedSearchMentionableUsersForChannel } from '../../../platform-apps/channels/util/api';
import {
  useChannelSelector as importedUseChannelSelector,
  useUsersSelector as importedUseUsersSelector,
} from '../../../store/hooks';
import {
  activeConversationIdSelector as importedActiveConversationIdSelector,
  isJoiningConversationSelector as importedIsJoiningConversationSelector,
} from '../../../store/chat/selectors';
import { leaveGroupDialogStatusSelector as importedLeaveGroupDialogStatusSelector } from '../../../store/group-management/selectors';
import { renderWithProviders } from '../../../test-utils';
import { RootState } from '../../../store';
import { mockChatState } from '../../../store/chat/test/mocks';
import { mockGroupManagementState } from '../../../store/group-management/test/mocks';
import { ParentMessage } from '../../../lib/chat/types';

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: vi.fn(() => vi.fn()),
  };
});

vi.mock('../../../store/channels', async () => {
  const actual = await vi.importActual('../../../store/channels');
  return {
    ...actual,
    onRemoveReply: vi.fn(() => ({ type: 'ON_REMOVE_REPLY' })),
  };
});

vi.mock('../../chat-view-container/chat-view-container', () => ({
  ChatViewContainer: vi.fn(() => <div data-testid='chat-view-container'>ChatViewContainer</div>),
}));

vi.mock('../../../store/messages', async () => {
  const actual = await vi.importActual('../../../store/messages');
  return {
    ...actual,
    send: vi.fn((payload) => ({ type: 'SEND_MESSAGE', payload })),
  };
});

vi.mock('../../../store/group-management', async () => {
  const actual = await vi.importActual('../../../store/group-management');
  return {
    ...actual,
    setLeaveGroupStatus: vi.fn((status) => ({ type: 'SET_LEAVE_GROUP_STATUS', payload: status })),
  };
});

vi.mock('../../group-management/leave-group-dialog/container', () => ({
  LeaveGroupDialogContainer: vi.fn(() => <div data-testid='leave-group-dialog'>LeaveGroupDialogContainer</div>),
}));

vi.mock('../../message-input', () => ({
  MessageInput: vi.fn(({ onSubmit, onRemoveReply, reply }) => (
    <div data-testid='message-input'>
      <button onClick={() => onSubmit('test message', [], [])}>Send</button>
      {reply && <button onClick={onRemoveReply}>Remove Reply</button>}
    </div>
  )),
}));

vi.mock('../../../platform-apps/channels/util/api', () => ({
  searchMentionableUsersForChannel: vi.fn().mockResolvedValue([]),
}));

vi.mock('../conversation-header/container', () => ({
  ConversationHeaderContainer: vi.fn(() => <div data-testid='conversation-header'>ConversationHeader</div>),
}));

vi.mock('./typing-indicator', () => ({
  ChatTypingIndicator: vi.fn(() => <div data-testid='chat-typing-indicator'>ChatTypingIndicator</div>),
}));

vi.mock('../../../store/hooks', () => ({
  useChannelSelector: vi.fn(),
  useUsersSelector: vi.fn(),
}));

vi.mock('../../../store/chat/selectors', () => ({
  activeConversationIdSelector: vi.fn(),
  isJoiningConversationSelector: vi.fn(),
}));

vi.mock('../../../store/group-management/selectors', () => ({
  leaveGroupDialogStatusSelector: vi.fn(),
}));

const mockUseDispatch = vi.mocked(importedUseDispatch);
const mockOnRemoveReply = vi.mocked(importedOnRemoveReply);
const mockSendMessageAction = vi.mocked(importedSendMessageAction);
const mockSetLeaveGroupStatusAction = vi.mocked(importedSetLeaveGroupStatusAction);
const mockSearchMentionableUsersForChannel = vi.mocked(importedSearchMentionableUsersForChannel);
const mockUseChannelSelector = vi.mocked(importedUseChannelSelector);
const mockUseUsersSelector = vi.mocked(importedUseUsersSelector);
const mockActiveConversationIdSelector = vi.mocked(importedActiveConversationIdSelector);
const mockIsJoiningConversationSelector = vi.mocked(importedIsJoiningConversationSelector);
const mockLeaveGroupDialogStatusSelector = vi.mocked(importedLeaveGroupDialogStatusSelector);

const defaultMockChannel: NormalizedChannel = {
  ...CHANNEL_DEFAULTS,
  id: 'channel-1',
  name: 'Test Channel',
  bumpStamp: 0,
};

const renderComponent = (preloadedStateOverrides = {}, options: { channel?: NormalizedChannel } = {}) => {
  const { channel = defaultMockChannel } = options;
  const preloadedState: Partial<RootState> = {
    chat: {
      ...mockChatState,
      activeConversationId: 'channel-1',
      isJoiningConversation: false,
    },
    groupManagement: {
      ...mockGroupManagementState,
      leaveGroupDialogStatus: LeaveGroupDialogStatus.CLOSED,
    },
    ...preloadedStateOverrides,
  };

  mockActiveConversationIdSelector.mockImplementation((state) => state.chat.activeConversationId);
  mockIsJoiningConversationSelector.mockImplementation((state) => state.chat.isJoiningConversation);
  mockLeaveGroupDialogStatusSelector.mockImplementation((state) => state.groupManagement.leaveGroupDialogStatus);
  mockUseChannelSelector.mockReturnValue(channel);
  mockUseUsersSelector.mockReturnValue([]);

  return renderWithProviders(<MessengerChat />, {
    preloadedState,
  });
};

describe('MessengerChat', () => {
  let dispatchMock: Dispatch<AnyAction>;

  beforeEach(() => {
    vi.clearAllMocks();
    dispatchMock = vi.fn();
    mockUseDispatch.mockReturnValue(dispatchMock);
  });

  it('renders null if no active conversation and not joining', () => {
    renderComponent({
      chat: {
        activeConversationId: null,
        isJoiningConversation: false,
      },
    });
    expect(screen.queryByTestId('conversation-header')).not.toBeInTheDocument();
  });

  it('renders chat components when an active conversation exists', () => {
    renderComponent();
    expect(screen.getByTestId('conversation-header')).toBeInTheDocument();
    expect(screen.getByTestId('chat-view-container')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
    expect(screen.getByTestId('chat-typing-indicator')).toBeInTheDocument();
  });

  it('handles sending a message', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Send'));

    expect(mockSendMessageAction).toHaveBeenCalledWith({
      channelId: 'channel-1',
      message: 'test message',
      mentionedUserIds: [],
      parentMessage: undefined,
      files: [],
    });
    expect(dispatchMock).toHaveBeenCalledWith(mockSendMessageAction(expect.anything()));
    expect(dispatchMock).toHaveBeenCalledWith(mockOnRemoveReply());
  });

  it('handles sending a message with reply', () => {
    const replyMessage: ParentMessage = {
      messageId: 'reply-msg-id',
      message: 'reply text',
      sender: {
        userId: 'user-id',
        firstName: 'Test',
        lastName: 'User',
        profileImage: 'profile-image',
        profileId: 'profile-id',
      },
      isAdmin: false,
      userId: 'user-id',
      mentionedUsers: [],
      hidePreview: false,
    };
    renderComponent({}, { channel: { ...defaultMockChannel, reply: replyMessage } });

    expect(screen.getByText('Remove Reply')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Send'));

    expect(mockSendMessageAction).toHaveBeenCalledWith({
      channelId: 'channel-1',
      message: 'test message',
      mentionedUserIds: [],
      parentMessage: replyMessage,
      files: [],
    });
    expect(dispatchMock).toHaveBeenCalledWith(mockSendMessageAction(expect.anything()));
    expect(dispatchMock).toHaveBeenCalledWith(mockOnRemoveReply());
  });

  it('removes reply when remove reply button is clicked', () => {
    const replyMessage: ParentMessage = {
      messageId: 'reply-msg-id',
      message: 'reply text',
      sender: {
        userId: 'user-id',
        firstName: 'Test',
        lastName: 'User',
        profileImage: 'profile-image',
        profileId: 'profile-id',
      },
      isAdmin: false,
      userId: 'user-id',
      mentionedUsers: [],
      hidePreview: false,
    };
    renderComponent({}, { channel: { ...defaultMockChannel, reply: replyMessage } });

    fireEvent.click(screen.getByText('Remove Reply'));
    expect(dispatchMock).toHaveBeenCalledWith(mockOnRemoveReply());
  });

  it('opens and closes leave group dialog', async () => {
    const MockedLeaveGroupDialog: FC<{ onClose?: () => void }> = vi.fn(({ onClose }) => (
      <div data-testid='leave-group-dialog'>
        <button onClick={onClose}>Close Dialog</button>
      </div>
    ));
    vi.mocked(ImportedLeaveGroupDialogContainer).mockImplementation(MockedLeaveGroupDialog);

    renderComponent({
      groupManagement: {
        leaveGroupDialogStatus: LeaveGroupDialogStatus.OPEN,
      },
    });

    expect(screen.getByTestId('leave-group-dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close Dialog'));
    expect(dispatchMock).toHaveBeenCalledWith(mockSetLeaveGroupStatusAction(LeaveGroupDialogStatus.CLOSED));
  });

  it('calls searchMentionableUsersForChannel when MessageInput requests it', async () => {
    const MockedMessageInput: FC<{ getUsersForMentions: (query: string) => Promise<any[]> }> = vi.fn(
      ({ getUsersForMentions }) => <button onClick={() => getUsersForMentions('testQuery')}>Search Mentions</button>
    );
    vi.mocked(ImportedMessageInput).mockImplementation(MockedMessageInput);

    renderComponent();

    fireEvent.click(screen.getByText('Search Mentions'));

    await waitFor(() => {
      expect(mockSearchMentionableUsersForChannel).toHaveBeenCalledWith('testQuery', defaultMockChannel.otherMembers);
    });
  });

  it('renders loading state if isJoiningConversation is true', () => {
    renderComponent({
      chat: {
        activeConversationId: null,
        isJoiningConversation: true,
      },
    });

    expect(screen.queryByTestId('conversation-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chat-view-container')).not.toBeInTheDocument();
    expect(screen.queryByTestId('message-input')).not.toBeInTheDocument();
  });
});

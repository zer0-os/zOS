import React from 'react';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ChatView, Properties } from './chat-view';
import { CHANNEL_DEFAULTS, MessagesFetchState, NormalizedChannel, User } from '../../store/channels';
import { MediaType } from '../../store/messages';
import { RootState } from '../../store/reducer';
import { renderWithProviders } from '../../test-utils';
import {
  formatDayHeader as mockUtilFormatDayHeader,
  createMessageGroups as mockUtilCreateMessageGroups,
  processMessages as mockUtilProcessMessages,
  getConversationErrorMessage as mockUtilGetConversationErrorMessage,
  getFailureErrorMessage as mockUtilGetFailureErrorMessage,
} from './utils';
import { ChatSkeleton as MockChatSkeletonComponent } from './chat-skeleton';
import { ChatMessage as MockChatMessageComponent } from './chat-message';
import {
  useChannelSelector as importUseChannelSelector,
  useMessagesSelector as importUseMessagesSelector,
  useUsersSelector as importUseUsersSelector,
} from '../../store/hooks';
import { useDispatch as importUseDispatch } from 'react-redux';
import { openLightbox as importOpenLightbox } from '../../store/dialogs';
import { openMessageInfo as importOpenMessageInfo } from '../../store/message-info';
import { toggleSecondarySidekick as importToggleSecondarySidekick } from '../../store/group-management';
import { mockMessage } from '../../store/messages/test/mocks';

// Mocks
vi.mock('./chat-skeleton', () => ({
  ChatSkeleton: vi.fn(({ short }) => (
    <div data-testid={short ? 'chat-skeleton-short' : 'chat-skeleton-full'}>ChatSkeleton</div>
  )),
}));

vi.mock('./chat-message', () => ({
  ChatMessage: vi.fn(() => <div data-testid='chat-message'>ChatMessage</div>),
}));

vi.mock('../admin-message/container', () => ({
  AdminMessageContainer: vi.fn(() => <div data-testid='admin-message-container'>AdminMessageContainer</div>),
}));

vi.mock('../waypoint', () => ({
  Waypoint: vi.fn(({ onEnter }) => (
    <div data-testid='waypoint' onClick={onEnter}>
      Waypoint
    </div>
  )),
}));

vi.mock('../inverted-scroll', () => ({
  default: React.forwardRef(({ children }: { children: React.ReactNode }, ref: any) => (
    <div data-testid='inverted-scroll' ref={ref}>
      {children}
    </div>
  )),
}));

vi.mock('./utils', async () => {
  const actual = await vi.importActual('./utils');
  return {
    ...actual,
    formatDayHeader: vi.fn((day) => `Formatted: ${day}`),
    createMessageGroups: vi.fn((messages) => [messages]),
    processMessages: vi.fn((messages) => ({ messages, mediaMessages: new Map() })),
    getConversationErrorMessage: vi.fn().mockReturnValue(null),
    getFailureErrorMessage: vi.fn().mockReturnValue('Failed to load messages.'),
    isUserOwnerOfMessage: vi.fn(),
  };
});

vi.mock('../../store/hooks', () => ({
  useChannelSelector: vi.fn(),
  useMessagesSelector: vi.fn(),
  useUsersSelector: vi.fn(),
  useDispatch: vi.fn(() => vi.fn()),
}));
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(() => vi.fn()),
  };
});
vi.mock('../../store/authentication/selectors', () => ({
  currentUserSelector: vi.fn(() => ({ id: 'current-user-id' })),
}));

vi.mock('../../store/dialogs', async () => {
  const actual = await vi.importActual('../../store/dialogs');
  return {
    ...actual,
    openLightbox: vi.fn(),
  };
});

vi.mock('../../store/message-info', async () => {
  const actual = await vi.importActual('../../store/message-info');
  return {
    ...actual,
    openMessageInfo: vi.fn(),
  };
});

vi.mock('../../store/group-management', async () => {
  const actual = await vi.importActual('../../store/group-management');
  return {
    ...actual,
    toggleSecondarySidekick: vi.fn(),
  };
});

const useChannelSelector = vi.mocked(importUseChannelSelector);
const useMessagesSelector = vi.mocked(importUseMessagesSelector);
const useUsersSelector = vi.mocked(importUseUsersSelector);
const useDispatch = vi.mocked(importUseDispatch);
const openLightbox = vi.mocked(importOpenLightbox);
const openMessageInfo = vi.mocked(importOpenMessageInfo);
const toggleSecondarySidekick = vi.mocked(importToggleSecondarySidekick);
const ChatMessage = vi.mocked(MockChatMessageComponent);

const mockOtherMembers = [{ userId: 'user-2', firstName: 'Other', lastName: 'Member' }] as User[];
const mockChannel = {
  ...CHANNEL_DEFAULTS,
  id: 'channel-1',
  name: 'Test Channel',
  messages: [],
  otherMembers: mockOtherMembers.map((u) => u.userId),
  hasMore: true,
  messagesFetchStatus: MessagesFetchState.SUCCESS,
  hasLoadedMessages: true,
} as NormalizedChannel;

const defaultProps: Properties = {
  id: 'channel-1',
  hasLoadedMessages: false,
  messagesFetchStatus: MessagesFetchState.SUCCESS,
  isOneOnOne: false,
  isSecondarySidekickOpen: false,
  onHiddenMessageInfoClick: vi.fn(),
  onFetchMore: vi.fn(),
  onReload: vi.fn(),
};

const renderComponent = (partialProps: Partial<Properties> = {}, preloadedState: Partial<RootState> = {}) => {
  const props = { ...defaultProps, ...partialProps };

  useUsersSelector.mockReturnValue(mockOtherMembers);

  return renderWithProviders(<ChatView {...props} />, { preloadedState });
};

describe('ChatView', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(mockUtilGetConversationErrorMessage).mockReturnValue(null);
    vi.mocked(mockUtilGetFailureErrorMessage).mockReturnValue('Failed to load messages.');
    vi.mocked(mockUtilProcessMessages).mockReturnValue({ messages: [], mediaMessages: new Map() });
    vi.mocked(mockUtilFormatDayHeader).mockImplementation((day) => `Formatted: ${day}`);
    vi.mocked(mockUtilCreateMessageGroups).mockImplementation((messages) => [messages]);
  });

  describe('Initial Rendering & States', () => {
    describe('Loading State', () => {
      it('should render ChatSkeleton when hasLoadedMessages is false and messagesFetchStatus is IN_PROGRESS', () => {
        renderComponent({
          hasLoadedMessages: false,
          messagesFetchStatus: MessagesFetchState.IN_PROGRESS,
        });

        expect(vi.mocked(MockChatSkeletonComponent)).toHaveBeenCalled();
        expect(screen.getByTestId('chat-skeleton-full')).toBeInTheDocument();
        expect(screen.queryByTestId('chat-skeleton-short')).not.toBeInTheDocument();
      });

      it('should render ChatSkeleton when messagesFetchStatus is IN_PROGRESS (and hasLoadedMessages is false by default for this specific renderComponent call)', () => {
        renderComponent({
          messagesFetchStatus: MessagesFetchState.IN_PROGRESS,
        });
        expect(vi.mocked(MockChatSkeletonComponent)).toHaveBeenCalled();
        expect(screen.getByTestId('chat-skeleton-full')).toBeInTheDocument();
      });

      it('should NOT render ChatSkeleton if messagesFetchStatus is FAILED', () => {
        renderComponent({
          hasLoadedMessages: false,
          messagesFetchStatus: MessagesFetchState.FAILED,
        });
        expect(screen.queryByTestId('chat-skeleton-full')).not.toBeInTheDocument();
      });
      it('should NOT render ChatSkeleton if messagesFetchStatus is SUCCESS but no messages and hasLoadedMessages is false (edge case, usually hasLoadedMessages would be true)', () => {
        renderComponent({
          hasLoadedMessages: false,
          messagesFetchStatus: MessagesFetchState.SUCCESS,
        });
        expect(screen.getByTestId('chat-skeleton-full')).toBeInTheDocument();
      });
    });

    describe('More Messages Loading State', () => {
      it('should render short ChatSkeleton when hasLoadedMessages is true and messagesFetchStatus is MORE_IN_PROGRESS', () => {
        renderComponent({
          hasLoadedMessages: true,
          messagesFetchStatus: MessagesFetchState.MORE_IN_PROGRESS,
        });

        expect(vi.mocked(MockChatSkeletonComponent)).toHaveBeenCalledWith(
          { conversationId: 'channel-1', short: true },
          {}
        );
        expect(screen.getByTestId('chat-skeleton-short')).toBeInTheDocument();
        expect(screen.queryByTestId('chat-skeleton-full')).not.toBeInTheDocument();
        expect(screen.getByTestId('chat-skeleton-short').closest('.chat-view__scroll-skeleton')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    describe('Fetch More Messages (Infinite Scroll)', () => {
      beforeEach(() => {
        vi.mocked(mockUtilProcessMessages).mockImplementation((messages) => ({
          messages,
          mediaMessages: new Map(),
        }));
      });

      it('should call onFetchMore with the oldest message timestamp when Waypoint is entered and channel.hasMore is true', () => {
        const expectedTimestamp = 1678880000000;
        const mockMessages = [
          mockMessage({
            optimisticId: 'msg1',
            id: 'msg1',
            createdAt: expectedTimestamp,
          }),
          mockMessage({
            optimisticId: 'msg2',
            id: 'msg2',
            createdAt: expectedTimestamp + 1000,
          }),
        ];

        useMessagesSelector.mockReturnValue(mockMessages);
        useChannelSelector.mockReturnValue({
          ...mockChannel,
          hasMore: true,
          messages: mockMessages.map((m) => m.id),
        });

        const onFetchMoreMock = vi.fn();
        renderComponent({
          onFetchMore: onFetchMoreMock,
          hasLoadedMessages: true,
          messagesFetchStatus: MessagesFetchState.SUCCESS,
        });

        const waypoint = screen.getByTestId('waypoint');
        waypoint.click();

        expect(onFetchMoreMock).toHaveBeenCalledTimes(1);
        expect(onFetchMoreMock).toHaveBeenCalledWith(expectedTimestamp);
      });

      it('should NOT call onFetchMore if channel.hasMore is false', () => {
        const mockMessages = [
          mockMessage({ id: 'test-msg-no-fetch', optimisticId: 'test-msg-no-fetch-optimistic' }),
        ];
        useMessagesSelector.mockReturnValue(mockMessages);
        useChannelSelector.mockReturnValue({
          ...mockChannel,
          hasMore: false,
          messages: mockMessages.map((m) => m.id),
        });
        const onFetchMoreMock = vi.fn();
        renderComponent({
          onFetchMore: onFetchMoreMock,
          hasLoadedMessages: true,
          messagesFetchStatus: MessagesFetchState.SUCCESS,
        });

        const waypoint = screen.getByTestId('waypoint');
        waypoint.click();

        expect(onFetchMoreMock).not.toHaveBeenCalled();
      });
    });

    describe('Reload on Failure', () => {
      it('should call onReload when "Try Reload" is clicked in failure state', () => {
        const onReloadMock = vi.fn();
        renderComponent({
          messagesFetchStatus: MessagesFetchState.FAILED,
          onReload: onReloadMock,
          hasLoadedMessages: true,
        });

        const tryReloadLink = screen.getByText('Try Reload');
        expect(tryReloadLink).toBeInTheDocument();

        tryReloadLink.click();
        expect(onReloadMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('Chat Message Interactions', () => {
      const mockChatMessageProps = {
        message: mockMessage({
          id: 'm1',
          optimisticId: 'm1',
          message: 'Hello',
          createdAt: Date.now(),
        }),
        isUserOwner: false,
        isUserOwnerOfParentMessage: false,
        renderIndex: 0,
        showSenderAvatar: true,
        channelId: 'channel-1',
        groupLength: 1,
        isOneOnOne: false,
        mediaMessages: new Map(),
      };

      let messagesForSuite: ReturnType<typeof mockMessage>[] = [];

      beforeEach(() => {
        useDispatch.mockClear();
        openLightbox.mockClear();
        openMessageInfo.mockClear();
        toggleSecondarySidekick.mockClear();

        const messagesForChatInteractions = [
          mockMessage({
            id: 'm1',
            optimisticId: 'm1-optimistic',
            message: 'Hello with image',
            createdAt: Date.now(),
            media: { type: MediaType.Image, url: 'image.png', name: 'image', width: 100, height: 100 },
          }),
        ];
        messagesForSuite = messagesForChatInteractions;
        useMessagesSelector.mockReturnValue(messagesForSuite);

        const processedMediaMessages = new Map();
        if (messagesForSuite.length > 0 && messagesForSuite[0].media) {
          processedMediaMessages.set(messagesForSuite[0].id, { media: messagesForSuite[0].media });
        }
        vi.mocked(mockUtilProcessMessages).mockReturnValue({
          messages: messagesForSuite,
          mediaMessages: processedMediaMessages,
        });

        ChatMessage.mockImplementation((props: any) => {
          return (
            <div
              data-testid='chat-message'
              onClick={() => {
                if (props.onImageClick && props.message.media) props.onImageClick(props.message.media);
                if (props.onOpenMessageInfo) props.onOpenMessageInfo(props.message.id);
                if (props.onHiddenMessageInfoClick) props.onHiddenMessageInfoClick();
              }}
            >
              ChatMessage
            </div>
          );
        });
      });

      it('should dispatch openLightbox when onImageClick is called from ChatMessage', () => {
        const mockDispatch = vi.fn();
        useDispatch.mockReturnValue(mockDispatch);

        const messagesFromSelector = messagesForSuite;

        renderComponent({ hasLoadedMessages: true, messagesFetchStatus: MessagesFetchState.SUCCESS });

        screen.getByTestId('chat-message').click();

        expect(mockDispatch).toHaveBeenCalledTimes(3);

        const expectedMedia = messagesFromSelector[0].media;
        expect(openLightbox).toHaveBeenCalledWith({
          media: [expectedMedia].reverse(),
          startingIndex: 0,
        });
      });

      it('should dispatch openMessageInfo when onOpenMessageInfo is called from ChatMessage', () => {
        const mockDispatch = vi.fn();
        useDispatch.mockReturnValue(mockDispatch);
        renderComponent({ hasLoadedMessages: true, messagesFetchStatus: MessagesFetchState.SUCCESS });

        screen.getByTestId('chat-message').click();

        expect(mockDispatch).toHaveBeenCalled();
        expect(openMessageInfo).toHaveBeenCalledWith({
          messageId: mockChatMessageProps.message.id,
          channelId: 'channel-1',
        });
      });

      it('should dispatch toggleSecondarySidekick if isSecondarySidekickOpen is false when onOpenMessageInfo is called', () => {
        const mockDispatch = vi.fn();
        useDispatch.mockReturnValue(mockDispatch);

        const messageWithoutMedia = mockMessage({
          id: 'm-no-media-1',
          optimisticId: 'm-no-media-1-optimistic',
          message: 'No media here for toggle test',
          createdAt: Date.now(),
          media: undefined,
        });
        useMessagesSelector.mockReturnValue([messageWithoutMedia]);
        vi.mocked(mockUtilProcessMessages).mockReturnValue({
          messages: [messageWithoutMedia],
          mediaMessages: new Map(),
        });

        renderComponent({
          hasLoadedMessages: true,
          messagesFetchStatus: MessagesFetchState.SUCCESS,
          isSecondarySidekickOpen: false,
        });

        screen.getByTestId('chat-message').click();

        expect(mockDispatch).toHaveBeenCalledTimes(2);
        expect(openMessageInfo).toHaveBeenCalledWith({ messageId: messageWithoutMedia.id, channelId: 'channel-1' });
        expect(toggleSecondarySidekick).toHaveBeenCalledTimes(1);
      });

      it('should NOT dispatch toggleSecondarySidekick if isSecondarySidekickOpen is true', () => {
        const mockDispatch = vi.fn();
        useDispatch.mockReturnValue(mockDispatch);

        const messageWithoutMedia = mockMessage({
          id: 'm-no-media-2',
          optimisticId: 'm-no-media-2-optimistic',
          message: 'No media here for no-toggle test',
          createdAt: Date.now(),
          media: undefined,
        });
        useMessagesSelector.mockReturnValue([messageWithoutMedia]);
        vi.mocked(mockUtilProcessMessages).mockReturnValue({
          messages: [messageWithoutMedia],
          mediaMessages: new Map(),
        });

        renderComponent({
          hasLoadedMessages: true,
          messagesFetchStatus: MessagesFetchState.SUCCESS,
          isSecondarySidekickOpen: true,
        });

        screen.getByTestId('chat-message').click();

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(openMessageInfo).toHaveBeenCalledWith({ messageId: messageWithoutMedia.id, channelId: 'channel-1' });
        expect(toggleSecondarySidekick).not.toHaveBeenCalled();
      });

      it('should call onHiddenMessageInfoClick prop when ChatMessage invokes it', () => {
        const onHiddenMessageInfoClickMock = vi.fn();
        renderComponent({
          hasLoadedMessages: true,
          messagesFetchStatus: MessagesFetchState.SUCCESS,
          onHiddenMessageInfoClick: onHiddenMessageInfoClickMock,
        });

        screen.getByTestId('chat-message').click();

        expect(onHiddenMessageInfoClickMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});

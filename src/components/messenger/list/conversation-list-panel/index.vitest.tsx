import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConversationListPanel, Tab as _Tab } from '.';
import {
  DefaultRoomLabels as _DefaultRoomLabels,
  Channel,
  ConversationStatus,
  MessagesFetchState as _MessagesFetchState,
  CHANNEL_DEFAULTS,
  User,
  openConversation,
  onAddLabel,
  onRemoveLabel,
} from '../../../../store/channels';
import { RootState } from '../../../../store/reducer';
import { MemberNetworks as _MemberNetworks } from '../../../../store/users/types';
import { bemClassName } from '../../../../lib/bem';

const cn = bemClassName('messages-list');
const getClassName = (...args: string[]) => cn(...args).className;

const mockDispatch = vi.fn();
const useSelectorMock = vi.fn();

let currentLastActiveTabInMock: _Tab | null = null;
const mockGetLastActiveTab = vi.fn(() => currentLastActiveTabInMock);
const mockSetLastActiveTab = vi.fn((tab: _Tab) => {
  currentLastActiveTabInMock = tab;
});

const createFullUser = (userData: Partial<User>): User => ({
  userId: 'default-user-id',
  matrixId: '@default:matrix.org',
  firstName: 'Default',
  lastName: 'User',
  profileId: 'default-profile-id',
  isOnline: false,
  profileImage: '',
  lastSeenAt: '2023-01-01T00:00:00.000Z',
  primaryZID: 'default-zid',
  ...userData,
});

const createHighlightedTextMatcher = (targetText: string, selector?: string) => {
  const normalizedTargetText = targetText.replace(/\s+/g, ' ').trim().toLowerCase();
  return (content: string, element: Element | null): boolean => {
    if (!element) return false;
    const elementText = element.textContent?.replace(/\s+/g, ' ').trim().toLowerCase();
    const textMatches = elementText === normalizedTargetText;
    if (selector) {
      return textMatches && element.matches(selector);
    }
    return textMatches;
  };
};

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => mockDispatch,
    useSelector: (...args) => useSelectorMock(...args),
  };
});

vi.mock('../../../../lib/last-tab', () => ({
  getLastActiveTab: () => mockGetLastActiveTab(),
  setLastActiveTab: (tab: _Tab) => mockSetLastActiveTab(tab),
}));

vi.mock('../../../../store/channels', async () => {
  const actual = await vi.importActual('../../../../store/channels');
  return {
    ...actual,
    ConversationStatus: actual.ConversationStatus || { CREATED: 'CREATED', CREATING: 'CREATING', ERROR: 'ERROR' },
    MessagesFetchState: actual.MessagesFetchState || {
      SUCCESS: 'SUCCESS',
      LOADING_MORE: 'LOADING_MORE',
      FAILED: 'FAILED',
      NONE: 'NONE',
    },
    CHANNEL_DEFAULTS: actual.CHANNEL_DEFAULTS || {
      optimisticId: '',
      name: '',
      messages: [],
      otherMembers: [],
      memberHistory: [],
      totalMembers: 0,
      hasMore: true,
      hasMorePosts: true,
      createdAt: 0,
      lastMessage: undefined,
      unreadCount: { total: 0, highlight: 0 },
      icon: '',
      hasLoadedMessages: false,
      conversationStatus: 'CREATED',
      messagesFetchStatus: null,
      adminMatrixIds: [],
      moderatorIds: [],
      otherMembersTyping: [],
      labels: [],
      isSocialChannel: false,
      zid: null,
    },
    openConversation: vi.fn((payload) => ({ type: 'OPEN_CONVERSATION', payload })),
    onAddLabel: vi.fn((payload) => ({ type: 'ADD_LABEL', payload })),
    onRemoveLabel: vi.fn((payload) => ({ type: 'REMOVE_LABEL', payload })),
  };
});

const defaultProps = {
  currentUserId: 'test-user-id',
  activeConversationId: '',
  isLabelDataLoaded: true,
  isCollapsed: false,
  search: vi.fn(),
  onCreateConversation: vi.fn(),
};

const stubConversation = (conv: Partial<Channel>): Channel => ({
  ...CHANNEL_DEFAULTS,
  id: 'default-id',
  name: 'Default Conversation',
  otherMembers: [],
  unreadCount: { total: 0, highlight: 0 },
  labels: [],
  hasLoadedMessages: false,
  createdAt: Date.now(),
  lastMessage: null,
  isSocialChannel: false,
  bumpStamp: Date.now(),
  conversationStatus: ConversationStatus.CREATED,
  ...conv,
});

const renderComponent = (props: Partial<typeof defaultProps> = {}, initialConversations: Channel[] = []) => {
  useSelectorMock.mockImplementation((selector) => {
    if (selector.name === 'allChannelsSelector') {
      return initialConversations;
    }
    if (selector.name === 'selectGetUser') {
      return (id: string) => createFullUser({ userId: id, firstName: 'Test', lastName: 'User' });
    }
    if (selector.name === 'selectCurrentUserId') {
      return 'test-user-id';
    }
    return undefined;
  });

  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <ConversationListPanel {...defaultProps} {...props} />
    </QueryClientProvider>
  );
};

describe('ConversationListPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentLastActiveTabInMock = null;
    useSelectorMock.mockImplementation((selector) => {
      const state: Partial<RootState> = {
        authentication: { user: { data: { id: 'test-user-id' } } } as any,
        normalized: { users: {} } as any,
        channelsList: { channels: [] } as any,
      };
      if (selector.name === 'allChannelsSelector') {
        return [];
      }
      if (selector.name === 'selectGetUser') {
        return () => (id: string) => createFullUser(state.normalized.users[id] || { userId: id });
      }
      if (selector.name === 'selectCurrentUserId') {
        return 'test-user-id';
      }
      return undefined;
    });
  });

  it('renders the search input and create conversation button when expanded', () => {
    renderComponent({ isCollapsed: false });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /icon/i })).toBeInTheDocument();
  });

  it('does not render search input and create button when collapsed', () => {
    renderComponent({ isCollapsed: true });
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /icon/i })).not.toBeInTheDocument();
  });

  it('renders "All" tab by default', () => {
    renderComponent();
    const allTab = screen.getByText('All');
    expect(allTab).toBeInTheDocument();
  });

  it('renders a list of conversations', () => {
    const conversations = [
      stubConversation({ id: 'convo-1', name: 'Conversation 1', bumpStamp: 1 }),
      stubConversation({ id: 'convo-2', name: 'Conversation 2', bumpStamp: 2 }),
    ];
    renderComponent({}, conversations);
    expect(screen.getByText('Conversation 1')).toBeInTheDocument();
    expect(screen.getByText('Conversation 2')).toBeInTheDocument();
  });

  it('displays empty state message for "All" tab when no conversations exist and not searching', () => {
    renderComponent({}, []);
    expect(screen.queryByText(/Right click a conversation to add it to the/i)).not.toBeInTheDocument();
  });

  it('displays specific empty state message for a label tab (e.g., Work) when no conversations exist for it', async () => {
    renderComponent({}, []);
    const workTab = screen.getByRole('tab', { name: /Work tab/i });
    fireEvent.click(workTab);
    await waitFor(() => {
      expect(screen.getByText(/Right click a conversation to add it to the work label/i)).toBeInTheDocument();
    });
  });
});

describe('Search Functionality', () => {
  beforeEach(() => {
    currentLastActiveTabInMock = null;
  });

  const conversations = [
    stubConversation({
      id: 'convo-1',
      name: 'General Chat',
      bumpStamp: 3,
      otherMembers: [
        createFullUser({ userId: 'user-a', firstName: 'Alice', lastName: 'A', matrixId: '@a:matrix.org' }),
      ],
    }),
    stubConversation({
      id: 'convo-2',
      name: 'Project Alpha',
      bumpStamp: 2,
      otherMembers: [createFullUser({ userId: 'user-b', firstName: 'Bob', lastName: 'B', matrixId: '@b:matrix.org' })],
    }),
    stubConversation({
      id: 'convo-3',
      name: 'Random Discussion',
      bumpStamp: 1,
      otherMembers: [
        createFullUser({ userId: 'user-c', firstName: 'Charlie', lastName: 'C', matrixId: '@c:matrix.org' }),
      ],
    }),
  ];

  it('filters conversation list on search input and clears filter', async () => {
    renderComponent({}, conversations);
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'General' } });

    await waitFor(() => {
      expect(
        screen.getByText(createHighlightedTextMatcher('General Chat', 'div.conversation-item__name'))
      ).toBeInTheDocument();
      expect(screen.queryByText('Project Alpha')).not.toBeInTheDocument();
      expect(screen.queryByText('Random Discussion')).not.toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getByText('General Chat')).toBeInTheDocument();
      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Random Discussion')).toBeInTheDocument();
    });
  });

  it('calls API for user search, displays results, and handles new conversation creation', async () => {
    const mockSearchProp = vi.fn().mockResolvedValue([
      {
        id: 'user-d',
        handle: 'david_h',
        profileImage: '',
        name: 'David',
        type: 'user',
        primaryZID: 'zid-d',
        primaryWalletAddress: '0x123',
      },
      {
        id: 'user-e',
        handle: 'eve_h',
        profileImage: '',
        name: 'Eve',
        type: 'user',
        primaryZID: 'zid-e',
        primaryWalletAddress: '0x456',
      },
    ] as _MemberNetworks[]);
    const mockCreateConversationProp = vi.fn();
    renderComponent({ search: mockSearchProp, onCreateConversation: mockCreateConversationProp }, conversations);
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'David' } });

    await waitFor(() => {
      expect(mockSearchProp).toHaveBeenCalledWith('David');
      expect(
        screen.getByText(createHighlightedTextMatcher('David', 'div.user-search-results__label'))
      ).toBeInTheDocument();
      expect(screen.getByText('Eve')).toBeInTheDocument();
    });

    const davidResult = screen.getByText(createHighlightedTextMatcher('David', 'div.user-search-results__label'));
    fireEvent.click(davidResult);

    await waitFor(() => {
      expect(mockCreateConversationProp).toHaveBeenCalledWith('user-d');
      expect(searchInput).toHaveValue('');
      expect(
        screen.queryByText(createHighlightedTextMatcher('David', 'div.user-search-results__label'))
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Eve')).not.toBeInTheDocument();
    });
  });

  it('displays "No results for [filter]" message when search yields no matches', async () => {
    const mockSearchProp = vi.fn().mockResolvedValue([]);
    const initialConversations = [
      stubConversation({
        id: 'convo-x',
        name: 'Xylophone Club',
        otherMembers: [createFullUser({ userId: 'user-x', firstName: 'Xena' })],
      }),
    ];
    renderComponent({ search: mockSearchProp }, initialConversations);
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
    await waitFor(() => {
      expect(mockSearchProp).toHaveBeenCalledWith('NonExistent');
      expect(screen.queryByText('Xylophone Club')).not.toBeInTheDocument();
      expect(screen.getByText(/No results for 'NonExistent'/i)).toBeInTheDocument();
    });
  });
});

describe('Tab Interactions & State Management', () => {
  const conversationsWithLabels = [
    stubConversation({
      id: 'convo-fav-1',
      name: 'Favorite Chat 1',
      labels: [_DefaultRoomLabels.FAVORITE],
      bumpStamp: 10,
      unreadCount: { total: 1, highlight: 0 },
    }),
    stubConversation({ id: 'convo-work-1', name: 'Work Project A', labels: [_DefaultRoomLabels.WORK], bumpStamp: 9 }),
    stubConversation({
      id: 'convo-archived-1',
      name: 'Old Archived Thing',
      labels: [_DefaultRoomLabels.ARCHIVED],
      bumpStamp: 1,
    }),
    stubConversation({
      id: 'convo-all-1',
      name: 'General Discussion',
      bumpStamp: 8,
      unreadCount: { total: 3, highlight: 1 },
    }),
    stubConversation({
      id: 'convo-fav-2',
      name: 'Favorite Chat 2',
      labels: [_DefaultRoomLabels.FAVORITE],
      bumpStamp: 7,
      unreadCount: { total: 2, highlight: 0 },
    }),
  ];

  it('clicking a tab filters conversations, updates active tab, and persists selection', async () => {
    renderComponent({}, conversationsWithLabels);

    const workTab = screen.getByRole('tab', { name: /Work tab/i });
    fireEvent.click(workTab);

    await waitFor(() => {
      expect(workTab).toHaveClass(getClassName('tab', 'active'));
      expect(workTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Work Project A')).toBeInTheDocument();
      expect(screen.queryByText('Favorite Chat 1')).not.toBeInTheDocument();
      expect(screen.queryByText('General Discussion')).not.toBeInTheDocument();
      expect(mockSetLastActiveTab).toHaveBeenCalledWith(_Tab.Work);
    });

    mockSetLastActiveTab.mockClear();

    const favoritesTab = screen.getByRole('tab', { name: /Favorites tab/i });
    fireEvent.click(favoritesTab);

    await waitFor(() => {
      expect(favoritesTab).toHaveClass(getClassName('tab', 'active'));
      expect(favoritesTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Favorite Chat 1')).toBeInTheDocument();
      expect(screen.getByText('Favorite Chat 2')).toBeInTheDocument();
      expect(screen.queryByText('Work Project A')).not.toBeInTheDocument();
      expect(mockSetLastActiveTab).toHaveBeenCalledWith(_Tab.Favorites);
    });

    const archivedTab = screen.getByRole('tab', { name: /Archived tab/i });
    fireEvent.click(archivedTab);

    await waitFor(() => {
      expect(archivedTab).toHaveClass(getClassName('tab', 'active'));
      expect(archivedTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Old Archived Thing')).toBeInTheDocument();
      expect(screen.queryByText('Favorite Chat 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Work Project A')).not.toBeInTheDocument();
      expect(mockSetLastActiveTab).toHaveBeenCalledWith(_Tab.Archived);
    });
  });

  it('initial tab selection is Last Active Tab if available', () => {
    mockGetLastActiveTab.mockReturnValue(_Tab.Work);
    renderComponent({}, conversationsWithLabels);

    const workTab = screen.getByRole('tab', { name: /Work tab/i });
    expect(workTab).toHaveClass(getClassName('tab', 'active'));
    expect(workTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Work Project A')).toBeInTheDocument();
    expect(screen.queryByText('Favorite Chat 1')).not.toBeInTheDocument();
  });

  it('initial tab selection falls back to Favorites if no last active and favorites exist', () => {
    mockGetLastActiveTab.mockReturnValue(null);
    const conversationsWithOnlyFavorites = [
      stubConversation({ id: 'fav-only', name: 'Only Favorite', labels: [_DefaultRoomLabels.FAVORITE] }),
    ];
    renderComponent({ isLabelDataLoaded: true }, conversationsWithOnlyFavorites);

    const favoritesTab = screen.getByRole('tab', { name: /Favorites tab/i });
    expect(favoritesTab).toHaveClass(getClassName('tab', 'active'));
    expect(favoritesTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Only Favorite')).toBeInTheDocument();
  });

  it('initial tab selection falls back to All if no last active and no favorites', () => {
    mockGetLastActiveTab.mockReturnValue(null);
    const conversationsWithoutFavorites = [
      stubConversation({ id: 'work-only', name: 'Only Work', labels: [_DefaultRoomLabels.WORK] }),
      stubConversation({ id: 'general', name: 'A General Convo' }),
    ];
    renderComponent({ isLabelDataLoaded: true }, conversationsWithoutFavorites);

    const allTab = screen.getByRole('tab', { name: /All tab/i });
    expect(allTab).toHaveClass(getClassName('tab', 'active'));
    expect(allTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Only Work')).toBeInTheDocument();
    expect(screen.getByText('A General Convo')).toBeInTheDocument();
  });

  it('unread count badges on tabs display correctly for initial conversations', () => {
    renderComponent({}, conversationsWithLabels);

    const favoritesTab = screen.getByRole('tab', { name: /Favorites tab/i });
    const favoritesBadge = favoritesTab.querySelector('.' + getClassName('tab-badge') + ' span');
    expect(favoritesBadge).toBeInTheDocument();
    expect(favoritesBadge).toHaveTextContent('3');

    const allTab = screen.getByRole('tab', { name: /All tab/i });
    const allBadge = allTab.querySelector('.' + getClassName('tab-badge') + ' span');
    expect(allBadge).toBeInTheDocument();
    expect(allBadge).toHaveTextContent('6');

    const workTab = screen.getByRole('tab', { name: /Work tab/i });
    const workBadge = workTab.querySelector('.' + getClassName('tab-badge') + ' span');
    expect(workBadge).not.toBeInTheDocument();
  });

  it('unread count badges on "All" tab display correctly with many unread conversations', () => {
    const manyUnreadConversations = [
      stubConversation({ id: 'unread-1', name: 'Unread 1', unreadCount: { total: 50, highlight: 0 } }),
      stubConversation({ id: 'unread-2', name: 'Unread 2', unreadCount: { total: 50, highlight: 0 } }),
    ];
    renderComponent({}, manyUnreadConversations);
    const allTabMany = screen.getByRole('tab', { name: /All tab/i });
    const allBadgeMany = allTabMany.querySelector('.' + getClassName('tab-badge') + ' span');
    expect(allBadgeMany).toBeInTheDocument();
    expect(allBadgeMany).toHaveTextContent('99+');
  });
});

describe('Conversation List Operations & Interactions', () => {
  const initialConversations = [
    stubConversation({
      id: 'convo-1',
      name: 'Chat Alpha',
      bumpStamp: 100,
      unreadCount: { total: 1, highlight: 0 },
      otherMembers: [createFullUser({ userId: 'user-alpha' })],
    }),
    stubConversation({
      id: 'convo-2',
      name: 'Chat Beta',
      bumpStamp: 99,
      otherMembers: [createFullUser({ userId: 'user-beta' })],
    }),
    stubConversation({
      id: 'convo-3',
      name: 'Chat Gamma',
      bumpStamp: 98,
      otherMembers: [createFullUser({ userId: 'user-gamma' })],
    }),
  ];

  it('clicking a conversation item dispatches openConversation and clears search', async () => {
    renderComponent({ activeConversationId: '' }, initialConversations);
    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    let nameElement: HTMLElement | null = null;
    await waitFor(() => {
      nameElement = screen.getByText(createHighlightedTextMatcher('Chat Alpha', '.conversation-item__name'));
      expect(nameElement).toBeInTheDocument();
    });

    if (!nameElement) {
      throw new Error('Name element not found');
    }

    const conversationItem = nameElement.closest('[role="button"]');
    if (!conversationItem) {
      throw new Error('Conversation item button not found');
    }

    fireEvent.click(conversationItem);

    await waitFor(() => {
      expect(openConversation).toHaveBeenCalledWith({ conversationId: 'convo-1' });
      expect(mockDispatch).toHaveBeenCalledWith(openConversation({ conversationId: 'convo-1' }));
      expect(searchInput).toHaveValue('');
    });
  });

  it('infinite scroll loads more conversations and displays a loading indicator', async () => {
    const manyConversations = Array.from({ length: 40 }, (_, i) =>
      stubConversation({ id: `convo-${i}`, name: `Conversation ${i}`, bumpStamp: Date.now() - i * 1000 })
    );

    renderComponent({}, manyConversations);

    expect(screen.getAllByText(/Conversation \d+/i).length).toBe(20);

    await waitFor(
      () => {
        expect(screen.getAllByText(/Conversation \d+/i).length).toBe(40);
      },
      { timeout: 2000 }
    );

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('onAddLabel (from ConversationItem) dispatches onAddLabel action', () => {
    renderComponent({}, [initialConversations[0]]);
    const payload = { roomId: 'convo-1', label: _DefaultRoomLabels.FAVORITE };

    mockDispatch(onAddLabel(payload));

    expect(onAddLabel).toHaveBeenCalledWith(payload);
    expect(mockDispatch).toHaveBeenCalledWith(onAddLabel(payload));
  });

  it('onRemoveLabel (from ConversationItem) dispatches onRemoveLabel action', () => {
    renderComponent({}, [initialConversations[0]]);
    const payload = { roomId: 'convo-1', label: _DefaultRoomLabels.FAVORITE };

    mockDispatch(onRemoveLabel(payload));

    expect(onRemoveLabel).toHaveBeenCalledWith(payload);
    expect(mockDispatch).toHaveBeenCalledWith(onRemoveLabel(payload));
  });
});

describe('Collapsed State Visuals', () => {
  it('tab list is not rendered when the panel is collapsed', () => {
    renderComponent({ isCollapsed: true }, []);

    const tabList = document.querySelector('.' + getClassName('tab-list'));
    expect(tabList).not.toBeInTheDocument();

    expect(screen.queryByRole('tab', { name: /All tab/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Favorites tab/i })).not.toBeInTheDocument();
  });
});

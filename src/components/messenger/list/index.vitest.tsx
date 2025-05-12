import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MessengerList } from '.';
import { Stage as SagaStage } from '../../../store/create-conversation';
import ImportedCreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel as ImportedConversationListPanel } from './conversation-list-panel';
import { GroupDetailsPanel as ImportedGroupDetailsPanel } from './group-details-panel';

// --- Define Core Mock Functions FIRST ---
const mockReduxDispatch = vi.fn();
const mockUseSelectorFn = vi.fn();

// --- Explicitly Mock react-redux LAZILY ---
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => mockReduxDispatch,
    useSelector: (selector: any) => mockUseSelectorFn(selector),
  };
});

// --- Mock child components ---
vi.mock('./create-conversation-panel', () => ({
  default: vi.fn((props) => (
    <div data-testid='create-conversation-panel' {...props}>
      CreateConversationPanel
    </div>
  )),
}));
vi.mock('./conversation-list-panel', () => ({
  ConversationListPanel: vi.fn((props) => (
    <div data-testid='conversation-list-panel' {...props}>
      ConversationListPanel
    </div>
  )),
}));
vi.mock('./group-details-panel', () => ({
  GroupDetailsPanel: vi.fn((props) => (
    <div data-testid='group-details-panel' {...props}>
      GroupDetailsPanel
    </div>
  )),
}));
vi.mock('../../sidekick/components/content', () => ({
  Content: vi.fn(({ children }) => <div data-testid='sidekick-content'>{children}</div>),
}));
vi.mock('@zero-tech/zui/components', () => ({
  Modal: vi.fn(({ children, open }) => (open ? <div data-testid='modal'>{children}</div> : null)),
}));
vi.mock('../../error-dialog', () => ({
  ErrorDialog: vi.fn(({ header, body, linkText, linkPath, onClose }) => (
    <div
      data-testid='error-dialog'
      data-header={header}
      data-body={body}
      data-linktext={linkText}
      data-linkpath={linkPath}
      onClick={onClose}
    >
      ErrorDialog Content: {header} {body}
    </div>
  )),
}));
vi.mock('../../rewards-modal/container', () => ({
  RewardsModalContainer: vi.fn(() => <div data-testid='rewards-modal-container'>RewardsModalContainer</div>),
}));
vi.mock('../../invite-dialog/container', () => ({
  InviteDialogContainer: vi.fn(() => <div data-testid='invite-dialog-container'>InviteDialogContainer</div>),
}));
vi.mock('./group-details-panel/group-type-dialog', () => ({
  GroupTypeDialog: vi.fn(() => <div data-testid='group-type-dialog'>GroupTypeDialog</div>),
}));
vi.mock('@zero-tech/zui/components/Button', () => ({
  Button: vi.fn(({ children, onPress, startEnhancer, ...props }) => (
    <button onClick={onPress} {...props} data-testid='zui-button'>
      {startEnhancer}
      {children}
    </button>
  )),
}));
vi.mock('@zero-tech/zui/icons', () => ({
  IconPlus: vi.fn(() => <svg data-testid='icon-plus' />),
}));

// --- Mock API (using lazy wrapper) ---
const mockSearchMyNetworksByName = vi.fn();
vi.mock('../../../platform-apps/channels/util/api', () => ({
  searchMyNetworksByName: (...args: any[]) => mockSearchMyNetworksByName(...args),
}));

// --- Mock Redux actions (define mocks) ---
const mockBack = vi.fn(() => ({ type: 'MOCK_BACK_ACTION' }));
const mockCreateConversation = vi.fn((payload) => ({ type: 'MOCK_CREATE_CONVERSATION_ACTION', payload }));
const mockCreateUnencryptedConversation = vi.fn((payload) => ({
  type: 'MOCK_CREATE_UNENCRYPTED_CONVERSATION_ACTION',
  payload,
}));
const mockMembersSelected = vi.fn((payload) => ({ type: 'MOCK_MEMBERS_SELECTED_ACTION', payload }));
const mockCloseConversationErrorDialog = vi.fn(() => ({ type: 'MOCK_CLOSE_ERROR_DIALOG_ACTION' }));
const mockCloseRewardsDialog = vi.fn(() => ({ type: 'MOCK_CLOSE_REWARDS_DIALOG_ACTION' }));
const mockReceiveSearchResultsAction = vi.fn((payload) => ({ type: 'MOCK_RECEIVE_SEARCH_RESULTS_ACTION', payload }));

// --- Mock Store modules (using lazy wrappers) ---
vi.mock('../../../store/create-conversation', async () => {
  const actual = await vi.importActual('../../../store/create-conversation');
  const { Stage: ActualSagaStageForMock } = actual;
  return {
    ...actual,
    Stage: ActualSagaStageForMock,
    back: () => mockBack(),
    createConversation: (payload?: any) => mockCreateConversation(payload),
    createUnencryptedConversation: (payload?: any) => mockCreateUnencryptedConversation(payload),
    membersSelected: (payload?: any) => mockMembersSelected(payload),
  };
});
vi.mock('../../../store/chat', async () => {
  const actual = await vi.importActual('../../../store/chat');
  return {
    ...actual,
    closeConversationErrorDialog: () => mockCloseConversationErrorDialog(),
  };
});
vi.mock('../../../store/rewards', async () => {
  const actual = await vi.importActual('../../../store/rewards');
  return {
    ...actual,
    closeRewardsDialog: () => mockCloseRewardsDialog(),
  };
});
vi.mock('../../../store/users', async () => {
  const actual = await vi.importActual('../../../store/users');
  return {
    ...actual,
    receiveSearchResults: (payload?: any) => mockReceiveSearchResultsAction(payload),
  };
});

const defaultProps = {};

describe('MessengerList', () => {
  let mockReduxState: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReduxState = {
      stage: SagaStage.None,
      groupUsers: [],
      isFetchingExistingConversations: false,
      currentUserId: 'default-test-user-id',
      activeConversationId: undefined,
      joinRoomErrorContent: undefined,
      isRewardsDialogOpen: false,
      isSecondaryConversationDataLoaded: true,
      usersMap: {},
    };
    mockUseSelectorFn.mockImplementation((selectorFn: (state: any) => any) => {
      const fullMockState = {
        createConversation: {
          stage: mockReduxState.stage,
          groupUsers: mockReduxState.groupUsers,
          startGroupChat: { isLoading: mockReduxState.isFetchingExistingConversations },
        },
        authentication: { user: { data: { id: mockReduxState.currentUserId } } },
        chat: {
          activeConversationId: mockReduxState.activeConversationId,
          joinRoomErrorContent: mockReduxState.joinRoomErrorContent,
          isSecondaryConversationDataLoaded: mockReduxState.isSecondaryConversationDataLoaded,
        },
        rewards: { showRewardsInPopup: mockReduxState.isRewardsDialogOpen },
        normalized: { users: mockReduxState.usersMap },
      };
      return selectorFn(fullMockState);
    });
  });

  const renderComponent = (initialStateOverrides = {}) => {
    mockReduxState = { ...mockReduxState, ...initialStateOverrides };
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, networkMode: 'offlineFirst' } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MessengerList {...defaultProps} />
      </QueryClientProvider>
    );
  };

  describe('Rendering based on Stage', () => {
    it('renders ConversationListPanel and footer button when stage is None', () => {
      renderComponent({ stage: SagaStage.None });
      expect(screen.getByTestId('conversation-list-panel')).toBeInTheDocument();
      const footerButton = screen.getByTestId('zui-button');
      expect(footerButton).toHaveTextContent('Invite Friends');
      expect(screen.getByTestId('icon-plus')).toBeInTheDocument();

      expect(screen.queryByTestId('create-conversation-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('group-details-panel')).not.toBeInTheDocument();
    });

    it('renders CreateConversationPanel when stage is InitiateConversation', () => {
      renderComponent({ stage: SagaStage.InitiateConversation });
      expect(screen.getByTestId('create-conversation-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('conversation-list-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('group-details-panel')).not.toBeInTheDocument();
      expect(screen.queryByText('Invite Friends')).not.toBeInTheDocument();
    });

    it('renders GroupDetailsPanel when stage is GroupDetails', () => {
      renderComponent({ stage: SagaStage.GroupDetails });
      expect(screen.getByTestId('group-details-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('conversation-list-panel')).not.toBeInTheDocument();
      expect(screen.queryByTestId('create-conversation-panel')).not.toBeInTheDocument();
      expect(screen.queryByText('Invite Friends')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('dispatches back action when onBack is called from CreateConversationPanel', () => {
      renderComponent({ stage: SagaStage.InitiateConversation });
      const panelMockProps = vi.mocked(ImportedCreateConversationPanel).mock.lastCall?.[0];
      expect(panelMockProps?.onBack).toBeInstanceOf(Function);
      panelMockProps?.onBack();

      expect(mockBack).toHaveBeenCalledTimes(1);
      expect(mockReduxDispatch).toHaveBeenCalledWith(mockBack());
    });

    it('dispatches back action when onBack is called from GroupDetailsPanel', () => {
      renderComponent({ stage: SagaStage.GroupDetails });
      const panelMockProps = vi.mocked(ImportedGroupDetailsPanel).mock.lastCall?.[0];
      expect(panelMockProps?.onBack).toBeInstanceOf(Function);
      panelMockProps?.onBack();

      expect(mockBack).toHaveBeenCalledTimes(1);
      expect(mockReduxDispatch).toHaveBeenCalledWith(mockBack());
    });
  });

  describe('User Search', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      mockSearchMyNetworksByName.mockResolvedValue([]);
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    const apiUsersResponse = [
      { id: 'userA', name: 'User A', profileImage: 'api_A.png' },
      { id: 'userB', name: 'User B', profileImage: 'api_B.png' },
      { id: 'componentCurrentUser', name: 'Current User', profileImage: 'api_Current.png' },
    ];

    const testUserSearch = async (panelStage: SagaStage, PanelMockComponent: any) => {
      mockSearchMyNetworksByName.mockResolvedValue(apiUsersResponse);
      const currentUserIdInState = 'componentCurrentUser';
      const usersMapInState = { userA: { id: 'userA', profileImage: 'state_A.png' } as any };

      renderComponent({
        stage: panelStage,
        currentUserId: currentUserIdInState,
        usersMap: usersMapInState,
      });

      const panelProps = vi.mocked(PanelMockComponent).mock.lastCall?.[0];
      expect(panelProps.search).toBeInstanceOf(Function);

      panelProps.search('find test users');

      await vi.runAllTimersAsync();

      const expectedDispatchedUsers = [
        { id: 'userA', name: 'User A', profileImage: 'state_A.png', image: 'state_A.png' },
        { id: 'userB', name: 'User B', profileImage: 'api_B.png', image: 'api_B.png' },
      ];

      expect(mockSearchMyNetworksByName).toHaveBeenCalledWith('find test users');
      expect(mockReduxDispatch).toHaveBeenCalledWith(mockReceiveSearchResultsAction(expectedDispatchedUsers));
      expect(mockReceiveSearchResultsAction).toHaveBeenCalledWith(expectedDispatchedUsers);
    };

    it('searches users via ConversationListPanel, respecting usersMap and currentUserId', async () => {
      await testUserSearch(SagaStage.None, ImportedConversationListPanel);
    });

    it('searches users via CreateConversationPanel, respecting usersMap and currentUserId', async () => {
      await testUserSearch(SagaStage.InitiateConversation, ImportedCreateConversationPanel);
    });
  });

  describe('One-on-One Conversation', () => {
    it('dispatches createConversation action when onCreateOneOnOne is called', () => {
      renderComponent({ stage: SagaStage.InitiateConversation });
      const panelProps = vi.mocked(ImportedCreateConversationPanel).mock.lastCall?.[0];
      expect(panelProps?.onCreateOneOnOne).toBeInstanceOf(Function);

      const targetUserId = 'user-to-chat-with';
      panelProps?.onCreateOneOnOne(targetUserId);

      const expectedPayload = { userIds: [targetUserId] };
      expect(mockCreateConversation).toHaveBeenCalledWith(expectedPayload);
      expect(mockReduxDispatch).toHaveBeenCalledWith(mockCreateConversation(expectedPayload));
    });
  });

  describe('Group Conversation', () => {
    const selectedUsersOption = [
      { value: 'user1', label: 'User 1' },
      { value: 'user2', label: 'User 2' },
    ];

    it('dispatches membersSelected action from CreateConversationPanel.onStartGroup', () => {
      renderComponent({ stage: SagaStage.InitiateConversation });
      const panelProps = vi.mocked(ImportedCreateConversationPanel).mock.lastCall?.[0];
      expect(panelProps?.onStartGroup).toBeInstanceOf(Function);
      panelProps?.onStartGroup(selectedUsersOption);

      const expectedPayload = { users: selectedUsersOption };
      expect(mockMembersSelected).toHaveBeenCalledWith(expectedPayload);
      expect(mockReduxDispatch).toHaveBeenCalledWith(mockMembersSelected(expectedPayload));
    });

    it('dispatches createConversation (encrypted) from GroupDetailsPanel.onCreate', () => {
      renderComponent({ stage: SagaStage.GroupDetails });
      const panelProps = vi.mocked(ImportedGroupDetailsPanel).mock.lastCall?.[0];
      expect(panelProps?.onCreate).toBeInstanceOf(Function);

      const groupDetails = {
        name: 'Encrypted Group',
        users: selectedUsersOption,
        image: new File([''], 'test.png', { type: 'image/png' }),
        groupType: 'encrypted',
      };
      panelProps?.onCreate(groupDetails);

      const expectedPayload = {
        name: groupDetails.name,
        userIds: selectedUsersOption.map((u) => u.value),
        image: groupDetails.image,
        groupType: groupDetails.groupType,
      };
      expect(mockCreateConversation).toHaveBeenCalledWith(expectedPayload);
      expect(mockReduxDispatch).toHaveBeenCalledWith(mockCreateConversation(expectedPayload));
      expect(mockCreateUnencryptedConversation).not.toHaveBeenCalled();
    });

    it('dispatches createUnencryptedConversation from GroupDetailsPanel.onCreate', () => {
      renderComponent({ stage: SagaStage.GroupDetails });
      const panelProps = vi.mocked(ImportedGroupDetailsPanel).mock.lastCall?.[0];
      expect(panelProps?.onCreate).toBeInstanceOf(Function);

      const groupDetails = { name: 'Social Group', users: selectedUsersOption, groupType: 'social', image: undefined };
      panelProps?.onCreate(groupDetails);

      const expectedPayload = {
        name: groupDetails.name,
        userIds: selectedUsersOption.map((u) => u.value),
        image: undefined,
        groupType: groupDetails.groupType,
      };
      expect(mockCreateUnencryptedConversation).toHaveBeenCalledWith(expectedPayload);
      expect(mockReduxDispatch).toHaveBeenCalledWith(mockCreateUnencryptedConversation(expectedPayload));
      expect(mockCreateConversation).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('passes isSubmitting=true to CreateConversationPanel when isFetchingExistingConversations is true', () => {
      renderComponent({ stage: SagaStage.InitiateConversation, isFetchingExistingConversations: true });
      const panelProps = vi.mocked(ImportedCreateConversationPanel).mock.lastCall?.[0];
      expect(panelProps?.isSubmitting).toBe(true);
    });

    it('passes isSubmitting=false to CreateConversationPanel when isFetchingExistingConversations is false', () => {
      renderComponent({ stage: SagaStage.InitiateConversation, isFetchingExistingConversations: false });
      const panelProps = vi.mocked(ImportedCreateConversationPanel).mock.lastCall?.[0];
      expect(panelProps?.isSubmitting).toBe(false);
    });
  });

  describe('Error Dialog', () => {
    const errorContent = {
      header: 'Test Error',
      body: 'Something bad happened.',
      linkText: 'Details',
      linkPath: '/details',
    };

    it('displays error dialog when joinRoomErrorContent is present', () => {
      renderComponent({ joinRoomErrorContent: errorContent });
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      const errorDialogElement = screen.getByTestId('error-dialog');
      expect(errorDialogElement).toBeInTheDocument();

      expect(errorDialogElement).toHaveAttribute('data-header', errorContent.header);
      expect(errorDialogElement).toHaveAttribute('data-body', errorContent.body);
      expect(errorDialogElement).toHaveAttribute('data-linktext', errorContent.linkText);
      expect(errorDialogElement).toHaveAttribute('data-linkpath', errorContent.linkPath);
    });

    it('does not display error dialog when joinRoomErrorContent is null', () => {
      renderComponent({ joinRoomErrorContent: null });
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      expect(screen.queryByTestId('error-dialog')).not.toBeInTheDocument();
    });

    it('dispatches closeConversationErrorDialog action when dialog is dismissed', () => {
      renderComponent({ joinRoomErrorContent: errorContent });
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      const errorDialogElement = screen.getByTestId('error-dialog');
      expect(errorDialogElement).toBeInTheDocument();

      fireEvent.click(errorDialogElement);

      expect(mockReduxDispatch).toHaveBeenCalledTimes(1);
      expect(mockReduxDispatch).toHaveBeenCalledWith(mockCloseConversationErrorDialog());
    });
  });
});

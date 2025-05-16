import { screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ChatViewContainer, PublicProperties } from './chat-view-container';
import { renderWithProviders } from '../../test-utils';
import { mockAuthenticationState } from '../../store/authentication/test/mocks';
import { mockGroupManagementState } from '../../store/group-management/test/mocks';
import { mockMatrixState } from '../../store/matrix/test/mocks';
import { useChannelSelector as importedUseChannelSelector } from '../../store/hooks';
import { isOneOnOne as importedIsOneOnOne } from '../../store/channels-list/utils';
import { fetch as importedFetchMessages, syncMessages as importedSyncMessages } from '../../store/messages';
import {
  openCreateBackupDialog as importedOpenCreateBackupDialog,
  openRestoreBackupDialog as importedOpenRestoreBackupDialog,
} from '../../store/matrix';
import { ChatView as ImportedChatView } from './chat-view';
import { NormalizedChannel, MessagesFetchState, CHANNEL_DEFAULTS } from '../../store/channels';

vi.mock('../../store/messages', async () => {
  const actual = await vi.importActual('../../store/messages');
  return {
    ...actual,
    fetch: vi.fn((payload) => ({ type: 'FETCH_MESSAGES', payload })),
    syncMessages: vi.fn((payload) => ({ type: 'SYNC_MESSAGES', payload })),
  };
});

vi.mock('../../store/matrix', async () => {
  const actual = await vi.importActual('../../store/matrix');
  return {
    ...actual,
    openCreateBackupDialog: vi.fn(() => ({ type: 'OPEN_CREATE_BACKUP_DIALOG' })),
    openRestoreBackupDialog: vi.fn(() => ({ type: 'OPEN_RESTORE_BACKUP_DIALOG' })),
  };
});

vi.mock('../../store/channels-list/utils', () => ({
  isOneOnOne: vi.fn(),
}));

vi.mock('../../store/hooks', () => ({
  useChannelSelector: vi.fn(),
}));

vi.mock('./chat-view', () => ({
  ChatView: vi.fn(({ onFetchMore, onReload, onHiddenMessageInfoClick, ...props }, ref) => {
    console.log('ref', ref);
    return (
      <div data-testid='chat-view' {...props}>
        <button onClick={() => onFetchMore?.(12345)}>Fetch More</button>
        <button onClick={onReload}>Reload</button>
        <button onClick={onHiddenMessageInfoClick}>Hidden Info</button>
      </div>
    );
  }),
}));

const mockUseChannelSelector = vi.mocked(importedUseChannelSelector);
const mockIsOneOnOneUtil = vi.mocked(importedIsOneOnOne);
const mockFetchMessages = vi.mocked(importedFetchMessages);
const mockSyncMessages = vi.mocked(importedSyncMessages);
const mockOpenCreateBackupDialog = vi.mocked(importedOpenCreateBackupDialog);
const mockOpenRestoreBackupDialog = vi.mocked(importedOpenRestoreBackupDialog);
const MockedChatView = vi.mocked(ImportedChatView);

interface TestPreloadedState {
  authentication: typeof mockAuthenticationState;
  groupManagement: typeof mockGroupManagementState;
  matrix: typeof mockMatrixState;
}

describe('ChatViewContainer', () => {
  const testUser = {
    ...mockAuthenticationState.user.data,
    id: 'user-1',
  };

  const defaultChannel: NormalizedChannel = {
    ...CHANNEL_DEFAULTS,
    id: 'channel-1',
    name: 'Test Channel',
    bumpStamp: Date.now(),
  };

  const basePreloadedState: TestPreloadedState = {
    authentication: {
      ...mockAuthenticationState,
      user: { ...mockAuthenticationState.user, data: testUser },
    },
    groupManagement: { ...mockGroupManagementState, isSecondarySidekickOpen: false },
    matrix: { ...mockMatrixState, backupExists: false },
  };
  const defaultProps: PublicProperties = {
    channelId: 'channel-1',
  };

  const renderComponent = (
    partialProps: Partial<PublicProperties> = {},
    partialStateOverrides: Partial<TestPreloadedState> = {}
  ) => {
    const finalProps = { ...defaultProps, ...partialProps };

    const mergedState: TestPreloadedState = {
      authentication: {
        ...basePreloadedState.authentication,
        ...(partialStateOverrides.authentication || {}),
        user: {
          ...basePreloadedState.authentication.user,
          ...(partialStateOverrides.authentication?.user || {}),
          data:
            partialStateOverrides.authentication?.user?.data !== undefined
              ? partialStateOverrides.authentication.user.data
              : basePreloadedState.authentication.user.data,
        },
      },
      groupManagement: {
        ...basePreloadedState.groupManagement,
        ...(partialStateOverrides.groupManagement || {}),
      },
      matrix: {
        ...basePreloadedState.matrix,
        ...(partialStateOverrides.matrix || {}),
      },
    };

    return renderWithProviders(<ChatViewContainer {...finalProps} />, {
      preloadedState: mergedState,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseChannelSelector.mockReturnValue(defaultChannel);
    mockIsOneOnOneUtil.mockReturnValue(false);
  });

  // 1. Basic Rendering
  it('renders null when the channel is not found', () => {
    mockUseChannelSelector.mockReturnValue(null);
    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it('renders ChatView when a valid channel is found', () => {
    renderComponent();
    expect(screen.getByTestId('chat-view')).toBeInTheDocument();
  });

  it('passes className prop to ChatView', () => {
    renderComponent({ className: 'custom-class' });
    expect(screen.getByTestId('chat-view')).toHaveClass('custom-class');
  });

  // 2. Initial Data Fetching and Syncing
  it('dispatches fetchMessages if channelId is provided and hasLoadedMessages is false', () => {
    mockUseChannelSelector.mockReturnValue({ ...defaultChannel, hasLoadedMessages: false });
    renderComponent();
    expect(mockFetchMessages).toHaveBeenCalledWith({ channelId: defaultProps.channelId });
  });

  it('dispatches syncMessages if channelId is provided and hasLoadedMessages is true', () => {
    mockUseChannelSelector.mockReturnValue({ ...defaultChannel, hasLoadedMessages: true });
    renderComponent();
    expect(mockSyncMessages).toHaveBeenCalledWith({ channelId: defaultProps.channelId });
  });

  // 3. Channel ID Changes
  it('dispatches fetchMessages when channelId prop changes', () => {
    const { rerender } = renderComponent({ channelId: 'channel-1' });
    expect(mockFetchMessages).toHaveBeenCalledWith({ channelId: 'channel-1' });
    mockFetchMessages.mockClear();

    const newChannel: NormalizedChannel = { ...defaultChannel, id: 'channel-2', hasLoadedMessages: false };
    mockUseChannelSelector.mockImplementation((id) => (id === 'channel-2' ? newChannel : defaultChannel));

    rerender(<ChatViewContainer channelId='channel-2' />);
    expect(mockFetchMessages).toHaveBeenCalledWith({ channelId: 'channel-2' });
  });

  // 4. User Authentication Changes
  it('dispatches fetchMessages when user changes from null to a valid user', () => {
    const stateWithNullUser: Partial<TestPreloadedState> = {
      authentication: {
        ...basePreloadedState.authentication,
        user: { ...basePreloadedState.authentication.user, data: null },
      },
    };
    renderComponent({}, stateWithNullUser);
    expect(mockFetchMessages).not.toHaveBeenCalled();
    mockFetchMessages.mockClear();

    renderComponent(
      {},
      {
        authentication: {
          ...basePreloadedState.authentication,
          user: { ...basePreloadedState.authentication.user, data: testUser },
        },
      }
    );
    expect(mockFetchMessages).toHaveBeenCalledWith({ channelId: defaultProps.channelId });
  });

  // 5. Interaction Handlers (Callbacks to ChatView)
  it('dispatches fetchMessages with referenceTimestamp on onFetchMore', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Fetch More'));
    expect(mockFetchMessages).toHaveBeenCalledWith({ channelId: defaultProps.channelId, referenceTimestamp: 12345 });
  });

  it('dispatches fetchMessages on onReload', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Reload'));
    expect(mockFetchMessages).toHaveBeenCalledTimes(2);
    expect(mockFetchMessages).toHaveBeenLastCalledWith({ channelId: defaultProps.channelId });
  });

  it('dispatches openCreateBackupDialog on onHiddenMessageInfoClick when backupExists is false', () => {
    renderComponent({}, { matrix: { ...basePreloadedState.matrix, backupExists: false } });
    fireEvent.click(screen.getByText('Hidden Info'));
    expect(mockOpenCreateBackupDialog).toHaveBeenCalled();
  });

  it('dispatches openRestoreBackupDialog on onHiddenMessageInfoClick when backupExists is true', () => {
    renderComponent({}, { matrix: { ...basePreloadedState.matrix, backupExists: true } });
    fireEvent.click(screen.getByText('Hidden Info'));
    expect(mockOpenRestoreBackupDialog).toHaveBeenCalled();
  });

  // 6. Props Propagation to ChatView
  it('passes correct props to ChatView', () => {
    const channelForPropTest: NormalizedChannel = {
      ...defaultChannel,
      id: 'channel-prop-test',
      messagesFetchStatus: MessagesFetchState.IN_PROGRESS,
      hasLoadedMessages: true,
      name: 'Prop Test Channel',
    };
    mockUseChannelSelector.mockReturnValue(channelForPropTest);
    mockIsOneOnOneUtil.mockReturnValue(true);

    renderComponent(
      { channelId: channelForPropTest.id },
      {
        groupManagement: { ...basePreloadedState.groupManagement, isSecondarySidekickOpen: true },
      }
    );

    expect(MockedChatView).toHaveBeenCalledWith(
      expect.objectContaining({
        id: channelForPropTest.id,
        messagesFetchStatus: channelForPropTest.messagesFetchStatus,
        hasLoadedMessages: channelForPropTest.hasLoadedMessages,
        isOneOnOne: true,
        isSecondarySidekickOpen: true,
      }),
      expect.anything()
    );
  });
});

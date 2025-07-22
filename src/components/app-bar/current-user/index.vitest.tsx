import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CurrentUser } from '.';
import { CurrentUserDetailsReturn } from './lib/useCurrentUserDetails';

vi.mock('./styles.module.scss', () => ({
  default: {
    Container: 'Container',
    Drawer: 'Drawer',
    Details: 'Details',
    Name: 'Name',
    Handle: 'Handle',
    Verify: 'Verify',
  },
}));

vi.mock('../../matrix-avatar', () => ({
  MatrixAvatar: ({ imageURL, isActive, size, statusType }) => (
    <div
      data-testid='mock-avatar'
      data-image-url={imageURL}
      data-is-active={isActive}
      data-size={size}
      data-status-type={statusType}
    />
  ),
}));

vi.mock('@zero-tech/zui/components/Button', () => ({
  Button: ({ children, isSubmit, onPress, variant, className }) => (
    <button
      data-testid='mock-button'
      data-is-submit={isSubmit}
      data-variant={variant}
      className={className}
      onClick={onPress}
    >
      {children}
    </button>
  ),
  Variant: {
    Secondary: 'secondary',
  },
}));

vi.mock('@zero-tech/zui/components/Modal', () => ({
  Modal: ({ children, onOpenChange, open }) =>
    open ? (
      <div data-testid='mock-modal' data-open={open}>
        <button data-testid='modal-close-trigger' onClick={() => onOpenChange(false)}>
          Trigger Close
        </button>
        {children}
      </div>
    ) : null,
}));

vi.mock('../../messenger/list/rewards-tooltip/container', () => ({
  RewardsToolTipContainer: () => <div data-testid='mock-rewards-tooltip' />,
}));

vi.mock('../../verify-id-dialog', () => ({
  VerifyIdDialog: ({ onClose }) => (
    <div data-testid='mock-verify-id-dialog'>
      <button data-testid='close-verify-id-button' onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

vi.mock('./zero-pro-notification', () => ({
  ZeroProNotification: ({ onUpgradeClick, onClose }) => (
    <div data-testid='mock-zero-pro-notification'>
      <button data-testid='upgrade-button' onClick={onUpgradeClick}>
        Unlock Premium Features With Zero Pro
      </button>
      <button data-testid='close-notification-button' onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

vi.mock('./user-details', () => ({
  UserDetails: ({ userName, userHandle, isHandleAWalletAddress, onOpenVerifyIdDialog }) => (
    <div data-testid='mock-user-details'>
      <div className='Name'>{userName}</div>
      {isHandleAWalletAddress ? (
        <button data-testid='verify-id-button' onClick={onOpenVerifyIdDialog}>
          Verify ID
        </button>
      ) : (
        <div className='Handle'>{userHandle}</div>
      )}
    </div>
  ),
}));

const mockTotalRewardsViewed = vi.fn();
const mockOpenUserProfile = vi.fn();
const mockCloseUserProfile = vi.fn();
const mockCloseVerifyIdDialog = vi.fn();
const mockOpenVerifyIdDialog = vi.fn();
const mockOnUpgradeClick = vi.fn();
const mockOnCloseZeroProNotification = vi.fn();

const DEFAULT_HOOK_RETURN: CurrentUserDetailsReturn = {
  hasUnviewedRewards: false,
  isHandleAWalletAddress: false,
  isRewardsTooltipOpen: false,
  isVerifyIdDialogOpen: false,
  onClick: () => {
    mockOpenUserProfile();
    mockTotalRewardsViewed();
  },
  onCloseVerifyIdDialog: mockCloseVerifyIdDialog,
  onOpenVerifyIdDialog: mockOpenVerifyIdDialog,
  userAvatarUrl: 'https://example.com/avatar.jpg',
  userHandle: '@username',
  userName: 'John Doe',
};

let currentMockHook = { ...DEFAULT_HOOK_RETURN };
let currentZeroProMock = {
  showZeroProNotification: false,
  onUpgradeClick: mockOnUpgradeClick,
  onCloseZeroProNotification: mockOnCloseZeroProNotification,
};

vi.mock('./lib/useCurrentUserDetails', () => ({
  useCurrentUserDetails: () => currentMockHook,
}));

vi.mock('./lib/useZeroProNotification', () => ({
  useZeroProNotification: () => currentZeroProMock,
}));

const queryClient = new QueryClient();

const renderWithQueryClient = (component: React.ReactElement) => {
  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
};

describe('CurrentUser Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockHook = { ...DEFAULT_HOOK_RETURN };
    currentZeroProMock = {
      showZeroProNotification: false,
      onUpgradeClick: mockOnUpgradeClick,
      onCloseZeroProNotification: mockOnCloseZeroProNotification,
    };
  });

  it('should render user profile with avatar, name and handle', () => {
    renderWithQueryClient(<CurrentUser />);

    const avatar = screen.getByTestId('mock-avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('data-image-url', 'https://example.com/avatar.jpg');
    expect(avatar).toHaveAttribute('data-is-active', 'false');

    const userDetails = screen.getByTestId('mock-user-details');
    expect(userDetails).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('@username')).toBeInTheDocument();

    expect(screen.queryByTestId('mock-rewards-tooltip')).not.toBeInTheDocument();
  });

  it('should render "Verify ID" button when handle is a wallet address', () => {
    currentMockHook = {
      ...DEFAULT_HOOK_RETURN,
      isHandleAWalletAddress: true,
      userHandle: '0x123456789abcdef',
    };

    renderWithQueryClient(<CurrentUser />);

    const verifyButton = screen.getByTestId('verify-id-button');
    expect(verifyButton).toBeInTheDocument();
    expect(screen.getByText('Verify ID')).toBeInTheDocument();

    expect(screen.queryByText('0x123456789abcdef')).not.toBeInTheDocument();
  });

  it('should render rewards tooltip when showRewardsInTooltip is true', () => {
    currentMockHook = {
      ...DEFAULT_HOOK_RETURN,
      hasUnviewedRewards: true,
      isRewardsTooltipOpen: true,
    };

    renderWithQueryClient(<CurrentUser />);

    expect(screen.getByTestId('mock-rewards-tooltip')).toBeInTheDocument();

    const avatar = screen.getByTestId('mock-avatar');
    expect(avatar).toHaveAttribute('data-is-active', 'true');
  });

  it('should dispatch actions when user profile is clicked', () => {
    const { container } = renderWithQueryClient(<CurrentUser />);

    const containerElement = container.querySelector('.Container');
    expect(containerElement).toBeInTheDocument();

    fireEvent.click(containerElement);

    expect(mockOpenUserProfile).toHaveBeenCalled();
    expect(mockTotalRewardsViewed).toHaveBeenCalled();
  });

  it('should close user profile when clicked while open', () => {
    currentMockHook = {
      ...DEFAULT_HOOK_RETURN,
      onClick: () => {
        mockCloseUserProfile();
        mockTotalRewardsViewed();
      },
    };

    const { container } = render(<CurrentUser />);

    const containerElement = container.querySelector('.Container');
    expect(containerElement).toBeInTheDocument();

    fireEvent.click(containerElement);

    expect(mockCloseUserProfile).toHaveBeenCalled();
    expect(mockTotalRewardsViewed).toHaveBeenCalled();
  });

  it('should open and close the verify ID dialog', () => {
    currentMockHook = {
      ...DEFAULT_HOOK_RETURN,
      isHandleAWalletAddress: true,
    };

    renderWithQueryClient(<CurrentUser />);

    const verifyButton = screen.getByTestId('verify-id-button');
    expect(verifyButton).toBeInTheDocument();

    fireEvent.click(verifyButton);

    expect(mockOpenVerifyIdDialog).toHaveBeenCalled();

    currentMockHook = {
      ...currentMockHook,
      isVerifyIdDialogOpen: true,
    };

    renderWithQueryClient(<CurrentUser />);

    expect(screen.getByTestId('mock-verify-id-dialog')).toBeInTheDocument();

    const closeButton = screen.getByTestId('close-verify-id-button');
    fireEvent.click(closeButton);

    expect(mockCloseVerifyIdDialog).toHaveBeenCalled();
  });

  it('should close verify ID dialog when modal close is triggered', () => {
    currentMockHook = {
      ...DEFAULT_HOOK_RETURN,
      isHandleAWalletAddress: true,
      isVerifyIdDialogOpen: true,
    };

    renderWithQueryClient(<CurrentUser />);

    expect(screen.getByTestId('mock-verify-id-dialog')).toBeInTheDocument();

    const modalCloseButton = screen.getByTestId('modal-close-trigger');
    fireEvent.click(modalCloseButton);

    expect(mockCloseVerifyIdDialog).toHaveBeenCalled();
  });

  it('should render Zero Pro notification when showZeroProNotification is true', () => {
    currentZeroProMock = {
      showZeroProNotification: true,
      onUpgradeClick: mockOnUpgradeClick,
      onCloseZeroProNotification: mockOnCloseZeroProNotification,
    };

    renderWithQueryClient(<CurrentUser />);

    const notification = screen.getByTestId('mock-zero-pro-notification');
    expect(notification).toBeInTheDocument();
    expect(screen.getByText('Unlock Premium Features With Zero Pro')).toBeInTheDocument();

    const upgradeButton = screen.getByTestId('upgrade-button');
    fireEvent.click(upgradeButton);
    expect(mockOnUpgradeClick).toHaveBeenCalled();

    const closeButton = screen.getByTestId('close-notification-button');
    fireEvent.click(closeButton);
    expect(mockOnCloseZeroProNotification).toHaveBeenCalled();
  });
});

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

vi.mock('@zero-tech/zui/components/Avatar', () => ({
  Avatar: ({ imageURL, isActive, size, statusType }) => (
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

const mockTotalRewardsViewed = vi.fn();
const mockOpenUserProfile = vi.fn();
const mockCloseVerifyIdDialog = vi.fn();
const mockOpenVerifyIdDialog = vi.fn();

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
vi.mock('./lib/useCurrentUserDetails', () => ({
  useCurrentUserDetails: () => currentMockHook,
}));

describe('CurrentUser Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockHook = { ...DEFAULT_HOOK_RETURN };
  });

  it('should render user profile with avatar, name and handle', () => {
    render(<CurrentUser />);

    const avatar = screen.getByTestId('mock-avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('data-image-url', 'https://example.com/avatar.jpg');
    expect(avatar).toHaveAttribute('data-is-active', 'false');

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

    render(<CurrentUser />);

    const verifyButton = screen.getByTestId('mock-button');
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

    render(<CurrentUser />);

    expect(screen.getByTestId('mock-rewards-tooltip')).toBeInTheDocument();

    const avatar = screen.getByTestId('mock-avatar');
    expect(avatar).toHaveAttribute('data-is-active', 'true');
  });

  it('should dispatch actions when user profile is clicked', () => {
    const { container } = render(<CurrentUser />);

    const containerElement = container.querySelector('.Container');
    expect(containerElement).toBeInTheDocument();

    fireEvent.click(containerElement);

    expect(mockOpenUserProfile).toHaveBeenCalled();
    expect(mockTotalRewardsViewed).toHaveBeenCalled();
  });

  it('should open and close the verify ID dialog', () => {
    currentMockHook = {
      ...DEFAULT_HOOK_RETURN,
      isHandleAWalletAddress: true,
    };

    render(<CurrentUser />);

    const verifyButton = screen.getByTestId('mock-button');
    expect(verifyButton).toBeInTheDocument();

    fireEvent.click(verifyButton);

    expect(mockOpenVerifyIdDialog).toHaveBeenCalled();

    currentMockHook = {
      ...currentMockHook,
      isVerifyIdDialogOpen: true,
    };

    render(<CurrentUser />);

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

    render(<CurrentUser />);

    expect(screen.getByTestId('mock-verify-id-dialog')).toBeInTheDocument();

    const modalCloseButton = screen.getByTestId('modal-close-trigger');
    fireEvent.click(modalCloseButton);

    expect(mockCloseVerifyIdDialog).toHaveBeenCalled();
  });
});

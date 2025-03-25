import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageMenu } from './messageMenu';
import { MessageSendStatus, MediaType } from '../../../store/messages';

describe('MessageMenu', () => {
  const defaultProps = {
    isOwner: true,
    message: 'Test message',
    sendStatus: MessageSendStatus.SUCCESS,
    media: {
      type: MediaType.Image,
      mimetype: 'image/jpeg',
      url: 'https://example.com/image.jpg',
      height: 800,
      width: 600,
      name: 'test-image.jpg',
    },
    isMenuOpen: true,
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onReply: vi.fn(),
    onInfo: vi.fn(),
    onDownload: vi.fn(),
    onCopy: vi.fn(),
    onOpenChange: vi.fn(),
    onCloseMenu: vi.fn(),
    onReportUser: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Owner permissions', () => {
    it('should allow editing when user is owner and message is sent', () => {
      render(<MessageMenu {...defaultProps} />);
      expect(screen.getByRole('menuitem', { name: /edit/i })).toBeEnabled();
    });

    it('should disable editing when message is in progress', () => {
      render(<MessageMenu {...defaultProps} sendStatus={MessageSendStatus.IN_PROGRESS} />);
      expect(screen.queryByRole('menuitem', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('should disable editing when message failed to send', () => {
      render(<MessageMenu {...defaultProps} sendStatus={MessageSendStatus.FAILED} />);
      expect(screen.queryByRole('menuitem', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('should allow deletion when user is owner', () => {
      render(<MessageMenu {...defaultProps} />);
      expect(screen.getByRole('menuitem', { name: /delete/i })).toBeEnabled();
    });

    it('should disable deletion when message is in progress', () => {
      render(<MessageMenu {...defaultProps} sendStatus={MessageSendStatus.IN_PROGRESS} />);
      expect(screen.queryByRole('menuitem', { name: /delete/i })).not.toBeInTheDocument();
    });
  });

  describe('Non-owner permissions', () => {
    it('should not show edit or delete options for non-owners', () => {
      render(<MessageMenu {...defaultProps} isOwner={false} />);
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });

    it('should allow reporting for non-owners', () => {
      render(<MessageMenu {...defaultProps} isOwner={false} />);
      expect(screen.getByRole('menuitem', { name: /report/i })).toBeEnabled();
    });

    it('should disable reporting when message is in progress', () => {
      render(<MessageMenu {...defaultProps} isOwner={false} sendStatus={MessageSendStatus.IN_PROGRESS} />);
      expect(screen.queryByRole('menuitem', { name: /report/i })).not.toBeInTheDocument();
    });
  });

  describe('Owner state combinations', () => {
    it('should show all owner actions when owner and message is sent', () => {
      render(<MessageMenu {...defaultProps} />);
      expect(screen.getByRole('menuitem', { name: /edit/i })).toBeEnabled();
      expect(screen.getByRole('menuitem', { name: /delete/i })).toBeEnabled();
      expect(screen.queryByRole('button', { name: /report/i })).not.toBeInTheDocument();
    });

    it('should disable all owner actions when message is in progress', () => {
      render(<MessageMenu {...defaultProps} sendStatus={MessageSendStatus.IN_PROGRESS} />);
      expect(screen.queryByRole('menuitem', { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /delete/i })).not.toBeInTheDocument();
    });

    it('should show only report option for non-owner with sent message', () => {
      render(<MessageMenu {...defaultProps} isOwner={false} />);
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /report/i })).toBeEnabled();
    });

    it('should handle empty message state for owner', () => {
      render(<MessageMenu {...defaultProps} message='' />);
      expect(screen.queryByRole('menuitem', { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /delete/i })).toBeEnabled();
    });

    it('should handle empty message state for non-owner', () => {
      render(<MessageMenu {...defaultProps} isOwner={false} message='' />);
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /report/i })).toBeEnabled();
    });

    it('should handle failed message state for owner', () => {
      render(<MessageMenu {...defaultProps} sendStatus={MessageSendStatus.FAILED} />);
      expect(screen.queryByRole('menuitem', { name: /edit/i })).not.toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /delete/i })).toBeEnabled();
    });
  });

  describe('Media handling', () => {
    it('should enable download for non-GIF images', () => {
      render(<MessageMenu {...defaultProps} />);
      expect(screen.getByRole('menuitem', { name: /download/i })).toBeEnabled();
    });

    it('should disable download for GIF images', () => {
      render(<MessageMenu {...defaultProps} media={{ ...defaultProps.media, mimetype: 'image/gif' }} />);
      expect(screen.queryByRole('menuitem', { name: /download/i })).not.toBeInTheDocument();
    });

    it('should enable copy for non-GIF images', () => {
      render(<MessageMenu {...defaultProps} />);
      expect(screen.getByRole('menuitem', { name: /copy/i })).toBeEnabled();
    });

    it('should disable copy for GIF images', () => {
      render(<MessageMenu {...defaultProps} media={{ ...defaultProps.media, mimetype: 'image/gif' }} />);
      expect(screen.queryByRole('menuitem', { name: /copy/i })).not.toBeInTheDocument();
    });
  });

  describe('Reply functionality', () => {
    it('should enable reply for sent messages', () => {
      render(<MessageMenu {...defaultProps} />);
      expect(screen.getByRole('menuitem', { name: /reply/i })).toBeEnabled();
    });

    it('should disable reply when message is in progress', () => {
      render(<MessageMenu {...defaultProps} sendStatus={MessageSendStatus.IN_PROGRESS} />);
      expect(screen.queryByRole('menuitem', { name: /reply/i })).not.toBeInTheDocument();
    });

    it('should disable reply when message failed to send', () => {
      render(<MessageMenu {...defaultProps} sendStatus={MessageSendStatus.FAILED} />);
      expect(screen.queryByRole('menuitem', { name: /reply/i })).not.toBeInTheDocument();
    });

    it('should call onReply when reply button is clicked', async () => {
      render(<MessageMenu {...defaultProps} />);
      fireEvent.click(screen.getByRole('menuitem', { name: /reply/i }));

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(defaultProps.onReply).toHaveBeenCalled();
    });
  });

  describe('Info viewing', () => {
    it('should enable info viewing for sent messages', () => {
      render(<MessageMenu {...defaultProps} />);
      expect(screen.getByRole('menuitem', { name: /info/i })).toBeEnabled();
    });

    it('should disable info viewing when message is in progress', () => {
      render(<MessageMenu {...defaultProps} sendStatus={MessageSendStatus.IN_PROGRESS} />);
      expect(screen.queryByRole('menuitem', { name: /info/i })).not.toBeInTheDocument();
    });

    it('should disable info viewing when message failed to send', () => {
      render(<MessageMenu {...defaultProps} sendStatus={MessageSendStatus.FAILED} />);
      expect(screen.queryByRole('menuitem', { name: /info/i })).not.toBeInTheDocument();
    });
  });

  describe('Event handlers', () => {
    it('should call onDelete when delete button is clicked', async () => {
      render(<MessageMenu {...defaultProps} />);

      fireEvent.click(screen.getByRole('menuitem', { name: /delete/i }));
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(defaultProps.onDelete).toHaveBeenCalled();
    });

    it('should call onEdit when edit button is clicked', async () => {
      render(<MessageMenu {...defaultProps} />);

      fireEvent.click(screen.getByRole('menuitem', { name: /edit/i }));
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(defaultProps.onEdit).toHaveBeenCalled();
    });

    it('should call onReply when reply button is clicked', async () => {
      render(<MessageMenu {...defaultProps} />);

      fireEvent.click(screen.getByRole('menuitem', { name: /reply/i }));
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(defaultProps.onReply).toHaveBeenCalled();
    });

    it('should call onReportUser when report button is clicked', () => {
      render(<MessageMenu {...defaultProps} isOwner={false} />);
      fireEvent.click(screen.getByRole('menuitem', { name: /report/i }));
      expect(defaultProps.onReportUser).toHaveBeenCalled();
    });
  });
});

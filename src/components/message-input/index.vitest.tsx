import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MessageInput } from './index';
import { MediaType } from '../../store/messages';
import { renderWithProviders } from '../../test-utils';
import { RootState } from '../../store';
import { ZUIProvider } from '@zero-tech/zui/ZUIProvider';

// Mock dependencies
vi.mock('../../store/messages', async () => {
  const actual = await vi.importActual('../../store/messages');
  return {
    ...actual,
    MediaType: {
      Image: 'image',
      Video: 'video',
      File: 'file',
    },
  };
});

// Mock components
vi.mock('./emoji-picker/emoji-picker', () => ({
  EmojiPicker: vi.fn(() => <div data-testid='emoji-picker'>EmojiPicker</div>),
}));

vi.mock('./giphy/giphy', () => ({
  Giphy: vi.fn(() => <div data-testid='giphy-picker'>Giphy</div>),
}));

// Mock functions
const mockGetUsersForMentions = vi.fn().mockResolvedValue([]);
const mockOnSubmit = vi.fn();
const mockOnUserTyping = vi.fn();
const mockOnRemoveReply = vi.fn();
const mockDropzoneToMedia = vi.fn();

const defaultProps = {
  id: 'test-room',
  onSubmit: mockOnSubmit,
  getUsersForMentions: mockGetUsersForMentions,
  onUserTyping: mockOnUserTyping,
  onRemoveReply: mockOnRemoveReply,
  dropzoneToMedia: mockDropzoneToMedia,
};

const renderComponent = (partialProps = {}, preloadedState: Partial<RootState> = {}) => {
  const finalProps = { ...defaultProps, ...partialProps };
  return renderWithProviders(
    <ZUIProvider>
      <MessageInput {...finalProps} />
    </ZUIProvider>,
    { preloadedState }
  );
};

describe('MessageInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with initial value', () => {
      renderComponent({ initialValue: 'Hello World' });
      expect(screen.getByRole('textbox')).toHaveValue('Hello World');
    });

    it('shows disabled tooltip when send is disabled', async () => {
      renderComponent({ sendDisabledMessage: 'Cannot send message' });
      const buttons = screen.getAllByRole('button');
      const sendButton = buttons.find((el) => el.classList.contains('message-input__icon--end-action'));

      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getAllByText('Cannot send message')[0]).toBeInTheDocument();
      });
    });
  });

  describe('Message Submission', () => {
    it('handles text input and submission via button', async () => {
      renderComponent();
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'New message' } });
      expect(input).toHaveValue('New message');

      const buttons = screen.getAllByRole('button');
      const sendButton = buttons.find((el) => el.classList.contains('message-input__icon--end-action'));

      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('New message', [], []);
        expect(input).toHaveValue('');
      });
    });

    it('handles Enter key submission', async () => {
      renderComponent();
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'New message' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('New message', [], []);
        expect(input).toHaveValue('');
      });
    });

    it('does not submit on Shift+Enter', () => {
      renderComponent();
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'New message' } });
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(input).toHaveValue('New message');
    });
  });

  describe('Reply Functionality', () => {
    it('handles reply card rendering and removal', () => {
      const reply = {
        message: 'Reply message',
        sender: { firstName: 'John', lastName: 'Doe' },
        media: [],
      };

      renderComponent({ reply, replyIsCurrentUser: false });

      expect(screen.getByText('Reply message')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();

      const buttons = screen.getAllByRole('button', { name: 'icon' });
      const removeButton = buttons.find((el) => el.closest('.reply-card'));

      fireEvent.click(removeButton);

      expect(mockOnRemoveReply).toHaveBeenCalled();
    });
  });

  describe('Media and Attachments', () => {
    it('handles emoji picker interaction', async () => {
      renderComponent();
      const buttons = screen.getAllByRole('button', { name: 'icon' });
      const emojiButton = buttons.find((el) => el.classList.contains('message-input__icon--emoji'));

      fireEvent.click(emojiButton);

      await waitFor(() => {
        expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
      });
    });

    it('handles giphy picker interaction', async () => {
      renderComponent();
      const buttons = screen.getAllByRole('button', { name: 'icon' });
      const giphyButton = buttons.find((el) => el.classList.contains('message-input__icon--giphy'));

      fireEvent.click(giphyButton);

      await waitFor(() => {
        expect(screen.getByTestId('giphy-picker')).toBeInTheDocument();
      });
    });

    it('handles file attachment', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const mockMedia = [
        {
          id: '1',
          name: 'test.png',
          type: MediaType.Image,
          mediaType: MediaType.Image,
          url: 'test-url',
        },
      ];

      mockDropzoneToMedia.mockReturnValueOnce(mockMedia);
      renderComponent();

      const dropzones = screen.getAllByRole('presentation');
      const messageDropzone = dropzones.find((el) => el.classList.contains('message-input__drop-zone-text-area'));

      const dropEvent = {
        dataTransfer: {
          files: [mockFile],
          items: [
            {
              kind: 'file',
              type: 'image/png',
              getAsFile: () => mockFile,
            },
          ],
          types: ['Files'],
        },
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      };

      fireEvent.drop(messageDropzone, dropEvent);

      await waitFor(() => {
        expect(mockDropzoneToMedia).toHaveBeenCalledWith([mockFile]);
        expect(screen.getByTitle('test.png')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('handles user typing and triggers callback', () => {
      renderComponent();
      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'Typing...' } });

      expect(mockOnUserTyping).toHaveBeenCalledWith({ roomId: 'test-room' });
    });
  });
});

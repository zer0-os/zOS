import { describe, it, expect, vi } from 'vitest';
import { PostInput } from './';
import { fireEvent, render, screen } from '@testing-library/react';
import { POST_MAX_LENGTH } from '../../lib/constants';
import { ViewModes } from '../../../../shared-components/theme-engine';

vi.mock('../../../../components/matrix-avatar', () => ({
  MatrixAvatar: () => {
    return <div data-testid='matrix-avatar-mock' />;
  },
}));

describe('PostInput', () => {
  it('should only show the character count when the post is too long', () => {
    render(<PostInput viewMode={ViewModes.Dark} onSubmit={() => {}} />);

    const textarea = screen.getByRole('textbox');

    // Character count should not be visible when the input value is empty
    expect(screen.queryByTestId('character-count')).not.toBeInTheDocument();

    const threshold = POST_MAX_LENGTH * 0.8 + 1;

    fireEvent.change(textarea, { target: { value: 'a'.repeat(threshold) } });

    // Character count should be visible when the input value is too long
    const characterCount = screen.getByTestId('character-count');
    expect(characterCount).toHaveTextContent(`${threshold} / ${POST_MAX_LENGTH}`);

    fireEvent.change(textarea, { target: { value: 'a'.repeat(POST_MAX_LENGTH) } });

    expect(characterCount).toHaveTextContent(`${POST_MAX_LENGTH} / ${POST_MAX_LENGTH}`);
  });
});

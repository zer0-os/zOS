import { describe, it, expect, vi } from 'vitest';
import { ShowMoreButton } from '.';
import { render, screen, fireEvent } from '@testing-library/react';

describe('ShowMoreButton', () => {
  const renderShowMore = (props = {}) => {
    const defaultProps = {
      onClick: vi.fn(),
      ...props,
    };

    return render(<ShowMoreButton {...defaultProps} />);
  };

  it('should render the "Show more" text', () => {
    renderShowMore();
    expect(screen.getByText('Show more')).toBeInTheDocument();
  });

  it('should apply custom className when provided', () => {
    const customClass = 'custom-class';
    renderShowMore({ className: customClass });
    const button = screen.getByRole('button');
    expect(button).toHaveClass(customClass);
  });

  it('should call onClick handler when clicked', () => {
    const onClick = vi.fn();
    renderShowMore({ onClick });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalled();
  });

  it('should stop event propagation when clicked', () => {
    const onClick = vi.fn();
    const containerClick = vi.fn();

    render(
      <div onClick={containerClick}>
        <ShowMoreButton onClick={onClick} />
      </div>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalled();
    expect(containerClick).not.toHaveBeenCalled();
  });
});

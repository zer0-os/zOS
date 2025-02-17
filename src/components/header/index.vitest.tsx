import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header, HeaderProps } from './';

const DEFAULT_PROPS: HeaderProps = {
  className: undefined,
  end: undefined,
  onClick: undefined,
  title: '',
};

const renderComponent = (props: Partial<HeaderProps> = {}) => {
  const mergedProps = { ...DEFAULT_PROPS, ...props };
  return render(<Header {...mergedProps} />);
};

describe(Header, () => {
  it('should render the title', async () => {
    renderComponent({ title: 'foo' });

    expect(screen.getByText('foo')).toBeVisible();
  });

  it('should render the end', async () => {
    renderComponent({ end: 'qux' });

    expect(screen.getByText('qux')).toBeVisible();
  });

  it('should call onClick', async () => {
    const onClick = vi.fn();
    renderComponent({ onClick });

    screen.getByRole('button').click();

    expect(onClick).toHaveBeenCalled();
  });

  it('should render the className', async () => {
    const { container } = renderComponent({ className: 'foo' });

    expect(container.firstElementChild).toHaveClass('foo');
  });

  it('should not propagate the click event from clickable elements in end', async () => {
    const onClick = vi.fn();
    const onClickEnd = vi.fn();
    renderComponent({ onClick, end: <button onClick={onClickEnd}>foobutton</button> });

    screen.getByText('foobutton').click();

    expect(onClick).not.toHaveBeenCalled();
    expect(onClickEnd).toHaveBeenCalled();
  });
});

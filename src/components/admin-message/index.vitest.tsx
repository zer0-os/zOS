import { render, screen } from '@testing-library/react';
import { AdminMessage } from './';

describe('AdminMessage', () => {
  it('renders the message', () => {
    render(<AdminMessage message='test message' />);

    expect(screen.getByText('test message')).toBeTruthy();
  });
});

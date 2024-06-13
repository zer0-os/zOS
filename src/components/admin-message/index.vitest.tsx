import { render } from '@testing-library/react';
import { AdminMessage } from './';

describe('AdminMessage', () => {
  it('renders the message', () => {
    const { getByText } = render(<AdminMessage message='test message' />);

    expect(getByText('test message')).toBeTruthy();
  });
});

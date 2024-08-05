import { render, screen } from '@testing-library/react';

import { IFrame, IFrameProps } from '.';

const DEFAULT_PROPS: IFrameProps = {
  title: 'Bar',
  src: 'https://foo.bar',
};

var iFrame: HTMLIFrameElement;

describe(IFrame, () => {
  beforeEach(() => {
    render(<IFrame {...DEFAULT_PROPS} />);
    iFrame = screen.getByTestId('iframe') as HTMLIFrameElement;
  });

  describe('iframe', () => {
    it('should have correct title', () => {
      expect(iFrame.title).toBe('Bar');
    });

    it('should have correct src', () => {
      expect(iFrame.src).toBe('https://foo.bar/');
    });
  });
});

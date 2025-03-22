// src/apps/iframe/index.vitest.tsx
import { render, screen } from '@testing-library/react';

import { IFrame, IFrameProps } from '.';

const DEFAULT_PROPS: IFrameProps = {
  title: 'Bar',
  src: 'https://foo.bar',
};

describe(IFrame, () => {
  describe('by default', () => {
    let iFrame: HTMLIFrameElement;

    beforeEach(() => {
      render(<IFrame {...DEFAULT_PROPS} />);
      iFrame = screen.getByTestId('iframe') as HTMLIFrameElement;
    });

    it('should have correct title', () => {
      expect(iFrame.title).toBe('Bar');
    });

    it('should have correct src', () => {
      expect(iFrame.src).toBe('https://foo.bar/');
    });

    it('should not have is-fullscreen class', () => {
      expect(iFrame.classList.contains('iframe--is-fullscreen')).toBe(false);
    });
  });

  describe('when isFullscreen is true', () => {
    let iFrame: HTMLIFrameElement;

    beforeEach(() => {
      render(<IFrame {...DEFAULT_PROPS} isFullscreen={true} />);
      iFrame = screen.getByTestId('iframe') as HTMLIFrameElement;
    });

    it('should have is-fullscreen class', () => {
      expect(iFrame.classList.contains('iframe--is-fullscreen')).toBe(true);
    });
  });
});

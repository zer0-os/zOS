import { act } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { ExternalApp, PublicProperties } from './';
import { vi } from 'vitest';
import { renderWithProviders } from '../../test-utils';

const mockIFrame = vi.fn();

vi.mock('../iframe', () => ({
  IFrame: (props: any) => {
    mockIFrame(props);
    return <iframe title='foo' data-testid='iframe' {...props} />;
  },
}));

const DEFAULT_PROPS: PublicProperties = {
  manifest: {
    title: 'Foo',
    route: '/foo',
    url: 'https://foo.bar',
    features: [],
  },
};

const history = createMemoryHistory();

const renderComponent = (props: Partial<PublicProperties>, route?: string) => {
  history.replace(route ?? '/');

  return renderWithProviders(
    <Router history={history}>
      <ExternalApp {...{ ...DEFAULT_PROPS, ...props }} />
    </Router>
  );
};

describe(ExternalApp, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass title to iFrame', () => {
    renderComponent(DEFAULT_PROPS);
    expect(mockIFrame).toHaveBeenCalledWith(expect.objectContaining({ title: 'Foo' }));
  });

  describe('when browser route is default app route', () => {
    it('should pass url to iFrame', () => {
      renderComponent({ manifest: { ...DEFAULT_PROPS.manifest, url: 'https://foo.baz' } });
      expect(mockIFrame).toHaveBeenCalledWith(expect.objectContaining({ src: 'https://foo.baz/' }));
    });
  });

  describe('when browser route is sub-route of app route', () => {
    it('should pass url to iFrame', () => {
      renderComponent({ manifest: { ...DEFAULT_PROPS.manifest, url: 'https://foo.baz' } }, '/foo/bar/baz');
      expect(mockIFrame).toHaveBeenCalledWith(expect.objectContaining({ src: 'https://foo.baz/bar/baz' }));
    });
  });

  describe('when window receives a message event', () => {
    describe('when type is zapp-route-changed', () => {
      it('should change route accordingly', async () => {
        renderComponent({ manifest: { ...DEFAULT_PROPS.manifest, url: 'https://foo.bar' } }, '/foo');

        const navigationEvent = new MessageEvent('message', {
          data: {
            type: 'zapp-route-changed',
            data: { pathname: '/bar/baz' },
          },
          origin: 'https://foo.bar',
        });

        act(() => {
          window.dispatchEvent(navigationEvent);
        });

        expect(history.location.pathname).toBe('/foo/bar/baz');
      });

      it('should ignore origin outside of app', async () => {
        renderComponent({ manifest: { ...DEFAULT_PROPS.manifest, url: 'https://foo.bar' } }, '/foo');

        const navigationEvent = new MessageEvent('message', {
          data: {
            type: 'zapp-route-changed',
          },
          origin: 'https://bar.baz',
        });

        act(() => {
          window.dispatchEvent(navigationEvent);
        });

        expect(history.location.pathname).toBe('/foo');
      });

      it('should handle root navigation', async () => {
        renderComponent({ manifest: { ...DEFAULT_PROPS.manifest, url: 'https://foo.bar' } }, '/foo');

        const navigationEvent = new MessageEvent('message', {
          data: {
            type: 'zapp-route-changed',
            data: { pathname: '/' },
          },
          origin: 'https://foo.bar',
        });

        act(() => {
          window.dispatchEvent(navigationEvent);
        });

        expect(history.location.pathname).toBe('/foo');
      });

      it('should not react if unmounted', () => {
        const { unmount } = renderComponent(
          { manifest: { ...DEFAULT_PROPS.manifest, url: 'https://foo.bar' } },
          '/foo'
        );

        unmount();

        const navigationEvent = new MessageEvent('message', {
          data: {
            type: 'zapp-route-changed',
            data: { pathname: '/bar/baz' },
          },
          origin: 'https://foo.bar',
        });

        act(() => {
          window.dispatchEvent(navigationEvent);
        });

        expect(history.location.pathname).toBe('/foo');
      });
    });

    it('should not react to other message types (only accept zapp-route-changed)', async () => {
      renderComponent({ manifest: { ...DEFAULT_PROPS.manifest, url: 'https://foo.bar' } }, '/foo');

      const navigationEvent = new MessageEvent('message', {
        data: {
          type: 'foo-bar',
        },
      });

      act(() => {
        window.dispatchEvent(navigationEvent);
      });

      expect(history.location.pathname).toBe('/foo');
    });
  });

  describe('fullscreen feature', () => {
    it('should pass isFullscreen=false when no fullscreen feature exists', () => {
      renderComponent({
        manifest: {
          ...DEFAULT_PROPS.manifest,
          features: [],
        },
      });
      expect(mockIFrame).toHaveBeenCalledWith(expect.objectContaining({ isFullscreen: false }));
    });

    it('should pass isFullscreen=true when fullscreen feature exists', () => {
      renderComponent({
        manifest: {
          ...DEFAULT_PROPS.manifest,
          features: [{ type: 'fullscreen' }],
        },
      });
      expect(mockIFrame).toHaveBeenCalledWith(expect.objectContaining({ isFullscreen: true }));
    });

    it('should pass isFullscreen=false when other features exist but not fullscreen', () => {
      renderComponent({
        manifest: {
          ...DEFAULT_PROPS.manifest,
          features: [{ type: 'microphone' }],
        },
      });
      expect(mockIFrame).toHaveBeenCalledWith(expect.objectContaining({ isFullscreen: false }));
    });
  });
});

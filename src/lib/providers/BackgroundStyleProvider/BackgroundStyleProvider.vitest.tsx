import { describe, it, expect, afterEach } from 'vitest';
import { BackgroundStyleProvider } from './BackgroundStyleProvider';
import { renderWithProviders } from '../../../test-utils';
import { MainBackground } from '../../../store/background';
import { act } from '@testing-library/react';

describe('BackgroundStyleProvider', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--is-low-contrast-background');
  });

  it('should set --is-low-contrast-background to 1 for low contrast backgrounds', () => {
    renderWithProviders(<BackgroundStyleProvider />, {
      preloadedState: {
        background: {
          selectedMainBackground: MainBackground.StaticLightsOut,
        },
      },
    });

    expect(document.documentElement.style.getPropertyValue('--is-low-contrast-background')).toBe('1');
  });

  it('should set --is-low-contrast-background to 0 for non-low contrast backgrounds', () => {
    renderWithProviders(<BackgroundStyleProvider />, {
      preloadedState: {
        background: {
          selectedMainBackground: MainBackground.StaticGreenParticles,
        },
      },
    });

    expect(document.documentElement.style.getPropertyValue('--is-low-contrast-background')).toBe('0');
  });

  it('should update the CSS variable when the background changes', async () => {
    const { store } = renderWithProviders(<BackgroundStyleProvider />, {
      preloadedState: {
        background: {
          selectedMainBackground: MainBackground.StaticGreenParticles,
        },
      },
    });

    expect(document.documentElement.style.getPropertyValue('--is-low-contrast-background')).toBe('0');

    await act(async () => {
      store.dispatch({
        type: 'background/setSelectedMainBackground',
        payload: MainBackground.StaticLightsOut,
      });
    });

    expect(document.documentElement.style.getPropertyValue('--is-low-contrast-background')).toBe('1');
  });
});

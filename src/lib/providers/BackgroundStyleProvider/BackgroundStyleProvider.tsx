import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/reducer';
import { MainBackground } from '../../../store/background';

const LOW_CONTRAST_BACKGROUNDS: MainBackground[] = [MainBackground.StaticLightsOut];

/**
 * Sets CSS variables based on the selected background.
 */
export const BackgroundStyleProvider = () => {
  const selectedMainBackground = useSelector((state: RootState) => state.background.selectedMainBackground);

  useEffect(() => {
    const isLowContrastBackground = LOW_CONTRAST_BACKGROUNDS.includes(selectedMainBackground);
    document.documentElement.style.setProperty('--is-low-contrast-background', isLowContrastBackground ? '1' : '0');
  }, [selectedMainBackground]);

  return null;
};

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MainBackground } from '../../../store/background';
import { selectedMainBackgroundSelector } from '../../../store/background/selectors';

const LOW_CONTRAST_BACKGROUNDS: MainBackground[] = [MainBackground.StaticLightsOut, MainBackground.DotGrid];

/**
 * Sets CSS variables based on the selected background.
 */
export const BackgroundStyleProvider = () => {
  const selectedMainBackground = useSelector(selectedMainBackgroundSelector);

  useEffect(() => {
    const isLowContrastBackground = LOW_CONTRAST_BACKGROUNDS.includes(selectedMainBackground);
    document.documentElement.style.setProperty('--is-low-contrast-background', isLowContrastBackground ? '1' : '0');
  }, [selectedMainBackground]);

  return null;
};

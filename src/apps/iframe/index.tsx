import './styles.scss';

import { bemClassName } from '../../lib/bem';

const cn = bemClassName('iframe');

export interface IFrameProps {
  src: string;
  title: string;
  allow?: string;
  isFullscreen?: boolean;
}

export const IFrame = ({ src, title, allow, isFullscreen = false }: IFrameProps) => {
  return (
    <iframe {...cn('', isFullscreen && 'is-fullscreen')} data-testid='iframe' src={src} title={title} allow={allow} />
  );
};
